alter table public.households
add column if not exists invitation_type text not null default 'day';

alter table public.households
drop constraint if exists households_invitation_type_check;

alter table public.households
add constraint households_invitation_type_check
check (invitation_type in ('day', 'evening'));

comment on column public.households.invitation_type is
'Whether everyone in this household has a day or evening invitation.';
