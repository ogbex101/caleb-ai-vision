import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PortfolioItem {
  id: string;
  title: string;
  description?: string | null;
  client_name?: string | null;
  category?: string | null;
  video_url?: string | null;
  full_video_url?: string | null;
}

interface Props {
  items: PortfolioItem[];
  autoAdvanceMs?: number;
}

const PortfolioCarousel = ({ items, autoAdvanceMs = 10000 }: Props) => {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);

  const total = items.length;
  const goTo = (i: number) => setIndex(((i % total) + total) % total);
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Auto-advance timer (10s max, or when the video ends first)
  useEffect(() => {
    if (!isPlaying || total <= 1) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(next, autoAdvanceMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, isPlaying, total, autoAdvanceMs]);

  // Restart video whenever slide changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    if (isPlaying) v.play().catch(() => {});
    else v.pause();
  }, [index, isPlaying]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") { e.preventDefault(); setIsPlaying((p) => !p); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  if (total === 0) return null;
  const current = items[index];

  return (
    <div className="relative">
      {/* Stage */}
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-card shadow-[var(--shadow-glow-lg)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {current.video_url ? (
              <video
                ref={videoRef}
                src={current.video_url}
                className="w-full h-full object-cover"
                autoPlay={isPlaying}
                muted
                playsInline
                onEnded={next}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                No video
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />

            {/* Caption */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute bottom-0 left-0 right-0 p-6 md:p-8"
            >
              {current.category && (
                <span className="text-xs font-medium text-primary tracking-widest uppercase">
                  {current.category}
                </span>
              )}
              <h3 className="font-display font-bold text-2xl md:text-4xl text-foreground mt-2">
                {current.title}
              </h3>
              {current.client_name && (
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  {current.client_name}
                </p>
              )}
              {current.full_video_url && (
                <a
                  href={current.full_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Watch Full Video
                </a>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-background/70 backdrop-blur-md border border-border hover:border-primary/60 hover:bg-background/90 flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-background/70 backdrop-blur-md border border-border hover:border-primary/60 hover:bg-background/90 flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}

        {/* Play / Pause */}
        <button
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/70 backdrop-blur-md border border-border hover:border-primary/60 flex items-center justify-center transition-all"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-foreground" />
          ) : (
            <Play className="w-4 h-4 text-foreground ml-0.5" />
          )}
        </button>

        {/* Progress bar */}
        {total > 1 && isPlaying && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-border/40">
            <motion.div
              key={`${index}-${isPlaying}`}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: autoAdvanceMs / 1000, ease: "linear" }}
              className="h-full bg-primary"
            />
          </div>
        )}
      </div>

      {/* Thumbnails / dots */}
      {total > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          {items.map((it, i) => (
            <button
              key={it.id}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-primary" : "w-4 bg-border hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      )}

      <div className="mt-3 text-center text-xs text-muted-foreground tracking-widest">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
};

export default PortfolioCarousel;
