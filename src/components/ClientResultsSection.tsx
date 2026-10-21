import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePortfolioItems } from "@/hooks/usePortfolioItems";

/** Counts up to `to` once it scrolls into view, then stops. */
const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) { setValue(to); return; }
    const controls = animate(0, to, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduceMotion]);

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  );
};

/**
 * Signature motion: numbers that count and a strip that never stops. The
 * stats tick up from zero as they arrive, and the client names scroll
 * continuously, so this band reads as live rather than printed.
 *
 * Client names come from the library itself, so the strip is only ever as
 * honest as the work: with nothing tagged, it says nothing.
 */
const ClientResultsSection = () => {
  const { items } = usePortfolioItems();
  const reduceMotion = useReducedMotion();

  const clients = Array.from(
    new Set(items.map((i) => i.client_name?.trim()).filter((n): n is string => Boolean(n))),
  );
  const delivered = items.length;
  const niches = new Set(
    items.flatMap((i) => [i.subcategory_slug, i.category_slug].filter(Boolean)),
  ).size;

  // Nothing in the library yet: a band of zeroes helps nobody.
  if (delivered === 0) return null;

  const stats = [
    { value: delivered, suffix: "+", label: "Pieces delivered" },
    { value: clients.length, suffix: "", label: "Clients served" },
    { value: niches, suffix: "", label: "Niches covered" },
  ].filter((s) => s.value > 0);

  // Duplicated so the marquee can loop without a visible seam.
  const strip = clients.length > 0 ? [...clients, ...clients] : [];

  return (
    <section id="results" className="relative overflow-hidden border-y border-border/60 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-5xl font-bold md:text-6xl">
                <span className="bg-gradient-to-b from-foreground to-foreground/55 bg-clip-text text-transparent">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </span>
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {strip.length > 0 && (
        <div className="relative mt-16">
          <p className="mb-5 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Trusted by
          </p>
          {/* Edges fade so names enter and leave rather than popping */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
          <div className="overflow-hidden">
            <motion.div
              animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
              transition={{ duration: Math.max(18, clients.length * 4), repeat: Infinity, ease: "linear" }}
              className="flex w-max items-center gap-12"
            >
              {strip.map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="whitespace-nowrap font-display text-xl font-semibold text-muted-foreground/70 md:text-2xl"
                >
                  {name}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ClientResultsSection;
