// Gives each profile its own link preview.
//
// The app is a single-page app, so every URL is served the same index.html,
// and the title, description and image that WhatsApp, LinkedIn, Slack, email
// clients and Upwork show when a link is pasted come from that file's <head>
// (those crawlers do not run JavaScript, so usePageMeta never reaches them).
// After `vite build`, this writes dist/daniel.html and dist/faith.html with
// their own tags; vercel.json serves them for /daniel/* and /faith/*. The
// React app itself is identical in all three files.
//
// Image URLs are made absolute when the production domain is known
// (VITE_PUBLIC_SITE_URL, or VERCEL_PROJECT_PRODUCTION_URL on Vercel), because
// several crawlers ignore relative og:image paths.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const PROFILES = [
  {
    file: "index.html",
    path: "/",
    title: "AI Video Editing Portfolio | Cinematic Reels",
    description:
      "Cinematic AI video and editing portfolio: talking head, UGC, b-roll, reels and long-form work, organised into shareable category reels.",
    image: "/og/default.jpg",
    author: "Caleb Peters",
  },
  {
    file: "daniel.html",
    path: "/daniel",
    title: "Daniel Studio | AI Film & Video by Daniel Ogbeifun Osewe",
    description:
      "Generative AI films, ads and social edits, directed, edited and finished by Daniel Ogbeifun Osewe.",
    image: "/og/daniel.jpg",
    author: "Daniel Ogbeifun Osewe",
  },
  {
    file: "faith.html",
    path: "/faith",
    title: "Faith K | Video Editing Portfolio",
    description: "Cinematic video editing and AI-assisted reels by Faith K.",
    image: "/og/faith.jpg",
    author: "Faith K",
  },
];

const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Replaces the tag with this name/property, or adds it just before </head>. */
export const setMetaTag = (html, attr, key, content) => {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  const safeKey = key.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+${attr}="${safeKey}"[^>]*>`, "i");
  // Function replacers, so a "$" in the content is never read as a pattern.
  return pattern.test(html) ? html.replace(pattern, () => tag) : html.replace("</head>", () => `    ${tag}\n  </head>`);
};

export const siteOrigin = (env = process.env) => {
  const explicit = (env.VITE_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  if (explicit) return explicit;
  return env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
};

export const renderProfileHtml = (html, profile, origin = "") => {
  const image = origin ? `${origin}${profile.image}` : profile.image;
  let out = html.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapeAttr(profile.title)}</title>`);
  out = setMetaTag(out, "name", "description", profile.description);
  out = setMetaTag(out, "name", "author", profile.author);
  out = setMetaTag(out, "property", "og:title", profile.title);
  out = setMetaTag(out, "property", "og:description", profile.description);
  out = setMetaTag(out, "property", "og:image", image);
  out = setMetaTag(out, "property", "og:image:width", "1200");
  out = setMetaTag(out, "property", "og:image:height", "630");
  if (origin) out = setMetaTag(out, "property", "og:url", `${origin}${profile.path}`);
  out = setMetaTag(out, "name", "twitter:title", profile.title);
  out = setMetaTag(out, "name", "twitter:description", profile.description);
  out = setMetaTag(out, "name", "twitter:image", image);
  return out;
};

const main = () => {
  const dist = resolve(process.cwd(), "dist");
  const base = readFileSync(resolve(dist, "index.html"), "utf8");
  const origin = siteOrigin();
  for (const profile of PROFILES) {
    writeFileSync(resolve(dist, profile.file), renderProfileHtml(base, profile, origin));
  }
  console.log(`profile-meta: wrote ${PROFILES.map((p) => p.file).join(", ")}${origin ? ` for ${origin}` : " (no production domain set, image paths stay relative)"}`);
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
