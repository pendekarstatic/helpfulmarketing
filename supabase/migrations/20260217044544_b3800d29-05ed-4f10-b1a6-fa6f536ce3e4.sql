
-- Add new project settings columns
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS url_format text DEFAULT 'pretty_slash';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS custom_domain text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS theme text DEFAULT 'dark';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS openrouter_api_key text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS straico_api_key text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS ai_model text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS brand_guidelines text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS sitemap_max_urls integer DEFAULT 50000;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS sitemap_separate boolean DEFAULT true;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS favicon_url text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS og_image_url text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS analytics_code text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS robots_txt text DEFAULT '';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS use_header_footer boolean DEFAULT false;
