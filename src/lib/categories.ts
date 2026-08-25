export interface SubCategory {
  slug: string;
  label: string;
  blurb: string;
}

export interface Category {
  slug: string;
  label: string;
  blurb: string;
  subcategories: SubCategory[];
}

/**
 * Shared taxonomy — the single source of truth for every user layout.
 * Portfolio items are tagged with `category_slug` + `subcategory_slug`,
 * so adding a video in admin instantly surfaces it on every layout.
 */
export const CATEGORIES: Category[] = [
  {
    slug: "ai-video",
    label: "AI Video",
    blurb: "Fully AI-generated films, avatars and synthetic footage.",
    subcategories: [
      { slug: "talking-head", label: "Talking Head", blurb: "AI avatars and synthetic presenters delivering script-perfect takes." },
      { slug: "ugc", label: "UGC (AI-generated)", blurb: "Creator-style ad spots generated end-to-end with AI actors." },
      { slug: "b-roll", label: "B-Roll", blurb: "Generated cutaways, textures and atmosphere built to fill any timeline." },
      { slug: "reels-shorts", label: "Reels / Shorts", blurb: "Vertical, scroll-stopping AI edits cut for Reels, Shorts and TikTok." },
      { slug: "long-form", label: "Long Form", blurb: "Extended AI-driven narratives, explainers and branded films." },
      { slug: "product-ads", label: "Product Ads", blurb: "AI product visualisations and commercial spots." },
      { slug: "faceless", label: "Faceless / Narration", blurb: "Voice-led faceless content with fully generated visuals." },
    ],
  },
  {
    slug: "video-editing",
    label: "Video Editing",
    blurb: "Hand-crafted edits of real, filmed footage.",
    subcategories: [
      { slug: "talking-head", label: "Talking Head", blurb: "Interview and to-camera edits with pacing, captions and clean audio." },
      { slug: "ugc", label: "UGC", blurb: "Creator-shot ad edits built for performance and retention." },
      { slug: "b-roll", label: "B-Roll", blurb: "Cinematic cutaway sequences, colour-graded and sound-designed." },
      { slug: "reels-shorts", label: "Reels / Shorts", blurb: "Fast, punchy vertical cuts engineered for the first three seconds." },
      { slug: "long-form", label: "Long Form", blurb: "Documentaries, podcasts and YouTube edits that hold attention." },
      { slug: "podcast", label: "Podcast", blurb: "Multi-cam podcast edits with dynamic speaker switching." },
      { slug: "event", label: "Event / Highlight", blurb: "Recap films and highlight reels with story-first structure." },
    ],
  },
];

export const getCategory = (slug?: string | null) =>
  CATEGORIES.find((c) => c.slug === slug);

export const getSubCategory = (catSlug?: string | null, subSlug?: string | null) =>
  getCategory(catSlug)?.subcategories.find((s) => s.slug === subSlug);

export const categoryPath = (username: string, catSlug: string, subSlug?: string | null) =>
  `/${username}/category-${catSlug}${subSlug ? `/${subSlug}` : ""}`;

export const categoryUrl = (username: string, catSlug: string, subSlug?: string | null) =>
  `${typeof window !== "undefined" ? window.location.origin : ""}${categoryPath(username, catSlug, subSlug)}`;

/** Parses a `category-ai-video` style path segment. */
export const parseCategoryParam = (param?: string) =>
  param?.startsWith("category-") ? param.slice("category-".length) : null;

export const USERNAMES = ["caleb", "faith", "daniel"] as const;
export type Username = (typeof USERNAMES)[number];
