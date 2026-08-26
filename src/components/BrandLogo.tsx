import { motion } from "framer-motion";
import { Link } from "react-router-dom";

type Variant = "caleb" | "faith" | "daniel";

interface Props {
  variant: Variant;
  to?: string;
  showWordmark?: boolean;
  className?: string;
}

const config = {
  caleb: {
    initials: "CP",
    name: "Caleb Peters",
    role: "AI Video Craft",
    gradientId: "brand-grad-cp",
  },
  faith: {
    initials: "FK",
    name: "Faith K",
    role: "AI Video Craft",
    gradientId: "brand-grad-fk",
  },
  daniel: {
    initials: "DS",
    name: "Daniel Studio",
    role: "Generative Motion",
    gradientId: "brand-grad-ds",
  },
} as const;

const BrandLogo = ({ variant, to = "/", showWordmark = true, className = "" }: Props) => {
  const c = config[variant];

  return (
    <Link to={to} aria-label={c.name} className={`group inline-flex items-center gap-3 ${className}`}>
      <motion.div
        whileHover={{ rotateY: 18, rotateX: -8, scale: 1.06 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        style={{ transformStyle: "preserve-3d", perspective: 600 }}
        className="relative"
      >
        {/* ambient glow */}
        <div className="absolute -inset-2 rounded-xl bg-primary/25 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <svg
          viewBox="0 0 48 48"
          className="relative w-10 h-10"
          role="img"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={c.gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
            <linearGradient id={`${c.gradientId}-stroke`} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* outer aperture frame */}
          <motion.path
            d="M24 2.5 L42.6 13.25 V34.75 L24 45.5 L5.4 34.75 V13.25 Z"
            fill="hsl(var(--card))"
            stroke={`url(#${c.gradientId}-stroke)`}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* inner shutter blades */}
          <g opacity="0.35" stroke={`url(#${c.gradientId})`} strokeWidth="1">
            <path d="M24 7 L38.5 15.4 M38.5 15.4 L38.5 32.6 M38.5 32.6 L24 41 M24 41 L9.5 32.6 M9.5 32.6 L9.5 15.4 M9.5 15.4 L24 7" fill="none" />
          </g>
          {/* monogram */}
          <text
            x="24"
            y="30.5"
            textAnchor="middle"
            fontSize="16"
            fontWeight="700"
            letterSpacing="-0.5"
            fill={`url(#${c.gradientId})`}
            style={{ fontFamily: "var(--font-display, inherit)" }}
          >
            {c.initials}
          </text>
          {/* accent dot */}
          <circle cx="38" cy="10" r="2.4" fill="hsl(var(--primary))">
            <animate attributeName="opacity" values="1;0.35;1" dur="2.6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </motion.div>

      {showWordmark && (
        <span className="hidden sm:flex flex-col leading-none">
          <span className="font-display font-bold text-base tracking-tight gradient-text">{c.name}</span>
          <span className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground mt-1">{c.role}</span>
        </span>
      )}
    </Link>
  );
};

export default BrandLogo;
