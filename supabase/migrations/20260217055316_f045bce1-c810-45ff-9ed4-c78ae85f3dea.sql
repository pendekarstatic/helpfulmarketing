
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS split_assets boolean DEFAULT true;
