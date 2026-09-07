ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS aspect_ratio text NOT NULL DEFAULT '16:9',
  ADD COLUMN IF NOT EXISTS category_tags jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.portfolio_items
  ADD CONSTRAINT portfolio_items_category_tags_max5
  CHECK (jsonb_typeof(category_tags) = 'array' AND jsonb_array_length(category_tags) <= 5);

UPDATE public.portfolio_items
SET category_tags = jsonb_build_array(
  jsonb_build_object('category', category_slug, 'subcategory', subcategory_slug)
)
WHERE category_slug IS NOT NULL
  AND jsonb_array_length(category_tags) = 0;