-- Read-only health check. Paste into the Supabase SQL editor and run.
--
-- Deliberately ONE query: the editor only shows the final statement's result
-- set, so a multi-statement script silently discards everything but its last
-- SELECT. Problems sort to the top.
--
-- Nothing here writes, creates or deletes. Any row not reading "ok" is either
-- a migration that has not been applied or a reason uploads are being refused.
WITH expected(tbl, col, note) AS (
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
    ('portfolio_items', 'full_video_url',    'mig 20260725193335'),
    ('portfolio_items', 'category_slug',     'mig 20260825064851'),
    ('portfolio_items', 'subcategory_slug',  'mig 20260825064851'),
    ('portfolio_items', 'preview_seconds',   'mig 20260825064851'),
    ('portfolio_items', 'aspect_ratio',      'mig 20260907101626'),
    ('portfolio_items', 'category_tags',     'mig 20260907160615'),
    ('portfolio_items', 'premium',           'mig 20261021190000'),
    -- site_layouts
    ('site_layouts',    'username',            'mig 20260825064851'),
    ('site_layouts',    'display_name',        'mig 20260825064851'),
    ('site_layouts',    'theme',               'mig 20260825064851'),
    ('site_layouts',    'tagline',             'mig 20260825064851'),
    ('site_layouts',    'hero_media_url',      'mig 20260825064851'),
    ('site_layouts',    'hero_media_type',     'mig 20260825064851'),
    ('site_layouts',    'active',              'mig 20260825064851'),
    ('site_layouts',    'hero_parallax_urls',  'mig 20260927120000'),
    ('site_layouts',    'maintenance_mode',    'mig 20260927170000'),
    ('site_layouts',    'maintenance_message', 'mig 20260927170000'),
    ('site_layouts',    'seo_title',           'mig 20260927170000'),
    ('site_layouts',    'seo_description',     'mig 20260927170000'),
    ('site_layouts',    'contact_email',       'mig 20261001090000'),
    ('site_layouts',    'whatsapp_number',     'mig 20261001090000'),
    -- taxonomy
    ('taxonomy',        'parent_category',   'mig 20260927160000'),
    ('taxonomy',        'slug',              'mig 20260927160000'),
    ('taxonomy',        'label',             'mig 20260927160000'),
    ('taxonomy',        'blurb',             'mig 20260927160000'),
    ('taxonomy',        'sort_order',        'mig 20260927160000'),
    -- analytics
    ('page_views',      'created_at',        'mig 20260825064851'),
    ('link_copies',     'created_at',        'mig 20260825064851'),
    ('video_clicks',    'created_at',        'mig 20260906203817'),
    ('testimonials',    'username',          'mig 20260907005122')
)
SELECT * FROM (
  -- Columns the admin dashboard writes to
  SELECT
    'column'                    AS kind,
    e.tbl || '.' || e.col       AS item,
    e.note                      AS detail,
    CASE WHEN c.column_name IS NULL THEN '*** MISSING ***' ELSE 'ok' END AS status
  FROM expected e
  LEFT JOIN information_schema.columns c
    ON c.table_schema = 'public' AND c.table_name = e.tbl AND c.column_name = e.col

  UNION ALL

  -- Video upload bucket. 209715200 is the 200MB the admin UI enforces.
  SELECT 'storage', 'portfolio-videos bucket',
         COALESCE((SELECT file_size_limit::text || ' byte limit, public=' || public::text
                   FROM storage.buckets WHERE id = 'portfolio-videos'), 'no such bucket'),
         CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'portfolio-videos')
              THEN 'ok' ELSE '*** MISSING: every upload fails ***' END

  UNION ALL

  -- Uploads need a signed-in user holding the admin role. Zero rows means
  -- row-level security refuses every write with a 403, which looks identical
  -- in the dashboard to a broken upload but no migration can fix it.
  SELECT 'auth', 'accounts with the admin role',
         (SELECT count(*)::text FROM public.user_roles WHERE role = 'admin'::public.app_role),
         CASE WHEN (SELECT count(*) FROM public.user_roles WHERE role = 'admin'::public.app_role) > 0
              THEN 'ok' ELSE '*** NONE: uploads refused with 403 ***' END

  UNION ALL

  -- Was the taxonomy seeded? 40 is the full shipped list.
  SELECT 'data', 'taxonomy rows',
         (SELECT count(*)::text FROM public.taxonomy),
         CASE WHEN (SELECT count(*) FROM public.taxonomy) >= 40
              THEN 'ok' ELSE '*** under-seeded ***' END

  UNION ALL

  -- How much work is in the library, for context on the rest.
  SELECT 'data', 'portfolio items',
         (SELECT count(*)::text FROM public.portfolio_items), 'ok'
) report
-- Anything not "ok" first, so a short glance is enough.
ORDER BY (status = 'ok'), kind, item;
