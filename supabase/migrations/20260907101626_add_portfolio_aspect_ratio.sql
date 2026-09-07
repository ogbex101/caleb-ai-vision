-- Lets visitors narrow a niche down to an exact orientation (e.g. AI Video
-- > Talking Head > 9:16) instead of stopping at the subcategory.
ALTER TABLE public.portfolio_items ADD COLUMN IF NOT EXISTS aspect_ratio text NOT NULL DEFAULT '16:9';
CREATE INDEX IF NOT EXISTS portfolio_items_aspect_ratio_idx ON public.portfolio_items (aspect_ratio);
