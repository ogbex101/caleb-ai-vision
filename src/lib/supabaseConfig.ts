/**
 * What the build was actually configured with.
 *
 * A 401 on every request has only a few causes, and they are told apart by the
 * shape of the key rather than its value: a legacy JWT after the project has
 * disabled legacy keys, a new publishable key on a project that has not
 * enabled them, a secret key that must never reach a browser, or nothing at
 * all. Classifying it needs no secrets — the publishable key is public by
 * design — and the value itself is never logged.
 */
export type KeyKind =
  | "publishable"   // sb_publishable_… the correct kind for a browser
  | "secret"        // sb_secret_… must never be shipped to a browser
  | "legacy-jwt"    // eyJ… anon or service_role, disabled on newer projects
  | "missing"
  | "unrecognised";

export interface SupabaseConfigReport {
  urlPresent: boolean;
  projectRef: string | null;
  keyKind: KeyKind;
  /** Enough to compare against the dashboard, never the whole key. */
  keyPreview: string;
  /** Null when the configuration looks sound. */
  problem: string | null;
}

export const classifyKey = (key?: string | null): KeyKind => {
  const value = key?.trim();
  if (!value) return "missing";
  if (value.startsWith("sb_publishable_")) return "publishable";
  if (value.startsWith("sb_secret_")) return "secret";
  if (value.startsWith("eyJ")) return "legacy-jwt";
  return "unrecognised";
};

/** The project ref in a Supabase URL, for comparing against the dashboard. */
export const projectRefFrom = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    const host = new URL(url).hostname;
    const [ref] = host.split(".");
    return ref || null;
  } catch {
    return null;
  }
};

const PROBLEMS: Record<KeyKind, string | null> = {
  publishable: null,
  secret: "This is a SECRET key. It must never be used in a browser, and Supabase rejects it from one. Use the sb_publishable_ key instead.",
  "legacy-jwt": "This is a legacy JWT key. If the project has switched to the new API keys, legacy keys are rejected and every request returns 401. Copy the sb_publishable_ key from Settings > API Keys.",
  missing: "No key reached the build. VITE_ variables are read at build time, so the variable must exist in the hosting environment for the Production environment and the site must be rebuilt after it is set.",
  unrecognised: "This does not look like a Supabase key. Check it was copied whole, with no quotes or stray characters.",
};

/** A short, safe preview: enough to compare, never enough to reuse. */
export const previewKey = (key?: string | null): string => {
  const value = key?.trim();
  if (!value) return "(none)";
  return `${value.slice(0, 14)}… (${value.length} chars)`;
};

export const describeSupabaseConfig = (url?: string | null, key?: string | null): SupabaseConfigReport => {
  const keyKind = classifyKey(key);
  return {
    urlPresent: Boolean(url?.trim()),
    projectRef: projectRefFrom(url),
    keyKind,
    keyPreview: previewKey(key),
    problem: !url?.trim()
      ? "No Supabase URL reached the build. Set VITE_SUPABASE_URL in the hosting environment and rebuild."
      : PROBLEMS[keyKind],
  };
};
