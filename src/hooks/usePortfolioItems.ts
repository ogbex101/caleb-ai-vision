import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { readTags, tagsMatch, type CategoryTag } from "@/lib/categories";
import { isExpiredSessionError, recoverFromExpiredSession } from "@/lib/expiredSession";

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
  /** Undefined until the premium migration is applied; treated as false. */
  premium?: boolean | null;
  sort_order?: number;
}

interface Filter {
  featuredOnly?: boolean;
  premiumOnly?: boolean;
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
export const usePortfolioItems = ({ featuredOnly, premiumOnly, categorySlug, subcategorySlug, aspectRatio }: Filter = {}) => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Kept so callers can tell "the request failed" from "there is nothing here".
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      const db = supabase as any;
      let q = db.from("portfolio_items").select("*").order("sort_order");
      if (featuredOnly) q = q.eq("featured", true);
      if (aspectRatio) q = q.eq("aspect_ratio", aspectRatio);
      const { data, error: queryError } = await q;
      if (cancelled) return;
      if (queryError) {
        // A rejected key, a dropped connection or a blocked request all land
        // here. Reporting it stops the page claiming the library is empty.
        console.error(`[supabase] portfolio_items failed: ${queryError.message} (code ${queryError.code ?? "none"})`, queryError);
        // An expired login breaks even anonymous reads, so drop it and reload
        // as a visitor rather than showing an error for a page about to go.
        if (isExpiredSessionError(queryError)) {
          const recovering = await recoverFromExpiredSession(() => supabase.auth.signOut({ scope: "local" }));
          if (recovering) return;
        }
        setError(queryError.message);
        setItems([]);
        setLoading(false);
        return;
      }
      const rows = ((data as any[]) ?? [])
        .filter((row) => tagsMatch(readTags(row), categorySlug, subcategorySlug))
        // Filtered here rather than with .eq("premium", true): until the
        // premium migration is applied the column does not exist, and a server
        // filter on a missing column fails the whole query with a 400. A
        // client-side check just yields nothing, so the section stays empty
        // instead of taking the page down.
        .filter((row) => (premiumOnly ? row.premium === true : true));
      setItems(rows as PortfolioItem[]);
      setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [featuredOnly, premiumOnly, categorySlug, subcategorySlug, aspectRatio]);

  return { items, loading, error };
};

/**
 * The layout row plus whether it is still loading. Callers that gate rendering
 * on it (maintenance mode) need to tell "no row yet" from "no row exists",
 * otherwise the page flashes its content before the gate closes.
 */
export const useSiteLayoutState = (username: string) => {
  const [layout, setLayout] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const db = supabase as any;
    db.from("site_layouts").select("*").eq("username", username).maybeSingle()
      .then(({ data }: { data: any }) => {
        if (cancelled) return;
        setLayout(data);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [username]);
  return { layout, loading };
};

export const useSiteLayout = (username: string) => useSiteLayoutState(username).layout;
