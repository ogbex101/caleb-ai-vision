import { motion } from "framer-motion";

const STATS = [
  { value: "120+", label: "Films Directed" },
  { value: "48hr", label: "Avg. Turnaround" },
  { value: "35M+", label: "Views Generated" },
  { value: "100%", label: "In-House AI Pipeline" },
];

/**
 * Editorial stat strip — thin gold dividers instead of boxed cards, so it
 * reads as a magazine spread rather than the dashboard-style tiles used
 * on the Faith/Caleb layouts.
 */
const StudioStats = () => (
  <section className="px-6 py-16">
    <div className="mx-auto grid max-w-6xl divide-y divide-border/70 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className="px-6 py-6 text-center first:pl-0 last:pr-0 sm:first:pl-0"
        >
          <div className="gradient-text-gold font-display text-4xl font-bold md:text-5xl">{stat.value}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default StudioStats;
