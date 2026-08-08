create table if not exists public.seating_tables (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  capacity integer not null default 10 check (capacity between 1 and 30),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seating_assignments (
  guest_id uuid primary key references public.guests(id) on delete cascade,
  table_id uuid not null references public.seating_tables(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seating_assignments_table_id_idx
on public.seating_assignments (table_id);

alter table public.seating_tables enable row level security;
alter table public.seating_assignments enable row level security;

comment on table public.seating_tables is
  'Private wedding breakfast tables, accessed only through the server-side admin API.';

comment on table public.seating_assignments is
  'Private guest-to-table assignments, accessed only through the server-side admin API.';
