create table if not exists public.wedding_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  uploader_name text check (char_length(uploader_name) <= 80),
  caption text check (char_length(caption) <= 240),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.wedding_photos
add column if not exists hidden boolean not null default false;

create index if not exists wedding_photos_created_at_idx
on public.wedding_photos (created_at desc);

alter table public.wedding_photos enable row level security;

revoke all on table public.wedding_photos from public, anon, authenticated;
grant all on table public.wedding_photos to service_role;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'wedding-photos',
  'wedding-photos',
  true,
  12582912,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
