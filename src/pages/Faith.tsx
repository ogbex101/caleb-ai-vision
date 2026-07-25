import { motion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";
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

const FaithHero = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0">
      <video
        className="w-full h-full object-cover"
        src={HERO_VIDEO}
        poster={heroBg}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-background/70" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
    </div>
    <div className="absolute inset-0 bg-grid opacity-30" />
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
    <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

    <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-widest uppercase border border-primary/30 rounded-full text-primary bg-primary/5">
          AI Video Editor & Creator
        </span>
      </motion.div>
      <motion.h1
        className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-tight mb-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span className="text-foreground">Faith</span> <span className="gradient-text">K</span>
      </motion.h1>
      <motion.p
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Transforming raw footage into cinematic masterpieces with the power of artificial intelligence. Where creativity meets cutting-edge technology.
      </motion.p>
      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Link
          to="/portfolio"
          className="group flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] transition-all duration-300"
        >
          <Play className="w-5 h-5" />
          View My Work
        </Link>
        <a
          href="#about"
          className="flex items-center gap-2 px-8 py-4 border border-border text-foreground font-display font-medium rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
        >
          Learn More
        </a>
      </motion.div>
    </div>

    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <ArrowDown className="w-5 h-5 text-muted-foreground" />
    </motion.div>
  </section>
);

const FaithAbout = () => (
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
            From the bustling streets of Lagos to the cutting edge of AI-powered filmmaking, Faith K has spent the last decade redefining what's possible in video production. What started as a teenage passion for storytelling through a borrowed camera evolved into a relentless pursuit of innovation.
          </p>
          <p>
            After years of mastering traditional editing techniques, Faith recognized the transformative potential of AI early on—becoming one of the first editors in the industry to seamlessly blend machine learning with human creativity. Her philosophy is simple: <span className="text-primary font-medium">AI doesn't replace the artist; it amplifies the vision.</span>
          </p>
          <p>
            Today, Faith has worked with over 200 clients worldwide—from indie filmmakers to Fortune 500 brands—delivering content that doesn't just look stunning, but tells stories that resonate on a deeply human level.
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
