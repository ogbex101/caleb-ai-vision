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
    <section className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-primary text-sm font-medium tracking-widest uppercase">Portfolio</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3">
            Featured <span className="gradient-text">Work</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            A rotating showcase of AI-powered video projects. Autoplay advances every 10 seconds.
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center text-muted-foreground py-12">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No featured projects yet.</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
