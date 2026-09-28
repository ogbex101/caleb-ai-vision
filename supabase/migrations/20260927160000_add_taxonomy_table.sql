-- Categories and sub-categories lived in src/lib/categories.ts, so adding a
-- niche (e.g. "3D", "2D") meant a code change and a deploy. This moves the
-- taxonomy into the database so admin can manage it from the dashboard.
--
-- Seeded with exactly the CATEGORIES array it replaces, so nothing changes
-- visually on first deploy. categories.ts keeps that array as the fallback used
-- before the fetch resolves, or if it fails.
CREATE TABLE IF NOT EXISTS public.taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULL for a top-level category, otherwise the parent category's slug.
  parent_category text,
  slug text NOT NULL,
  label text NOT NULL,
  blurb text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Sub-category slugs repeat across parents (both categories have
  -- "talking-head"), so uniqueness is per parent, not global.
  CONSTRAINT taxonomy_parent_slug_key UNIQUE (parent_category, slug)
);

-- NULLs compare as distinct in a UNIQUE constraint, so the constraint above
-- does not stop two top-level rows sharing a slug. This does.
CREATE UNIQUE INDEX IF NOT EXISTS taxonomy_top_level_slug_idx
  ON public.taxonomy (slug) WHERE parent_category IS NULL;

CREATE INDEX IF NOT EXISTS taxonomy_parent_category_idx ON public.taxonomy (parent_category);

GRANT SELECT ON public.taxonomy TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.taxonomy TO authenticated;
GRANT ALL ON public.taxonomy TO service_role;

ALTER TABLE public.taxonomy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "taxonomy public read" ON public.taxonomy FOR SELECT USING (true);
CREATE POLICY "taxonomy admin manage" ON public.taxonomy FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.taxonomy (parent_category, slug, label, blurb, sort_order) VALUES
  (NULL, 'ai-video', 'AI Video', 'Fully AI-generated films, avatars and synthetic footage.', 1),
  ('ai-video', 'talking-head', 'Talking Head', 'AI avatars and synthetic presenters delivering script-perfect takes.', 1),
  ('ai-video', 'ugc', 'UGC', 'Creator-style ad spots generated end-to-end with AI actors.', 2),
  ('ai-video', 'podcast', 'Podcast', 'AI-hosted and AI-edited podcast segments, from clip generation to captioned cutdowns.', 3),
  ('ai-video', 'b-roll', 'B-Roll', 'Generated cutaways, textures and atmosphere built to fill any timeline.', 4),
  ('ai-video', 'reels-shorts', 'Reels / Shorts', 'Vertical, scroll-stopping AI edits cut for Reels, Shorts and TikTok.', 5),
  ('ai-video', 'long-form', 'Long Form', 'Extended AI-driven narratives, explainers and branded films.', 6),
  ('ai-video', 'product-ads', 'Product Ads', 'AI product visualisations and commercial spots.', 7),
  ('ai-video', 'faceless', 'Faceless / Narration', 'Voice-led faceless content with fully generated visuals.', 8),
  ('ai-video', 'explainer', 'Explainer / Educational', 'Concept-to-screen explainers with generated diagrams, scenes and voiceover.', 9),
  ('ai-video', 'documentary', 'Documentary', 'Documentary-style pieces built from AI-generated archival, recreation and B-roll.', 10),
  ('ai-video', 'vlog', 'Vlog', 'AI-avatar or fully synthetic vlog-style content shot without a camera.', 11),
  ('ai-video', 'testimonial', 'Testimonial / Case Study', 'AI-presenter testimonials and case study walkthroughs, no filming required.', 12),
  ('ai-video', 'event', 'Event / Highlight', 'Generated recap and highlight reels styled to feel shot on location.', 13),
  ('ai-video', 'music-video', 'Music Video', 'Fully generated visuals synchronised to a track, no set or cast needed.', 14),
  ('ai-video', 'fashion', 'Fashion / Lookbook', 'AI models and generated environments for lookbooks and virtual runway.', 15),
  ('ai-video', 'corporate', 'Corporate / Brand Film', 'Polished brand films built entirely from generated presenters and scenes.', 16),
  ('ai-video', 'trailer', 'Trailer / Teaser', 'Generated teaser cuts for launches, drops and announcements.', 17),
  ('ai-video', 'bts', 'Behind-the-Scenes', 'Simulated behind-the-scenes footage built to support a bigger campaign.', 18),
  ('ai-video', 'motion-graphics', 'Motion Graphics / Typography', 'AI-assisted kinetic type, title sequences and abstract motion design.', 19),
  (NULL, 'video-editing', 'Video Editing', 'Hand-crafted edits of real, filmed footage.', 2),
  ('video-editing', 'talking-head', 'Talking Head', 'Interview and to-camera edits with pacing, captions and clean audio.', 1),
  ('video-editing', 'ugc', 'UGC', 'Creator-shot ad edits built for performance and retention.', 2),
  ('video-editing', 'podcast', 'Podcast', 'Multi-cam podcast edits with dynamic speaker switching and clip cutdowns.', 3),
  ('video-editing', 'b-roll', 'B-Roll', 'Cinematic cutaway sequences, colour-graded and sound-designed.', 4),
  ('video-editing', 'reels-shorts', 'Reels / Shorts', 'Fast, punchy vertical cuts engineered for the first three seconds.', 5),
  ('video-editing', 'long-form', 'Long Form', 'Documentaries, podcasts and YouTube edits that hold attention.', 6),
  ('video-editing', 'product-ads', 'Product Ads', 'Filmed product commercials with tight, performance-driven cuts.', 7),
  ('video-editing', 'faceless', 'Faceless / Narration', 'Voice-led narration edits built from stock, licensed and original footage.', 8),
  ('video-editing', 'explainer', 'Explainer / Educational', 'Screen-recorded and filmed tutorials edited for clarity and retention.', 9),
  ('video-editing', 'documentary', 'Documentary', 'Story-first documentary edits from real interviews and location footage.', 10),
  ('video-editing', 'vlog', 'Vlog', 'Day-in-the-life and travel vlogs edited for pace and personality.', 11),
  ('video-editing', 'testimonial', 'Testimonial / Case Study', 'Filmed client testimonials and case study interviews, edited to sell the result.', 12),
  ('video-editing', 'event', 'Event / Highlight', 'Recap films and highlight reels with story-first structure.', 13),
  ('video-editing', 'music-video', 'Music Video', 'Performance and narrative music videos cut to the beat.', 14),
  ('video-editing', 'fashion', 'Fashion / Lookbook', 'Fashion films and lookbooks with a filmed model and location shoot.', 15),
  ('video-editing', 'corporate', 'Corporate / Brand Film', 'Company culture, brand and internal comms films from real footage.', 16),
  ('video-editing', 'trailer', 'Trailer / Teaser', 'Teaser cuts from a feature, series or campaign shoot.', 17),
  ('video-editing', 'bts', 'Behind-the-Scenes', 'Real behind-the-scenes footage edited to support a bigger campaign.', 18),
  ('video-editing', 'wedding', 'Wedding / Ceremony', 'Full-day wedding and ceremony films, from teaser to feature cut.', 19)
ON CONFLICT (parent_category, slug) DO NOTHING;
