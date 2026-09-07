import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Horizontal offset instead of the default vertical + 3D tilt entrance. */
  direction?: "up" | "left" | "right";
}

const variants = {
  up: { y: 46, x: 0, rotateX: -14 },
  left: { y: 0, x: -46, rotateY: 14 },
  right: { y: 0, x: 46, rotateY: -14 },
};

/**
 * Scroll-triggered 3D entrance used across every Daniel-only section, so
 * scrolling the page feels like cards swinging into frame rather than a
 * flat fade-up.
 */
const Reveal = ({ children, className = "", delay = 0, direction = "up" }: Props) => {
  const offset = variants[direction];
  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, y: 0, x: 0, rotateX: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
