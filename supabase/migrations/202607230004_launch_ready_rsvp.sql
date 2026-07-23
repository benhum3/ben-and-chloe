update public.households
set search_name = regexp_replace(
  lower(trim(invitation_name)),
  '\s+',
  ' ',
  'g'
);

create unique index if not exists households_search_name_unique
on public.households (search_name);

create or replace function public.sync_household_search_name()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.search_name := regexp_replace(
    lower(trim(new.invitation_name)),
    '\s+',
    ' ',
    'g'
  );
  return new;
end;
$$;

drop trigger if exists households_sync_search_name
on public.households;

create trigger households_sync_search_name
before insert or update of invitation_name
on public.households
for each row
execute function public.sync_household_search_name();

revoke all on function public.sync_household_search_name()
from public, anon, authenticated;

create or replace function public.submit_household_rsvp(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_household_id uuid;
  guest_payload jsonb;
  target_guest_id uuid;
  guest_attending boolean;
  dietary_text text;
  song_text text := trim(coalesce(payload->>'songRequest', ''));
  message_text text := trim(coalesce(payload->>'message', ''));
  expected_guest_count integer;
  submitted_guest_count integer;
begin
  if jsonb_typeof(payload) <> 'object' then
    raise exception 'A valid RSVP is required.';
  end if;

  target_household_id := (payload->>'householdId')::uuid;

  if not exists (
    select 1 from public.households where id = target_household_id
  ) then
    raise exception 'Household not found.';
  end if;

  if jsonb_typeof(payload->'guests') <> 'array'
    or jsonb_array_length(payload->'guests') = 0
    or jsonb_array_length(payload->'guests') > 20 then
    raise exception 'A valid guest response is required.';
  end if;

  if char_length(song_text) > 160 or char_length(message_text) > 1000 then
    raise exception 'One or more responses are too long.';
  end if;

  select count(*)
  into expected_guest_count
  from public.guests
  where household_id = target_household_id;

  select count(distinct (value->>'id'))
  into submitted_guest_count
  from jsonb_array_elements(payload->'guests');

  if expected_guest_count <> jsonb_array_length(payload->'guests')
    or submitted_guest_count <> expected_guest_count then
    raise exception 'Every guest on the invitation must have one response.';
  end if;

  for guest_payload in
    select value from jsonb_array_elements(payload->'guests')
  loop
    target_guest_id := (guest_payload->>'id')::uuid;

    if jsonb_typeof(guest_payload->'attending') <> 'boolean' then
      raise exception 'Every guest needs an attendance response.';
    end if;

    guest_attending := (guest_payload->>'attending')::boolean;
    dietary_text := trim(
      coalesce(guest_payload->>'dietaryRequirements', '')
    );

    if char_length(dietary_text) > 500 then
      raise exception 'A dietary response is too long.';
    end if;

    update public.guests
    set attending = guest_attending,
        dietary_requirements = case
          when guest_attending then nullif(dietary_text, '')
          else null
        end,
        updated_at = now()
    where id = target_guest_id
      and household_id = target_household_id;

    if not found then
      raise exception 'A guest does not belong to this invitation.';
    end if;
  end loop;

  update public.households
  set song_request = nullif(song_text, ''),
      message = nullif(message_text, ''),
      submitted_at = now(),
      updated_at = now()
  where id = target_household_id;
end;
$$;

revoke all on function public.submit_household_rsvp(jsonb)
from public, anon, authenticated;

grant execute on function public.submit_household_rsvp(jsonb)
to service_role;
