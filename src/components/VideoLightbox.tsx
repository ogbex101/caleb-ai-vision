import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { driveViewUrl, drivePreviewUrl } from "@/lib/driveLink";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** A file in our own bucket, played directly. */
  videoUrl?: string | null;
  /** Google Drive, YouTube, Vimeo… opened in its own player. */
  fullVideoUrl?: string | null;
}

/** YouTube and Vimeo share links, reduced to their embeddable form. */
const embedUrl = (url: string): string | null => {
  const drive = drivePreviewUrl(url);
  if (drive) return drive;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return `https://www.youtube.com/embed${parsed.pathname}`;
    if (host.endsWith("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.endsWith("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
};

/**
 * Plays a piece without leaving the page.
 *
 * A file in our own bucket plays in a real <video>. Anything hosted elsewhere
 * is embedded in its own player instead, because a Drive or YouTube share link
 * returns an HTML page rather than a media stream and cannot drive <video src>.
 * Where even that is not possible, the lightbox degrades to a link out rather
 * than showing an empty frame.
 */
const VideoLightbox = ({ open, onClose, title, videoUrl, fullVideoUrl }: Props) => {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const embed = fullVideoUrl ? embedUrl(fullVideoUrl) : null;

  // Escape closes, and the page behind must not scroll while this is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] grid place-items-center bg-background/95 p-4 backdrop-blur-xl md:p-8"
        >
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-border bg-background/70 text-muted-foreground transition-colors hover:text-foreground md:right-6 md:top-6"
          >
            <X className="h-5 w-5" />
          </button>

          <motion.div
            initial={{ scale: reduceMotion ? 1 : 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: reduceMotion ? 1 : 0.98, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-2xl">
              {videoUrl ? (
                <video src={videoUrl} controls autoPlay playsInline className="aspect-video w-full" />
              ) : embed ? (
                <iframe
                  src={embed}
                  title={title}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full border-0"
                />
              ) : (
                <div className="grid aspect-video w-full place-items-center p-8 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">This one plays on its own site.</p>
                    {fullVideoUrl && (
                      <a
                        href={fullVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/40 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                      >
                        <ExternalLink className="h-4 w-4" /> Open the full video
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl">{title}</h3>
              {fullVideoUrl && (
                <a
                  href={driveViewUrl(fullVideoUrl) || fullVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" /> Open in a new tab
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoLightbox;
