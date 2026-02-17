-- Add local_seo to project_mode enum
ALTER TYPE public.project_mode ADD VALUE IF NOT EXISTS 'local_seo';