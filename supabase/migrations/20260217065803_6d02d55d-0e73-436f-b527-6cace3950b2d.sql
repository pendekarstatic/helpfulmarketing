
-- User global settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Add generation config to templates
ALTER TABLE public.templates
  ADD COLUMN IF NOT EXISTS generation_mode TEXT NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS split_column TEXT,
  ADD COLUMN IF NOT EXISTS combo_columns JSONB,
  ADD COLUMN IF NOT EXISTS filter_rules JSONB;
