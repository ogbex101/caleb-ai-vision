import { motion } from "framer-motion";

/**
 * A thin gradient seam with a light-leak sweep, used between sections
 * instead of a plain border so scrolling through the page feels like
 * moving between cuts in a reel.
 */
const ReelDivider = () => (
  <div className="relative h-px overflow-hidden bg-border">
    <motion.div
      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      animate={{ left: ["-33%", "100%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
    />
  </div>
);

export default ReelDivider;
