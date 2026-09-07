import { motion } from "framer-motion";
import { Users, Eye, Film, Sparkles } from "lucide-react";

const stats = [
  { icon: Users, value: "200+", label: "Clients Worldwide", accent: "primary" },
  { icon: Eye, value: "50M+", label: "Total Views", accent: "accent" },
  { icon: Film, value: "500+", label: "Projects Delivered", accent: "primary" },
  { icon: Sparkles, value: "10+", label: "Years Crafting", accent: "accent" },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary text-xs font-medium tracking-[0.3em] uppercase">About</span>
          <h2 className="text-4xl md:text-6xl font-display font-bold mt-4 gradient-text">
            The Story Behind the Lens
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3 space-y-6 text-muted-foreground leading-relaxed text-[15px] md:text-base"
          >
            <p>
              From the bustling streets of Lagos to the cutting edge of AI-powered filmmaking, Caleb Peters has spent the last decade redefining what's possible in video production. What started as a teenage passion for storytelling through a borrowed camera evolved into a relentless pursuit of innovation.
            </p>
            <p>
              After years of mastering traditional editing techniques, Caleb recognized the transformative potential of AI early on, becoming one of the first editors to seamlessly blend machine learning with human creativity. His philosophy is simple: <span className="text-primary font-medium">AI doesn't replace the artist; it amplifies the vision.</span>
            </p>
            <p>
              Today, Caleb has worked with over 200 clients worldwide, from indie filmmakers to Fortune 500 brands, delivering content that doesn't just look stunning, but tells stories that resonate on a deeply human level.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-2 grid grid-cols-2 gap-4"
          >
            {stats.map((s, i) => {
              const Icon = s.icon;
              const isAccent = s.accent === "accent";
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="group relative p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:border-primary/50 transition-colors overflow-hidden"
                >
                  <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity ${isAccent ? "bg-accent/40" : "bg-primary/40"}`} />
                  <Icon className={`w-5 h-5 mb-3 ${isAccent ? "text-accent" : "text-primary"}`} />
                  <div className={`text-3xl md:text-4xl font-display font-bold ${isAccent ? "gradient-text-accent" : "gradient-text"}`}>
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 tracking-wide">{s.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
