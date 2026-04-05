insert into public.advisory_templates (created_by, name, title, message)
values
  (
    null,
    'Severe Rainfall Warning',
    'Severe Rainfall Warning',
    'Heavy to intense rainfall is expected in low-lying and flood-prone areas. Prepare go-bags, secure important documents, and monitor official DRRM channels for evacuation instructions.'
  ),
  (
    null,
    'Pre-Evacuation Advisory',
    'Pre-Evacuation Advisory',
    'Residents in high-risk zones are advised to prepare for possible evacuation. Keep communication lines open, assist vulnerable household members, and follow barangay response teams for updates.'
  ),
  (
    null,
    'Immediate Evacuation Order',
    'Immediate Evacuation Order',
    'Immediate evacuation is now in effect for identified danger areas. Proceed calmly to the nearest designated evacuation center and follow responder instructions at all times.'
  ),
  (
    null,
    'Aftershock Safety Reminder',
    'Aftershock Safety Reminder',
    'Aftershocks may still occur. Stay away from damaged structures, check for injuries, and report urgent needs through official DRRM hotlines or response channels.'
  ),
  (
    null,
    'Water Level Monitoring Notice',
    'Water Level Monitoring Notice',
    'River and creek water levels are being closely monitored. Stay alert for sudden rise in water, move vehicles and valuables to safer areas, and be ready for rapid response advisories.'
  )
on conflict (created_by, name) do nothing;
