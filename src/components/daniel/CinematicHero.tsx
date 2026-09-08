import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioItem } from "@/hooks/usePortfolioItems";

interface Props {
  heroUrl: string;
  isImage: boolean;
  items: PortfolioItem[];
  tagline?: string | null;
}

/**
 * Full-bleed cinematic hero. The film is the subject: it fills the frame at
 * full brightness, with type confined to a disciplined lower band and a
 * right-hand index of the reel, so nothing floats loose over the picture.
 */
const CinematicHero = ({ heroUrl, isImage, items, tagline }: Props) => {
  const clips = useMemo(() => items.filter((i) => i.video_url).slice(0, 5), [items]);
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const panelOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (clips.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % clips.length), 7000);
    return () => clearInterval(t);
  }, [clips.length]);

  const montage = clips[active];

  return (
    <section ref={sectionRef} className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden film-grain">
      {/* Film plate */}
      <motion.div style={{ y: mediaY, scale: mediaScale }} className="absolute inset-0">
        {isImage ? (
          <img src={heroUrl} alt="Daniel Studio showreel still" className="h-full w-full object-cover" />
        ) : (
          <video src={heroUrl} autoPlay muted={muted} loop playsInline className="h-full w-full object-cover" />
        )}

        <AnimatePresence mode="wait">
          {montage?.video_url && (
            <motion.video
              key={montage.id}
              src={montage.video_url}
              poster={montage.thumbnail_url || undefined}
              autoPlay
              muted={muted}
              loop
              playsInline
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>

        {/* Only enough shading to seat the type — the picture stays bright */}
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-background via-background/75 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background/85 to-transparent" />
        <div className="scanlines absolute inset-0 opacity-[0.04]" />
      </motion.div>

      {/* Letterbox rules */}
      <div className="pointer-events-none absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <motion.div style={{ opacity: panelOpacity }} className="relative mx-auto w-full max-w-7xl px-6 pb-14">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Type block, aligned to one baseline grid */}
          <div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.42em] text-primary">
              <span className="h-px w-10 bg-primary/70" />
              AI Film Studio
            </div>

            <h1 className="mt-5 font-display text-[13vw] font-bold leading-[0.82] tracking-tight md:text-[8.5rem]">
              {["Daniel", "Studio"].map((word, i) => (
                <span key={word} className="block overflow-hidden">
                  <motion.span
                    initial={{ y: "115%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className={`block ${i === 1 ? "gradient-text-gold" : "text-foreground"}`}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="mt-6 max-w-md text-base leading-relaxed text-foreground/75"
            >
              {tagline || "Generative film craft for brands that want motion with intent. Directed, edited and finished in-house."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.7 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <a
                href="#reel"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-display text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                <Play className="h-4 w-4" /> Enter the showreel
              </a>
              <a
                href="#search-category"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-6 py-3 font-display text-sm font-medium backdrop-blur-md transition-colors hover:border-primary hover:text-primary"
              >
                Build a client link
              </a>
              {!isImage && (
                <button
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? "Unmute showreel" : "Mute showreel"}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 backdrop-blur-md transition-colors hover:border-primary hover:text-primary"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-primary" />}
                </button>
              )}
            </motion.div>
          </div>

          {/* Reel index — a numbered list, not floating thumbnails */}
          {clips.length > 0 && (
            <motion.ol
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.05, duration: 0.8 }}
              className="hidden divide-y divide-border/60 border-l border-primary/25 pl-5 lg:block"
            >
              <li className="pb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Now playing</li>
              {clips.map((clip, i) => (
                <li key={clip.id}>
                  <button
                    onClick={() => setActive(i)}
                    className={`flex w-full items-center gap-3 py-3 text-left transition-colors ${
                      i === active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="truncate text-sm">{clip.title}</span>
                  </button>
                </li>
              ))}
            </motion.ol>
          )}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity }}
        className="absolute bottom-6 right-8 text-primary/80"
      >
        <ArrowDown className="h-5 w-5" />
      </motion.div>
    </section>
  );
};

export default CinematicHero;
