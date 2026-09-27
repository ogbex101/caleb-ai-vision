import { motion } from "framer-motion";
import { Construction } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

interface Props {
  displayName: string;
  message?: string | null;
  variant?: "caleb" | "faith" | "daniel";
  to?: string;
}

/**
 * Shown in place of a layout's public pages while its maintenance_mode flag is
 * on. Deliberately a full replacement rather than a banner: the point is that
 * unfinished work is not on show.
 */
const MaintenanceScreen = ({ displayName, message, variant = "caleb", to = "/" }: Props) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
    <div className="absolute inset-0 bg-grid opacity-10" />
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative max-w-lg"
    >
      <div className="mb-8 flex justify-center">
        <BrandLogo variant={variant} to={to} />
      </div>
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-primary">
        <Construction className="h-3.5 w-3.5" />
        Coming soon
      </span>
      <h1 className="mt-6 font-display text-4xl font-bold md:text-5xl">{displayName}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        {message?.trim() || "This portfolio is being put together right now. Check back shortly."}
      </p>
    </motion.div>
  </div>
);

export default MaintenanceScreen;
