import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { FileText, MessageSquare, Scissors, Send, type LucideIcon } from "lucide-react";
import { useRef } from "react";

interface Step {
  icon: LucideIcon;
  title: string;
  body: string;
  when: string;
}

const STEPS: Step[] = [
  { icon: MessageSquare, title: "Brief", body: "You send the footage, references and the goal. I come back with questions and a scope, not a guess.", when: "Day 0" },
  { icon: FileText, title: "Direction", body: "A short treatment: structure, pacing, music lane and look. We agree it before anything is cut.", when: "Day 1" },
  { icon: Scissors, title: "Edit", body: "First cut for structure, then grade, sound and graphics once the spine is signed off.", when: "Day 2-5" },
  { icon: Send, title: "Delivery", body: "Final masters in every ratio you need, plus the project file if you want it.", when: "Day 6" },
];

/**
 * Signature motion: a line that draws itself. The vertical rail fills as the
 * section scrolls, and each step latches in as the line passes it, so progress
 * through the process maps onto progress down the page.
 */
const ProcessSection = () => {
  const railRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: railRef, offset: ["start 75%", "end 55%"] });
  // Springing the raw progress stops the rail jittering on trackpad scrolls.
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const height = useTransform(fill, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" className="relative px-6 py-28">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">How it runs</span>
          <h2 className="mt-5 font-display text-4xl font-bold md:text-5xl">From brief to delivery</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Four steps, no mystery. Timings are typical for a single piece.
          </p>
        </motion.div>

        <div ref={railRef} className="relative pl-16 md:pl-24">
          {/* The rail: a dim track with a bright fill that follows the scroll */}
          <div className="absolute bottom-2 left-[26px] top-2 w-px bg-border md:left-[42px]" />
          <motion.div
            style={{ height: reduceMotion ? "100%" : height }}
            className="absolute left-[26px] top-2 w-px origin-top bg-gradient-to-b from-primary via-primary to-primary/0 shadow-[0_0_12px_hsl(var(--primary))] md:left-[42px]"
          />

          <ol className="space-y-12">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, x: reduceMotion ? 0 : -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {/* Node sits on the rail */}
                <motion.span
                  initial={{ scale: reduceMotion ? 1 : 0.4, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                  className="absolute -left-16 top-0 grid h-[52px] w-[52px] place-items-center rounded-2xl border border-primary/40 bg-background text-primary md:-left-24"
                >
                  <step.icon className="h-5 w-5" />
                </motion.span>

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="font-display text-xl font-bold">{step.title}</h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80">{step.when}</span>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                <span className="mt-3 block font-mono text-[10px] text-muted-foreground/50">
                  {String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
