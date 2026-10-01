import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * True when the person viewing the page is signed in to the admin dashboard
 * in this browser. Owner-only tools (building share links for proposals and
 * outreach) use it so clients browsing the portfolio never see them.
 */
export const useIsOwner = () => {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setIsOwner(Boolean(data.session));
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setIsOwner(Boolean(session));
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return isOwner;
};
