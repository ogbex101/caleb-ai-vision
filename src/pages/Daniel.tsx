import { motion } from "framer-motion";
import { ArrowDown, Clapperboard, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import CategoryLinkBuilder from "@/components/CategoryLinkBuilder";
import ContactSection from "@/components/ContactSection";
import FAQSection from "@/components/FAQSection";
import PortfolioGrid from "@/components/PortfolioGrid";
import TestimonialsSection from "@/components/TestimonialsSection";
import { usePageView } from "@/hooks/usePageView";
import { usePortfolioItems, useSiteLayout } from "@/hooks/usePortfolioItems";

const fallbackHero = "https://videos.pexels.com/video-files/3129957/3129957-hd_1920_1080_30fps.mp4";

const Daniel = () => {
  usePageView({ username: "daniel" });
  const layout = useSiteLayout("daniel");
  const { items, loading } = usePortfolioItems({ featuredOnly: true });
  const heroUrl = layout?.hero_media_url || fallbackHero;
  const isImage = layout?.hero_media_type === "image";

  return (
    <div className="daniel-studio min-h-screen bg-background">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <BrandLogo variant="daniel" to="/daniel" />
          <div className="hidden items-center gap-7 md:flex">
            <a href="#reel" className="text-sm text-muted-foreground transition-colors hover:text-primary">Showreel</a>
            <a href="#search-category" className="text-sm text-muted-foreground transition-colors hover:text-primary">Find a reel</a>
            <a href="#contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contact</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative flex min-h-[92vh] items-end overflow-hidden px-6 pb-20 pt-28">
          <div className="absolute inset-0">
            {isImage ? (
              <motion.img initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2 }} src={heroUrl} alt="Daniel Studio showreel" className="h-full w-full object-cover" />
            ) : (
              <motion.video initial={{ scale: 1.08, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2 }} src={heroUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-background/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/30" />
          </div>

          <div className="relative mx-auto w-full max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-7 inline-flex items-center gap-2 border border-primary/40 bg-background/35 px-3 py-2 text-xs uppercase tracking-[0.24em] text-primary backdrop-blur-md">
              <Sparkles className="h-4 w-4" /> AI video studio
            </motion.div>
            <h1 className="max-w-5xl font-display text-6xl font-bold leading-[0.94] md:text-8xl lg:text-9xl">
              Daniel <span className="gradient-text">Studio</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-foreground/80 md:text-xl">
              Motion-first films built where cinematic craft, sharp editing and generative AI meet.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#reel" className="inline-flex items-center gap-2 bg-primary px-6 py-3 font-display font-semibold text-primary-foreground transition-transform hover:scale-105">
                <Play className="h-4 w-4" /> Enter the showreel
              </a>
              <a href="#search-category" className="inline-flex items-center gap-2 border border-border bg-background/40 px-6 py-3 font-display font-semibold backdrop-blur-md transition-colors hover:border-primary/60">
                Build a client link
              </a>
            </div>
          </div>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-7 right-7 text-primary">
            <ArrowDown className="h-5 w-5" />
          </motion.div>
        </section>

        <section id="reel" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 grid gap-6 border-b border-border pb-10 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <span className="text-xs uppercase tracking-[0.28em] text-primary">Featured productions</span>
                <h2 className="mt-4 font-display text-4xl font-bold md:text-6xl">The current cut.</h2>
              </div>
              <Link to="/daniel/category-ai-video" className="inline-flex items-center gap-2 text-sm font-medium text-primary">Explore AI work <Clapperboard className="h-4 w-4" /></Link>
            </motion.div>
            {loading ? <p className="py-16 text-center text-muted-foreground">Loading showreel…</p> : <PortfolioGrid items={items} />}
          </div>
        </section>

        <CategoryLinkBuilder username="daniel" />
        <TestimonialsSection />
        <FAQSection name="Daniel" />
        <section id="contact"><ContactSection /></section>
      </main>

      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <BrandLogo variant="daniel" to="/daniel" />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Daniel Studio. Motion with intent.</p>
        </div>
      </footer>
    </div>
  );
};

export default Daniel;