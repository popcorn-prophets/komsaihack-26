drop function if exists private.assign_bootstrap_super_admin(uuid, text);
drop table if exists private.bootstrap_super_admins;

create table private.bootstrap_registration_state (
  singleton boolean primary key default true check (singleton),
  reservation_email text,
  reservation_expires_at timestamptz,
  bootstrap_user_id uuid references auth.users(id) on delete set null,
  bootstrap_completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bootstrap_registration_state_reservation_check check (
    (reservation_email is null and reservation_expires_at is null)
    or (reservation_email is not null and reservation_expires_at is not null)
  )
);

insert into private.bootstrap_registration_state (singleton)
values (true)
on conflict (singleton) do nothing;

create trigger set_bootstrap_registration_state_updated_at
before update on private.bootstrap_registration_state
for each row
execute function public.set_profile_updated_at();

create table public.account_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.app_role not null,
  token_hash text not null unique,
  invited_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz,
  claim_expires_at timestamptz,
  accepted_at timestamptz,
  accepted_user_id uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint account_invites_email_check check (
    email = lower(trim(email))
    and length(trim(email)) > 0
  ),
  constraint account_invites_role_check check (
    role in ('admin', 'responder')
  ),
  constraint account_invites_expiration_check check (
    expires_at is null or expires_at > created_at
  ),
  constraint account_invites_acceptance_check check (
    (accepted_at is null and accepted_user_id is null)
    or (accepted_at is not null and accepted_user_id is not null)
  )
);

create unique index account_invites_active_email_idx
  on public.account_invites (lower(email))
  where accepted_at is null and revoked_at is null;

create index account_invites_invited_by_idx
  on public.account_invites (invited_by, created_at desc);

create index account_invites_active_token_idx
  on public.account_invites (token_hash)
  where accepted_at is null and revoked_at is null;

create trigger set_account_invites_updated_at
before update on public.account_invites
for each row
execute function public.set_profile_updated_at();

create or replace function public.bootstrap_registration_open()
returns boolean
language sql
stable
security definer
set search_path = public, auth, private
as $$
  select
    not exists (select 1 from auth.users limit 1)
    and exists (
      select 1
      from private.bootstrap_registration_state as state
      where state.singleton = true
        and state.bootstrap_user_id is null
        and (
          state.reservation_expires_at is null
          or state.reservation_expires_at <= timezone('utc', now())
        )
    );
$$;

create or replace function public.claim_bootstrap_admin(
  target_email text
)
returns boolean
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  normalized_email text := lower(trim(target_email));
  state private.bootstrap_registration_state%rowtype;
begin
  if normalized_email is null or normalized_email = '' then
    return false;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('bootstrap-admin', 0));

  insert into private.bootstrap_registration_state (singleton)
  values (true)
  on conflict (singleton) do nothing;

  select *
  into state
  from private.bootstrap_registration_state
  where singleton = true
  for update;

  if exists (select 1 from auth.users limit 1) then
    return false;
  end if;

  if state.bootstrap_user_id is not null then
    return false;
  end if;

  if (
    state.reservation_email is not null
    and state.reservation_expires_at is not null
    and state.reservation_expires_at > timezone('utc', now())
    and state.reservation_email <> normalized_email
  ) then
    return false;
  end if;

  update private.bootstrap_registration_state
  set reservation_email = normalized_email,
      reservation_expires_at = timezone('utc', now()) + interval '10 minutes',
      updated_at = timezone('utc', now())
  where singleton = true;

  return true;
end;
$$;

create or replace function public.release_bootstrap_admin_claim(
  target_email text
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  normalized_email text := lower(trim(target_email));
begin
  if normalized_email is null or normalized_email = '' then
    return;
  end if;

  update private.bootstrap_registration_state
  set reservation_email = null,
      reservation_expires_at = null,
      updated_at = timezone('utc', now())
  where singleton = true
    and bootstrap_user_id is null
    and reservation_email = normalized_email;
end;
$$;

create or replace function public.claim_account_invite(
  target_token_hash text
)
returns table (
  id uuid,
  email text,
  role public.app_role,
  expires_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  update public.account_invites as invite
  set claim_expires_at = timezone('utc', now()) + interval '10 minutes',
      updated_at = timezone('utc', now())
  where invite.token_hash = trim(target_token_hash)
    and invite.accepted_at is null
    and invite.revoked_at is null
    and (
      invite.expires_at is null
      or invite.expires_at > timezone('utc', now())
    )
    and (
      invite.claim_expires_at is null
      or invite.claim_expires_at < timezone('utc', now())
    )
  returning
    invite.id,
    invite.email,
    invite.role,
    invite.expires_at;
$$;

create or replace function public.release_account_invite_claim(
  target_token_hash text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_token_hash text := trim(target_token_hash);
begin
  if normalized_token_hash is null or normalized_token_hash = '' then
    return;
  end if;

  update public.account_invites
  set claim_expires_at = null,
      updated_at = timezone('utc', now())
  where token_hash = normalized_token_hash
    and accepted_at is null
    and revoked_at is null;
end;
$$;

create or replace function public.complete_account_invite(
  target_token_hash text,
  target_user_id uuid
)
returns table (
  id uuid,
  email text,
  role public.app_role
)
language sql
security definer
set search_path = public
as $$
  with claimed_invite as (
    update public.account_invites as invite
    set accepted_at = timezone('utc', now()),
        accepted_user_id = target_user_id,
        claim_expires_at = null,
        updated_at = timezone('utc', now())
    where invite.token_hash = trim(target_token_hash)
      and target_user_id is not null
      and invite.accepted_at is null
      and invite.revoked_at is null
      and (
        invite.expires_at is null
        or invite.expires_at > timezone('utc', now())
      )
      and invite.claim_expires_at is not null
      and invite.claim_expires_at >= timezone('utc', now())
    returning invite.id, invite.email, invite.role
  ), assigned_role as (
    insert into public.role_assignments (user_id, role, scope_type, scope_id)
    select target_user_id, claimed_invite.role, 'global', null
    from claimed_invite
    on conflict (user_id, role, scope_type, scope_id) do nothing
    returning 1
  )
  select claimed_invite.id, claimed_invite.email, claimed_invite.role
  from claimed_invite;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  derived_full_name text;
  bootstrap_state private.bootstrap_registration_state%rowtype;
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
  on conflict (id) do update
    set full_name = coalesce(public.profiles.full_name, excluded.full_name);

  insert into private.bootstrap_registration_state (singleton)
  values (true)
  on conflict (singleton) do nothing;

  select *
  into bootstrap_state
  from private.bootstrap_registration_state
  where singleton = true
  for update;

  if (
    bootstrap_state.bootstrap_user_id is null
    and bootstrap_state.reservation_email = lower(new.email)
    and bootstrap_state.reservation_expires_at is not null
    and bootstrap_state.reservation_expires_at >= timezone('utc', now())
  ) then
    insert into public.role_assignments (user_id, role, scope_type, scope_id)
    values (new.id, 'super_admin', 'global', null)
    on conflict (user_id, role, scope_type, scope_id) do nothing;

    update private.bootstrap_registration_state
    set bootstrap_user_id = new.id,
        bootstrap_completed_at = timezone('utc', now()),
        reservation_email = null,
        reservation_expires_at = null,
        updated_at = timezone('utc', now())
    where singleton = true;
  end if;

  return new;
end;
$$;

alter table public.account_invites enable row level security;

create policy "Admins can read account invites"
on public.account_invites
for select
to authenticated
using (public.is_admin_or_above());

create policy "Admins can create account invites"
on public.account_invites
for insert
to authenticated
with check (
  invited_by = auth.uid()
  and (
    (public.has_role('super_admin') and role in ('admin', 'responder'))
    or (
      public.has_any_role(array['super_admin', 'admin']::public.app_role[])
      and role = 'responder'
    )
  )
);

create policy "Admins can delete pending invites"
on public.account_invites
for delete
to authenticated
using (
  accepted_at is null
  and (
    public.has_role('super_admin')
    or (
      public.has_role('admin')
      and role = 'responder'
      and invited_by = auth.uid()
    )
  )
);
