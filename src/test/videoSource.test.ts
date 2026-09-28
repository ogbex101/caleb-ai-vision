import { describe, it, expect } from "vitest";
import { needsRehosting, videoSourceKind, videoSourceLabel } from "@/lib/videoSource";

describe("videoSourceKind", () => {
  it("recognises a file in our own bucket", () => {
    expect(videoSourceKind("https://abc.supabase.co/storage/v1/object/public/portfolio-videos/x.mp4")).toBe("storage");
  });

  it("recognises a plain direct media file", () => {
    expect(videoSourceKind("https://cdn.example.com/reel.mp4")).toBe("direct");
    expect(videoSourceKind("https://cdn.example.com/reel.webm?v=2")).toBe("direct");
  });

  it("flags share hosts that only serve a player page", () => {
    for (const url of [
      "https://drive.google.com/file/d/abc/view",
      "https://www.youtube.com/watch?v=abc",
      "https://youtu.be/abc",
      "https://vimeo.com/12345",
      "https://www.dropbox.com/s/abc/clip.mp4?dl=0",
    ]) {
      expect(videoSourceKind(url), url).toBe("embed-only");
    }
  });

  it("treats a URL with no media extension and no known host as unrecognised", () => {
    expect(videoSourceKind("https://example.com/watch/abc")).toBe("unknown");
  });

  it("does not throw on a malformed or empty value", () => {
    expect(videoSourceKind("")).toBe("unknown");
    expect(videoSourceKind(null)).toBe("unknown");
    expect(videoSourceKind("not a url")).toBe("unknown");
  });
});

describe("needsRehosting", () => {
  it("is false when there is no preview set at all, so empty rows are not nagged", () => {
    expect(needsRehosting(null)).toBe(false);
    expect(needsRehosting("")).toBe(false);
  });

  it("is false for anything that can actually stream", () => {
    expect(needsRehosting("https://abc.supabase.co/storage/v1/object/public/portfolio-videos/x.mp4")).toBe(false);
    expect(needsRehosting("https://cdn.example.com/reel.mp4")).toBe(false);
  });

  it("is true for a Drive preview that will never play inline", () => {
    expect(needsRehosting("https://drive.google.com/file/d/abc/view")).toBe(true);
  });
});

describe("videoSourceLabel", () => {
  it("describes each kind for the admin badge", () => {
    expect(videoSourceLabel("https://x.supabase.co/storage/v1/object/public/portfolio-videos/a.mp4")).toBe("Hosted here");
    expect(videoSourceLabel("https://drive.google.com/file/d/a/view")).toBe("Won't play inline");
  });
});
