import { describe, it, expect, afterEach } from "vitest";
import {
  SEED_CATEGORIES,
  getCategories,
  getCategory,
  getSubCategory,
  rowsToCategories,
  setCategories,
  tagLabel,
  type TaxonomyRow,
} from "@/lib/categories";

const rows: TaxonomyRow[] = [
  { parent_category: null, slug: "video-editing", label: "Video Editing", blurb: "Edits", sort_order: 2 },
  { parent_category: null, slug: "ai-video", label: "AI Video", blurb: "Generated", sort_order: 1 },
  { parent_category: "ai-video", slug: "ugc", label: "UGC", blurb: "Creator style", sort_order: 2 },
  { parent_category: "ai-video", slug: "talking-head", label: "Talking Head", blurb: "Avatars", sort_order: 1 },
  { parent_category: "video-editing", slug: "talking-head", label: "Talking Head", blurb: "Interviews", sort_order: 1 },
];

// The store is module state, so each test leaves the seed back in place.
afterEach(() => setCategories(SEED_CATEGORIES));

describe("rowsToCategories", () => {
  it("nests sub-categories under their parent and honours sort_order", () => {
    const result = rowsToCategories(rows);
    expect(result.map((c) => c.slug)).toEqual(["ai-video", "video-editing"]);
    expect(result[0].subcategories.map((s) => s.slug)).toEqual(["talking-head", "ugc"]);
  });

  it("keeps a repeated sub-category slug under each parent separately", () => {
    const result = rowsToCategories(rows);
    expect(getSubCategoryFrom(result, "ai-video")?.blurb).toBe("Avatars");
    expect(getSubCategoryFrom(result, "video-editing")?.blurb).toBe("Interviews");
  });

  it("drops a sub-category whose parent is missing", () => {
    const orphaned = rowsToCategories([...rows, { parent_category: "nope", slug: "x", label: "X" }]);
    expect(orphaned.flatMap((c) => c.subcategories.map((s) => s.slug))).not.toContain("x");
  });

  it("defaults a null blurb to an empty string", () => {
    const [first] = rowsToCategories([{ parent_category: null, slug: "a", label: "A", blurb: null }]);
    expect(first.blurb).toBe("");
  });

  const getSubCategoryFrom = (cats: ReturnType<typeof rowsToCategories>, parent: string) =>
    cats.find((c) => c.slug === parent)?.subcategories.find((s) => s.slug === "talking-head");
});

describe("setCategories", () => {
  it("makes the sync helpers read the new taxonomy", () => {
    setCategories(rowsToCategories(rows));
    expect(getCategory("ai-video")?.label).toBe("AI Video");
    expect(getSubCategory("video-editing", "talking-head")?.blurb).toBe("Interviews");
    expect(tagLabel({ category: "ai-video", subcategory: "ugc" })).toBe("AI Video / UGC");
  });

  it("falls back to the seed rather than blanking the site on an empty list", () => {
    setCategories([]);
    expect(getCategories()).toBe(SEED_CATEGORIES);
  });
});
