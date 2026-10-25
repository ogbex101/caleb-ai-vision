import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, Play, Sparkles } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const TITLE = ["Caleb", "Peters"];

interface Props {
  /** Showreel or still set in Admin > Layouts; falls back to the bundled image. */
  heroUrl?: string | null;
  isImage?: boolean;
}

/**
 * The headline is a window onto the showreel: a layer filled with the page
 * background sits over the media in `mix-blend-mode: multiply`, with the type
 * in pure white. Multiply leaves the backdrop untouched wherever the layer is
 * white, so the footage plays inside the letters, while the surrounding fill
 * (4% lightness) multiplies the video down to near-black.
 *
 * It degrades honestly: a browser without mix-blend-mode support just shows
 * white type on a dark plate, which is the design it replaced.
 */
const HeroSection = ({ heroUrl, isImage = true }: Props) => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const mediaSrc = heroUrl || heroBg;
  const showVideo = Boolean(heroUrl) && !isImage;

  // Cursor-driven tilt. Springs rather than raw values, so the plate settles
  // instead of snapping, and it is skipped entirely for reduced motion.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 20 });
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-9, 9]), { stiffness: 120, damping: 20 });

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  // The media, the type and the supporting copy travel at three different
  // rates: that mismatch is what reads as depth rather than a flat overlay.
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const typeY = useTransform(scrollYProgress, [0, 1], ["0%", "-22%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const handlePointer = (e: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointer}
      onPointerLeave={resetPointer}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ perspective: 1200 }}
    >
      {/* Media plate */}
      <motion.div style={{ y: mediaY, scale: mediaScale }} className="absolute inset-0">
        {showVideo ? (
          <video src={mediaSrc} autoPlay muted loop playsInline poster={heroBg} className="h-full w-full object-cover" />
        ) : (
          <motion.img
            initial={{ scale: reduceMotion ? 1 : 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0.4 : 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full object-cover"
            src={mediaSrc}
            alt=""
          />
        )}
        {/* Only a seat for the type — the picture stays bright inside the letters */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, hsl(var(--foreground)) 2px, hsl(var(--foreground)) 3px)" }}
        />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />

      {/* The knockout. Fills the frame with the page background and punches the
          name out of it, so the footage shows only inside the glyphs. */}
      <motion.div
        aria-hidden
        style={{ y: typeY, rotateX: reduceMotion ? 0 : tiltX, rotateY: reduceMotion ? 0 : tiltY, mixBlendMode: "multiply" }}
        className="absolute inset-0 flex items-center justify-center bg-background"
      >
        <h1 className="px-6 text-center font-script text-[26vw] leading-[0.95] text-white md:text-[17vw]">
          <span className="block overflow-visible">
            <motion.span
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0.3 : 1.4, delay: reduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {TITLE.join(" ")}
            </motion.span>
          </span>
        </h1>
      </motion.div>

      {/* The same name, invisible, carrying the real heading for assistive tech
          and search engines: the knockout above is decorative. */}
      <h1 className="sr-only">{TITLE.join(" ")}</h1>

      {/* Supporting copy sits clear of the knockout, in normal blending */}
      <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div className="pointer-events-none h-[34vh] md:h-[30vh]" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-primary backdrop-blur-md">
            <Sparkles className="h-3 w-3" />
            AI Video Editor &amp; Creator
          </span>
        </motion.div>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/80 md:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Transforming raw footage into cinematic masterpieces with the power of artificial intelligence.
          Where creativity meets cutting-edge technology.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Link
            to="/portfolio"
            className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-primary px-8 py-4 font-display font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-glow)]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            <Play className="relative h-5 w-5" />
            <span className="relative">View My Work</span>
          </Link>
          <a
            href="#find-a-video"
            className="rounded-lg border border-border px-8 py-4 font-display font-medium text-foreground backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
          >
            Find your niche
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-primary/80"
      >
        <ArrowDown className="h-5 w-5" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
