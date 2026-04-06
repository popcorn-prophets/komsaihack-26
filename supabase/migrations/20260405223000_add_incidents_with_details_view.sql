create or replace view public.incidents_with_details as
select
  incidents.id,
  incidents.incident_type_id,
  incident_types.name as incident_type_name,
  incidents.severity,
  incidents.status,
  incidents.incident_time,
  incidents.created_at,
  incidents.updated_at,
  incidents.description,
  incidents.location_description,
  st_x(incidents.location::geometry) as longitude,
  st_y(incidents.location::geometry) as latitude,
  incidents.reported_by,
  residents.name as reporter_name,
  residents.platform as reporter_platform,
  residents.thread_id as reporter_thread_id
from public.incidents
left join public.incident_types
  on incident_types.id = incidents.incident_type_id
left join public.residents
  on residents.id = incidents.reported_by;

alter view public.incidents_with_details set (security_invoker = true);

grant select on public.incidents_with_details to authenticated;

notify pgrst, 'reload schema';
