import { motion, AnimatePresence } from "framer-motion";
import { Plus, HelpCircle } from "lucide-react";
import { useState } from "react";

interface FAQ {
  q: string;
  a: string;
}

const defaultFaqs: FAQ[] = [
  {
    q: "What exactly does an AI video editor do differently?",
    a: "Traditional editing is manual frame work. I pair that craft with generative and assistive AI (shot generation, upscaling, relighting, motion synthesis, voice work and automated rough cuts) so the concept-to-final loop collapses from weeks into days without losing directorial control.",
  },
  {
    q: "How fast is a typical turnaround?",
    a: "Short-form social edits land in 24–72 hours. Brand films and commercials usually run 5–10 working days including one revision round. Rush timelines are possible; flag it in the brief and the pipeline gets structured around it.",
  },
  {
    q: "Do I own the final footage and AI-generated assets?",
    a: "Yes. On final payment you receive full commercial rights to the delivered edit, plus project files on request. AI-generated elements are produced with commercially licensed tools, so you're clear to run paid media with them.",
  },
  {
    q: "What do you need from me to start?",
    a: "A short brief: goal, audience, platform, reference links, and any raw footage or brand assets. If you don't have footage, that's fine: a large share of this work is generated and composited entirely from scratch.",
  },
  {
    q: "How many revisions are included?",
    a: "Two structured revision rounds are included in every project. Additional rounds are billed hourly, but honest scoping upfront means most projects never need them.",
  },
  {
    q: "Can you handle long-form content?",
    a: "Absolutely: documentaries, YouTube series, event recaps and course content. Long masters are delivered through a private drive link, while the on-site portfolio previews the highlight cut.",
  },
];

interface Props {
  name?: string;
}

const FAQSection = ({ name = "me" }: Props) => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary text-xs font-medium tracking-[0.3em] uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold mt-4 tracking-tight">
            Questions, <span className="gradient-text">Answered</span>
          </h2>
          <p className="text-muted-foreground mt-5 max-w-xl mx-auto leading-relaxed">
            Everything worth knowing before working with {name}: process, ownership, timelines and the tech behind it.
          </p>
        </motion.div>

        <div className="space-y-3">
          {defaultFaqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={`rounded-2xl border backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
                  isOpen ? "border-primary/50 bg-card/80" : "border-border bg-card/40 hover:border-primary/30"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-6 text-left px-6 md:px-8 py-6"
                >
                  <span className="font-display font-semibold text-base md:text-lg text-foreground">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 135 : 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center ${
                      isOpen ? "border-primary bg-primary/15" : "border-border"
                    }`}
                  >
                    <Plus className={`w-4 h-4 ${isOpen ? "text-primary" : "text-muted-foreground"}`} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 md:px-8 pb-7 -mt-1 text-muted-foreground leading-relaxed text-[15px]">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
