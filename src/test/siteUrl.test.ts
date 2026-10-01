import { describe, it, expect, afterEach, vi } from "vitest";
import { campaignSlug, publicOrigin, withCampaign } from "@/lib/siteUrl";

describe("publicOrigin", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the configured production domain, without a trailing slash", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", "https://caleb-ai-vision.vercel.app/");
    expect(publicOrigin()).toBe("https://caleb-ai-vision.vercel.app");
  });

  it("falls back to the current address when none is configured", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", "");
    expect(publicOrigin()).toBe(window.location.origin);
  });
});

describe("withCampaign", () => {
  it("tags an outreach link so its visits show as a campaign", () => {
    expect(withCampaign("https://x.app/daniel/category-ai-video", "US DTC week 40")).toBe(
      "https://x.app/daniel/category-ai-video?utm_source=outreach&utm_campaign=us-dtc-week-40",
    );
  });

  it("appends to an existing query string", () => {
    expect(withCampaign("https://x.app/daniel/category-ai-video?ratio=9%3A16", "uk")).toBe(
      "https://x.app/daniel/category-ai-video?ratio=9%3A16&utm_source=outreach&utm_campaign=uk",
    );
  });

  it("leaves the link alone when no tag is given", () => {
    expect(withCampaign("https://x.app/daniel", "   ")).toBe("https://x.app/daniel");
    expect(campaignSlug("--Hello, World!--")).toBe("hello-world");
  });
});
