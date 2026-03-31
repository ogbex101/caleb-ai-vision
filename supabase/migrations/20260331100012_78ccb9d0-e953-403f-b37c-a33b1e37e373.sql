
-- Create storage bucket for portfolio videos
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-videos', 'portfolio-videos', true);

-- Allow authenticated admins to upload/manage files
CREATE POLICY "Admin can upload portfolio videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-videos' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admin can update portfolio videos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'portfolio-videos' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admin can delete portfolio videos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'portfolio-videos' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow public read access
CREATE POLICY "Public can read portfolio videos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'portfolio-videos');
