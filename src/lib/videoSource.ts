/**
 * Where a video URL can actually be used.
 *
 * `full_video_url` is rendered as a link, so a Google Drive or YouTube URL is
 * perfectly fine there and is what the field is for. `video_url` is rendered as
 * `<video src>`, which needs a direct media response: a Drive or YouTube share
 * page returns HTML, so the player silently shows nothing. Telling those apart
 * is what lets admin flag the previews that will never play.
 */
export type VideoSourceKind = "storage" | "direct" | "embed-only" | "unknown";

/** Hosts that only ever serve a player page, never a usable media stream. */
const EMBED_ONLY_HOSTS = [
  "drive.google.com",
  "docs.google.com",
  "youtube.com",
  "youtu.be",
  "vimeo.com",
  "dropbox.com",
  "onedrive.live.com",
  "1drv.ms",
  "wetransfer.com",
  "loom.com",
];

const MEDIA_EXTENSION = /\.(mp4|webm|ogv|ogg|mov|m4v)(\?|#|$)/i;

export const videoSourceKind = (url?: string | null): VideoSourceKind => {
  if (!url) return "unknown";
  let host = "";
  try {
    host = new URL(url, "https://placeholder.invalid").hostname.toLowerCase();
  } catch {
    return "unknown";
  }
  if (url.includes("/portfolio-videos/")) return "storage";
  if (EMBED_ONLY_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return "embed-only";
  if (MEDIA_EXTENSION.test(url)) return "direct";
  return "unknown";
};

/** True when this URL cannot drive an inline <video> and needs re-uploading. */
export const needsRehosting = (videoUrl?: string | null) => {
  if (!videoUrl) return false;
  const kind = videoSourceKind(videoUrl);
  return kind === "embed-only" || kind === "unknown";
};

export const videoSourceLabel = (url?: string | null): string => {
  switch (videoSourceKind(url)) {
    case "storage": return "Hosted here";
    case "direct": return "Direct file";
    case "embed-only": return "Won't play inline";
    default: return "Unrecognised URL";
  }
};
