import { motion } from "framer-motion";
import { ArrowRight, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PortfolioCarousel from "./PortfolioCarousel";

interface PortfolioSectionProps {
  showCertificate?: boolean;
}

const PortfolioSection = ({ showCertificate = true }: PortfolioSectionProps) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("featured", true)
        .order("sort_order");
      if (data) setProjects(data);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.07]" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
      <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px]" />

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
        >
          <div>
            <span className="text-primary text-xs font-medium tracking-[0.3em] uppercase">— Selected Work</span>
            <h2 className="text-4xl md:text-6xl font-display font-bold mt-4 tracking-tight">
              Frames That <span className="gradient-text">Move People</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm md:text-right leading-relaxed">
            A rotating reel of AI-assisted films, brand spots and story-driven edits. Each piece plays for ten seconds — hit the arrows to explore at your own pace, and unmute to hear the sound design.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No featured projects yet.</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <PortfolioCarousel items={projects} autoAdvanceMs={10000} />
          </motion.div>
        )}

        {showCertificate && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-primary text-sm font-medium tracking-widest uppercase">
                <Award className="w-4 h-4" />
                Certification
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold mt-2">
                AI Design <span className="gradient-text">Certificate</span>
              </h3>
            </div>
            <div className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-500">
              <img
                src="/images/synthesia-certificate.jpg"
                alt="AI Design Certificate - Synthesia"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] hover:scale-105 transition-all duration-300"
          >
            View All Work
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PortfolioSection;
