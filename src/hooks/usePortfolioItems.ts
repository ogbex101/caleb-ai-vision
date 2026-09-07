import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { readTags, tagsMatch, type CategoryTag } from "@/lib/categories";

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  client_name?: string | null;
  category?: string | null;
  category_slug?: string | null;
  subcategory_slug?: string | null;
  category_tags?: CategoryTag[] | null;
  aspect_ratio?: string | null;
  video_url?: string | null;
  full_video_url?: string | null;
  thumbnail_url?: string | null;
  preview_seconds?: number | null;
  featured?: boolean;
  sort_order?: number;
}

interface Filter {
  featuredOnly?: boolean;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  aspectRatio?: string | null;
}

/**
 * Shared portfolio data source. Every user layout reads from this same table,
 * so uploads apply everywhere automatically. Category filtering runs over the
 * multi-tag list (up to 5 per video) with a fallback to the legacy single
 * category columns.
 */
export const usePortfolioItems = ({ featuredOnly, categorySlug, subcategorySlug, aspectRatio }: Filter = {}) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const db = supabase as any;
      let q = db.from("portfolio_items").select("*").order("sort_order");
      if (featuredOnly) q = q.eq("featured", true);
      if (aspectRatio) q = q.eq("aspect_ratio", aspectRatio);
      const { data } = await q;
      if (cancelled) return;
      const rows = ((data as any[]) ?? []).filter((row) =>
        tagsMatch(readTags(row), categorySlug, subcategorySlug),
      );
      setItems(rows as PortfolioItem[]);
      setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [featuredOnly, categorySlug, subcategorySlug, aspectRatio]);

  return { items, loading };
};

export const useSiteLayout = (username: string) => {
  const [layout, setLayout] = useState<any | null>(null);
  useEffect(() => {
    let cancelled = false;
    const db = supabase as any;
    db.from("site_layouts").select("*").eq("username", username).maybeSingle()
      .then(({ data }: { data: any }) => { if (!cancelled) setLayout(data); });
    return () => { cancelled = true; };
  }, [username]);
  return layout;
};
