import { motion } from "framer-motion";
import { ExternalLink, Film, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PortfolioItem } from "@/hooks/usePortfolioItems";
import { getCategory, getSubCategory } from "@/lib/categories";

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
      {items.map((item, i) => (
        <PreviewCard key={item.id} item={item} index={i} />
      ))}
    </div>
  );
};

export default PortfolioGrid;
