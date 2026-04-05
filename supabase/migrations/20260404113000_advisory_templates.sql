create table public.advisory_templates (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint advisory_templates_name_non_empty check (length(trim(name)) > 0),
  constraint advisory_templates_title_non_empty check (length(trim(title)) > 0),
  constraint advisory_templates_message_non_empty check (length(trim(message)) > 0),
  constraint advisory_templates_creator_name_key unique nulls not distinct (created_by, name)
);

create index advisory_templates_created_by_idx
  on public.advisory_templates (created_by);

alter table public.advisory_templates enable row level security;

create policy "Staff can read advisory templates"
on public.advisory_templates
for select
to authenticated
using (public.is_responder_or_above());

create policy "Staff can insert advisory templates"
on public.advisory_templates
for insert
to authenticated
with check (
  public.is_responder_or_above()
  and created_by = auth.uid()
);
