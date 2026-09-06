CREATE TABLE IF NOT EXISTS public.video_clicks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.portfolio_items(id) on delete cascade,
  title text,
  username text,
  visitor_id text,
  created_at timestamptz not null default now()
);
GRANT INSERT ON public.video_clicks TO anon, authenticated;
GRANT SELECT ON public.video_clicks TO authenticated;
GRANT ALL ON public.video_clicks TO service_role;
ALTER TABLE public.video_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "video_clicks anyone can record" ON public.video_clicks;
CREATE POLICY "video_clicks anyone can record" ON public.video_clicks FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "video_clicks admin read" ON public.video_clicks;
CREATE POLICY "video_clicks admin read" ON public.video_clicks FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX IF NOT EXISTS video_clicks_item_idx ON public.video_clicks(item_id);