import { motion } from "framer-motion";
import { ExternalLink, Film, Play, Volume2, VolumeX } from "lucide-react";
import VideoLightbox from "@/components/VideoLightbox";
import { isDriveLink } from "@/lib/driveLink";
import { useEffect, useRef, useState } from "react";
import type { PortfolioItem } from "@/hooks/usePortfolioItems";
import { getCategory, getSubCategory } from "@/lib/categories";

/**
 * Poster card, for a piece whose film lives elsewhere.
 *
 * Nothing but a still is hosted here, so the still has to carry it: the image
 * drifts slowly behind a fixed frame and sits desaturated until hover, when it
 * lifts to full colour. A static frame that moves reads as film; one that does
 * not reads as a broken video.
 */
const PosterCard = ({ item, index }: { item: PortfolioItem; index: number }) => {
  const [open, setOpen] = useState(false);
  const cat = getCategory(item.category_slug);
  const sub = getSubCategory(item.category_slug, item.subcategory_slug);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -6 }}
        className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
      >
        <button
          onClick={() => setOpen(true)}
          aria-label={`Play ${item.title}`}
          className="relative block aspect-video w-full overflow-hidden bg-muted"
        >
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt=""
              loading="lazy"
              className="ken-burns h-full w-full object-cover saturate-[0.45] transition-[filter] duration-700 group-hover:saturate-100"
            />
          ) : (
            <span className="grid h-full w-full place-items-center text-muted-foreground"><Film className="h-8 w-8" /></span>
          )}

          {/* Letterbox bars, so a still reads as a frame of film */}
          <span className="pointer-events-none absolute inset-x-0 top-0 h-[7%] bg-background/80" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[7%] bg-background/80" />
          <span className="pointer-events-none absolute inset-0 film-grain opacity-40" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-primary/40 bg-background/70 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <Play className="ml-0.5 h-5 w-5 text-primary" />
            </span>
          </span>

          <span className="absolute bottom-[10%] left-3 rounded-full border border-border bg-background/70 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {isDriveLink(item.full_video_url) ? "Full film" : "Watch"}
          </span>
        </button>

        <div className="space-y-3 p-5">
          <div className="flex flex-wrap gap-2">
            {cat && (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-primary">
                {cat.label}
              </span>
            )}
            {sub && (
              <span className="rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {sub.label}
              </span>
            )}
          </div>
          <h3 className="font-display text-xl font-bold leading-tight">{item.title}</h3>
          {item.description && <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}
        </div>
      </motion.article>

      <VideoLightbox
        open={open}
        onClose={() => setOpen(false)}
        title={item.title}
        fullVideoUrl={item.full_video_url}
      />
    </>
  );
};

/**
 * Auto-preview card: plays only the first N seconds (30 or 60, set per item in
 * admin) then loops back, keeping long uploads light on the page.
 */
const PreviewCard = ({ item, index }: { item: PortfolioItem; index: number }) => {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const limit = item.preview_seconds && item.preview_seconds > 0 ? item.preview_seconds : 30;
  const cat = getCategory(item.category_slug);
  const sub = getSubCategory(item.category_slug, item.subcategory_slug);
  const fullLink = item.full_video_url;

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      if (v.currentTime >= limit) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [limit]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative rounded-2xl overflow-hidden border border-border hover:border-primary/50 bg-card transition-colors"
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {item.video_url ? (
          <video
            ref={ref}
            src={item.video_url}
            poster={item.thumbnail_url || undefined}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            muted={muted}
            playsInline
            preload="metadata"
            onClick={toggle}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Film className="w-8 h-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />

        {item.video_url && (
          <>
            {!playing && (
              <button
                onClick={toggle}
                aria-label={`Play preview of ${item.title}`}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="w-14 h-14 rounded-full bg-background/70 backdrop-blur-md border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-primary ml-0.5" />
                </span>
              </button>
            )}
            <button
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute preview" : "Mute preview"}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                muted ? "bg-background/60 border-border" : "bg-primary/20 border-primary"
              }`}
            >
              {muted ? <VolumeX className="w-4 h-4 text-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
            </button>
            <span className="absolute bottom-3 left-3 text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-full bg-background/70 border border-border text-muted-foreground">
              {limit}s preview
            </span>
          </>
        )}
      </div>

      <div className="p-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          {cat && (
            <span className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary">
              {cat.label}
            </span>
          )}
          {sub && (
            <span className="text-[10px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-border text-muted-foreground">
              {sub.label}
            </span>
          )}
        </div>
        <h3 className="font-display font-bold text-xl leading-tight">{item.title}</h3>
        {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
        {fullLink && (
          <a
            href={fullLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
          >
            <ExternalLink className="w-4 h-4" /> Watch Full Video
          </a>
        )}
      </div>
    </motion.article>
  );
};

const PortfolioGrid = ({ items }: { items: PortfolioItem[] }) => {
  if (items.length === 0) {
    return <p className="text-center text-muted-foreground py-16">No videos in this category yet.</p>;
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, i) =>
        // No preview hosted here, but a poster and a link: show the poster and
        // open the film in a lightbox rather than an empty player.
        !item.video_url && item.thumbnail_url && item.full_video_url ? (
          <PosterCard key={item.id} item={item} index={i} />
        ) : (
          <PreviewCard key={item.id} item={item} index={i} />
        ),
      )}
    </div>
  );
};

export default PortfolioGrid;
