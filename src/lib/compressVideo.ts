import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Single-thread core (no cross-origin-isolation / SharedArrayBuffer required),
// so it works on Lovable's static hosting without any custom response headers.
const CORE_BASE = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

// Below this, compressing a file rarely earns back the wait, so it's
// uploaded as-is.
const COMPRESS_THRESHOLD_BYTES = 25 * 1024 * 1024;

// Never upscale, and cap most previews at 1080p, that's already more than
// enough quality for an on-site preview clip.
const MAX_HEIGHT = 1080;

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
      throw err;
    });
  }
  return ffmpegPromise;
};

export const shouldCompress = (file: File) => file.type.startsWith("video/") && file.size > COMPRESS_THRESHOLD_BYTES;

/**
 * Downscales + re-encodes a large video client-side (in-browser, via
 * ffmpeg.wasm) before it's uploaded, so a 4K, multi-hundred-MB sample
 * becomes a normal-sized web preview. Runs entirely on the admin's own
 * machine; there is no backend transcoding service in this project.
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
    await ffmpeg.exec([
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
    const data = await ffmpeg.readFile(outputName);
    const bytes = new Uint8Array(data as unknown as ArrayLike<number>);
    const compressedName = file.name.replace(/\.[^/.]+$/, "") + "-web.mp4";
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "video/mp4" });
    return new File([blob], compressedName, { type: "video/mp4" });
  } finally {
    ffmpeg.off("progress", progressHandler);
    await Promise.all([
      ffmpeg.deleteFile(inputName).catch(() => {}),
      ffmpeg.deleteFile(outputName).catch(() => {}),
    ]);
  }
};
