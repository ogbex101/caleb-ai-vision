import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    title: "CEO, TechVault Inc.",
    content: "Caleb didn't just edit our video—he reimagined our entire brand story. The AI-enhanced visuals were unlike anything we'd ever seen. Our launch video hit 2M views in the first week.",
    rating: 5,
  },
  {
    name: "Marcus Chen",
    title: "Director, Indie Film Collective",
    content: "Working with Caleb is like working with someone from the future. He sees possibilities in AI that most editors haven't even dreamed of yet. Absolute game-changer for our film.",
    rating: 5,
  },
  {
    name: "Amara Obi",
    title: "Marketing Director, HyperX Gaming",
    content: "The turnaround time was insane, and the quality was cinema-grade. Caleb's use of AI tools cut our production timeline in half without sacrificing an ounce of creativity.",
    rating: 5,
  },
  {
    name: "James Rodriguez",
    title: "Creative Director, Urban Culture Magazine",
    content: "Caleb has this rare ability to make technology feel human. Every frame of our documentary felt intentional and emotionally resonant. He's our go-to editor now.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
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
          <span className="text-primary text-sm font-medium tracking-widest uppercase">Testimonials</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-3">
            What Clients <span className="gradient-text">Say</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 relative"
            >
              <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
              
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              <div>
                <div className="font-display font-semibold text-foreground">{testimonial.name}</div>
                <div className="text-sm text-primary">{testimonial.title}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
