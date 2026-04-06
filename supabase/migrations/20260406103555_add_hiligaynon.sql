-- Add Hiligaynon (ISO 639-3: hil) to resident_language enum
ALTER TYPE public.resident_language
ADD VALUE IF NOT EXISTS 'hil';
