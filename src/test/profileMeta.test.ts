import { describe, it, expect } from "vitest";
import { PROFILES, renderProfileHtml, setMetaTag, siteOrigin } from "../../scripts/profile-meta.mjs";

const BASE = `<!doctype html><html><head>
<title>AI Video Editing Portfolio | Cinematic Reels</title>
<meta name="description" content="old" />
<meta property="og:title" content="old" />
<meta property="og:image" content="/og/default.jpg" />
</head><body><div id="root"></div><script type="module" src="/assets/index-abc.js"></script></body></html>`;

const daniel = PROFILES.find((p: { file: string }) => p.file === "daniel.html");

describe("profile link previews", () => {
  it("gives the Daniel page its own title, description and absolute image", () => {
    const html = renderProfileHtml(BASE, daniel, "https://caleb-ai-vision.vercel.app");
    expect(html).toContain("<title>Daniel Studio | AI Film &amp; Video Showreel</title>");
    expect(html).toContain('<meta property="og:title" content="Daniel Studio | AI Film &amp; Video Showreel" />');
    expect(html).toContain('<meta property="og:image" content="https://caleb-ai-vision.vercel.app/og/daniel.jpg" />');
    expect(html).toContain('<meta property="og:url" content="https://caleb-ai-vision.vercel.app/daniel" />');
    expect(html).not.toContain('content="old"');
  });

  it("keeps the app bundle untouched", () => {
    const html = renderProfileHtml(BASE, daniel, "");
    expect(html).toContain('<script type="module" src="/assets/index-abc.js"></script>');
    expect(html).toContain('<meta property="og:image" content="/og/daniel.jpg" />');
    expect(html).not.toContain("og:url");
  });

  it("adds a missing tag before </head> and treats $ in content literally", () => {
    const html = setMetaTag("<head></head>", "name", "twitter:title", "Save $& more");
    expect(html).toContain('<meta name="twitter:title" content="Save $&amp; more" />');
  });

  it("reads the production domain from Vercel when nothing is set explicitly", () => {
    expect(siteOrigin({ VERCEL_PROJECT_PRODUCTION_URL: "caleb-ai-vision.vercel.app" })).toBe("https://caleb-ai-vision.vercel.app");
    expect(siteOrigin({ VITE_PUBLIC_SITE_URL: "https://studio.example.com/" })).toBe("https://studio.example.com");
    expect(siteOrigin({})).toBe("");
  });

  it("covers every public profile route", () => {
    expect(PROFILES.map((p: { file: string }) => p.file)).toEqual(["index.html", "daniel.html", "faith.html"]);
  });
});
