import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Single-thread core (no cross-origin-isolation / SharedArrayBuffer required),
// so it works on static hosting without any custom response headers.
//
// Defaults to the public CDN. Set VITE_FFMPEG_CORE_BASE to serve the two core
// files from somewhere we control instead (e.g. "/ffmpeg" after copying
// ffmpeg-core.js and ffmpeg-core.wasm into public/ffmpeg/), which removes the
// runtime dependency on a third-party CDN staying up.
const DEFAULT_CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
const CORE_BASE = import.meta.env.VITE_FFMPEG_CORE_BASE || DEFAULT_CORE_BASE;

// Below this, compressing a file rarely earns back the wait, so it's
// uploaded as-is.
const COMPRESS_THRESHOLD_BYTES = 25 * 1024 * 1024;

// Never upscale, and cap most previews at 1080p, that's already more than
// enough quality for an on-site preview clip.
const MAX_HEIGHT = 1080;

// Containers browsers routinely hand us with an empty or unhelpful File.type.
const VIDEO_EXTENSION = /\.(mp4|mov|m4v|webm|mkv|avi|wmv|flv|mpe?g|m2ts|mts|3gp|ogv)$/i;

/**
 * Which step failed. The CDN fetch failing is an environment problem the admin
 * can't fix by picking a different file, an encode failure usually means the
 * source codec is one this build can't read, so they read very differently in
 * the UI.
 */
export type CompressionStage = "load" | "encode";

export class VideoCompressionError extends Error {
  constructor(
    message: string,
    readonly stage: CompressionStage,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "VideoCompressionError";
  }
}

let ffmpegPromise: Promise<FFmpeg> | null = null;

const loadFFmpeg = async () => {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg();
      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
        toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
      ]);
      await ffmpeg.load({ coreURL, wasmURL });
      return ffmpeg;
    })().catch((err) => {
      ffmpegPromise = null; // allow retrying on the next upload
      throw new VideoCompressionError(
        `Could not load the video compressor from ${CORE_BASE}. Check that the network allows it, or serve the core files locally via VITE_FFMPEG_CORE_BASE.`,
        "load",
        err,
      );
    });
  }
  return ffmpegPromise;
};

/** True when the file looks like a video, whether or not the browser set a MIME type. */
export const isVideoFile = (file: File) =>
  file.type.startsWith("video/") || (!file.type && VIDEO_EXTENSION.test(file.name));

export const shouldCompress = (file: File) => isVideoFile(file) && file.size > COMPRESS_THRESHOLD_BYTES;

/**
 * A usable Content-Type for storage. Supabase rejects an upload sent with an
 * empty one, and some browsers report "" for .mov/.mkv/.avi picks.
 */
export const contentTypeFor = (file: File) => {
  if (file.type) return file.type;
  if (VIDEO_EXTENSION.test(file.name)) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "webm") return "video/webm";
    if (ext === "ogv") return "video/ogg";
    return "video/mp4";
  }
  return "application/octet-stream";
};

/**
 * Downscales + re-encodes a large video client-side (in-browser, via
 * ffmpeg.wasm) before it's uploaded, so a 4K, multi-hundred-MB sample
 * becomes a normal-sized web preview. Runs entirely on the admin's own
 * machine; there is no backend transcoding service in this project.
 *
 * Throws VideoCompressionError rather than ever returning a partial file:
 * callers fall back to uploading the original, so a silent half-encoded
 * output would be worse than a failure.
 */
export const compressVideo = async (file: File, onProgress?: (ratio: number) => void): Promise<File> => {
  if (!shouldCompress(file)) return file;

  const ffmpeg = await loadFFmpeg();
  const progressHandler = ({ progress }: { progress: number }) => {
    if (Number.isFinite(progress)) onProgress?.(Math.min(1, Math.max(0, progress)));
  };
  ffmpeg.on("progress", progressHandler);

  const inputName = "input";
  const outputName = "output.mp4";

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    // exec resolves with an exit code and does NOT reject on failure, so an
    // unchecked call here is how a truncated output.mp4 used to reach storage.
    const exitCode = await ffmpeg.exec([
      "-i", inputName,
      "-vf", `scale=-2:min(ih\\,${MAX_HEIGHT})`,
      "-c:v", "libx264",
      "-preset", "veryfast",
      "-crf", "28",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      outputName,
    ]);
    if (exitCode !== 0) {
      throw new VideoCompressionError(`ffmpeg exited with code ${exitCode} while re-encoding ${file.name}.`, "encode");
    }

    const data = await ffmpeg.readFile(outputName);
    const bytes = new Uint8Array(data as unknown as ArrayLike<number>);
    // A successful exit with a tiny output means the encode produced nothing
    // usable; uploading it would replace a working clip with a broken one.
    if (bytes.byteLength < 1024) {
      throw new VideoCompressionError(`Re-encoding ${file.name} produced an empty file.`, "encode");
    }

    const compressedName = file.name.replace(/\.[^/.]+$/, "") + "-web.mp4";
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "video/mp4" });
    return new File([blob], compressedName, { type: "video/mp4" });
  } catch (err) {
    if (err instanceof VideoCompressionError) throw err;
    throw new VideoCompressionError(
      err instanceof Error ? err.message : `Could not re-encode ${file.name}.`,
      "encode",
      err,
    );
  } finally {
    ffmpeg.off("progress", progressHandler);
    await Promise.all([
      ffmpeg.deleteFile(inputName).catch(() => {}),
      ffmpeg.deleteFile(outputName).catch(() => {}),
    ]);
  }
};
