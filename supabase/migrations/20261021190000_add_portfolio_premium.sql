-- Marks the handful of pieces that belong in the Premium Work showcase, which
-- is a separate idea from `featured`: featured decides what appears on the
-- landing page grid, premium decides what gets the flagship treatment.
--
-- Additive and defaulted, so every existing row comes out premium = false and
-- the new section simply stays empty until you tick something.
ALTER TABLE public.portfolio_items
  ADD COLUMN IF NOT EXISTS premium boolean NOT NULL DEFAULT false;

-- The section reads a short list ordered by sort_order, so give it an index
-- rather than scanning the whole library on every page load.
CREATE INDEX IF NOT EXISTS portfolio_items_premium_idx
  ON public.portfolio_items (premium, sort_order) WHERE premium;
