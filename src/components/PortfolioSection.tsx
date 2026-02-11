import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";

const projects = [
  {
    title: "Neon Dreams Campaign",
    client: "TechVault Inc.",
    category: "Commercial",
    color: "from-primary/20 to-blue-500/20",
  },
  {
    title: "Echoes of Tomorrow",
    client: "Indie Film Collective",
    category: "Short Film",
    color: "from-purple-500/20 to-primary/20",
  },
  {
    title: "Product Launch: HyperX",
    client: "HyperX Gaming",
    category: "Product Video",
    color: "from-accent/20 to-red-500/20",
  },
  {
    title: "Soul of the City",
    client: "Urban Culture Magazine",
    category: "Documentary",
    color: "from-green-500/20 to-primary/20",
  },
];

const PortfolioSection = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-widest uppercase">Portfolio</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3">
            Featured <span className="gradient-text">Work</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            A curated selection of projects that showcase the power of AI-enhanced video editing.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-video rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-500 cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${project.color}`} />
              <div className="absolute inset-0 bg-card/60 group-hover:bg-card/40 transition-colors duration-500" />
              
              {/* Play icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-6 h-6 text-primary ml-1" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-xs font-medium text-primary tracking-wider uppercase">{project.category}</span>
                <h3 className="font-display font-bold text-xl text-foreground mt-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.client}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] transition-all duration-300"
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
