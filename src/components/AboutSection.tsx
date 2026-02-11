import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-widest uppercase">About</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3 gradient-text">
            The Story Behind the Lens
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              From the bustling streets of Lagos to the cutting edge of AI-powered filmmaking, Caleb Peters has spent the last decade redefining what's possible in video production. What started as a teenage passion for storytelling through a borrowed camera evolved into a relentless pursuit of innovation.
            </p>
            <p>
              After years of mastering traditional editing techniques, Caleb recognized the transformative potential of AI early on—becoming one of the first editors in the industry to seamlessly blend machine learning with human creativity. His philosophy is simple: <span className="text-primary font-medium">AI doesn't replace the artist; it amplifies the vision.</span>
            </p>
            <p>
              Today, Caleb has worked with over 200 clients worldwide—from indie filmmakers to Fortune 500 brands—delivering content that doesn't just look stunning, but tells stories that resonate on a deeply human level.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-card border border-border overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-display font-bold gradient-text">200+</div>
                  <div className="text-muted-foreground">Clients Worldwide</div>
                  <div className="text-5xl font-display font-bold gradient-text-accent mt-6">50M+</div>
                  <div className="text-muted-foreground">Total Views</div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-primary/10 blur-xl -z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
