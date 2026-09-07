import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees. Lower for small tiles, higher for hero cards. */
  strength?: number;
  glare?: boolean;
}

/**
 * Mouse-tracked 3D tilt wrapper shared across Daniel's cards (testimonial
 * spotlight, stat tiles, filmstrip thumbnails) so the whole page shares one
 * consistent "handled like film stock" tactile feel.
 */
const TiltCard = ({ children, className = "", strength = 10, glare = true }: Props) => {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springConfig = { stiffness: 220, damping: 20, mass: 0.6 };
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [strength, -strength]), springConfig);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-strength, strength]), springConfig);
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className={`group relative will-change-transform ${className}`}
    >
      {glare && (
        <motion.div
          aria-hidden
          style={{ left: glareX, top: glareY }}
          className="pointer-events-none absolute z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      {children}
    </motion.div>
  );
};

export default TiltCard;
