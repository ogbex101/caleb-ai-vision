import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ASPECT_RATIOS, CATEGORIES, categoryPath, categoryUrl } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Reveal from "@/components/daniel/Reveal";

/**
 * Chip-based category picker instead of the dropdown card used on the
 * shared CategoryLinkBuilder, so it reads as a cinematic "reel finder"
 * unique to this profile.
 */
const DanielCategoryFinder = () => {
  const [cat, setCat] = useState("");
  const [sub, setSub] = useState("");
  const [ratio, setRatio] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const subs = useMemo(() => CATEGORIES.find((c) => c.slug === cat)?.subcategories ?? [], [cat]);
  const link = cat ? categoryUrl("daniel", cat, sub || null, ratio || null) : "";

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      toast({ title: "Couldn't copy automatically. Select the link and copy it.", variant: "destructive" });
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied", description: "Paste it straight into your proposal." });
    supabase.from("link_copies").insert({ username: "daniel", category_slug: cat, subcategory_slug: sub || null, url: link }).then(() => {});
  };

  return (
    <section id="search-category" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-10 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-primary">
          <Film className="h-3.5 w-3.5" /> Reel finder
        </Reveal>

        <div className="space-y-8">
          <Reveal delay={0.05}>
            <p className="mb-3 text-sm text-muted-foreground">Discipline</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => { setCat(c.slug); setSub(""); }}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
                    cat === c.slug ? "border-gold bg-gold text-gold-foreground" : "border-border text-foreground/80 hover:border-gold/50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </Reveal>

          {cat && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="mb-3 text-sm text-muted-foreground">Niche</p>
              <div className="flex flex-wrap gap-2">
                {subs.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => setSub(s.slug)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
                      sub === s.slug ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground/80 hover:border-primary/50"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {cat && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <p className="mb-3 text-sm text-muted-foreground">Orientation</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRatio("")}
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
                    !ratio ? "border-gold bg-gold text-gold-foreground" : "border-border text-foreground/80 hover:border-gold/50"
                  }`}
                >
                  Any
                </button>
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.slug}
                    onClick={() => setRatio(r.slug)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-all ${
                      ratio === r.slug ? "border-gold bg-gold text-gold-foreground" : "border-border text-foreground/80 hover:border-gold/50"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {link && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 rounded-2xl border border-gold/40 bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Shareable link</p>
                <p className="truncate font-mono text-sm text-foreground">{link}</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button onClick={copy} className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-display font-semibold text-gold-foreground transition-transform hover:scale-105">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => navigate(`${categoryPath("daniel", cat, sub || null)}${ratio ? `?ratio=${encodeURIComponent(ratio)}` : ""}`)}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-primary/60"
                >
                  Preview
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DanielCategoryFinder;
