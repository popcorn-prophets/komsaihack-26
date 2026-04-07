-- Add Web Chat platform to resident_platform enum
ALTER TYPE public.resident_platform
ADD VALUE IF NOT EXISTS 'webchat';
