import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink, Film, Volume2, VolumeX } from "lucide-react";
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
  const [isMuted, setIsMuted] = useState(true);
  const [direction, setDirection] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // 3D tilt tracking
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useTransform(my, [-0.5, 0.5], [8, -8]);
  const rotY = useTransform(mx, [-0.5, 0.5], [-12, 12]);

  const total = items.length;
  const goTo = (i: number, dir = 1) => {
    setDirection(dir);
    setIndex(((i % total) + total) % total);
  };
  const next = () => goTo(index + 1, 1);
  const prev = () => goTo(index - 1, -1);

  useEffect(() => {
    if (!isPlaying || total <= 1) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(next, autoAdvanceMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isPlaying, total, autoAdvanceMs]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = isMuted;
    if (isPlaying) v.play().catch(() => {});
    else v.pause();
  }, [index, isPlaying, isMuted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (total === 0) return null;
  const current = items[index];
  const prevItem = items[(index - 1 + total) % total];
  const nextItem = items[(index + 1) % total];

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const resetMouse = () => {
    mx.set(0);
    my.set(0);
  };

  const variants = {
    enter: (dir: number) => ({
      opacity: 0,
      rotateY: dir * 35,
      x: dir * 120,
      scale: 0.9,
    }),
    center: { opacity: 1, rotateY: 0, x: 0, scale: 1 },
    exit: (dir: number) => ({
      opacity: 0,
      rotateY: dir * -35,
      x: dir * -120,
      scale: 0.9,
    }),
  };

  return (
    <div className="relative" style={{ perspective: "2000px" }}>
      {/* Side peek previews (desktop) */}
      <div className="hidden lg:block pointer-events-none absolute inset-y-0 -left-16 w-40 opacity-40 blur-[2px]" style={{ transform: "rotateY(35deg) translateZ(-100px)", transformOrigin: "right center" }}>
        <div className="h-full rounded-2xl overflow-hidden border border-border/40 bg-card">
          {prevItem.video_url && (
            <video src={prevItem.video_url} muted loop playsInline autoPlay className="w-full h-full object-cover" />
          )}
        </div>
      </div>
      <div className="hidden lg:block pointer-events-none absolute inset-y-0 -right-16 w-40 opacity-40 blur-[2px]" style={{ transform: "rotateY(-35deg) translateZ(-100px)", transformOrigin: "left center" }}>
        <div className="h-full rounded-2xl overflow-hidden border border-border/40 bg-card">
          {nextItem.video_url && (
            <video src={nextItem.video_url} muted loop playsInline autoPlay className="w-full h-full object-cover" />
          )}
        </div>
      </div>

      {/* Ambient glow */}
      <div aria-hidden className="absolute -inset-8 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent blur-3xl -z-10" />

      {/* Stage */}
      <motion.div
        onMouseMove={handleMouse}
        onMouseLeave={resetMouse}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        className="relative aspect-video rounded-2xl overflow-hidden border border-primary/20 bg-card shadow-[var(--shadow-glow-lg)] will-change-transform"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {current.video_url ? (
              <video
                ref={videoRef}
                src={current.video_url}
                className="w-full h-full object-cover"
                autoPlay={isPlaying}
                muted={isMuted}
                playsInline
                onEnded={next}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                <Film className="w-8 h-8" />
              </div>
            )}

            {/* Cinematic vignette + gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, hsl(var(--background) / 0.6) 100%)" }} />

            {/* Caption */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="absolute bottom-0 left-0 right-0 p-6 md:p-10"
              style={{ transform: "translateZ(60px)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                {current.category && (
                  <span className="text-[10px] font-medium text-primary tracking-[0.25em] uppercase px-3 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur">
                    {current.category}
                  </span>
                )}
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
                  {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl text-foreground leading-[1.05] tracking-tight max-w-3xl">
                {current.title}
              </h3>
              {current.client_name && (
                <p className="text-sm md:text-base text-muted-foreground mt-3 font-medium">
                  <span className="text-primary/70">◆</span> {current.client_name}
                </p>
              )}
              {current.description && (
                <p className="text-sm text-muted-foreground/80 mt-3 max-w-xl line-clamp-2">
                  {current.description}
                </p>
              )}
              {current.full_video_url && (
                <a
                  href={current.full_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] hover:scale-105 transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Watch Full Video
                </a>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="group absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/60 backdrop-blur-md border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all hover:scale-110"
              style={{ transform: "translateZ(80px) translateY(-50%)" }}
            >
              <ChevronLeft className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="group absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/60 backdrop-blur-md border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all hover:scale-110"
              style={{ transform: "translateZ(80px) translateY(-50%)" }}
            >
              <ChevronRight className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            </button>
          </>
        )}

        <button
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-border hover:border-primary flex items-center justify-center transition-all"
        >
          {isPlaying ? <Pause className="w-4 h-4 text-foreground" /> : <Play className="w-4 h-4 text-foreground ml-0.5" />}
        </button>

        <button
          onClick={() => setIsMuted((m) => !m)}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          title={isMuted ? "Unmute" : "Mute"}
          className={`absolute top-4 right-16 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all hover:scale-110 ${
            isMuted
              ? "bg-background/60 border-border hover:border-primary"
              : "bg-primary/20 border-primary shadow-[var(--shadow-glow)]"
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
        </button>

        {total > 1 && isPlaying && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-border/30 overflow-hidden">
            <motion.div
              key={`${index}-${isPlaying}`}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: autoAdvanceMs / 1000, ease: "linear" }}
              className="h-full bg-gradient-to-r from-primary via-accent to-primary"
            />
          </div>
        )}
      </motion.div>

      {/* Thumbnail rail */}
      {total > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap px-4">
          {items.map((it, i) => {
            const active = i === index;
            return (
              <motion.button
                key={it.id}
                onClick={() => goTo(i, i > index ? 1 : -1)}
                whileHover={{ y: -4, scale: 1.05 }}
                aria-label={`Go to ${it.title}`}
                className={`relative overflow-hidden rounded-lg border transition-all ${
                  active ? "border-primary shadow-[var(--shadow-glow)] w-28 h-16" : "border-border/60 opacity-60 hover:opacity-100 w-20 h-12"
                }`}
              >
                {it.video_url ? (
                  <video src={it.video_url} muted loop playsInline autoPlay className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                {active && (
                  <motion.div
                    layoutId="thumb-active"
                    className="absolute inset-0 ring-2 ring-primary rounded-lg pointer-events-none"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortfolioCarousel;
