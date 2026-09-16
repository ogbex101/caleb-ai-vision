import { motion } from "framer-motion";
import { ArrowDown, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const title = ["Caleb", "Peters"];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Cinematic background image (swap for your own hosted video later via Supabase Storage) */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full object-cover"
          src={heroBg}
          alt=""
        />
        {/* Layered cinematic overlays */}
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.85) 90%)" }} />
        {/* Film scan lines */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 3px)" }} />
      </div>

      <div className="absolute inset-0 bg-grid opacity-20" />
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-[100px]"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-medium tracking-[0.25em] uppercase border border-primary/40 rounded-full text-primary bg-primary/5 backdrop-blur-md">
            <Sparkles className="w-3 h-3" />
            AI Video Editor & Creator
          </span>
        </motion.div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold leading-[0.95] mb-8 tracking-tight">
          {title.map((word, wi) => (
            <span key={word} className="inline-block overflow-hidden mr-4 last:mr-0">
              <motion.span
                className={`inline-block ${wi === 1 ? "gradient-text text-glow" : "text-foreground"}`}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 + wi * 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          Transforming raw footage into cinematic masterpieces with the power of artificial intelligence. Where creativity meets cutting-edge technology.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <Link
            to="/portfolio"
            className="group relative flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Play className="w-5 h-5 relative" />
            <span className="relative">View My Work</span>
          </Link>
          <a
            href="#about"
            className="flex items-center gap-2 px-8 py-4 border border-border text-foreground font-display font-medium rounded-lg hover:border-primary/50 hover:bg-primary/5 backdrop-blur-md transition-all duration-300"
          >
            Learn More
          </a>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowDown className="w-4 h-4 text-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
