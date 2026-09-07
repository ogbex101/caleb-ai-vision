import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Reveal from "@/components/daniel/Reveal";
import TiltCard from "@/components/daniel/TiltCard";

interface Testimonial {
  id: string;
  name: string;
  title: string;
  content: string;
  rating: number;
}

/**
 * A single-quote spotlight reel with a filmstrip of names underneath,
 * instead of the two-column tilt-card grid used on Caleb/Faith. Only one
 * card is ever mounted, so there is nothing for a hover/tilt effect on one
 * card to bleed into.
 */
const DanielTestimonials = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("testimonials")
      .select("*")
      .eq("username", "daniel")
      .order("sort_order")
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          setItems(
            data.map((row) => ({
              id: row.id,
              name: row.client_name,
              title: row.client_title || "",
              content: row.content,
              rating: row.rating ?? 5,
            })),
          );
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && items.length === 0) return null;

  const total = items.length;
  const current = items[index];
  const go = (dir: number) => setIndex((i) => (i + dir + total) % total);

  return (
    <section className="relative overflow-hidden px-6 py-28">
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />

      <div className="relative mx-auto max-w-4xl">
        <Reveal className="mb-14 flex items-end justify-between gap-6 border-b border-border pb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-primary">Client testimony</span>
            <h2 className="mt-4 font-display text-4xl font-bold md:text-6xl">On the record.</h2>
          </div>
          {total > 1 && (
            <div className="flex shrink-0 gap-2">
              <button onClick={() => go(-1)} aria-label="Previous testimonial" className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:border-gold/40 hover:text-gold transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => go(1)} aria-label="Next testimonial" className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:border-gold/40 hover:text-gold transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </Reveal>

        {current && (
          <TiltCard strength={5}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, rotateY: 12, x: 40 }}
                animate={{ opacity: 1, rotateY: 0, x: 0 }}
                exit={{ opacity: 0, rotateY: -12, x: -40 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-3xl border border-gold/40 bg-card/60 p-10 md:p-14"
              >
                <Quote className="h-10 w-10 text-gold" />
                <p className="mt-6 font-display text-xl leading-relaxed text-foreground/90 md:text-3xl">
                  "{current.content}"
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-border pt-6">
                  <div>
                    <div className="font-display text-lg font-semibold">{current.name}</div>
                    <div className="text-sm text-muted-foreground">{current.title}</div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: current.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TiltCard>
        )}

        {total > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setIndex(i)}
                aria-label={`Show testimonial from ${item.name}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-gold" : "w-1.5 bg-border hover:bg-gold/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DanielTestimonials;
