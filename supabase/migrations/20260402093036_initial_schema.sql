-- Enable extensions
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Incident severity
CREATE TYPE public.incident_severity AS ENUM (
  'low',
  'moderate',
  'high',
  'critical'
);

-- Incident status
CREATE TYPE public.incident_status AS ENUM (
  'new',
  'validated',
  'in_progress',
  'resolved',
  'dismissed'
);

-- Resident platform
CREATE TYPE public.resident_platform AS ENUM (
  'telegram',
  'messenger'
);

-- Resident language (ISO 639-3)
CREATE TYPE public.resident_language AS ENUM (
  'eng',
  'fil'
);

-- Residents
CREATE TABLE public.residents (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  platform public.resident_platform NOT NULL,
  platform_user_id text NOT NULL,
  thread_id text NOT NULL,
  name text NOT NULL,
  language public.resident_language NOT NULL DEFAULT 'fil',
  location geography(POINT, 4326) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, platform_user_id)
);

CREATE INDEX idx_residents_location ON public.residents USING GIST (location);

-- Incident Types
CREATE TABLE public.incident_types (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Incidents
CREATE TABLE public.incidents (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by uuid REFERENCES public.residents (id) ON DELETE SET NULL,
  incident_type_id uuid NOT NULL REFERENCES public.incident_types (id) ON DELETE RESTRICT,
  location geography(POINT, 4326),
  location_description text,
  severity public.incident_severity NOT NULL,
  description text,
  status public.incident_status NOT NULL DEFAULT 'new',
  incident_time timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_incidents_location ON public.incidents USING GIST (location);
CREATE INDEX idx_incidents_status ON public.incidents (status);
CREATE INDEX idx_incidents_severity ON public.incidents (severity);

-- Advisories
CREATE TABLE public.advisories (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  title text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Advisory Recipients
CREATE TABLE public.advisory_recipients (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  advisory_id uuid NOT NULL REFERENCES public.advisories (id) ON DELETE CASCADE,
  resident_id uuid NOT NULL REFERENCES public.residents (id) ON DELETE CASCADE,
  delivered_at timestamptz,
  UNIQUE (advisory_id, resident_id)
);

-- Automatically update updated_at on incidents
CREATE OR REPLACE FUNCTION public.set_incident_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER trg_incident_updated_at
BEFORE UPDATE ON public.incidents
FOR EACH ROW
EXECUTE FUNCTION public.set_incident_updated_at();

-- Enable RLS
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisory_recipients ENABLE ROW LEVEL SECURITY;

-- Residents Policies
CREATE POLICY "Backend can insert residents"
ON public.residents
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Responders can read residents"
ON public.residents
FOR SELECT
TO authenticated
USING (true);

-- Incident Types Policies
CREATE POLICY "Responders can read incident types"
ON public.incident_types
FOR SELECT
TO authenticated
USING (true);

-- Incidents Policies
CREATE POLICY "Backend can insert incidents"
ON public.incidents
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Responders can read incidents"
ON public.incidents
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Responders can update incidents"
ON public.incidents
FOR UPDATE
TO authenticated
USING ((SELECT auth.role()) = 'authenticated')
WITH CHECK ((SELECT auth.role()) = 'authenticated');

-- Advisories Policies
CREATE POLICY "Responders can read advisories"
ON public.advisories
FOR SELECT
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Responders can insert advisories"
ON public.advisories
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Responders can update advisories"
ON public.advisories
FOR UPDATE
TO authenticated
USING ((SELECT auth.role()) = 'authenticated')
WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Responders can delete advisories"
ON public.advisories
FOR DELETE
TO authenticated
USING ((SELECT auth.role()) = 'authenticated');

-- Advisory Recipients Policies
CREATE POLICY "Backend can insert advisory recipients"
ON public.advisory_recipients
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Responders can read advisory recipients"
ON public.advisory_recipients
FOR SELECT
TO authenticated
USING ((select auth.role()) = 'authenticated');

CREATE POLICY "Backend can update advisory recipients"
ON public.advisory_recipients
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
