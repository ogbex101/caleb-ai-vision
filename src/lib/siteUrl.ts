/**
 * Links you copy to send to clients must point at the production domain.
 *
 * Every Vercel deployment also gets its own frozen address
 * (caleb-ai-vision-<hash>-<team>.vercel.app). A link built while browsing one
 * of those keeps showing that old deployment forever, so it never picks up
 * later fixes. VITE_PUBLIC_SITE_URL is filled in at build time (see
 * vite.config.ts) with the production domain, and only falls back to the
 * current address when it is missing, e.g. in local development.
 */
export const publicOrigin = (): string => {
  const configured = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim().replace(/\/+$/, "");
  if (configured) return configured;
  return typeof window !== "undefined" ? window.location.origin : "";
};

/** Lowercase, dash-separated, safe to put in a URL. */
export const campaignSlug = (raw?: string | null): string =>
  (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Tags an outreach link so its visits show up as a campaign in Admin >
 * Analytics (page_views already records utm_source and utm_campaign).
 */
export const withCampaign = (url: string, campaign?: string | null): string => {
  const tag = campaignSlug(campaign);
  if (!tag) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=outreach&utm_campaign=${encodeURIComponent(tag)}`;
};
