import { motion, useInView, useReducedMotion } from "framer-motion";
import { MoveHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

interface Pair {
  label: string;
  note: string;
  before: string;
  after: string;
}

/**
 * Raw footage against the finished grade. Replace these with your own stills
 * (or set them from the dashboard later) — the bundled hero still stands in for
 * both sides so the section renders before you have assets.
 */
const PAIRS: Pair[] = [
  {
    label: "Colour grade",
    note: "Flat log footage against the final cinematic grade.",
    before: heroBg,
    after: heroBg,
  },
];

/**
 * Signature motion: the divider itself. The section reveals by sweeping the
 * handle across once, which both demonstrates the control and shows the two
 * states, then hands it to the visitor to drag.
 */
const BeforeAfterSection = () => {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(frameRef, { once: true, margin: "-60px" });
  // Starts fully covered by "before" and sweeps back once on reveal, which
  // both shows the two states and advertises that the handle is draggable.
  const [position, setPosition] = useState(reduceMotion ? 50 : 100);
  const [dragging, setDragging] = useState(false);
  const [swept, setSwept] = useState(false);
  const pair = PAIRS[0];

  useEffect(() => {
    if (!inView || swept) return;
    setSwept(true);
    if (reduceMotion) { setPosition(50); return; }
    const t = window.setTimeout(() => setPosition(50), 300);
    return () => window.clearTimeout(t);
  }, [inView, swept, reduceMotion]);

  const setFromClientX = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  }, []);

  // Listeners live on the window while dragging, so the handle keeps following
  // the pointer after it leaves the frame instead of sticking mid-sweep.
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => setFromClientX(e.clientX);
    const stop = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging, setFromClientX]);

  return (
    <section id="before-after" className="relative px-6 py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Proof, not claims</span>
          <h2 className="mt-5 font-display text-4xl font-bold md:text-5xl">Before and after</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Drag the handle. Left is what came off the camera, right is what gets delivered.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl border border-border bg-card"
        >
          <div
            ref={frameRef}
            onPointerDown={(e) => { setDragging(true); setFromClientX(e.clientX); }}
            className="relative aspect-video cursor-ew-resize select-none touch-none"
          >
            {/* After sits underneath, revealed as the clip shrinks */}
            <img src={pair.after} alt={`${pair.label}, after`} className="absolute inset-0 h-full w-full object-cover" />

            {/* Before is clipped rather than resized: clip-path hides part of a
                full-size image, so the footage never squashes as it moves. The
                transition is dropped while dragging so the handle tracks the
                pointer exactly. */}
            <div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - position}% 0 0)`,
                transition: dragging || reduceMotion ? undefined : "clip-path 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <img
                src={pair.before}
                alt={`${pair.label}, before`}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: "saturate(0.35) contrast(0.85) brightness(0.95)" }}
              />
              <span className="absolute bottom-4 left-4 rounded-full bg-background/80 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-md">
                Before
              </span>
            </div>

            <span className="absolute bottom-4 right-4 rounded-full bg-primary/90 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-primary-foreground backdrop-blur-md">
              After
            </span>

            {/* Handle */}
            <div
              className="pointer-events-none absolute inset-y-0"
              style={{
                left: `${position}%`,
                transition: dragging || reduceMotion ? undefined : "left 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className="absolute inset-y-0 -left-px w-0.5 bg-primary shadow-[0_0_20px_hsl(var(--primary))]" />
              <div className="absolute left-0 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary/60 bg-background/90 text-primary backdrop-blur-md">
                <MoveHorizontal className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-5">
            <div>
              <p className="font-display text-sm font-semibold">{pair.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{pair.note}</p>
            </div>
            {/* Keyboard and screen-reader route to the same control */}
            <label className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="sr-only">Reveal amount</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(position)}
                onChange={(e) => setPosition(Number(e.target.value))}
                aria-label="Reveal the before or after image"
                className="w-32 accent-primary"
              />
              {Math.round(position)}%
            </label>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BeforeAfterSection;
