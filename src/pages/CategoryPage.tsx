import { motion } from "framer-motion";
import { ArrowLeft, Film } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import CategoryLinkBuilder from "@/components/CategoryLinkBuilder";
import PortfolioGrid from "@/components/PortfolioGrid";
import { usePageView } from "@/hooks/usePageView";
import { usePortfolioItems } from "@/hooks/usePortfolioItems";
import { getCategory, getSubCategory, parseCategoryParam, USERNAMES, type Username } from "@/lib/categories";

const displayNames: Record<Username, string> = {
  caleb: "Caleb Peters",
  faith: "Faith K",
  daniel: "Daniel Studio",
};

const CategoryPage = () => {
  const { username: rawUsername, categoryParam, subcategory } = useParams();
  const username = USERNAMES.find((value) => value === rawUsername);
  const categorySlug = parseCategoryParam(categoryParam);
  const category = getCategory(categorySlug);
  const sub = getSubCategory(categorySlug, subcategory);
  const invalidSubcategory = Boolean(subcategory && !sub);

  usePageView({ username, categorySlug, subcategorySlug: sub?.slug });
  const { items, loading } = usePortfolioItems({
    categorySlug,
    subcategorySlug: sub?.slug,
  });

  if (!username || !category || invalidSubcategory) return <Navigate to="/404" replace />;

  const home = username === "caleb" ? "/" : `/${username}`;
  const logoVariant = username === "faith" ? "faith" : username === "daniel" ? "daniel" : "caleb";
  const title = sub ? `${category.label} / ${sub.label}` : category.label;
  const blurb = sub?.blurb ?? category.blurb;

  return (
    <div className={`min-h-screen bg-background ${username === "daniel" ? "daniel-studio" : ""}`}>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <BrandLogo variant={logoVariant} to={home} />
          <Link to={home} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to {displayNames[username]}
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border/60 px-6 pb-16 pt-20">
          <div className="absolute inset-0 bg-grid opacity-10" />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-6xl">
            <div className="mb-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.28em] text-primary">
              <Film className="h-4 w-4" /> Curated reel
            </div>
            <h1 className="max-w-4xl font-display text-4xl font-bold leading-tight md:text-7xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{blurb}</p>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {loading ? "Loading films" : `${items.length} ${items.length === 1 ? "film" : "films"}`}
            </p>
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          {loading ? <p className="py-16 text-center text-muted-foreground">Loading portfolio…</p> : <PortfolioGrid items={items} />}
        </section>

        <section className="border-t border-border/60 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <CategoryLinkBuilder username={username} compact />
          </div>
        </section>
      </main>
    </div>
  );
};

export default CategoryPage;