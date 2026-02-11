
-- Hero section content
CREATE TABLE public.hero_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL DEFAULT 'Crafting the Future of Video with AI',
  subheadline TEXT NOT NULL DEFAULT 'Award-winning AI video editor transforming raw footage into cinematic masterpieces',
  cta_text TEXT NOT NULL DEFAULT 'View My Work',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- About section
CREATE TABLE public.about_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'About Caleb',
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tech stack items
CREATE TABLE public.tech_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Portfolio/previous work
CREATE TABLE public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  client_name TEXT,
  category TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_title TEXT,
  client_avatar TEXT,
  content TEXT NOT NULL,
  rating INT DEFAULT 5,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact messages
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.hero_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read hero" ON public.hero_section FOR SELECT USING (true);
CREATE POLICY "Public can read about" ON public.about_section FOR SELECT USING (true);
CREATE POLICY "Public can read tech stack" ON public.tech_stack FOR SELECT USING (true);
CREATE POLICY "Public can read portfolio" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Public can read testimonials" ON public.testimonials FOR SELECT USING (true);

-- Public can submit contact messages
CREATE POLICY "Public can insert contact" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- Admin policies (authenticated users can do everything)
CREATE POLICY "Admin can manage hero" ON public.hero_section FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage about" ON public.about_section FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage tech stack" ON public.tech_stack FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage portfolio" ON public.portfolio_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin can manage contacts" ON public.contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed hero section
INSERT INTO public.hero_section (headline, subheadline, cta_text) VALUES (
  'Crafting the Future of Video with AI',
  'Award-winning AI video editor transforming raw footage into cinematic masterpieces',
  'View My Work'
);

-- Seed about section
INSERT INTO public.about_section (title, content) VALUES (
  'The Story Behind the Lens',
  'From the bustling streets of Lagos to the cutting edge of AI-powered filmmaking, Caleb Peters has spent the last decade redefining what''s possible in video production. What started as a teenage passion for storytelling through a borrowed camera evolved into a relentless pursuit of innovation at the intersection of art and artificial intelligence.

After years of mastering traditional editing techniques, Caleb recognized the transformative potential of AI early on—becoming one of the first editors in the industry to seamlessly blend machine learning with human creativity. His philosophy is simple: AI doesn''t replace the artist; it amplifies the vision.

Today, Caleb has worked with over 200 clients worldwide—from indie filmmakers to Fortune 500 brands—delivering content that doesn''t just look stunning, but tells stories that resonate on a deeply human level. His work has been featured in international film festivals, viral ad campaigns, and digital experiences that have collectively garnered over 50 million views.

When he''s not pushing the boundaries of what AI can do with video, you''ll find him mentoring the next generation of creators and speaking at tech conferences about the future of content creation.'
);

-- Seed tech stack
INSERT INTO public.tech_stack (name, description, sort_order) VALUES
  ('Runway ML', 'AI-powered video generation and editing', 1),
  ('Adobe Premiere Pro', 'Industry-standard video editing', 2),
  ('DaVinci Resolve', 'Professional color grading and editing', 3),
  ('Midjourney', 'AI image generation for storyboards', 4),
  ('After Effects', 'Motion graphics and visual effects', 5),
  ('Synthesia', 'AI avatar and video creation', 6),
  ('HeyGen', 'AI video generation platform', 7),
  ('Topaz Video AI', 'AI-powered video enhancement', 8);

-- Seed portfolio items
INSERT INTO public.portfolio_items (title, description, client_name, category, featured, sort_order) VALUES
  ('Neon Dreams Campaign', 'A futuristic brand campaign blending AI-generated visuals with live-action footage for a tech startup launch.', 'TechVault Inc.', 'Commercial', true, 1),
  ('Echoes of Tomorrow', 'Short film exploring AI consciousness, featuring entirely AI-generated environments composited with real actors.', 'Indie Film Collective', 'Short Film', true, 2),
  ('Product Launch: HyperX', 'Dynamic product reveal video using AI motion tracking and particle effects for a gaming accessories brand.', 'HyperX Gaming', 'Product Video', true, 3),
  ('Soul of the City', 'Documentary-style brand film with AI-enhanced color grading and automated scene transitions.', 'Urban Culture Magazine', 'Documentary', true, 4),
  ('Digital Fashion Show', 'Virtual runway experience with AI-generated models and environments for a luxury fashion brand.', 'Maison Élégance', 'Fashion', false, 5),
  ('Cosmic Beats', 'Music video featuring AI-generated abstract visuals synchronized to audio waveforms.', 'DJ Spectrum', 'Music Video', false, 6);

-- Seed testimonials
INSERT INTO public.testimonials (client_name, client_title, content, rating, sort_order) VALUES
  ('Sarah Mitchell', 'CEO, TechVault Inc.', 'Caleb didn''t just edit our video—he reimagined our entire brand story. The AI-enhanced visuals were unlike anything we''d ever seen. Our launch video hit 2M views in the first week.', 5, 1),
  ('Marcus Chen', 'Director, Indie Film Collective', 'Working with Caleb is like working with someone from the future. He sees possibilities in AI that most editors haven''t even dreamed of yet. Absolute game-changer for our film.', 5, 2),
  ('Amara Obi', 'Marketing Director, HyperX Gaming', 'The turnaround time was insane, and the quality was cinema-grade. Caleb''s use of AI tools cut our production timeline in half without sacrificing an ounce of creativity.', 5, 3),
  ('James Rodriguez', 'Creative Director, Urban Culture Magazine', 'Caleb has this rare ability to make technology feel human. Every frame of our documentary felt intentional and emotionally resonant. He''s our go-to editor now.', 5, 4);
