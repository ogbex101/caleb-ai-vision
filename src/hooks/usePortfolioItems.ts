import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  client_name?: string | null;
  category?: string | null;
  category_slug?: string | null;
  subcategory_slug?: string | null;
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
 * Shared portfolio data source — every user layout reads from this same table,
 * so uploads apply everywhere automatically.
 */
export const usePortfolioItems = ({ featuredOnly, categorySlug, subcategorySlug, aspectRatio }: Filter = {}) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      let q = supabase.from("portfolio_items").select("*").order("sort_order");
      if (featuredOnly) q = q.eq("featured", true);
      if (categorySlug) q = q.eq("category_slug", categorySlug);
      if (subcategorySlug) q = q.eq("subcategory_slug", subcategorySlug);
      if (aspectRatio) q = q.eq("aspect_ratio", aspectRatio);
      const { data } = await q;
      if (!cancelled) {
        setItems((data as PortfolioItem[]) ?? []);
        setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [featuredOnly, categorySlug, subcategorySlug, aspectRatio]);

  return { items, loading };
};

export const useSiteLayout = (username: string) => {
  const [layout, setLayout] = useState<any | null>(null);
  useEffect(() => {
    supabase.from("site_layouts").select("*").eq("username", username).maybeSingle()
      .then(({ data }) => setLayout(data));
  }, [username]);
  return layout;
};
