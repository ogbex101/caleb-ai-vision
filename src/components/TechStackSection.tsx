import { motion } from "framer-motion";
import { 
  Film, Palette, Wand2, Image, Sparkles, Video, Monitor, Layers 
} from "lucide-react";

const tools = [
  { name: "Runway ML", description: "AI-powered video generation", icon: Wand2 },
  { name: "Adobe Premiere Pro", description: "Industry-standard editing", icon: Film },
  { name: "DaVinci Resolve", description: "Professional color grading", icon: Palette },
  { name: "Midjourney", description: "AI image generation", icon: Image },
  { name: "After Effects", description: "Motion graphics & VFX", icon: Sparkles },
  { name: "Synthesia", description: "AI avatar creation", icon: Monitor },
  { name: "HeyGen", description: "AI video generation", icon: Video },
  { name: "Topaz Video AI", description: "AI video enhancement", icon: Layers },
];

const TechStackSection = () => {
  return (
    <section className="py-24 px-6 relative bg-card/50">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-medium tracking-widest uppercase">Tech Stack</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3">
            Tools of the <span className="gradient-text">Trade</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Harnessing the most powerful AI and professional editing tools to deliver exceptional results.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-[var(--shadow-glow)] transition-all duration-300 text-center"
            >
              <tool.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-semibold text-foreground text-sm">{tool.name}</h3>
              <p className="text-muted-foreground text-xs mt-1">{tool.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStackSection;
