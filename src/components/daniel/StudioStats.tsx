import { useMemo } from "react";
import Reveal from "@/components/daniel/Reveal";
import TiltCard from "@/components/daniel/TiltCard";
import type { PortfolioItem } from "@/hooks/usePortfolioItems";
import { readTags } from "@/lib/categories";

interface Props {
  items: PortfolioItem[];
  totalCount?: number;
}

/**
 * Editorial stat strip built from the real library, not placeholder numbers.
 */
const StudioStats = ({ items, totalCount }: Props) => {
  const stats = useMemo(() => {
    const all = items;
    const tags = all.flatMap((i) => readTags(i as any));
    const categories = new Set(tags.map((t) => t.category));
    const subs = new Set(tags.filter((t) => t.subcategory).map((t) => `${t.category}/${t.subcategory}`));
    const formats = new Set(all.map((i) => i.aspect_ratio || "16:9"));
    return [
      { value: String(totalCount ?? all.length), label: "Films in the library" },
      { value: String(categories.size), label: "Disciplines covered" },
      { value: String(subs.size), label: "Specialist niches" },
      { value: String(formats.size), label: "Delivery formats" },
    ];
  }, [items, totalCount]);

  return (
    <section className="px-6 py-16">
      <div className="mx-auto grid max-w-6xl divide-y divide-border/70 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.08} className="px-6 py-6 first:pl-0 last:pr-0 sm:first:pl-0">
            <TiltCard strength={8} glare={false} className="text-center">
              <div className="gradient-text-gold font-display text-4xl font-bold md:text-5xl">{stat.value}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">{stat.label}</div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default StudioStats;
