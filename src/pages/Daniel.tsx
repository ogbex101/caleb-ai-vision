import { motion } from "framer-motion";
import { Clapperboard } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import ClientStrip from "@/components/daniel/ClientStrip";
import CinematicHero from "@/components/daniel/CinematicHero";
import DanielCategoryFinder from "@/components/daniel/DanielCategoryFinder";
import DanielContact from "@/components/daniel/DanielContact";
import DanielFAQ from "@/components/daniel/DanielFAQ";
import DanielTestimonials from "@/components/daniel/DanielTestimonials";
import ReelDivider from "@/components/daniel/ReelDivider";
import ShowreelStage from "@/components/daniel/ShowreelStage";
import StudioMarquee from "@/components/daniel/StudioMarquee";
import StudioStats from "@/components/daniel/StudioStats";
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
        <CinematicHero heroUrl={heroUrl} isImage={isImage} items={items} tagline={layout?.tagline} />

        <StudioMarquee />

        <ClientStrip items={items} />

        <StudioStats />

        <ReelDivider />

        <section id="reel" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 grid gap-6 border-b border-border pb-10 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <span className="text-xs uppercase tracking-[0.28em] text-primary">Featured productions</span>
                <h2 className="mt-4 font-display text-4xl font-bold md:text-6xl">The current cut.</h2>
              </div>
              <Link to="/daniel/category-ai-video" className="inline-flex items-center gap-2 text-sm font-medium text-primary">Explore AI work <Clapperboard className="h-4 w-4" /></Link>
            </motion.div>
            {loading ? <p className="py-16 text-center text-muted-foreground">Loading showreel…</p> : <ShowreelStage items={items} />}
          </div>
        </section>

        <ReelDivider />

        <DanielCategoryFinder />
        <DanielTestimonials />
        <DanielFAQ />
        <section id="contact"><DanielContact /></section>
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