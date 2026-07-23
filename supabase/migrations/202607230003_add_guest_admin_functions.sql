create or replace function public.admin_import_households(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  household_payload jsonb;
  guest_payload jsonb;
  household_id uuid;
  household_name text;
  invitation_kind text;
  imported_households integer := 0;
  imported_guests integer := 0;
begin
  if jsonb_typeof(payload) <> 'array' or jsonb_array_length(payload) = 0 then
    raise exception 'At least one household is required.';
  end if;

  for household_payload in select value from jsonb_array_elements(payload)
  loop
    household_name := trim(household_payload->>'invitationName');
    invitation_kind := lower(trim(household_payload->>'invitationType'));

    if household_name = '' or char_length(household_name) > 160 then
      raise exception 'Every household needs a valid invitation name.';
    end if;

    if invitation_kind not in ('day', 'evening') then
      raise exception 'Invitation type must be day or evening.';
    end if;

    if jsonb_typeof(household_payload->'guests') <> 'array'
      or jsonb_array_length(household_payload->'guests') = 0 then
      raise exception 'Every household needs at least one guest.';
    end if;

    if exists (
      select 1
      from public.households
      where lower(trim(invitation_name)) = lower(household_name)
    ) then
      raise exception 'An invitation named "%" already exists.', household_name;
    end if;

    insert into public.households (
      invitation_name,
      search_name,
      invitation_type
    ) values (
      household_name,
      lower(household_name),
      invitation_kind
    ) returning id into household_id;

    imported_households := imported_households + 1;

    for guest_payload in select value from jsonb_array_elements(household_payload->'guests')
    loop
      if trim(guest_payload#>>'{}') = '' or char_length(trim(guest_payload#>>'{}')) > 160 then
        raise exception 'Every guest needs a valid name.';
      end if;

      insert into public.guests (household_id, full_name)
      values (household_id, trim(guest_payload#>>'{}'));

      imported_guests := imported_guests + 1;
    end loop;
  end loop;

  return jsonb_build_object(
    'households', imported_households,
    'guests', imported_guests
  );
end;
$$;

create or replace function public.admin_update_household(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_household_id uuid := (payload->>'id')::uuid;
  household_name text := trim(payload->>'invitationName');
  invitation_kind text := lower(trim(payload->>'invitationType'));
  guest_payload jsonb;
  retained_guest_ids uuid[];
begin
  if household_name = '' or char_length(household_name) > 160 then
    raise exception 'A valid invitation name is required.';
  end if;

  if invitation_kind not in ('day', 'evening') then
    raise exception 'Invitation type must be day or evening.';
  end if;

  if jsonb_typeof(payload->'guests') <> 'array'
    or jsonb_array_length(payload->'guests') = 0 then
    raise exception 'At least one guest is required.';
  end if;

  if exists (
    select 1
    from public.households
    where lower(trim(invitation_name)) = lower(household_name)
      and id <> target_household_id
  ) then
    raise exception 'An invitation named "%" already exists.', household_name;
  end if;

  update public.households
  set invitation_name = household_name,
      search_name = lower(household_name),
      invitation_type = invitation_kind,
      updated_at = now()
  where id = target_household_id;

  if not found then
    raise exception 'Household not found.';
  end if;

  select coalesce(array_agg((value->>'id')::uuid), array[]::uuid[])
  into retained_guest_ids
  from jsonb_array_elements(payload->'guests')
  where nullif(value->>'id', '') is not null;

  delete from public.guests
  where household_id = target_household_id
    and not (id = any(retained_guest_ids));

  for guest_payload in select value from jsonb_array_elements(payload->'guests')
  loop
    if trim(guest_payload->>'fullName') = ''
      or char_length(trim(guest_payload->>'fullName')) > 160 then
      raise exception 'Every guest needs a valid name.';
    end if;

    if nullif(guest_payload->>'id', '') is null then
      insert into public.guests (household_id, full_name)
      values (target_household_id, trim(guest_payload->>'fullName'));
    else
      update public.guests
      set full_name = trim(guest_payload->>'fullName'),
          updated_at = now()
      where id = (guest_payload->>'id')::uuid
        and household_id = target_household_id;

      if not found then
        raise exception 'Guest not found in this household.';
      end if;
    end if;
  end loop;
end;
$$;

create or replace function public.admin_delete_household(p_household_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.guests where guests.household_id = p_household_id;
  delete from public.households where households.id = p_household_id;
end;
$$;

revoke all on function public.admin_import_households(jsonb) from public, anon, authenticated;
revoke all on function public.admin_update_household(jsonb) from public, anon, authenticated;
revoke all on function public.admin_delete_household(uuid) from public, anon, authenticated;

grant execute on function public.admin_import_households(jsonb) to service_role;
grant execute on function public.admin_update_household(jsonb) to service_role;
grant execute on function public.admin_delete_household(uuid) to service_role;
