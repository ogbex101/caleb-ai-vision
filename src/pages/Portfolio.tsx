import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const allProjects = [
  { title: "Neon Dreams Campaign", client: "TechVault Inc.", category: "Commercial", description: "A futuristic brand campaign blending AI-generated visuals with live-action footage for a tech startup launch.", color: "from-primary/20 to-blue-500/20" },
  { title: "Echoes of Tomorrow", client: "Indie Film Collective", category: "Short Film", description: "Short film exploring AI consciousness, featuring entirely AI-generated environments composited with real actors.", color: "from-purple-500/20 to-primary/20" },
  { title: "Product Launch: HyperX", client: "HyperX Gaming", category: "Product Video", description: "Dynamic product reveal video using AI motion tracking and particle effects.", color: "from-accent/20 to-red-500/20" },
  { title: "Soul of the City", client: "Urban Culture Magazine", category: "Documentary", description: "Documentary-style brand film with AI-enhanced color grading.", color: "from-green-500/20 to-primary/20" },
  { title: "Digital Fashion Show", client: "Maison Élégance", category: "Fashion", description: "Virtual runway experience with AI-generated models and environments.", color: "from-pink-500/20 to-purple-500/20" },
  { title: "Cosmic Beats", client: "DJ Spectrum", category: "Music Video", description: "Music video featuring AI-generated abstract visuals synchronized to audio waveforms.", color: "from-blue-500/20 to-accent/20" },
];

const Portfolio = () => {
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${project.color}`} />
                <div className="absolute inset-0 bg-card/60 group-hover:bg-card/30 transition-colors duration-500" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-sm">
                    <Play className="w-5 h-5 text-primary ml-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-xs font-medium text-primary tracking-wider uppercase">{project.category}</span>
                  <h3 className="font-display font-bold text-lg text-foreground mt-1">{project.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{project.client}</p>
                  <p className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">{project.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Portfolio;
