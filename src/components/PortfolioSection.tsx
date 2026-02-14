import { motion } from "framer-motion";
import { ArrowRight, Play, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";

const projects = [
  {
    title: "Synthesia & HeyGen Demo",
    client: "AI Avatar Project",
    category: "AI Video",
    video: "/videos/synthesia-heygen-demo.mp4",
  },
  {
    title: "Synthesia & HeyGen",
    client: "AI Presenter Showcase",
    category: "AI Video",
    video: "/videos/synthesia-heygen.mp4",
  },
  {
    title: "The Breakthrough Moment",
    client: "Motivational Content",
    category: "Short Film",
    video: "/videos/the-breakthrough-moment.mp4",
  },
  {
    title: "Understanding Procrastination",
    client: "Educational Content",
    category: "Explainer",
    video: "/videos/understanding-procrastination.mp4",
  },
];

const PortfolioSection = () => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handlePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (playingIndex === index) {
        video.pause();
        setPlayingIndex(null);
      } else {
        // Pause any currently playing
        if (playingIndex !== null && videoRefs.current[playingIndex]) {
          videoRefs.current[playingIndex]!.pause();
        }
        video.play();
        setPlayingIndex(index);
      }
    }
  };

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
            Real projects showcasing AI-powered video editing and content creation.
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
              onClick={() => handlePlay(index)}
            >
              <video
                ref={(el) => { videoRefs.current[index] = el; }}
                src={project.video}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                preload="metadata"
                onEnded={() => setPlayingIndex(null)}
              />
              <div className={`absolute inset-0 bg-card/40 transition-colors duration-500 ${playingIndex === index ? 'opacity-0' : 'group-hover:bg-card/20'}`} />

              {/* Play/Pause icon */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playingIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-6 h-6 text-primary ml-1" />
                </div>
              </div>

              <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/80 to-transparent transition-opacity ${playingIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                <span className="text-xs font-medium text-primary tracking-wider uppercase">{project.category}</span>
                <h3 className="font-display font-bold text-xl text-foreground mt-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.client}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Certificate Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
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
