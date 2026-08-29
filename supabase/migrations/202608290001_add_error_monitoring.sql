create table if not exists public.app_error_events (
  id uuid primary key default gen_random_uuid(),
  source text not null
    check (char_length(source) between 1 and 120),
  message text not null
    check (char_length(message) between 1 and 240),
  severity text not null default 'error'
    check (severity in ('warning', 'error', 'critical')),
  status_code smallint
    check (status_code between 400 and 599),
  fingerprint text not null
    check (char_length(fingerprint) = 64),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists app_error_events_created_at_idx
on public.app_error_events (created_at desc);

create index if not exists app_error_events_fingerprint_idx
on public.app_error_events (fingerprint, created_at desc);

alter table public.app_error_events enable row level security;

revoke all on table public.app_error_events
from public, anon, authenticated;

grant select, insert, delete on table public.app_error_events
to service_role;

create or replace function public.cleanup_app_error_events()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.app_error_events
  where created_at < now() - interval '30 days';
$$;

revoke all on function public.cleanup_app_error_events()
from public, anon, authenticated;

grant execute on function public.cleanup_app_error_events()
to service_role;
