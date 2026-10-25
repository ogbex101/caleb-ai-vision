/**
 * Google Drive share links, normalised.
 *
 * Drive hands out several shapes depending on where you copy from, and none of
 * them can be used as a <video src>: they return an HTML player page, not a
 * media stream. What they can do is open in a tab or sit in an iframe, so the
 * site stores a poster image and treats the Drive link as the way through to
 * the full piece.
 */

/** The 25-45 character id Drive gives every file. */
const ID = "[A-Za-z0-9_-]{10,}";

const PATTERNS = [
  new RegExp(`/file/d/(${ID})`),          // .../file/d/<id>/view
  new RegExp(`/d/(${ID})`),               // .../d/<id>
  new RegExp(`[?&]id=(${ID})`),           // .../open?id=<id>, uc?id=<id>
  new RegExp(`/folders/(${ID})`),         // a folder, which is not a file
];

const isDriveHost = (host: string) =>
  host === "drive.google.com" || host === "docs.google.com" || host.endsWith(".google.com");

/** The file id in a Drive URL, or null when there isn't one. */
export const driveFileId = (url?: string | null): string | null => {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (!isDriveHost(parsed.hostname.toLowerCase())) return null;
  // A folder link points at a collection, so it can never resolve to one video.
  if (parsed.pathname.includes("/folders/")) return null;
  for (const pattern of PATTERNS.slice(0, 3)) {
    const match = `${parsed.pathname}${parsed.search}`.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const isDriveLink = (url?: string | null) => driveFileId(url) !== null;

/** Opens the file in Drive's own player, in a tab. */
export const driveViewUrl = (url?: string | null) => {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/view` : null;
};

/** The embeddable player, for an iframe on our own pages. */
export const drivePreviewUrl = (url?: string | null) => {
  const id = driveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
};

/**
 * What to tell the admin about a link they pasted. null means it is fine.
 * Anything else is shown next to the field, because a Drive link that is not
 * shared publicly fails silently for visitors and looks like a broken site.
 */
export const driveLinkWarning = (url?: string | null): string | null => {
  const value = url?.trim();
  if (!value) return null;
  let host = "";
  try {
    host = new URL(value).hostname.toLowerCase();
  } catch {
    return "That doesn't look like a web address.";
  }
  if (!isDriveHost(host)) return null; // some other host, which is fine
  if (value.includes("/folders/")) {
    return "That's a link to a Drive folder, not a single video. Open the video itself and copy its link.";
  }
  if (!driveFileId(value)) {
    return "That's a Google link, but no file id could be found in it. Use Share → Copy link on the video.";
  }
  return null;
};
