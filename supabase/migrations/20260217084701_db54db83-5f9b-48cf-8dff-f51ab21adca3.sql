
-- Create custom_pages table for homepage and other manually created HTML pages
CREATE TABLE public.custom_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  url_path TEXT NOT NULL DEFAULT '/',
  html_content TEXT NOT NULL DEFAULT '',
  css_content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  is_homepage BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_pages ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can manage custom pages through their projects
CREATE POLICY "Users can manage own custom pages"
  ON public.custom_pages
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = custom_pages.project_id AND projects.user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_custom_pages_updated_at
  BEFORE UPDATE ON public.custom_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
