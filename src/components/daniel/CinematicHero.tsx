import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Play, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioItem } from "@/hooks/usePortfolioItems";
import TiltCard from "@/components/daniel/TiltCard";

interface Props {
  heroUrl: string;
  isImage: boolean;
  items: PortfolioItem[];
  tagline?: string | null;
}

const WORDS = ["Daniel", "Studio"];

/**
 * Cinematic hero: a rotating montage of the studio's own AI films behind
 * kinetic type, with a floating strip of live clips along the bottom. The
 * media plate and the type drift at different rates on scroll for depth.
 */
const CinematicHero = ({ heroUrl, isImage, items, tagline }: Props) => {
  const clips = useMemo(
    () => items.filter((i) => i.video_url).slice(0, 6),
    [items],
  );
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    if (clips.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % clips.length), 5200);
    return () => clearInterval(t);
  }, [clips.length]);

  const montage = clips[active];

  return (
    <section ref={sectionRef} className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden film-grain px-6 pb-14 pt-32">
      {/* Base hero media — parallaxes at a different rate than the scroll */}
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        {isImage ? (
          <motion.img
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
            src={heroUrl}
            alt="Daniel Studio showreel still"
            className="h-full w-full object-cover"
          />
        ) : (
          <motion.video
            initial={{ scale: 1.12, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
            src={heroUrl}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        )}

        {/* Montage of real work fading over the base plate */}
        <AnimatePresence mode="wait">
          {montage?.video_url && (
            <motion.video
              key={montage.id}
              src={montage.video_url}
              poster={montage.thumbnail_url || undefined}
              autoPlay
              muted
              loop
              playsInline
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 0.85, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/25" />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 30% 40%, hsl(43 78% 53% / 0.18), transparent 60%)" }}
        />
        <div className="scanlines absolute inset-0 opacity-[0.05]" />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[150px]"
        animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 9, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 bottom-1/4 h-[380px] w-[380px] rounded-full bg-accent/25 blur-[150px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.28, 0.5] }}
        transition={{ duration: 11, repeat: Infinity }}
      />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-primary backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5" /> AI Video Studio
        </motion.div>

        <h1 className="font-display text-[15vw] font-bold leading-[0.85] tracking-tight md:text-[11rem]">
          {WORDS.map((word, i) => (
            <span key={word} className="mr-5 inline-block overflow-hidden align-bottom last:mr-0">
              <motion.span
                initial={{ y: "115%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.45 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                className={`inline-block ${i === 1 ? "gradient-text text-glow" : "text-foreground"}`}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.7 }}
          className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/80 md:text-xl"
        >
          {tagline || "Generative film craft for brands that want motion with intent. Directed, edited and finished in-house."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#reel"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-3.5 font-display font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-background/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            <Play className="relative h-4 w-4" />
            <span className="relative">Enter the showreel</span>
          </a>
          <a
            href="#search-category"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-7 py-3.5 font-display font-medium backdrop-blur-md transition-colors hover:border-primary/60 hover:text-primary"
          >
            Build a client link
          </a>
        </motion.div>

        {/* Live clip strip */}
        {clips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.35, duration: 0.8 }}
            className="mt-12 flex gap-3 overflow-x-auto pb-2"
          >
            {clips.map((clip, i) => (
              <TiltCard key={clip.id} strength={12} className="shrink-0">
                <button
                  onClick={() => setActive(i)}
                  aria-label={`Preview ${clip.title}`}
                  className={`relative h-16 w-28 overflow-hidden rounded-lg border transition-all ${
                    i === active ? "border-primary shadow-[var(--shadow-glow)]" : "border-border/70 opacity-60 hover:opacity-100"
                  }`}
                >
                  <video src={clip.video_url!} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 truncate bg-background/70 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-foreground/80">
                    {clip.title}
                  </span>
                </button>
              </TiltCard>
            ))}
          </motion.div>
        )}
      </motion.div>

      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="absolute bottom-8 right-8 text-primary"
      >
        <ArrowDown className="h-5 w-5" />
      </motion.div>
    </section>
  );
};

export default CinematicHero;
