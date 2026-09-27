-- The admin dashboard's 4-layer cinematic parallax hero (intro / back / mid /
-- front clip URLs) was shipped writing this column, but the column itself was
-- never added, so every "Save layout" failed with PGRST204 and no parallax URL
-- could persist. Additive, defaulted, and existing rows keep working unchanged.
ALTER TABLE public.site_layouts
  ADD COLUMN IF NOT EXISTS hero_parallax_urls jsonb NOT NULL DEFAULT '{}'::jsonb;
