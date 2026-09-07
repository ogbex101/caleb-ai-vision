import { Gem } from "lucide-react";

const ITEMS = [
  "Generative Film",
  "Motion Design",
  "AI Showreels",
  "Brand Spots",
  "Synthetic Cinematography",
  "Sound Design",
];

/**
 * Continuous ticker of the studio's craft disciplines. Purely decorative
 * texture between the hero and the reel, reusing the .marquee-track keyframe.
 */
const StudioMarquee = () => {
  const track = [...ITEMS, ...ITEMS];

  return (
    <div className="relative overflow-hidden border-y border-gold/40 bg-card/40 py-4">
      <div className="gold-divider absolute inset-x-0 top-0 h-px" />
      <div className="gold-divider absolute inset-x-0 bottom-0 h-px" />
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {track.map((label, i) => (
          <span key={`${label}-${i}`} className="flex items-center gap-10 text-sm font-display uppercase tracking-[0.3em] text-foreground/70">
            {label}
            <Gem className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
};

export default StudioMarquee;
