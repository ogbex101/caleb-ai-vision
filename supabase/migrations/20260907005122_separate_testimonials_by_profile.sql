-- Testimonials were one shared pool across every profile (caleb/faith/daniel).
-- Give each profile its own reviews while keeping portfolio_items shared.
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS username text NOT NULL DEFAULT 'caleb';

CREATE INDEX IF NOT EXISTS testimonials_username_idx ON public.testimonials (username);

-- The existing seeded reviews were written for Caleb and already default to
-- 'caleb' above; give Faith and Daniel their own starter reviews so their
-- sections aren't empty. Guarded so re-running this migration is a no-op.
INSERT INTO public.testimonials (client_name, client_title, content, rating, sort_order, username)
SELECT * FROM (VALUES
  ('Priya Nandan', 'Founder, Aurora Wellness', 'Faith brought a calm, precise eye to a project that had a lot of moving parts. The final cut felt effortless even though the raw footage absolutely was not.', 5, 1, 'faith'),
  ('Diego Alvarez', 'Producer, Nightshift Media', 'Faith is meticulous about pacing and sound. Every edit she has sent back has needed almost no notes.', 5, 2, 'faith'),
  ('Wale Adenuga', 'Brand Lead, Solstice Beverages', 'Daniel Studio turned a two-line brief into a fully generated spot in days. The motion design alone looked like a much bigger production budget.', 5, 1, 'daniel'),
  ('Hana Kobayashi', 'Producer, Kobo Studios', 'What impressed me most was how consistent the AI-generated shots looked next to each other. Daniel clearly has a real pipeline, not just one-off prompts.', 5, 2, 'daniel')
) AS seed(client_name, client_title, content, rating, sort_order, username)
WHERE NOT EXISTS (
  SELECT 1 FROM public.testimonials t
  WHERE t.username = seed.username AND t.client_name = seed.client_name
);
