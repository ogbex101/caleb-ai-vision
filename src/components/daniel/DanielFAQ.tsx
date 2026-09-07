import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const FAQS = [
  {
    q: "What makes this an AI video studio rather than a regular edit house?",
    a: "Every stage, from previsualisation to final grade, runs through a generative pipeline I've built and tuned myself. Shots are generated, upscaled and composited rather than only cut together, so the studio can produce footage that was never filmed.",
  },
  {
    q: "How fast can a spot go from brief to delivery?",
    a: "A short-form generative spot usually lands in 3 to 5 working days. Longer branded films with live-action composites run 1 to 2 weeks, including a revision pass.",
  },
  {
    q: "Can I supply my own footage to blend with generated shots?",
    a: "Yes. Hybrid projects, real plates composited with generated environments or characters, are a large part of the studio's work.",
  },
  {
    q: "Who owns the generated footage once the project ships?",
    a: "You do. Full commercial rights transfer on final payment, and every generated asset is produced with commercially licensed tools.",
  },
];

/**
 * A numbered, split-column reveal: the question index sits fixed on the
 * left as a running counter and only the active answer slides in from the
 * side, instead of the plus/minus accordion used on Caleb/Faith.
 */
const DanielFAQ = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className="px-6 py-28">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[minmax(0,280px)_1fr]">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-primary">Studio FAQ</span>
          <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
            Before you <span className="gradient-text-gold">brief us.</span>
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Process, ownership and turnaround, the essentials before a project starts.
          </p>
        </div>

        <div>
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="border-b border-border py-6 first:pt-0">
                <button onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-start gap-5 text-left">
                  <span className={`font-display text-sm tabular-nums ${isOpen ? "text-gold" : "text-muted-foreground"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`flex-1 font-display text-lg font-semibold md:text-xl ${isOpen ? "text-foreground" : "text-foreground/80"}`}>
                    {faq.q}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <motion.p
                        initial={{ x: 24, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="ml-10 mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base"
                      >
                        {faq.a}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DanielFAQ;
