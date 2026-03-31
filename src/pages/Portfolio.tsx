import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Portfolio = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

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

  const handlePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (playingIndex === index) {
        video.pause();
        setPlayingIndex(null);
      } else {
        if (playingIndex !== null && videoRefs.current[playingIndex]) {
          videoRefs.current[playingIndex]!.pause();
        }
        video.play();
        setPlayingIndex(index);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
              All <span className="gradient-text">Work</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mb-12">
              A comprehensive showcase of AI-powered video editing projects across various industries and styles.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">No portfolio items yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 cursor-pointer"
                  onClick={() => handlePlay(index)}
                >
                  <video
                    ref={(el) => { videoRefs.current[index] = el; }}
                    src={project.video_url}
                    className="absolute inset-0 w-full h-full object-cover"
                    playsInline
                    preload="metadata"
                    onEnded={() => setPlayingIndex(null)}
                  />
                  <div className={`absolute inset-0 bg-card/40 transition-colors duration-500 ${playingIndex === index ? 'opacity-0' : 'group-hover:bg-card/20'}`} />

                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playingIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-6 h-6 text-primary ml-1" />
                    </div>
                  </div>

                  <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/80 to-transparent transition-opacity ${playingIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                    <span className="text-xs font-medium text-primary tracking-wider uppercase">{project.category}</span>
                    <h3 className="font-display font-bold text-xl text-foreground mt-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.client_name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Portfolio;
