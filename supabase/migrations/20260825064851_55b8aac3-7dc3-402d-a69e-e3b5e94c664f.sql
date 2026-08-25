
ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS category_slug text,
  ADD COLUMN IF NOT EXISTS subcategory_slug text,
  ADD COLUMN IF NOT EXISTS preview_seconds integer NOT NULL DEFAULT 30;

CREATE TABLE IF NOT EXISTS public.site_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  display_name text NOT NULL,
  theme text NOT NULL DEFAULT 'classic',
  tagline text,
  hero_media_url text,
  hero_media_type text NOT NULL DEFAULT 'video',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_layouts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_layouts TO authenticated;
GRANT ALL ON public.site_layouts TO service_role;
ALTER TABLE public.site_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_layouts public read" ON public.site_layouts FOR SELECT USING (true);
CREATE POLICY "site_layouts admin manage" ON public.site_layouts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  username text,
  category_slug text,
  subcategory_slug text,
  referrer text,
  source text NOT NULL DEFAULT 'direct',
  utm_source text,
  utm_medium text,
  utm_campaign text,
  visitor_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.page_views TO anon;
GRANT SELECT, INSERT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "page_views anyone can record" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "page_views admin read" ON public.page_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.link_copies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text,
  category_slug text,
  subcategory_slug text,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.link_copies TO anon;
GRANT SELECT, INSERT ON public.link_copies TO authenticated;
GRANT ALL ON public.link_copies TO service_role;
ALTER TABLE public.link_copies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "link_copies anyone can record" ON public.link_copies FOR INSERT WITH CHECK (true);
CREATE POLICY "link_copies admin read" ON public.link_copies FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX IF NOT EXISTS page_views_created_idx ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS portfolio_items_cat_idx ON public.portfolio_items (category_slug, subcategory_slug);

INSERT INTO public.site_layouts (username, display_name, theme, tagline)
VALUES
  ('caleb','Caleb Peters','classic','AI Video Editor & Creator'),
  ('faith','Faith K','classic','AI Video Editor & Creator'),
  ('daniel','Daniel','cinematic','AI Video Studio — Showreel')
ON CONFLICT (username) DO NOTHING;
