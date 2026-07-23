create table if not exists public.planning_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  category text not null default 'General' check (
    category in (
      'General',
      'Venue',
      'Guests',
      'Suppliers',
      'Stationery',
      'Outfits'
    )
  ),
  due_date date,
  notes text not null default '' check (char_length(notes) <= 1000),
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.planning_tasks enable row level security;

comment on table public.planning_tasks is
  'Private wedding planning tasks, accessed only through the server-side admin API.';
