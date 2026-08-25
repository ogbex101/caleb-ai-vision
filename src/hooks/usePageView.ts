import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "cp_visitor_id";

const getVisitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
};

const classifySource = (referrer: string, utmSource: string | null) => {
  if (utmSource) return "campaign";
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host === window.location.hostname) return "internal";
    if (/google|bing|duckduckgo|yahoo|ecosia|brave/.test(host)) return "search";
    if (/facebook|instagram|twitter|x\.com|linkedin|tiktok|youtube|whatsapp|t\.co/.test(host)) return "social";
    return "referral";
  } catch {
    return "unknown";
  }
};

interface Options {
  username?: string | null;
  categorySlug?: string | null;
  subcategorySlug?: string | null;
}

/** Records one view per page load (fire-and-forget, never blocks render). */
export const usePageView = ({ username, categorySlug, subcategorySlug }: Options = {}) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source");
    const referrer = document.referrer || "";

    supabase
      .from("page_views")
      .insert({
        path: window.location.pathname,
        username: username ?? null,
        category_slug: categorySlug ?? null,
        subcategory_slug: subcategorySlug ?? null,
        referrer: referrer || null,
        source: classifySource(referrer, utmSource),
        utm_source: utmSource,
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        visitor_id: getVisitorId(),
      })
      .then(() => {});
  }, [username, categorySlug, subcategorySlug]);
};
