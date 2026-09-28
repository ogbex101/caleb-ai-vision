import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { usePortfolioItems } from "@/hooks/usePortfolioItems";
import { type SearchHit, type SearchHitKind, buildSearchIndex, searchHits } from "@/lib/videoSearch";

interface Props {
  username: string;
  /** Headline and blurb are dropped when this sits inside another section. */
  bare?: boolean;
}

const KIND_LABEL: Record<SearchHitKind, string> = {
  category: "Category",
  subcategory: "Niche",
  video: "Video",
};

/**
 * Plain-language way in for a visitor who knows the kind of video they want but
 * not how this portfolio is organised: they type what they're after ("talking
 * head ads", "wedding") and get the matching niches, with a one-line
 * description of each, plus any videos whose title matches.
 */
const CategorySearch = ({ username, bare = false }: Props) => {
  const categories = useCategories();
  const { items } = usePortfolioItems();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const index = useMemo(
    () => buildSearchIndex(categories, items, username),
    [categories, items, username],
  );

  const results = useMemo(() => searchHits(index, query), [index, query]);

  // A first-time visitor needs to see what kind of thing to type. These are
  // real niches from the taxonomy, so they always match something.
  const examples = useMemo(
    () => categories.flatMap((c) => c.subcategories.slice(0, 2).map((s) => s.label)).slice(0, 4),
    [categories],
  );

  const go = (hit: SearchHit) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    navigate(hit.path);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[cursor] ?? results[0]);
    }
  };

  const showPanel = open && (results.length > 0 || query.trim().length > 0);

  return (
    <section id="find-a-video" className={bare ? "" : "px-6 py-20"}>
      <div className={bare ? "" : "mx-auto max-w-3xl text-center"}>
        {!bare && (
          <>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Find what you need</span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
              What kind of video are you looking for?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Describe it in your own words — “talking head ads”, “wedding film”, “product promo” — and we’ll point you
              at the right work.
            </p>
          </>
        )}

        <div className={`relative ${bare ? "" : "mx-auto mt-8 max-w-xl text-left"}`}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={showPanel}
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={showPanel && results[cursor] ? `${listId}-${cursor}` : undefined}
              aria-label="Search for a type of video"
              placeholder="e.g. talking head ads, wedding, product promo"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCursor(0); setOpen(true); }}
              onFocus={() => setOpen(true)}
              // Delayed so a click on a result lands before the panel unmounts.
              onBlur={() => window.setTimeout(() => setOpen(false), 120)}
              onKeyDown={onKeyDown}
              className="w-full rounded-full border border-border bg-card/70 py-3.5 pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showPanel && (
              <motion.ul
                id={listId}
                role="listbox"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              >
                {results.length === 0 && (
                  <li className="px-4 py-5 text-sm text-muted-foreground">
                    Nothing matched “{query.trim()}”. Try a broader word like “ads”, “podcast” or “wedding”.
                  </li>
                )}
                {results.map((hit, i) => (
                  <li key={hit.id} id={`${listId}-${i}`} role="option" aria-selected={i === cursor}>
                    <button
                      type="button"
                      onMouseEnter={() => setCursor(i)}
                      onClick={() => go(hit)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                        i === cursor ? "bg-primary/10" : "hover:bg-muted/50"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {KIND_LABEL[hit.kind]}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {hit.title}
                          {hit.context && <span className="text-muted-foreground"> · {hit.context}</span>}
                        </span>
                        {hit.hint && <span className="mt-0.5 block line-clamp-2 text-xs text-muted-foreground">{hit.hint}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>

          {!query && examples.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Popular:</span>
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => { setQuery(example); setCursor(0); setOpen(true); inputRef.current?.focus(); }}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategorySearch;
