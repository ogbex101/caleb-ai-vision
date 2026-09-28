import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  type Category,
  type TaxonomyRow,
  getCategories,
  rowsToCategories,
  setCategories,
  subscribeCategories,
} from "@/lib/categories";

/**
 * Loads the taxonomy table once per page load, however many components ask for
 * it, and hands the result to the shared store in categories.ts so the plain
 * helpers (getCategory, tagLabel, …) see the same data as the React tree.
 */
let loadPromise: Promise<void> | null = null;

const fetchTaxonomy = async () => {
  const { data, error } = await supabase
    .from("taxonomy")
    .select("parent_category, slug, label, blurb, sort_order");
  // A failure here is not fatal: the seed in categories.ts stays in place, so
  // the site keeps rendering the categories it shipped with.
  if (error || !Array.isArray(data)) return;
  setCategories(rowsToCategories(data as TaxonomyRow[]));
};

export const loadCategories = () => {
  if (!loadPromise) loadPromise = fetchTaxonomy().catch(() => {});
  return loadPromise;
};

/** Discards the cached fetch so the next load sees freshly saved edits. */
export const refreshCategories = async () => {
  loadPromise = null;
  await loadCategories();
};

/**
 * The live category list, re-rendering the caller whenever it changes. Falls
 * back to the seeded list until the fetch resolves, so there is never an empty
 * category picker.
 */
export const useCategories = (): Category[] => {
  const categories = useSyncExternalStore(subscribeCategories, getCategories, getCategories);
  useEffect(() => {
    void loadCategories();
  }, []);
  return categories;
};
