import { Plus, X } from "lucide-react";
import { CATEGORIES, MAX_CATEGORY_TAGS, getCategory, tagLabel, type CategoryTag } from "@/lib/categories";

interface Props {
  tags: CategoryTag[];
  onChange: (tags: CategoryTag[]) => void;
}

/** Lets an admin tag one video with up to 5 category / sub-category pairs. */
const CategoryTagsEditor = ({ tags, onChange }: Props) => {
  const update = (index: number, next: Partial<CategoryTag>) => {
    const copy = tags.map((t, i) => (i === index ? { ...t, ...next } : t));
    onChange(copy);
  };

  return (
    <div className="rounded-lg border border-border bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Categories for this video</p>
          <p className="text-xs text-muted-foreground">
            Tag up to {MAX_CATEGORY_TAGS} categories. The video shows up on every tagged category page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...tags, { category: CATEGORIES[0].slug, subcategory: null }])}
          disabled={tags.length >= MAX_CATEGORY_TAGS}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" /> Add category
        </button>
      </div>

      {tags.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">No categories yet. This video only shows in the full portfolio.</p>
      )}

      <div className="mt-4 space-y-3">
        {tags.map((tag, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <select
              value={tag.category}
              onChange={(e) => update(i, { category: e.target.value, subcategory: null })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.label}</option>
              ))}
            </select>
            <select
              value={tag.subcategory || ""}
              onChange={(e) => update(i, { subcategory: e.target.value || null })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">All sub-categories</option>
              {(getCategory(tag.category)?.subcategories || []).map((s) => (
                <option key={s.slug} value={s.slug}>{s.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange(tags.filter((_, index) => index !== i))}
              className="rounded-lg border border-border px-2 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              aria-label={`Remove ${tagLabel(tag)}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTagsEditor;
