create schema if not exists private;

create type public.app_role as enum (
  'super_admin',
  'admin',
  'responder'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.role_assignments (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  scope_type text not null default 'global',
  scope_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  constraint role_assignments_scope_check check (
    (scope_type = 'global' and scope_id is null)
    or (scope_type <> 'global' and scope_id is not null)
  ),
  constraint role_assignments_user_role_scope_key unique nulls not distinct (
    user_id,
    role,
    scope_type,
    scope_id
  )
);

create index role_assignments_user_id_idx
  on public.role_assignments (user_id);

create index role_assignments_scope_lookup_idx
  on public.role_assignments (role, scope_type, scope_id);

create table private.bootstrap_super_admins (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now()),
  constraint bootstrap_super_admins_email_lower_check check (
    email = lower(email)
    and length(trim(email)) > 0
  )
);

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profile_updated_at();

create or replace function private.assign_bootstrap_super_admin(
  target_user_id uuid,
  target_email text
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if target_user_id is null or target_email is null then
    return;
  end if;

  if exists (
    select 1
    from private.bootstrap_super_admins bootstrap
    where bootstrap.email = lower(target_email)
  ) then
    insert into public.role_assignments (user_id, role, scope_type, scope_id)
    values (target_user_id, 'super_admin', 'global', null)
    on conflict (user_id, role, scope_type, scope_id) do nothing;
  end if;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  derived_full_name text;
begin
  derived_full_name := nullif(
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name'
      )
    ),
    ''
  );

  insert into public.profiles (id, full_name)
  values (new.id, derived_full_name)
  on conflict (id) do nothing;

  perform private.assign_bootstrap_super_admin(new.id, new.email);

  return new;
end;
$$;

insert into public.profiles (id, full_name)
select
  auth_user.id,
  nullif(
    trim(
      coalesce(
        auth_user.raw_user_meta_data ->> 'full_name',
        auth_user.raw_user_meta_data ->> 'name'
      )
    ),
    ''
  )
from auth.users as auth_user
on conflict (id) do nothing;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.role_assignments enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "role_assignments_select_own"
on public.role_assignments
for select
to authenticated
using (auth.uid() = user_id);
