import { motion } from "framer-motion";
import { ArrowDown, Play, Sparkles, Users, Eye, Film } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";
import PortfolioSection from "@/components/PortfolioSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const FaithNavbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/faith" className="font-display font-bold text-xl gradient-text">
        FK<span className="text-primary">.</span>
      </Link>
      <div className="hidden md:flex items-center gap-8">
        {[
          { label: "About", href: "#about" },
          { label: "Work", href: "#portfolio" },
          { label: "Testimonials", href: "#testimonials" },
          { label: "Contact", href: "#contact" },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            {link.label}
          </a>
        ))}
        <Link
          to="/portfolio"
          className="px-5 py-2 bg-primary text-primary-foreground text-sm font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] transition-all"
        >
          View Portfolio
        </Link>
      </div>
    </div>
  </nav>
);

const HERO_VIDEO = "https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_30fps.mp4";
const title = ["Faith", "K"];

const FaithHero = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0">
      <motion.video
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full h-full object-cover"
        src={HERO_VIDEO}
        poster={heroBg}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-background/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 30%, hsl(var(--background) / 0.85) 90%)" }} />
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 3px)" }} />
    </div>
    <div className="absolute inset-0 bg-grid opacity-20" />
    <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px]" animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 6, repeat: Infinity }} />
    <motion.div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-[100px]" animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }} transition={{ duration: 8, repeat: Infinity }} />

    <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
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
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }}
      >
        Transforming raw footage into cinematic masterpieces with the power of artificial intelligence. Where creativity meets cutting-edge technology.
      </motion.p>

      <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.3 }}>
        <Link to="/portfolio" className="group relative flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] hover:scale-105 transition-all duration-300 overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Play className="w-5 h-5 relative" />
          <span className="relative">View My Work</span>
        </Link>
        <a href="#about" className="flex items-center gap-2 px-8 py-4 border border-border text-foreground font-display font-medium rounded-lg hover:border-primary/50 hover:bg-primary/5 backdrop-blur-md transition-all duration-300">
          Learn More
        </a>
      </motion.div>
    </div>

    <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
      <span className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Scroll</span>
      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <ArrowDown className="w-4 h-4 text-primary" />
      </motion.div>
    </motion.div>
  </section>
);

const faithStats = [
  { icon: Users, value: "200+", label: "Clients Worldwide", accent: false },
  { icon: Eye, value: "50M+", label: "Total Views", accent: true },
  { icon: Film, value: "500+", label: "Projects Delivered", accent: false },
  { icon: Sparkles, value: "10+", label: "Years Crafting", accent: true },
];

const FaithAbout = () => (
  <section id="about" className="py-32 px-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid opacity-10" />
    <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2" />
    <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2" />

    <div className="max-w-6xl mx-auto relative">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-20">
        <span className="text-primary text-xs font-medium tracking-[0.3em] uppercase">— About —</span>
        <h2 className="text-4xl md:text-6xl font-display font-bold mt-4 gradient-text">
          The Story Behind the Lens
        </h2>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="lg:col-span-3 space-y-6 text-muted-foreground leading-relaxed text-[15px] md:text-base">
          <p>
            From the bustling streets of Lagos to the cutting edge of AI-powered filmmaking, Faith K has spent the last decade redefining what's possible in video production. What started as a teenage passion for storytelling through a borrowed camera evolved into a relentless pursuit of innovation.
          </p>
          <p>
            After years of mastering traditional editing techniques, Faith recognized the transformative potential of AI early on—becoming one of the first editors to seamlessly blend machine learning with human creativity. Her philosophy is simple: <span className="text-primary font-medium">AI doesn't replace the artist; it amplifies the vision.</span>
          </p>
          <p>
            Today, Faith has worked with over 200 clients worldwide—from indie filmmakers to Fortune 500 brands—delivering content that doesn't just look stunning, but tells stories that resonate on a deeply human level.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }} className="lg:col-span-2 grid grid-cols-2 gap-4">
          {faithStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 * i }}
                whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
                style={{ transformStyle: "preserve-3d" }}
                className="group relative p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:border-primary/50 transition-colors overflow-hidden"
              >
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity ${s.accent ? "bg-accent/40" : "bg-primary/40"}`} />
                <Icon className={`w-5 h-5 mb-3 ${s.accent ? "text-accent" : "text-primary"}`} />
                <div className={`text-3xl md:text-4xl font-display font-bold ${s.accent ? "gradient-text-accent" : "gradient-text"}`}>
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

const FaithFooter = () => (
  <footer className="py-12 px-6 border-t border-border bg-card/30">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <Link to="/faith" className="font-display font-bold text-xl gradient-text">
        FK<span className="text-primary">.</span>
      </Link>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Faith K. Crafting the future of video.
      </p>
      <div className="flex items-center gap-6">
        <a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Get in Touch
        </a>
      </div>
    </div>
  </footer>
);

const Faith = () => {
  return (
    <div className="min-h-screen bg-background">
      <FaithNavbar />
      <FaithHero />
      <FaithAbout />
      <section id="portfolio">
        <PortfolioSection showCertificate={false} />
      </section>
      <section id="testimonials">
        <TestimonialsSection />
      </section>
      <section id="contact">
        <ContactSection />
      </section>
      <FaithFooter />
    </div>
  );
};

export default Faith;
