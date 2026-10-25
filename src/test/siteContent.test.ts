import { describe, it, expect } from "vitest";
import {
  DEFAULT_BEFORE_AFTER, DEFAULT_SERVICES, hasBeforeAfterPair, readBeforeAfter, readServices,
} from "@/lib/siteContent";

describe("readServices", () => {
  it("reads saved tiers", () => {
    const tiers = readServices([
      { name: "Reels", from: "£200", summary: "Vertical cuts", includes: ["Captions", "Two revisions"], highlight: true },
    ]);
    expect(tiers).toHaveLength(1);
    expect(tiers[0]).toMatchObject({ name: "Reels", from: "£200", highlight: true });
    expect(tiers[0].includes).toEqual(["Captions", "Two revisions"]);
  });

  it("falls back to the defaults rather than emptying the section", () => {
    expect(readServices(null)).toBe(DEFAULT_SERVICES);
    expect(readServices([])).toBe(DEFAULT_SERVICES);
    expect(readServices("nonsense")).toBe(DEFAULT_SERVICES);
    expect(readServices({ name: "not an array" })).toBe(DEFAULT_SERVICES);
  });

  it("drops a nameless row instead of rendering a blank card", () => {
    const tiers = readServices([{ name: "Real" }, { from: "£10" }, null, "x"]);
    expect(tiers.map((t) => t.name)).toEqual(["Real"]);
  });

  it("defaults a missing price to Ask and tolerates missing includes", () => {
    const [tier] = readServices([{ name: "Edit" }]);
    expect(tier.from).toBe("Ask");
    expect(tier.includes).toEqual([]);
    expect(tier.highlight).toBe(false);
  });

  it("strips blank lines out of includes", () => {
    const [tier] = readServices([{ name: "Edit", includes: ["Real", "", "  ", "Also real"] }]);
    expect(tier.includes).toEqual(["Real", "Also real"]);
  });
});

describe("readBeforeAfter", () => {
  it("reads a saved pair, in either key style", () => {
    expect(readBeforeAfter({ label: "Grade", note: "n", beforeUrl: "/b.jpg", afterUrl: "/a.jpg" }))
      .toEqual({ label: "Grade", note: "n", beforeUrl: "/b.jpg", afterUrl: "/a.jpg" });
    expect(readBeforeAfter({ before_url: "/b.jpg", after_url: "/a.jpg" }))
      .toMatchObject({ beforeUrl: "/b.jpg", afterUrl: "/a.jpg" });
  });

  it("keeps the default labels when only images are saved", () => {
    const pair = readBeforeAfter({ beforeUrl: "/b.jpg", afterUrl: "/a.jpg" });
    expect(pair.label).toBe(DEFAULT_BEFORE_AFTER.label);
    expect(pair.note).toBe(DEFAULT_BEFORE_AFTER.note);
  });

  it("falls back for anything malformed", () => {
    expect(readBeforeAfter(null)).toEqual(DEFAULT_BEFORE_AFTER);
    expect(readBeforeAfter([])).toEqual(DEFAULT_BEFORE_AFTER);
    expect(readBeforeAfter("x")).toEqual(DEFAULT_BEFORE_AFTER);
  });
});

describe("hasBeforeAfterPair", () => {
  it("needs both images, so a half-filled pair never shows one frame twice", () => {
    expect(hasBeforeAfterPair({ ...DEFAULT_BEFORE_AFTER, beforeUrl: "/b.jpg", afterUrl: "/a.jpg" })).toBe(true);
    expect(hasBeforeAfterPair({ ...DEFAULT_BEFORE_AFTER, beforeUrl: "/b.jpg", afterUrl: null })).toBe(false);
    expect(hasBeforeAfterPair(DEFAULT_BEFORE_AFTER)).toBe(false);
  });
});
