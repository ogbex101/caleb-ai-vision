import { FileText, Sparkles, Clapperboard, PackageCheck } from "lucide-react";
import Reveal from "@/components/daniel/Reveal";
import TiltCard from "@/components/daniel/TiltCard";

const STEPS = [
  { icon: FileText, label: "Brief", copy: "Send the concept, references, timeline and any raw footage you already have." },
  { icon: Sparkles, label: "Generate", copy: "The in-house pipeline produces first-pass shots, avatars and environments." },
  { icon: Clapperboard, label: "Direct", copy: "Human review shapes pacing, colour grade and sound design, pass by pass." },
  { icon: PackageCheck, label: "Deliver", copy: "Final export plus full commercial rights, ready to run." },
];

/**
 * "How a project moves" — a connected node timeline bridging the showreel
 * and the reel finder, so the page explains process before it asks for a
 * brief. New section, not present on Caleb/Faith.
 */
const DanielProcess = () => (
  <section className="relative overflow-hidden px-6 py-28">
    <div className="absolute inset-0 bg-grid opacity-[0.05]" />
    <div className="relative mx-auto max-w-6xl">
      <Reveal className="mb-16 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-primary">Process</span>
        <h2 className="mt-4 font-display text-4xl font-bold md:text-6xl">
          How a project <span className="gradient-text-gold">moves.</span>
        </h2>
      </Reveal>

      <div className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="gold-divider absolute left-0 right-0 top-8 hidden h-px lg:block" />
        {STEPS.map((step, i) => (
          <Reveal key={step.label} delay={i * 0.1}>
            <TiltCard strength={8} className="relative">
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-card text-gold shadow-[var(--shadow-glow)]">
                <step.icon className="h-6 w-6" />
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-mono text-xs text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-xl font-bold">{step.label}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default DanielProcess;
