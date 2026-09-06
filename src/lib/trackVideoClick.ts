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

const seen = new Set<string>();

/** Records a play/click on a portfolio video (once per item per page session). */
export const trackVideoClick = (item: { id?: string | null; title?: string | null }) => {
  const key = item.id || item.title || "";
  if (!key || seen.has(key)) return;
  seen.add(key);
  const username = window.location.pathname.split("/").filter(Boolean)[0] || "caleb";
  supabase
    .from("video_clicks")
    .insert({
      item_id: item.id ?? null,
      title: item.title ?? null,
      username,
      visitor_id: getVisitorId(),
    })
    .then(() => {});
};
