-- ============================================================================
-- Project HERMES deterministic dashboard seed
-- Target volume (approx): residents 70, incidents 110, advisories 25,
-- advisory_recipients 140, reference/auth/invites 20+
-- ============================================================================

-- 1) Cleanup for deterministic reruns
delete from public.advisory_recipients;
delete from public.advisories;
delete from public.incidents;
delete from public.residents;

delete from public.account_invites
where email like '%@hermes.local';

delete from public.role_assignments
where user_id in (
  '10000000-0000-4000-8000-000000000001'::uuid,
  '10000000-0000-4000-8000-000000000002'::uuid,
  '10000000-0000-4000-8000-000000000003'::uuid,
  '10000000-0000-4000-8000-000000000004'::uuid
);

delete from public.profiles
where id in (
  '10000000-0000-4000-8000-000000000001'::uuid,
  '10000000-0000-4000-8000-000000000002'::uuid,
  '10000000-0000-4000-8000-000000000003'::uuid,
  '10000000-0000-4000-8000-000000000004'::uuid
);

delete from auth.users
where id in (
  '10000000-0000-4000-8000-000000000001'::uuid,
  '10000000-0000-4000-8000-000000000002'::uuid,
  '10000000-0000-4000-8000-000000000003'::uuid,
  '10000000-0000-4000-8000-000000000004'::uuid
);

-- 2) Reference dimensions (incident types + advisory templates)
delete from public.incident_types
where name in (
  'Flood',
  'Storm',
  'Landslide',
  'Fire',
  'Medical Emergency',
  'Road Accident',
  'Coastal Surge'
);

insert into public.incident_types (id, name, description)
values
  ('20000000-0000-4000-8000-000000000001', 'Flood', 'Overflowing rivers, creeks, and flash flooding events'),
  ('20000000-0000-4000-8000-000000000002', 'Storm', 'Strong winds, tropical storm, and typhoon impacts'),
  ('20000000-0000-4000-8000-000000000003', 'Landslide', 'Slope failures and soil/rock movement in upland barangays'),
  ('20000000-0000-4000-8000-000000000004', 'Fire', 'Residential, commercial, and brush fire incidents'),
  ('20000000-0000-4000-8000-000000000005', 'Medical Emergency', 'Urgent health incidents requiring immediate response'),
  ('20000000-0000-4000-8000-000000000006', 'Road Accident', 'Vehicular collisions and roadway hazards'),
  ('20000000-0000-4000-8000-000000000007', 'Coastal Surge', 'High tide and wave surge impacts near coastal zones');

-- 3) Auth/staff bootstrap block (deterministic test users + roles + invites)
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'super.admin@hermes.local',
    crypt('DevPassword123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ari Super Admin"}',
    timezone('utc', now()) - interval '100 days',
    timezone('utc', now()) - interval '1 day',
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'admin.ops@hermes.local',
    crypt('DevPassword123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Mika Operations Admin"}',
    timezone('utc', now()) - interval '80 days',
    timezone('utc', now()) - interval '2 days',
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000003',
    'authenticated',
    'authenticated',
    'responder.alpha@hermes.local',
    crypt('DevPassword123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Noel Responder Alpha"}',
    timezone('utc', now()) - interval '70 days',
    timezone('utc', now()) - interval '6 hours',
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-4000-8000-000000000004',
    'authenticated',
    'authenticated',
    'responder.bravo@hermes.local',
    crypt('DevPassword123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ivy Responder Bravo"}',
    timezone('utc', now()) - interval '60 days',
    timezone('utc', now()) - interval '12 hours',
    '',
    '',
    '',
    ''
  )
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at;

insert into public.profiles (id, full_name)
values
  ('10000000-0000-4000-8000-000000000001', 'Ari Super Admin'),
  ('10000000-0000-4000-8000-000000000002', 'Mika Operations Admin'),
  ('10000000-0000-4000-8000-000000000003', 'Noel Responder Alpha'),
  ('10000000-0000-4000-8000-000000000004', 'Ivy Responder Bravo')
on conflict (id) do update
set full_name = excluded.full_name;

insert into public.role_assignments (user_id, role, scope_type, scope_id)
values
  ('10000000-0000-4000-8000-000000000001', 'super_admin', 'global', null),
  ('10000000-0000-4000-8000-000000000002', 'admin', 'global', null),
  ('10000000-0000-4000-8000-000000000003', 'responder', 'global', null),
  ('10000000-0000-4000-8000-000000000004', 'responder', 'global', null)
on conflict (user_id, role, scope_type, scope_id) do nothing;

insert into public.account_invites (
  email,
  role,
  token_hash,
  invited_by,
  expires_at,
  claim_expires_at,
  accepted_at,
  accepted_user_id,
  revoked_at,
  created_at,
  updated_at
)
values
  (
    'pending.admin1@hermes.local',
    'admin',
    'seed-token-admin-01',
    '10000000-0000-4000-8000-000000000001',
    timezone('utc', now()) + interval '14 days',
    null,
    null,
    null,
    null,
    timezone('utc', now()) - interval '4 days',
    timezone('utc', now()) - interval '4 days'
  ),
  (
    'pending.responder1@hermes.local',
    'responder',
    'seed-token-responder-01',
    '10000000-0000-4000-8000-000000000002',
    timezone('utc', now()) + interval '10 days',
    null,
    null,
    null,
    null,
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    'pending.responder2@hermes.local',
    'responder',
    'seed-token-responder-02',
    '10000000-0000-4000-8000-000000000002',
    timezone('utc', now()) + interval '7 days',
    null,
    null,
    null,
    null,
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) - interval '1 day'
  )
on conflict (token_hash) do update
set
  email = excluded.email,
  role = excluded.role,
  invited_by = excluded.invited_by,
  expires_at = excluded.expires_at,
  claim_expires_at = excluded.claim_expires_at,
  accepted_at = excluded.accepted_at,
  accepted_user_id = excluded.accepted_user_id,
  revoked_at = excluded.revoked_at,
  updated_at = excluded.updated_at;

do $$
begin
  if to_regclass('public.advisory_templates') is not null then
    insert into public.advisory_templates (created_by, name, title, message, created_at)
    values
      (
        '10000000-0000-4000-8000-000000000001',
        'Severe Rainfall Warning',
        'Severe Rainfall Warning',
        'Heavy rainfall is expected in low-lying and flood-prone areas. Prepare go-bags and monitor official DRRM updates.',
        timezone('utc', now()) - interval '40 days'
      ),
      (
        '10000000-0000-4000-8000-000000000001',
        'Pre-Evacuation Advisory',
        'Pre-Evacuation Advisory',
        'Residents in high-risk zones are advised to prepare for possible evacuation and assist vulnerable household members.',
        timezone('utc', now()) - interval '35 days'
      ),
      (
        '10000000-0000-4000-8000-000000000001',
        'Immediate Evacuation Order',
        'Immediate Evacuation Order',
        'Immediate evacuation is now in effect for identified danger areas. Proceed to the nearest evacuation center.',
        timezone('utc', now()) - interval '28 days'
      ),
      (
        '10000000-0000-4000-8000-000000000002',
        'River Level Watch',
        'River Level Watch',
        'River levels are rising steadily. Move valuables to higher ground and stand by for official instructions.',
        timezone('utc', now()) - interval '21 days'
      ),
      (
        '10000000-0000-4000-8000-000000000002',
        'Aftershock Safety Reminder',
        'Aftershock Safety Reminder',
        'Aftershocks may occur. Stay clear of damaged structures and report urgent needs to responders.',
        timezone('utc', now()) - interval '14 days'
      )
    on conflict (created_by, name) do update
    set
      title = excluded.title,
      message = excluded.message;
  end if;
end $$;

-- 4) Residents (70 varied rows)
with resident_seed as (
  select
    n,
    (
      substr(md5('resident-' || n::text), 1, 8) || '-' ||
      substr(md5('resident-' || n::text), 9, 4) || '-' ||
      substr(md5('resident-' || n::text), 13, 4) || '-' ||
      substr(md5('resident-' || n::text), 17, 4) || '-' ||
      substr(md5('resident-' || n::text), 21, 12)
    )::uuid as id,
    case when n % 2 = 0 then 'telegram'::public.resident_platform else 'messenger'::public.resident_platform end as platform,
    'user_' || lpad(n::text, 4, '0') as platform_user_id,
    'thread_' || lpad(n::text, 4, '0') as thread_id,
    'Resident ' || lpad(n::text, 3, '0') as name,
    case when n % 3 = 0 then 'eng'::public.resident_language else 'fil'::public.resident_language end as language,
    (120.58 + ((n % 10) * 0.006) + ((n % 3) * 0.0015))::double precision as lon,
    (10.60 + ((n % 7) * 0.007) + ((n % 5) * 0.0012))::double precision as lat,
    timezone('utc', now()) - ((n * 31) % 2200) * interval '1 hour' as created_at
  from generate_series(1, 70) as gs(n)
)
insert into public.residents (id, platform, platform_user_id, thread_id, name, language, location, created_at)
select
  id,
  platform,
  platform_user_id,
  thread_id,
  name,
  language,
  extensions.ST_SetSRID(extensions.ST_MakePoint(lon, lat), 4326)::geography,
  created_at
from resident_seed
on conflict (id) do update
set
  platform = excluded.platform,
  platform_user_id = excluded.platform_user_id,
  thread_id = excluded.thread_id,
  name = excluded.name,
  language = excluded.language,
  location = excluded.location;

-- 5) Incidents (110 rows with status/severity/time variation over ~90 days)
with resident_ids as (
  select id, row_number() over (order by id) as rn
  from public.residents
),
incident_seed as (
  select
    n,
    (
      substr(md5('incident-' || n::text), 1, 8) || '-' ||
      substr(md5('incident-' || n::text), 9, 4) || '-' ||
      substr(md5('incident-' || n::text), 13, 4) || '-' ||
      substr(md5('incident-' || n::text), 17, 4) || '-' ||
      substr(md5('incident-' || n::text), 21, 12)
    )::uuid as id,
    (select id from resident_ids where rn = ((n - 1) % 70) + 1) as reported_by,
    case ((n - 1) % 7) + 1
      when 1 then '20000000-0000-4000-8000-000000000001'::uuid
      when 2 then '20000000-0000-4000-8000-000000000002'::uuid
      when 3 then '20000000-0000-4000-8000-000000000003'::uuid
      when 4 then '20000000-0000-4000-8000-000000000004'::uuid
      when 5 then '20000000-0000-4000-8000-000000000005'::uuid
      when 6 then '20000000-0000-4000-8000-000000000006'::uuid
      else '20000000-0000-4000-8000-000000000007'::uuid
    end as incident_type_id,
    (120.59 + ((n % 11) * 0.005) + ((n % 4) * 0.0012))::double precision as lon,
    (10.61 + ((n % 9) * 0.0065) + ((n % 5) * 0.0011))::double precision as lat,
    'Barangay zone ' || ((n % 20) + 1) as location_description,
    case
      when n % 10 in (0, 1) then 'new'::public.incident_status
      when n % 10 in (2, 3) then 'validated'::public.incident_status
      when n % 10 in (4, 5, 6) then 'in_progress'::public.incident_status
      when n % 10 in (7, 8) then 'resolved'::public.incident_status
      else 'dismissed'::public.incident_status
    end as status,
    case
      when n % 8 in (0, 1, 2) then 'low'::public.incident_severity
      when n % 8 in (3, 4) then 'moderate'::public.incident_severity
      when n % 8 in (5, 6) then 'high'::public.incident_severity
      else 'critical'::public.incident_severity
    end as severity,
    'Field report #' || lpad(n::text, 3, '0') || ': observed hazard requiring DRRM monitoring.' as description,
    timezone('utc', now()) - ((n * 19) % 2160) * interval '1 hour' as incident_time
  from generate_series(1, 110) as gs(n)
)
insert into public.incidents (
  id,
  reported_by,
  incident_type_id,
  location,
  location_description,
  severity,
  description,
  status,
  incident_time,
  created_at,
  updated_at
)
select
  id,
  reported_by,
  incident_type_id,
  extensions.ST_SetSRID(extensions.ST_MakePoint(lon, lat), 4326)::geography,
  location_description,
  severity,
  description,
  status,
  incident_time,
  incident_time + interval '10 minutes',
  incident_time + interval '45 minutes'
from incident_seed;

-- 6) Advisories (25 rows in recent windows with varied cadence)
with advisory_seed as (
  select
    n,
    (
      substr(md5('advisory-' || n::text), 1, 8) || '-' ||
      substr(md5('advisory-' || n::text), 9, 4) || '-' ||
      substr(md5('advisory-' || n::text), 13, 4) || '-' ||
      substr(md5('advisory-' || n::text), 17, 4) || '-' ||
      substr(md5('advisory-' || n::text), 21, 12)
    )::uuid as id,
    case
      when n % 4 = 0 then '10000000-0000-4000-8000-000000000004'::uuid
      when n % 3 = 0 then '10000000-0000-4000-8000-000000000003'::uuid
      when n % 2 = 0 then '10000000-0000-4000-8000-000000000002'::uuid
      else '10000000-0000-4000-8000-000000000001'::uuid
    end as created_by,
    'Community Advisory #' || lpad(n::text, 2, '0') as title,
    case
      when n % 5 = 0 then 'Heavy rainfall expected. Prepare emergency kits and monitor flood-prone areas.'
      when n % 5 = 1 then 'Road section monitoring in progress. Expect intermittent traffic rerouting.'
      when n % 5 = 2 then 'Health desk reminder: report injuries and urgent medical concerns promptly.'
      when n % 5 = 3 then 'Barangay responders are conducting pre-emptive checks in identified high-risk zones.'
      else 'Continue monitoring official channels for evacuation and weather updates.'
    end as message,
    timezone('utc', now()) - ((n * 77) % 2160) * interval '1 hour' as created_at
  from generate_series(1, 25) as gs(n)
)
insert into public.advisories (id, created_by, title, message, created_at)
select id, created_by, title, message, created_at
from advisory_seed;

-- 7) Advisory recipients (140 rows with mixed delivery outcomes)
with advisory_rank as (
  select id, row_number() over (order by created_at asc, id) as rn
  from public.advisories
),
resident_rank as (
  select id, row_number() over (order by created_at asc, id) as rn
  from public.residents
),
recipient_seed as (
  select
    (
      substr(md5('adv-recipient-' || a.rn::text || '-' || r.rn::text), 1, 8) || '-' ||
      substr(md5('adv-recipient-' || a.rn::text || '-' || r.rn::text), 9, 4) || '-' ||
      substr(md5('adv-recipient-' || a.rn::text || '-' || r.rn::text), 13, 4) || '-' ||
      substr(md5('adv-recipient-' || a.rn::text || '-' || r.rn::text), 17, 4) || '-' ||
      substr(md5('adv-recipient-' || a.rn::text || '-' || r.rn::text), 21, 12)
    )::uuid as id,
    a.id as advisory_id,
    r.id as resident_id,
    row_number() over (order by a.rn, r.rn) as seq
  from advisory_rank a
  join resident_rank r
    on ((a.rn * 3 + r.rn * 5) % 11) < 2
)
insert into public.advisory_recipients (id, advisory_id, resident_id, delivered_at)
select
  id,
  advisory_id,
  resident_id,
  case
    when seq % 6 = 0 then null
    else timezone('utc', now()) - ((seq * 13) % 720) * interval '1 minute'
  end as delivered_at
from recipient_seed
where seq <= 140
on conflict (advisory_id, resident_id) do update
set delivered_at = excluded.delivered_at;

-- 8) Optional sanity checks for dashboard realism
select 'residents_total' as metric, count(*)::text as value from public.residents
union all
select 'incidents_total', count(*)::text from public.incidents
union all
select 'advisories_total', count(*)::text from public.advisories
union all
select 'advisory_recipients_total', count(*)::text from public.advisory_recipients
union all
select 'open_incidents', count(*)::text
from public.incidents
where status in ('new', 'validated', 'in_progress')
union all
select 'open_high_critical_incidents', count(*)::text
from public.incidents
where status in ('new', 'validated', 'in_progress')
  and severity in ('high', 'critical')
union all
select 'incidents_last_7d', count(*)::text
from public.incidents
where incident_time >= timezone('utc', now()) - interval '7 days'
union all
select 'incidents_last_30d', count(*)::text
from public.incidents
where incident_time >= timezone('utc', now()) - interval '30 days'
union all
select 'incidents_last_90d', count(*)::text
from public.incidents
where incident_time >= timezone('utc', now()) - interval '90 days'
union all
select 'advisories_last_30d', count(*)::text
from public.advisories
where created_at >= timezone('utc', now()) - interval '30 days'
union all
select 'delivery_success_rate_pct',
  round(
    100.0 * count(*) filter (where delivered_at is not null) / nullif(count(*), 0),
    2
  )::text
from public.advisory_recipients
union all
select 'responder_count', count(*)::text
from public.role_assignments
where role = 'responder'
union all
select 'pending_invites', count(*)::text
from public.account_invites
where accepted_at is null
  and revoked_at is null
  and (expires_at is null or expires_at > timezone('utc', now()));
