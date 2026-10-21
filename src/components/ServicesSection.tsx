import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clapperboard, Scissors, Sparkles, type LucideIcon } from "lucide-react";

interface Tier {
  icon: LucideIcon;
  name: string;
  from: string;
  summary: string;
  includes: string[];
  highlight?: boolean;
}

/** Edit these to match what you actually sell — they are copy, not data. */
const TIERS: Tier[] = [
  {
    icon: Scissors,
    name: "Social cutdowns",
    from: "£150",
    summary: "Vertical edits built for the first three seconds.",
    includes: ["Up to 60 seconds", "Captions and sound design", "9:16, 1:1 and 16:9 exports", "Two rounds of revisions"],
  },
  {
    icon: Sparkles,
    name: "AI-generated spots",
    from: "£450",
    summary: "Concept to finished ad with generated presenters and scenes.",
    includes: ["Script and storyboard", "AI presenter or full synthesis", "Licensed music and mix", "Three rounds of revisions"],
    highlight: true,
  },
  {
    icon: Clapperboard,
    name: "Long-form and brand films",
    from: "£900",
    summary: "Documentary, explainer and brand work that holds attention.",
    includes: ["Up to 10 minutes", "Colour grade and full mix", "Motion graphics and titles", "Unlimited revisions in scope"],
  },
];

/**
 * Signature motion: cards unfold. Each one rotates in on its own X axis
 * through a shared perspective, so the row assembles itself in sequence
 * rather than fading in as a block.
 */
const ServicesSection = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section id="services" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">What I do</span>
          <h2 className="mt-5 font-display text-4xl font-bold md:text-5xl">Services and starting prices</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Indicative, not fixed: scope, length and turnaround move the number. Tell me the brief and I'll quote properly.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3" style={{ perspective: 1400 }}>
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, rotateX: reduceMotion ? 0 : -18, y: reduceMotion ? 12 : 40 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: reduceMotion ? 0.35 : 0.8,
                delay: reduceMotion ? 0 : i * 0.14,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={reduceMotion ? undefined : { y: -8 }}
              style={{ transformOrigin: "top center" }}
              className={`flex flex-col rounded-2xl border p-7 transition-colors ${
                tier.highlight
                  ? "border-primary/50 bg-primary/5 shadow-[0_0_60px_-25px_hsl(var(--primary))]"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {tier.highlight && (
                <span className="mb-4 self-start rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
                  Most requested
                </span>
              )}
              <tier.icon className={`h-6 w-6 ${tier.highlight ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="mt-5 font-display text-xl font-bold">{tier.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tier.summary}</p>
              <p className="mt-6 font-display text-3xl font-bold">
                {tier.from}
                <span className="ml-1 text-sm font-normal text-muted-foreground">from</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {tier.includes.map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-muted-foreground">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${tier.highlight ? "text-primary" : "text-foreground/40"}`} />
                    {line}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`mt-7 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-display text-sm font-semibold transition-all ${
                  tier.highlight
                    ? "bg-primary text-primary-foreground hover:shadow-[var(--shadow-glow)]"
                    : "border border-border text-foreground hover:border-primary/50"
                }`}
              >
                Start a brief <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
