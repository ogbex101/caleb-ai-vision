import { describe, it, expect, afterEach } from "vitest";
import { SEED_CATEGORIES, rowsToCategories, setCategories, type TaxonomyRow } from "@/lib/categories";
import { buildSearchIndex, normalise, searchHits, type SearchableItem } from "@/lib/videoSearch";

const rows: TaxonomyRow[] = [
  { parent_category: null, slug: "ai-video", label: "AI Video", blurb: "Fully AI-generated films.", sort_order: 1 },
  { parent_category: "ai-video", slug: "talking-head", label: "Talking Head", blurb: "AI avatars presenting.", sort_order: 1 },
  { parent_category: "ai-video", slug: "product-ads", label: "Product Ads", blurb: "Commercial spots.", sort_order: 2 },
  { parent_category: null, slug: "video-editing", label: "Video Editing", blurb: "Edits of filmed footage.", sort_order: 2 },
  { parent_category: "video-editing", slug: "wedding", label: "Wedding / Ceremony", blurb: "Full-day wedding films.", sort_order: 1 },
];

const categories = rowsToCategories(rows);

const items: SearchableItem[] = [
  { id: "1", title: "Nike Spring Promo", client_name: "Nike", category_tags: [{ category: "ai-video", subcategory: "product-ads" }] },
  { id: "2", title: "Talking Point Podcast", description: "A talking format", category_tags: [] },
];

const index = buildSearchIndex(categories, items, "caleb");

afterEach(() => setCategories(SEED_CATEGORIES));

describe("normalise", () => {
  it("flattens punctuation and case so slashes and dashes still match", () => {
    expect(normalise("Wedding / Ceremony")).toBe("wedding ceremony");
    expect(normalise("Talking-Head!")).toBe("talking head");
  });
});

describe("buildSearchIndex", () => {
  it("indexes categories, sub-categories and videos", () => {
    expect(index.filter((h) => h.kind === "category")).toHaveLength(2);
    expect(index.filter((h) => h.kind === "subcategory")).toHaveLength(3);
    expect(index.filter((h) => h.kind === "video")).toHaveLength(2);
  });

  it("points a niche at its category page and carries the blurb as the hint", () => {
    const hit = index.find((h) => h.id === "s:video-editing:wedding");
    expect(hit?.path).toBe("/caleb/category-video-editing/wedding");
    expect(hit?.hint).toBe("Full-day wedding films.");
    expect(hit?.context).toBe("Video Editing");
  });

  it("sends an untagged video to the portfolio, since there is no per-item page", () => {
    expect(index.find((h) => h.id === "v:2")?.path).toBe("/portfolio");
    expect(index.find((h) => h.id === "v:1")?.path).toBe("/caleb/category-ai-video/product-ads");
  });
});

describe("searchHits", () => {
  it("returns nothing for an empty query rather than everything", () => {
    expect(searchHits(index, "   ")).toEqual([]);
  });

  it("ranks the matching niche above a video that merely mentions the word", () => {
    const [first] = searchHits(index, "talking");
    expect(first.kind).toBe("subcategory");
    expect(first.title).toBe("Talking Head");
  });

  it("matches a niche through its blurb, not just its label", () => {
    expect(searchHits(index, "avatars").map((h) => h.title)).toContain("Talking Head");
  });

  it("treats extra words as narrowing, not widening", () => {
    const hits = searchHits(index, "wedding films");
    expect(hits.map((h) => h.title)).toEqual(["Wedding / Ceremony"]);
  });

  it("matches across a slash in the label", () => {
    expect(searchHits(index, "ceremony").map((h) => h.title)).toContain("Wedding / Ceremony");
  });

  it("finds a video by its client name", () => {
    const hits = searchHits(index, "nike");
    expect(hits).toHaveLength(1);
    expect(hits[0].title).toBe("Nike Spring Promo");
  });

  it("returns nothing when a term matches no hit", () => {
    expect(searchHits(index, "claymation")).toEqual([]);
  });

  it("honours the result limit", () => {
    expect(searchHits(index, "video", 2)).toHaveLength(2);
  });
});
