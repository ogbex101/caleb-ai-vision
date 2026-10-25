-- Editable copy for two homepage sections that shipped with hardcoded content:
-- the service tiers (names, prices, what each includes) and the before/after
-- comparison (its two images and labels).
--
-- Stored per layout rather than globally, so each profile can price and present
-- its own work. Both are additive and defaulted, so existing rows come out with
-- empty values and the sections keep showing their built-in defaults until
-- something is saved.
ALTER TABLE public.site_layouts
  ADD COLUMN IF NOT EXISTS services jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS before_after jsonb NOT NULL DEFAULT '{}'::jsonb;
