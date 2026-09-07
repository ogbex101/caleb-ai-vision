import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PortfolioItem } from "@/hooks/usePortfolioItems";
import { getCategory, getSubCategory } from "@/lib/categories";
import { trackVideoClick } from "@/lib/trackVideoClick";
import Reveal from "@/components/daniel/Reveal";
import TiltCard from "@/components/daniel/TiltCard";

const SLIDE_MS = 10000;

/**
 * Cinema deck: one large stage clip with wipe transitions, a kinetic caption
 * block and a vertical filmstrip. Deliberately different from the coverflow
 * carousel used on the other layouts.
 */
const ShowreelStage = ({ items }: { items: PortfolioItem[] }) => {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const total = items.length;
  const item = items[index];

  const go = useCallback(
    (dir: number) => {
      if (total === 0) return;
      setIndex((i) => (i + dir + total) % total);
      setProgress(0);
    },
    [total],
  );

  useEffect(() => {
    if (!playing || total < 2) return;
    const started = Date.now();
    const tick = setInterval(() => {
      const pct = Math.min(1, (Date.now() - started) / SLIDE_MS);
      setProgress(pct);
      if (pct >= 1) go(1);
    }, 80);
    return () => clearInterval(tick);
  }, [playing, index, total, go]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [index, playing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (total === 0 || !item) {
    return <p className="py-16 text-center text-muted-foreground">No featured productions yet.</p>;
  }

  const cat = getCategory(item.category_slug);
  const sub = getSubCategory(item.category_slug, item.subcategory_slug);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_150px]">
      {/* Stage */}
      <Reveal direction="left" className="relative overflow-hidden rounded-3xl border border-border bg-card film-grain">
        <div className="relative aspect-[16/9] bg-background">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={item.id}
              initial={{ clipPath: "inset(0 0 0 100%)", scale: 1.06 }}
              animate={{ clipPath: "inset(0 0 0 0%)", scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
              className="absolute inset-0"
            >
              {item.video_url ? (
                <video
                  ref={videoRef}
                  src={item.video_url}
                  poster={item.thumbnail_url || undefined}
                  autoPlay
                  loop
                  muted={muted}
                  playsInline
                  onPlay={() => trackVideoClick(item)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={item.thumbnail_url || "/placeholder.svg"}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse at center, transparent 45%, hsl(var(--background) / 0.8) 100%)" }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Caption */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.28em]">
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                    {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                  {cat && <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-muted-foreground">{cat.label}</span>}
                  {sub && <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-muted-foreground">{sub.label}</span>}
                </div>
                <h3 className="font-display text-3xl font-bold leading-tight md:text-5xl">{item.title}</h3>
                {item.description && (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground/75 md:text-base">{item.description}</p>
                )}
                {item.full_video_url && (
                  <a
                    href={item.full_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackVideoClick(item)}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-display font-semibold text-primary-foreground transition-transform hover:scale-105"
                  >
                    <ExternalLink className="h-4 w-4" /> Watch full video
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="absolute right-5 top-5 flex gap-2">
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
              className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all ${
                muted ? "border-border bg-background/60" : "border-primary bg-primary/20"
              }`}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-primary" />}
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause showreel" : "Play showreel"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur-md transition-colors hover:border-primary"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>

          {total > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Previous production"
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur-md transition-all hover:border-primary hover:text-primary"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next production"
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/60 backdrop-blur-md transition-all hover:border-primary hover:text-primary"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className="h-1 w-full bg-muted">
          <motion.div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${progress * 100}%` }} />
        </div>
      </Reveal>

      {/* Filmstrip */}
      <Reveal direction="right" delay={0.1} className="flex gap-3 overflow-x-auto lg:max-h-[520px] lg:flex-col lg:overflow-y-auto lg:pr-1">
        {items.map((clip, i) => (
          <TiltCard key={clip.id} strength={8} className="w-36 shrink-0 lg:w-full">
            <button
              onClick={() => { setIndex(i); setProgress(0); }}
              aria-label={`Show ${clip.title}`}
              className={`relative aspect-video w-full overflow-hidden rounded-xl border text-left transition-all ${
                i === index ? "border-primary shadow-[var(--shadow-glow)]" : "border-border opacity-60 hover:opacity-100"
              }`}
            >
              {clip.video_url ? (
                <video src={clip.video_url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
              ) : (
                <img src={clip.thumbnail_url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
              )}
              <span className="absolute inset-x-0 bottom-0 truncate bg-background/75 px-2 py-1 text-[10px] font-medium">
                {clip.title}
              </span>
            </button>
          </TiltCard>
        ))}
      </Reveal>
    </div>
  );
};

export default ShowreelStage;
