create or replace view public.residents_with_coords as
select
  residents.id,
  residents.name,
  residents.platform,
  residents.platform_user_id,
  residents.thread_id,
  residents.language,
  residents.created_at,
  st_x(residents.location::geometry) as longitude,
  st_y(residents.location::geometry) as latitude
from public.residents;

alter view public.residents_with_coords set (security_invoker = true);

grant select on public.residents_with_coords to authenticated;

notify pgrst, 'reload schema';
