/**
 * Editable copy for the homepage sections that used to be hardcoded.
 *
 * Both readers are deliberately forgiving: the columns are jsonb edited through
 * a dashboard, so anything malformed, half-saved or absent falls back to the
 * shipped defaults rather than rendering an empty section. A portfolio showing
 * stale prices is recoverable; one showing nothing is not.
 */

export interface ServiceTier {
  name: string;
  from: string;
  summary: string;
  includes: string[];
  highlight?: boolean;
}

export interface BeforeAfter {
  label: string;
  note: string;
  beforeUrl: string | null;
  afterUrl: string | null;
}

/** Shipped defaults. Indicative prices, clearly placeholder until edited. */
export const DEFAULT_SERVICES: ServiceTier[] = [
  {
    name: "Social cutdowns",
    from: "Ask",
    summary: "Vertical edits built for the first three seconds.",
    includes: ["Up to 60 seconds", "Captions and sound design", "9:16, 1:1 and 16:9 exports", "Two rounds of revisions"],
  },
  {
    name: "AI-generated spots",
    from: "Ask",
    summary: "Concept to finished ad with generated presenters and scenes.",
    includes: ["Script and storyboard", "AI presenter or full synthesis", "Licensed music and mix", "Three rounds of revisions"],
    highlight: true,
  },
  {
    name: "Long-form and brand films",
    from: "Ask",
    summary: "Documentary, explainer and brand work that holds attention.",
    includes: ["Up to 10 minutes", "Colour grade and full mix", "Motion graphics and titles", "Unlimited revisions in scope"],
  },
];

export const DEFAULT_BEFORE_AFTER: BeforeAfter = {
  label: "Colour grade",
  note: "Flat log footage against the final cinematic grade.",
  beforeUrl: null,
  afterUrl: null,
};

const text = (value: unknown, fallback = "") =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const url = (value: unknown): string | null => {
  const v = text(value);
  return v || null;
};

/**
 * Service tiers from a stored value. A row with no name is dropped rather than
 * rendered as a blank card, and an empty result falls back to the defaults so
 * the section never disappears mid-edit.
 */
export const readServices = (value: unknown): ServiceTier[] => {
  if (!Array.isArray(value)) return DEFAULT_SERVICES;
  const tiers = value
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map((row) => ({
      name: text(row.name),
      from: text(row.from, "Ask"),
      summary: text(row.summary),
      includes: Array.isArray(row.includes)
        ? row.includes.map((line) => text(line)).filter(Boolean)
        : [],
      highlight: row.highlight === true,
    }))
    .filter((tier) => tier.name);
  return tiers.length ? tiers : DEFAULT_SERVICES;
};

/**
 * The before/after pair. Both images must be present for the comparison to
 * mean anything, so a half-filled pair reports null and the section hides
 * itself rather than showing the same frame twice.
 */
export const readBeforeAfter = (value: unknown): BeforeAfter => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_BEFORE_AFTER;
  const row = value as Record<string, unknown>;
  return {
    label: text(row.label, DEFAULT_BEFORE_AFTER.label),
    note: text(row.note, DEFAULT_BEFORE_AFTER.note),
    beforeUrl: url(row.beforeUrl ?? row.before_url),
    afterUrl: url(row.afterUrl ?? row.after_url),
  };
};

/** True only when there are two real images to compare. */
export const hasBeforeAfterPair = (pair: BeforeAfter) =>
  Boolean(pair.beforeUrl && pair.afterUrl);
