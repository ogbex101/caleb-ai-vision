import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioCarousel from "@/components/PortfolioCarousel";

const Portfolio = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("sort_order");
      if (data) setProjects(data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              All <span className="gradient-text">Work</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mb-12">
              A comprehensive showcase of AI-powered video editing projects. Use the arrows, dots, or arrow keys to browse.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No portfolio items yet.</div>
          ) : (
            <PortfolioCarousel items={projects} autoAdvanceMs={10000} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Portfolio;
