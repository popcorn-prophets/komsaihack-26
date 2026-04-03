create or replace function public.has_role(
  target_role public.app_role,
  target_scope_type text default 'global',
  target_scope_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.role_assignments as role_assignment
    where role_assignment.user_id = auth.uid()
      and role_assignment.role = target_role
      and role_assignment.scope_type = target_scope_type
      and role_assignment.scope_id is not distinct from target_scope_id
  );
$$;

create or replace function public.has_any_role(
  target_roles public.app_role[],
  target_scope_type text default 'global',
  target_scope_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.role_assignments as role_assignment
    where role_assignment.user_id = auth.uid()
      and role_assignment.role = any(target_roles)
      and role_assignment.scope_type = target_scope_type
      and role_assignment.scope_id is not distinct from target_scope_id
  );
$$;

create or replace function public.is_responder_or_above()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_any_role(
    array[
      'super_admin',
      'admin',
      'responder'
    ]::public.app_role[]
  );
$$;

create or replace function public.is_admin_or_above()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_any_role(
    array[
      'super_admin',
      'admin'
    ]::public.app_role[]
  );
$$;

drop policy if exists "Responders can read residents" on public.residents;
drop policy if exists "Responders can read incident types" on public.incident_types;
drop policy if exists "Responders can read incidents" on public.incidents;
drop policy if exists "Responders can update incidents" on public.incidents;
drop policy if exists "Responders can read advisories" on public.advisories;
drop policy if exists "Responders can insert advisories" on public.advisories;
drop policy if exists "Responders can update advisories" on public.advisories;
drop policy if exists "Responders can delete advisories" on public.advisories;
drop policy if exists "Responders can read advisory recipients" on public.advisory_recipients;

create policy "Staff can read residents"
on public.residents
for select
to authenticated
using (public.is_responder_or_above());

create policy "Staff can read incident types"
on public.incident_types
for select
to authenticated
using (public.is_responder_or_above());

create policy "Admins can manage incident types"
on public.incident_types
for all
to authenticated
using (public.is_admin_or_above())
with check (public.is_admin_or_above());

create policy "Staff can read incidents"
on public.incidents
for select
to authenticated
using (public.is_responder_or_above());

create policy "Staff can update incidents"
on public.incidents
for update
to authenticated
using (public.is_responder_or_above())
with check (public.is_responder_or_above());

create policy "Staff can read advisories"
on public.advisories
for select
to authenticated
using (public.is_responder_or_above());

create policy "Staff can insert advisories"
on public.advisories
for insert
to authenticated
with check (
  public.is_responder_or_above()
  and created_by = auth.uid()
);

create policy "Staff can update advisories"
on public.advisories
for update
to authenticated
using (public.is_responder_or_above())
with check (public.is_responder_or_above());

create policy "Staff can delete advisories"
on public.advisories
for delete
to authenticated
using (public.is_responder_or_above());

create policy "Staff can read advisory recipients"
on public.advisory_recipients
for select
to authenticated
using (public.is_responder_or_above());

create policy "Admins can read profiles"
on public.profiles
for select
to authenticated
using (public.is_admin_or_above());

create policy "Admins can read role assignments"
on public.role_assignments
for select
to authenticated
using (public.is_admin_or_above());

create policy "Super admins can insert role assignments"
on public.role_assignments
for insert
to authenticated
with check (public.has_role('super_admin'));

create policy "Super admins can update role assignments"
on public.role_assignments
for update
to authenticated
using (public.has_role('super_admin'))
with check (public.has_role('super_admin'));

create policy "Super admins can delete role assignments"
on public.role_assignments
for delete
to authenticated
using (public.has_role('super_admin'));
