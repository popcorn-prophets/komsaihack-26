create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_staff_role(
  target_user_id uuid,
  target_role public.app_role
)
returns table (
  user_id uuid,
  role public.app_role
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_user_id is null then
    raise exception 'target_user_id is required';
  end if;

  if target_role not in ('admin', 'responder') then
    raise exception 'target_role must be admin or responder';
  end if;

  delete from public.role_assignments
  where role_assignments.user_id = target_user_id
    and role_assignments.scope_type = 'global'
    and role_assignments.role in ('admin', 'responder');

  insert into public.role_assignments (user_id, role, scope_type, scope_id)
  values (target_user_id, target_role, 'global', null)
  on conflict on constraint role_assignments_user_role_scope_key do nothing;

  return query
  select target_user_id, target_role;
end;
$$;
