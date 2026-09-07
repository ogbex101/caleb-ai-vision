-- Compressed previews from the new client-side video pipeline land well
-- under this, but the original default (effectively ~50MB) left no
-- headroom for longer clips or a failed-compression fallback upload.
UPDATE storage.buckets SET file_size_limit = 209715200 WHERE id = 'portfolio-videos';
