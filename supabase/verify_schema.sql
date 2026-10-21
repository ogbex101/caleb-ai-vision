-- Read-only health check. Paste the whole file into the Supabase SQL editor
-- (Dashboard > SQL Editor > New query) and run it.
--
-- Nothing here writes, creates or deletes anything: it only reports which
-- tables, columns and storage settings the app expects and whether the live
-- database actually has them. Any row that comes back MISSING is a migration
-- in supabase/migrations that has not been applied to this project yet, and
-- every admin action that writes that column will fail with a 400
-- (PGRST204: "could not find the column in the schema cache").

-- 1. Tables and columns the admin dashboard writes to.
WITH expected(tbl, col, added_by) AS (
  VALUES
    -- portfolio_items: every column the Portfolio section saves
    ('portfolio_items', 'title',             'original'),
    ('portfolio_items', 'description',       'original'),
    ('portfolio_items', 'client_name',       'original'),
    ('portfolio_items', 'category',          'original'),
    ('portfolio_items', 'featured',          'original'),
    ('portfolio_items', 'sort_order',        'original'),
    ('portfolio_items', 'thumbnail_url',     'original'),
    ('portfolio_items', 'video_url',         'original'),
    ('portfolio_items', 'full_video_url',    '20260725193335'),
    ('portfolio_items', 'category_slug',     '20260825064851'),
    ('portfolio_items', 'subcategory_slug',  '20260825064851'),
    ('portfolio_items', 'preview_seconds',   '20260825064851'),
    ('portfolio_items', 'aspect_ratio',      '20260907101626 / 20260907160615'),
    ('portfolio_items', 'category_tags',     '20260907160615'),
    -- site_layouts: identity, hero, and the newer settings
    ('site_layouts',    'username',            '20260825064851'),
    ('site_layouts',    'display_name',        '20260825064851'),
    ('site_layouts',    'theme',               '20260825064851'),
    ('site_layouts',    'tagline',             '20260825064851'),
    ('site_layouts',    'hero_media_url',      '20260825064851'),
    ('site_layouts',    'hero_media_type',     '20260825064851'),
    ('site_layouts',    'active',              '20260825064851'),
    ('site_layouts',    'hero_parallax_urls',  '20260927120000'),
    ('site_layouts',    'maintenance_mode',    '20260927170000'),
    ('site_layouts',    'maintenance_message', '20260927170000'),
    ('site_layouts',    'seo_title',           '20260927170000'),
    ('site_layouts',    'seo_description',     '20260927170000'),
    ('site_layouts',    'contact_email',       '20261001090000'),
    ('site_layouts',    'whatsapp_number',     '20261001090000'),
    -- taxonomy: the database-backed categories
    ('taxonomy',        'parent_category',   '20260927160000'),
    ('taxonomy',        'slug',              '20260927160000'),
    ('taxonomy',        'label',             '20260927160000'),
    ('taxonomy',        'blurb',             '20260927160000'),
    ('taxonomy',        'sort_order',        '20260927160000'),
    -- analytics + content tables
    ('page_views',      'created_at',        '20260825064851'),
    ('link_copies',     'created_at',        '20260825064851'),
    ('video_clicks',    'created_at',        '20260906203817'),
    ('testimonials',    'username',          '20260907005122')
)
SELECT
  e.tbl        AS table_name,
  e.col        AS column_name,
  e.added_by   AS from_migration,
  CASE WHEN c.column_name IS NULL THEN '*** MISSING ***' ELSE 'ok' END AS status
FROM expected e
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public' AND c.table_name = e.tbl AND c.column_name = e.col
ORDER BY status DESC, e.tbl, e.col;

-- 2. Storage bucket for video uploads. file_size_limit must be 209715200
--    (200MB); the admin UI refuses anything larger before it is sent.
SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'portfolio-videos';

-- 3. Which expected tables exist at all. A table listed MISSING here means
--    its whole migration never ran, so skip the counts below for it: querying
--    a table that does not exist aborts the statement.
SELECT t.name AS table_name,
       CASE WHEN to_regclass('public.' || t.name) IS NULL THEN '*** MISSING ***' ELSE 'ok' END AS status
FROM (VALUES ('portfolio_items'), ('site_layouts'), ('taxonomy'), ('page_views'),
             ('link_copies'), ('video_clicks'), ('testimonials'), ('tech_stack'),
             ('hero_section'), ('about_section'), ('contact_messages'), ('user_roles')) AS t(name)
ORDER BY status DESC, t.name;

-- 4. Run these two only for tables step 3 reported as ok.
--
--    Admin accounts. Uploads need a signed-in user holding the 'admin' role:
--    zero rows means row-level security refuses every storage write (a 403,
--    not a 400), which looks identical in the UI to a failed upload.
--      SELECT count(*) AS admin_role_rows FROM public.user_roles WHERE role = 'admin';
--
--    Whether taxonomy was seeded. 0 means the Categories section shows
--    nothing and the site falls back to its built-in list.
--      SELECT count(*) AS taxonomy_rows FROM public.taxonomy;
