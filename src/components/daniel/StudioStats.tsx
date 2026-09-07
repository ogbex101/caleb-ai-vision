import Reveal from "@/components/daniel/Reveal";
import TiltCard from "@/components/daniel/TiltCard";

const STATS = [
  { value: "120+", label: "Films Directed" },
  { value: "48hr", label: "Avg. Turnaround" },
  { value: "35M+", label: "Views Generated" },
  { value: "100%", label: "In-House AI Pipeline" },
];

/**
 * Editorial stat strip — thin gold dividers instead of boxed cards, so it
 * reads as a magazine spread rather than the dashboard-style tiles used
 * on the Faith/Caleb layouts. Each number tilts toward the cursor.
 */
const StudioStats = () => (
  <section className="px-6 py-16">
    <div className="mx-auto grid max-w-6xl divide-y divide-border/70 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
      {STATS.map((stat, i) => (
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

export default StudioStats;
