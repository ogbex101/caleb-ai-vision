import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Link2, Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ASPECT_RATIOS, CATEGORIES, categoryPath, categoryUrl, getCategory } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  username: string;
  compact?: boolean;
}

const CategoryLinkBuilder = ({ username, compact = false }: Props) => {
  const [cat, setCat] = useState("");
  const [sub, setSub] = useState("");
  const [ratio, setRatio] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const subs = useMemo(() => getCategory(cat)?.subcategories ?? [], [cat]);
  const link = cat ? categoryUrl(username, cat, sub || null, ratio || null) : "";

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
    supabase
      .from("link_copies")
      .insert({ username, category_slug: cat, subcategory_slug: sub || null, url: link })
      .then(() => {});
  };

  return (
    <section id="search-category" className={compact ? "" : "py-24 px-6 relative overflow-hidden"}>
      {!compact && <div className="absolute inset-0 bg-grid opacity-[0.05]" />}
      <div className={compact ? "" : "max-w-4xl mx-auto relative"}>
        {!compact && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-primary text-xs font-medium tracking-[0.3em] uppercase">Search Category</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 tracking-tight">
              Jump Straight To <span className="gradient-text">The Right Reel</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Pick a category, then a sub-category. You get a clean, shareable deep link to exactly that body of work.
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-border bg-card/70 backdrop-blur-xl p-6 md:p-8 space-y-5 shadow-[var(--shadow-glow)]"
        >
          <div className="flex items-center gap-2 text-sm font-display font-semibold text-foreground">
            <Search className="w-4 h-4 text-primary" /> Category link builder
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block tracking-wide uppercase">Step 1: Category</label>
              <select
                value={cat}
                onChange={(e) => { setCat(e.target.value); setSub(""); }}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors"
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block tracking-wide uppercase">Step 2: Niche</label>
              <select
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                disabled={!cat}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-50"
              >
                <option value="">{cat ? "All niches" : "Choose a category first"}</option>
                {subs.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block tracking-wide uppercase">Step 3: Orientation</label>
              <select
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                disabled={!cat}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-50"
              >
                <option value="">Any orientation</option>
                {ASPECT_RATIOS.map((r) => (
                  <option key={r.slug} value={r.slug}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {link && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <label className="text-xs text-muted-foreground block tracking-wide uppercase">Your shareable link</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-background border border-primary/30 rounded-lg">
                  <Link2 className="w-4 h-4 text-primary shrink-0" />
                  <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="w-full bg-transparent text-sm text-foreground focus:outline-none" />
                </div>
                <button
                  onClick={copy}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-sm font-display font-semibold rounded-lg hover:shadow-[var(--shadow-glow)] hover:scale-[1.03] transition-all"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy Link"}
                </button>
              </div>
              <button
                onClick={() => navigate(`${categoryPath(username, cat, sub || null)}${ratio ? `?ratio=${encodeURIComponent(ratio)}` : ""}`)}
                className="inline-flex items-center gap-2 text-sm text-primary hover:gap-3 transition-all"
              >
                Preview this page <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryLinkBuilder;
