create or replace function public.residents_within_polygon(target_polygon jsonb)
returns table (
  id uuid,
  thread_id text,
  platform public.resident_platform
)
language sql
stable
security definer
set search_path = public
as $$
  with polygon as (
    select extensions.st_setsrid(
      extensions.st_geomfromgeojson(target_polygon::text),
      4326
    ) as geom
  )
  select r.id, r.thread_id, r.platform
  from public.residents r
  cross join polygon p
  where extensions.st_within(r.location::extensions.geometry, p.geom)
$$;

grant execute on function public.residents_within_polygon(jsonb) to authenticated;

notify pgrst, 'reload schema';
