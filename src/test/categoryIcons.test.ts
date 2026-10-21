import { describe, it, expect } from "vitest";
import { Presentation, Tag, Video } from "lucide-react";
import { SEED_CATEGORIES } from "@/lib/categories";
import { categoryIcon, iconForKind, nicheIcon } from "@/lib/categoryIcons";

describe("categoryIcons", () => {
  it("maps every seeded category to a real icon, not the fallback", () => {
    const unmapped = SEED_CATEGORIES.filter((c) => categoryIcon(c.slug) === Presentation);
    expect(unmapped.map((c) => c.slug)).toEqual([]);
  });

  it("maps every seeded niche to a real icon, not the fallback", () => {
    const unmapped = SEED_CATEGORIES.flatMap((c) =>
      c.subcategories.filter((s) => nicheIcon(s.slug) === Tag).map((s) => `${c.slug}/${s.slug}`),
    );
    expect(unmapped).toEqual([]);
  });

  it("falls back rather than throwing for a niche added from the dashboard", () => {
    expect(nicheIcon("3d-animation")).toBe(Tag);
    expect(categoryIcon("brand-new")).toBe(Presentation);
    expect(nicheIcon(null)).toBe(Tag);
    expect(nicheIcon(undefined)).toBe(Tag);
  });

  it("always uses the video icon for a video hit, whatever its slug", () => {
    expect(iconForKind("video", "wedding")).toBe(Video);
    expect(iconForKind("video", "")).toBe(Video);
  });

  it("distinguishes a category hit from a niche hit of the same slug", () => {
    expect(iconForKind("category", "ai-video")).toBe(categoryIcon("ai-video"));
    expect(iconForKind("subcategory", "wedding")).toBe(nicheIcon("wedding"));
  });
});
