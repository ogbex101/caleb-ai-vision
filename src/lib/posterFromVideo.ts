/**
 * Grabs a still from a video file in the browser and returns it as a JPEG.
 *
 * The video is never uploaded: it is read from the local file through an object
 * URL, decoded by the browser's own player, and only the single frame leaves as
 * an image. That sidesteps both the storage bill and ffmpeg.wasm's memory
 * ceiling, so it works on a 2GB master as readily as a 20MB clip.
 */

/** Widest edge of the generated poster. 1600px is ample for a card or a hero. */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;
/** A browser that cannot decode the codec may simply never fire an event. */
const STEP_TIMEOUT_MS = 20000;

export class PosterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PosterError";
  }
}

/** Resolves on the first of `event` or an error, and never hangs forever. */
const once = (video: HTMLVideoElement, event: string, what: string) =>
  new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener(event, onDone);
      video.removeEventListener("error", onError);
      window.clearTimeout(timer);
    };
    const onDone = () => { cleanup(); resolve(); };
    const onError = () => {
      cleanup();
      reject(new PosterError(`The browser could not ${what}. This video's format may not be playable here — try an MP4.`));
    };
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new PosterError(`Timed out trying to ${what}.`));
    }, STEP_TIMEOUT_MS);
    video.addEventListener(event, onDone, { once: true });
    video.addEventListener("error", onError, { once: true });
  });

/**
 * Where to take the frame from. A quarter of the way in avoids the black or
 * logo frames most edits open on, but short clips are sampled earlier so the
 * seek target stays inside the file.
 */
export const posterTimestamp = (duration: number) => {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  if (duration <= 2) return duration / 2;
  return Math.min(duration * 0.25, 10);
};

/** Fits the frame inside MAX_EDGE without distorting it. */
export const posterDimensions = (width: number, height: number) => {
  if (!width || !height) return { width: 0, height: 0 };
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
};

export const posterFromVideo = async (file: File): Promise<File> => {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  // Harmless for an object URL, and required if a remote source is ever passed.
  video.crossOrigin = "anonymous";
  video.src = objectUrl;

  try {
    await once(video, "loadedmetadata", "read this video");

    const { width, height } = posterDimensions(video.videoWidth, video.videoHeight);
    if (!width || !height) {
      throw new PosterError("This file has no video track to take a poster from.");
    }

    video.currentTime = posterTimestamp(video.duration);
    await once(video, "seeked", "seek inside this video");

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new PosterError("This browser would not provide a canvas to draw the frame on.");
    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob) throw new PosterError("The frame could not be encoded as an image.");

    const name = file.name.replace(/\.[^/.]+$/, "") + "-poster.jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } finally {
    // Release the decoder and the blob either way, or the file stays in memory.
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
};
