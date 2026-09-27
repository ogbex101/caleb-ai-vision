-- Per-user settings the admin Settings section needs.
--
-- maintenance_mode takes a single layout off the public site without deleting
-- anything or redeploying, which is what you want while a layout is being
-- built. The SEO columns replace titles and descriptions that were hardcoded
-- into each page component, so each user can own their own search snippet.
--
-- Additive and defaulted: existing rows come out with maintenance off and NULL
-- SEO, which means every page keeps the copy it has today.
ALTER TABLE public.site_layouts
  ADD COLUMN IF NOT EXISTS maintenance_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS maintenance_message text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;
