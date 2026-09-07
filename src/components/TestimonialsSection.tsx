import { motion, useMotionValue, useTransform } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  title: string;
  content: string;
  rating: number;
}

const fallbackTestimonials: Testimonial[] = [
  {
    id: "fallback-1",
    name: "Sarah Mitchell",
    title: "CEO, TechVault Inc.",
    content: "Caleb didn't just edit our video, he reimagined our entire brand story. The AI-enhanced visuals were unlike anything we'd ever seen. Our launch video hit 2M views in the first week.",
    rating: 5,
  },
  {
    id: "fallback-2",
    name: "Marcus Chen",
    title: "Director, Indie Film Collective",
    content: "Working with Caleb is like working with someone from the future. He sees possibilities in AI that most editors haven't even dreamed of yet. Absolute game-changer for our film.",
    rating: 5,
  },
  {
    id: "fallback-3",
    name: "Amara Obi",
    title: "Marketing Director, HyperX Gaming",
    content: "The turnaround time was insane, and the quality was cinema-grade. Caleb's use of AI tools cut our production timeline in half without sacrificing an ounce of creativity.",
    rating: 5,
  },
  {
    id: "fallback-4",
    name: "James Rodriguez",
    title: "Creative Director, Urban Culture Magazine",
    content: "Caleb has this rare ability to make technology feel human. Every frame of our documentary felt intentional and emotionally resonant. He's our go-to editor now.",
    rating: 5,
  },
];

/**
 * Each card owns its own motion values (mx/my below), so hovering or
 * tilting one card can never bleed into a neighbour's transform or state.
 */
const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useTransform(my, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-10, 10]);
  const glowX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: -12 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className="group relative p-8 rounded-2xl bg-card/70 backdrop-blur-sm border border-border hover:border-primary/50 transition-colors duration-300 will-change-transform overflow-hidden"
    >
      {/* cursor-following sheen */}
      <motion.div
        aria-hidden
        style={{ left: glowX, top: glowY }}
        className="pointer-events-none absolute w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      <motion.div
        animate={{ y: [0, -6, 0], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 6, repeat: Infinity, delay: index * 0.4 }}
        className="absolute top-6 right-6"
      >
        <Quote className="w-10 h-10 text-primary" />
      </motion.div>

      <div className="relative flex gap-1 mb-5" style={{ transform: "translateZ(30px)" }}>
        {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.12 + 0.3 + i * 0.07, type: "spring", stiffness: 300 }}
          >
            <Star className="w-4 h-4 fill-accent text-accent" />
          </motion.span>
        ))}
      </div>

      <p
        className="relative text-muted-foreground leading-relaxed mb-7 italic text-[15px]"
        style={{ transform: "translateZ(20px)" }}
      >
        "{testimonial.content}"
      </p>

      <div className="relative flex items-center gap-4" style={{ transform: "translateZ(40px)" }}>
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40 flex items-center justify-center font-display font-bold text-sm text-primary">
          {testimonial.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <div className="font-display font-semibold text-foreground">{testimonial.name}</div>
          <div className="text-sm text-primary/80">{testimonial.title}</div>
        </div>
      </div>

      {/* bottom accent line */}
      <div className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full bg-gradient-to-r from-primary to-accent transition-all duration-700" />
    </motion.div>
  );
};

interface Props {
  username?: string;
}

const TestimonialsSection = ({ username = "caleb" }: Props) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(username === "caleb" ? fallbackTestimonials : []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (supabase
      .from("testimonials")
      .select("*")
      .eq("username", username)
      .order("sort_order") as unknown as Promise<{ data: any[] | null }>)
      .then(({ data }) => {
        if (cancelled) return;
        if (data && data.length > 0) {
          setTestimonials(
            data.map((row: any) => ({
              id: row.id,
              name: row.client_name,
              title: row.client_title || "",
              content: row.content,
              rating: row.rating ?? 5,
            })),
          );
        } else if (username !== "caleb") {
          setTestimonials([]);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (!loading && testimonials.length === 0) return null;

  return (
    <section className="py-28 px-6 relative bg-card/40 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 9, repeat: Infinity }}
        className="absolute -top-24 left-1/4 w-[420px] h-[420px] bg-primary/10 rounded-full blur-[130px]"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.2, 0.4] }}
        transition={{ duration: 11, repeat: Infinity }}
        className="absolute bottom-0 right-1/4 w-[380px] h-[380px] bg-accent/10 rounded-full blur-[130px]"
      />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-xs font-medium tracking-[0.3em] uppercase">Testimonials</span>
          <h2 className="text-4xl md:text-6xl font-display font-bold mt-4 tracking-tight">
            What Clients <span className="gradient-text">Say</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6" style={{ perspective: "1400px" }}>
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
