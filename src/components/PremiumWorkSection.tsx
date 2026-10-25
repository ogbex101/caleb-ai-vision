import { motion, useReducedMotion } from "framer-motion";
import { Crown, Play } from "lucide-react";
import { useState } from "react";
import { usePortfolioItems } from "@/hooks/usePortfolioItems";
import { nicheIcon } from "@/lib/categoryIcons";
import { readTags, tagLabel } from "@/lib/categories";
import VideoLightbox from "@/components/VideoLightbox";

/**
 * The flagship showcase, deliberately unlike the main portfolio grid: a
 * spotlit stage with one large piece at a time and the rest as a numbered
 * index, rather than equal-weight cards. Driven by the `premium` flag, which
 * is separate from `featured` — featured fills the landing grid, premium picks
 * what earns this treatment.
 *
 * Its signature motion is a spotlight sweep: the stage scales up out of
 * darkness while a warm gradient wipes across it, so arriving here feels like
 * a different room from the rest of the page.
 */
const PremiumWorkSection = () => {
  const { items, loading } = usePortfolioItems({ premiumOnly: true });
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const reduceMotion = useReducedMotion();

  // Nothing marked premium yet, or the migration has not run: say nothing
  // rather than showing an empty stage.
  if (loading || items.length === 0) return null;

  const current = items[Math.min(active, items.length - 1)];
  const tag = readTags(current)[0];
  const TagIcon = nicheIcon(tag?.subcategory || tag?.category);

  return (
    <section id="premium-work" className="relative overflow-hidden px-6 py-28">
      {/* Warm spotlight, so this section reads as its own room */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(43 96% 56% / 0.10), transparent 70%)" }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.3em] text-amber-400">
            <Crown className="h-3.5 w-3.5" /> Premium work
          </span>
          <h2 className="mt-6 font-display text-4xl font-bold md:text-6xl">
            The pieces I'd{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              show first
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            A short list, not the whole library. Each of these was briefed, cut and finished end to end.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Stage: spotlight sweep on entry */}
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: reduceMotion ? 0.3 : 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden rounded-3xl border border-amber-400/25 bg-card shadow-[0_0_80px_-20px_hsl(43_96%_56%/0.25)]"
          >
            <div className="relative aspect-video overflow-hidden">
              {current.video_url ? (
                <video
                  src={current.video_url}
                  poster={current.thumbnail_url || undefined}
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="h-full w-full object-cover"
                />
              ) : (
                <img src={current.thumbnail_url || "/placeholder.svg"} alt="" className="ken-burns h-full w-full object-cover" />
              )}

              {/* The sweep: a warm band that wipes across once on reveal */}
              {!reduceMotion && (
                <motion.div
                  initial={{ x: "-120%" }}
                  whileInView={{ x: "120%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-amber-200/25 to-transparent"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

              <button
                onClick={() => setLightbox(true)}
                aria-label={`Play ${current.title}`}
                className="absolute inset-0 grid place-items-center"
              >
                <span className="grid h-16 w-16 place-items-center rounded-full border border-amber-400/50 bg-background/70 text-amber-400 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                  <Play className="h-6 w-6" />
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 p-6 md:p-8">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-amber-400">
                  <TagIcon className="h-3.5 w-3.5" />
                  {tag ? tagLabel(tag) : "Flagship"}
                </div>
                <h3 className="mt-3 truncate font-display text-2xl font-bold md:text-3xl">{current.title}</h3>
                {current.client_name && (
                  <p className="mt-1 text-sm text-muted-foreground">for {current.client_name}</p>
                )}
              </div>
              {current.full_video_url && (
                <a
                  href={current.full_video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-full border border-amber-400/40 px-5 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-400/10"
                >
                  Watch the full piece
                </a>
              )}
            </div>
          </motion.div>

          {/* Numbered index, not thumbnails: this is a short curated list */}
          <motion.ol
            initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="divide-y divide-border/60 self-start border-l border-amber-400/25 pl-5"
          >
            <li className="pb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {items.length} selected
            </li>
            {items.map((item, i) => (
              <li key={item.id}>
                <button
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  className={`flex w-full items-center gap-3 py-3 text-left transition-colors ${
                    i === active ? "text-amber-400" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="font-mono text-[10px]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate text-sm">{item.title}</span>
                </button>
              </li>
            ))}
          </motion.ol>
        </div>
      </div>

      <VideoLightbox
        open={lightbox}
        onClose={() => setLightbox(false)}
        title={current.title}
        videoUrl={current.video_url}
        fullVideoUrl={current.full_video_url}
      />

    </section>
  );
};

export default PremiumWorkSection;
