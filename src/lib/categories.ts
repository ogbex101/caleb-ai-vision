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

export interface AspectRatioOption {
  slug: string;
  label: string;
}

/** The orientation dimension every niche can be narrowed down by. */
export const ASPECT_RATIOS: AspectRatioOption[] = [
  { slug: "16:9", label: "Widescreen (16:9)" },
  { slug: "9:16", label: "Vertical (9:16)" },
  { slug: "1:1", label: "Square (1:1)" },
];

export const getAspectRatio = (slug?: string | null) =>
  ASPECT_RATIOS.find((r) => r.slug === slug);

/**
 * Shared taxonomy — the single source of truth for every user layout.
 * Portfolio items are tagged with `category_slug` + `subcategory_slug`
 * (+ optionally `aspect_ratio`), so adding a video in admin instantly
 * surfaces it, correctly filtered, on every layout.
 */
export const CATEGORIES: Category[] = [
  {
    slug: "ai-video",
    label: "AI Video",
    blurb: "Fully AI-generated films, avatars and synthetic footage.",
    subcategories: [
      { slug: "talking-head", label: "Talking Head", blurb: "AI avatars and synthetic presenters delivering script-perfect takes." },
      { slug: "ugc", label: "UGC", blurb: "Creator-style ad spots generated end-to-end with AI actors." },
      { slug: "podcast", label: "Podcast", blurb: "AI-hosted and AI-edited podcast segments, from clip generation to captioned cutdowns." },
      { slug: "b-roll", label: "B-Roll", blurb: "Generated cutaways, textures and atmosphere built to fill any timeline." },
      { slug: "reels-shorts", label: "Reels / Shorts", blurb: "Vertical, scroll-stopping AI edits cut for Reels, Shorts and TikTok." },
      { slug: "long-form", label: "Long Form", blurb: "Extended AI-driven narratives, explainers and branded films." },
      { slug: "product-ads", label: "Product Ads", blurb: "AI product visualisations and commercial spots." },
      { slug: "faceless", label: "Faceless / Narration", blurb: "Voice-led faceless content with fully generated visuals." },
      { slug: "explainer", label: "Explainer / Educational", blurb: "Concept-to-screen explainers with generated diagrams, scenes and voiceover." },
      { slug: "documentary", label: "Documentary", blurb: "Documentary-style pieces built from AI-generated archival, recreation and B-roll." },
      { slug: "vlog", label: "Vlog", blurb: "AI-avatar or fully synthetic vlog-style content shot without a camera." },
      { slug: "testimonial", label: "Testimonial / Case Study", blurb: "AI-presenter testimonials and case study walkthroughs, no filming required." },
      { slug: "event", label: "Event / Highlight", blurb: "Generated recap and highlight reels styled to feel shot on location." },
      { slug: "music-video", label: "Music Video", blurb: "Fully generated visuals synchronised to a track, no set or cast needed." },
      { slug: "fashion", label: "Fashion / Lookbook", blurb: "AI models and generated environments for lookbooks and virtual runway." },
      { slug: "corporate", label: "Corporate / Brand Film", blurb: "Polished brand films built entirely from generated presenters and scenes." },
      { slug: "trailer", label: "Trailer / Teaser", blurb: "Generated teaser cuts for launches, drops and announcements." },
      { slug: "bts", label: "Behind-the-Scenes", blurb: "Simulated behind-the-scenes footage built to support a bigger campaign." },
      { slug: "motion-graphics", label: "Motion Graphics / Typography", blurb: "AI-assisted kinetic type, title sequences and abstract motion design." },
    ],
  },
  {
    slug: "video-editing",
    label: "Video Editing",
    blurb: "Hand-crafted edits of real, filmed footage.",
    subcategories: [
      { slug: "talking-head", label: "Talking Head", blurb: "Interview and to-camera edits with pacing, captions and clean audio." },
      { slug: "ugc", label: "UGC", blurb: "Creator-shot ad edits built for performance and retention." },
      { slug: "podcast", label: "Podcast", blurb: "Multi-cam podcast edits with dynamic speaker switching and clip cutdowns." },
      { slug: "b-roll", label: "B-Roll", blurb: "Cinematic cutaway sequences, colour-graded and sound-designed." },
      { slug: "reels-shorts", label: "Reels / Shorts", blurb: "Fast, punchy vertical cuts engineered for the first three seconds." },
      { slug: "long-form", label: "Long Form", blurb: "Documentaries, podcasts and YouTube edits that hold attention." },
      { slug: "product-ads", label: "Product Ads", blurb: "Filmed product commercials with tight, performance-driven cuts." },
      { slug: "faceless", label: "Faceless / Narration", blurb: "Voice-led narration edits built from stock, licensed and original footage." },
      { slug: "explainer", label: "Explainer / Educational", blurb: "Screen-recorded and filmed tutorials edited for clarity and retention." },
      { slug: "documentary", label: "Documentary", blurb: "Story-first documentary edits from real interviews and location footage." },
      { slug: "vlog", label: "Vlog", blurb: "Day-in-the-life and travel vlogs edited for pace and personality." },
      { slug: "testimonial", label: "Testimonial / Case Study", blurb: "Filmed client testimonials and case study interviews, edited to sell the result." },
      { slug: "event", label: "Event / Highlight", blurb: "Recap films and highlight reels with story-first structure." },
      { slug: "music-video", label: "Music Video", blurb: "Performance and narrative music videos cut to the beat." },
      { slug: "fashion", label: "Fashion / Lookbook", blurb: "Fashion films and lookbooks with a filmed model and location shoot." },
      { slug: "corporate", label: "Corporate / Brand Film", blurb: "Company culture, brand and internal comms films from real footage." },
      { slug: "trailer", label: "Trailer / Teaser", blurb: "Teaser cuts from a feature, series or campaign shoot." },
      { slug: "bts", label: "Behind-the-Scenes", blurb: "Real behind-the-scenes footage edited to support a bigger campaign." },
      { slug: "wedding", label: "Wedding / Ceremony", blurb: "Full-day wedding and ceremony films, from teaser to feature cut." },
    ],
  },
];

export const getCategory = (slug?: string | null) =>
  CATEGORIES.find((c) => c.slug === slug);

export const getSubCategory = (catSlug?: string | null, subSlug?: string | null) =>
  getCategory(catSlug)?.subcategories.find((s) => s.slug === subSlug);

export const categoryPath = (username: string, catSlug: string, subSlug?: string | null) =>
  `/${username}/category-${catSlug}${subSlug ? `/${subSlug}` : ""}`;

export const categoryUrl = (username: string, catSlug: string, subSlug?: string | null, ratio?: string | null) =>
  `${typeof window !== "undefined" ? window.location.origin : ""}${categoryPath(username, catSlug, subSlug)}${ratio ? `?ratio=${encodeURIComponent(ratio)}` : ""}`;

/** Parses a `category-ai-video` style path segment. */
export const parseCategoryParam = (param?: string) =>
  param?.startsWith("category-") ? param.slice("category-".length) : null;

export const USERNAMES = ["caleb", "faith", "daniel"] as const;
export type Username = (typeof USERNAMES)[number];

export interface CategoryTag {
  category: string;
  subcategory?: string | null;
}

/**
 * A video can carry up to 5 category tags. Older rows only have the single
 * `category_slug` / `subcategory_slug` pair, so this normalises both shapes
 * into one list every consumer can rely on.
 */
export const MAX_CATEGORY_TAGS = 5;

export const readTags = (item: {
  category_tags?: unknown;
  category_slug?: string | null;
  subcategory_slug?: string | null;
}): CategoryTag[] => {
  const raw = Array.isArray(item?.category_tags) ? (item.category_tags as any[]) : [];
  const tags = raw
    .filter((t) => t && typeof t === "object" && typeof t.category === "string" && t.category)
    .map((t) => ({ category: t.category as string, subcategory: (t.subcategory as string) || null }));
  if (tags.length === 0 && item?.category_slug) {
    tags.push({ category: item.category_slug, subcategory: item.subcategory_slug || null });
  }
  return tags.slice(0, MAX_CATEGORY_TAGS);
};

export const tagsMatch = (
  tags: CategoryTag[],
  categorySlug?: string | null,
  subcategorySlug?: string | null,
) => {
  if (!categorySlug) return true;
  return tags.some(
    (t) => t.category === categorySlug && (!subcategorySlug || t.subcategory === subcategorySlug),
  );
};

export const tagLabel = (tag: CategoryTag) => {
  const cat = getCategory(tag.category);
  const sub = getSubCategory(tag.category, tag.subcategory);
  if (!cat) return tag.category;
  return sub ? `${cat.label} / ${sub.label}` : cat.label;
};
