import { type Category, type CategoryTag, categoryPath, getCategory, readTags } from "@/lib/categories";

export type SearchHitKind = "category" | "subcategory" | "video";

export interface SearchHit {
  id: string;
  kind: SearchHitKind;
  title: string;
  /** Parent category, or the video's category — shown after the title. */
  context: string | null;
  /** One-line description, the blurb for a niche. */
  hint: string | null;
  path: string;
  haystack: string;
}

/** Item fields the index needs; keeps this module independent of the row type. */
export interface SearchableItem {
  id: string;
  title: string;
  description?: string | null;
  client_name?: string | null;
  category_tags?: unknown;
  category_slug?: string | null;
  subcategory_slug?: string | null;
}

/** Words worth matching on: lowercased, punctuation flattened to spaces. */
export const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const buildSearchIndex = (
  categories: Category[],
  items: SearchableItem[],
  username: string,
): SearchHit[] => {
  const hits: SearchHit[] = [];
  categories.forEach((cat) => {
    hits.push({
      id: `c:${cat.slug}`,
      kind: "category",
      title: cat.label,
      context: null,
      hint: cat.blurb || null,
      path: categoryPath(username, cat.slug),
      haystack: normalise(`${cat.label} ${cat.blurb || ""}`),
    });
    cat.subcategories.forEach((sub) => {
      hits.push({
        id: `s:${cat.slug}:${sub.slug}`,
        kind: "subcategory",
        title: sub.label,
        context: cat.label,
        hint: sub.blurb || null,
        path: categoryPath(username, cat.slug, sub.slug),
        haystack: normalise(`${sub.label} ${sub.blurb || ""} ${cat.label}`),
      });
    });
  });
  items.forEach((item) => {
    const tag: CategoryTag | undefined = readTags(item)[0];
    hits.push({
      id: `v:${item.id}`,
      kind: "video",
      title: item.title,
      context: tag ? getCategory(tag.category)?.label ?? null : null,
      hint: item.client_name || item.description || null,
      // No per-item route exists, so a video leads to the page it appears on.
      path: tag ? categoryPath(username, tag.category, tag.subcategory) : "/portfolio",
      haystack: normalise(`${item.title} ${item.client_name || ""} ${item.description || ""}`),
    });
  });
  return hits;
};

/**
 * Lower is better. Someone typing "talking" wants the Talking Head niche first,
 * not a video whose description happens to mention talking, so niches outrank
 * videos and a title match outranks a blurb-only match.
 */
export const scoreHit = (hit: SearchHit, terms: string[]) => {
  const title = normalise(hit.title);
  const words = title.split(" ");
  const kindWeight = hit.kind === "video" ? 10 : 0;
  const worstTerm = terms.reduce((worst, term) => {
    if (title.startsWith(term)) return Math.max(worst, 0);
    if (words.some((word) => word.startsWith(term))) return Math.max(worst, 1);
    if (title.includes(term)) return Math.max(worst, 2);
    return Math.max(worst, 3); // matched only via blurb or parent category
  }, 0);
  return kindWeight + worstTerm;
};

/**
 * Every term must appear somewhere in the hit, so extra words narrow rather
 * than widen — "wedding film" should not return every video.
 */
export const searchHits = (index: SearchHit[], query: string, limit = 8): SearchHit[] => {
  const terms = normalise(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];
  return index
    .filter((hit) => terms.every((term) => hit.haystack.includes(term)))
    .map((hit) => ({ hit, score: scoreHit(hit, terms) }))
    .sort((a, b) => a.score - b.score || a.hit.title.localeCompare(b.hit.title))
    .slice(0, limit)
    .map((entry) => entry.hit);
};
