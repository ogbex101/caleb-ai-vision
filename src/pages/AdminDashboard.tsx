import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Save, Trash2, Plus, MessageSquare, Mail, Settings, ChevronDown, ChevronUp, Upload, Star, Loader2, BarChart3, Eye, Copy, Users, Image as ImageIcon, Play, Tags } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { ASPECT_RATIOS, MAX_CATEGORY_TAGS, getCategory, readTags, tagsMatch, type CategoryTag } from "@/lib/categories";
import { refreshCategories, useCategories } from "@/hooks/useCategories";
import { needsRehosting, videoSourceLabel } from "@/lib/videoSource";
import CategoryTagsEditor from "@/components/admin/CategoryTagsEditor";
import { VideoCompressionError, compressVideo, contentTypeFor, shouldCompress } from "@/lib/compressVideo";

type SectionName = "analytics" | "hero" | "about" | "techStack" | "portfolio" | "categories" | "layouts" | "testimonials" | "messages" | "settings";

// Raw file the admin can pick, anything larger than this is compressed
// client-side (in the browser) before it ever reaches Supabase storage.
const MAX_SOURCE_VIDEO_SIZE_MB = 1024;
// Anything under this uploads as-is, no need to wait on a transcode.
const MAX_VIDEO_SIZE_MB = 50;
// Hard ceiling enforced by the portfolio-videos bucket itself
// (storage.buckets.file_size_limit = 209715200). Anything above this is
// rejected by the storage API with a bare 400, so check it here and say why.
const BUCKET_FILE_SIZE_LIMIT_MB = 200;

/** A row of the taxonomy table as the editor holds it. sort_order is a string
 *  while being typed into its input, hence the union. */
interface TaxonomyRecord {
  id: string;
  parent_category: string | null;
  slug: string;
  label: string;
  blurb: string | null;
  sort_order: number | string | null;
}

/** sort_order as a number, whether it is mid-edit as a string or stored. */
const orderOf = (row: { sort_order?: number | string | null }) => Number(row.sort_order) || 0;

/** URL-safe slug from a label, matching the style of the seeded slugs. */
const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

/**
 * Why this upload cannot succeed, or null when it can. Checked against the
 * file that is actually about to be sent, which is the compressed output when
 * compression worked and the untouched original when it didn't.
 */
const uploadBlocker = (file: File) => {
  if (file.size <= BUCKET_FILE_SIZE_LIMIT_MB * 1024 * 1024) return null;
  const mb = Math.round(file.size / (1024 * 1024));
  return `${file.name} is ${mb}MB, over the ${BUCKET_FILE_SIZE_LIMIT_MB}MB storage limit. Compression either failed or could not shrink it enough — trim or re-encode it locally, then upload again.`;
};

/** Compression failures read differently depending on which step broke. */
const compressionFailureTitle = (err: unknown) =>
  err instanceof VideoCompressionError && err.stage === "load"
    ? "Video compressor unavailable, uploading the original instead"
    : "Compression failed, uploading the original file instead";

type CompressionStatus = { key: string; progress: number } | null;

type TimeRange = "today" | "3d" | "week" | "month" | "all";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "3d", label: "Last 3 Days" },
  { value: "week", label: "Last Week" },
  { value: "month", label: "Last Month" },
  { value: "all", label: "All Time" },
];

/**
 * Oldest created_at still counted, or null for all time. "Today" means since
 * local midnight, which is what an admin checking today's numbers expects; the
 * wider ranges are rolling windows counted back from now.
 */
const rangeCutoff = (range: TimeRange): Date | null => {
  if (range === "all") return null;
  if (range === "today") {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    return midnight;
  }
  const days = range === "3d" ? 3 : range === "week" ? 7 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

/** Rows created at or after the cutoff. Rows with no usable date are dropped. */
const withinRange = <T extends { created_at?: string | null }>(rows: T[], range: TimeRange): T[] => {
  const cutoff = rangeCutoff(range);
  if (!cutoff) return rows;
  const from = cutoff.getTime();
  return rows.filter((row) => {
    const at = row.created_at ? new Date(row.created_at).getTime() : NaN;
    return Number.isFinite(at) && at >= from;
  });
};

const AdminDashboard = () => {
  const categories = useCategories();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionName>("hero");

  // Data states
  const [hero, setHero] = useState({ id: "", headline: "", subheadline: "", cta_text: "" });
  const [about, setAbout] = useState({ id: "", title: "", content: "" });
  const [techStack, setTechStack] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [layouts, setLayouts] = useState<any[]>([]);
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [linkCopies, setLinkCopies] = useState<any[]>([]);
  const [videoClicks, setVideoClicks] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [taxonomy, setTaxonomy] = useState<TaxonomyRecord[]>([]);
  const [newCategory, setNewCategory] = useState({ label: "", slug: "" });
  const [newSub, setNewSub] = useState<Record<string, { label: string; slug: string }>>({});

  // Upload states
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [bulkUploading, setBulkUploading] = useState<{ done: number; total: number } | null>(null);
  const [heroUploading, setHeroUploading] = useState<string | null>(null);
  const [addingProject, setAddingProject] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [compressing, setCompressing] = useState<CompressionStatus>(null);

  // Upload target category (applied to bulk uploads + new projects) and list filter
  const [uploadCat, setUploadCat] = useState("");
  const [uploadSub, setUploadSub] = useState("");
  const [filterCat, setFilterCat] = useState("");

  // Testimonials are scoped per profile; this picks which profile's tab is showing
  const [testimonialProfile, setTestimonialProfile] = useState<"caleb" | "faith" | "daniel">("caleb");

  // Settings
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (!s) navigate("/admin/login");
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (!s) navigate("/admin/login");
      else fetchAll();
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [h, a, t, p, te, m, l, pv, lc, vc, tx] = await Promise.all([
      supabase.from("hero_section").select("*").limit(1).single(),
      supabase.from("about_section").select("*").limit(1).single(),
      supabase.from("tech_stack").select("*").order("sort_order"),
      supabase.from("portfolio_items").select("*").order("sort_order"),
      supabase.from("testimonials").select("*").order("sort_order"),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("site_layouts").select("*").order("created_at"),
      supabase.from("page_views").select("*").order("created_at", { ascending: false }).limit(5000),
      supabase.from("link_copies").select("*").order("created_at", { ascending: false }).limit(5000),
      supabase.from("video_clicks").select("*").order("created_at", { ascending: false }).limit(5000),
      supabase.from("taxonomy").select("*").order("sort_order"),
    ]);
    if (h.data) setHero(h.data);
    if (a.data) setAbout(a.data);
    if (t.data) setTechStack(t.data);
    if (p.data) setPortfolio(p.data);
    if (te.data) setTestimonials(te.data);
    if (m.data) setMessages(m.data);
    if (l.data) setLayouts(l.data);
    if (pv.data) setPageViews(pv.data);
    if (lc.data) setLinkCopies(lc.data);
    if (vc.data) setVideoClicks(vc.data);
    if (tx.data) setTaxonomy(tx.data as TaxonomyRecord[]);
    setLoading(false);
  };

  const saveHero = async () => {
    const { error } = await supabase.from("hero_section").update({
      headline: hero.headline, subheadline: hero.subheadline, cta_text: hero.cta_text,
    }).eq("id", hero.id);
    toast({ title: error ? "Failed to save" : "Hero section updated!", variant: error ? "destructive" : "default" });
  };

  const saveAbout = async () => {
    const { error } = await supabase.from("about_section").update({
      title: about.title, content: about.content,
    }).eq("id", about.id);
    toast({ title: error ? "Failed to save" : "About section updated!", variant: error ? "destructive" : "default" });
  };

  const saveTechItem = async (item: any) => {
    const { error } = await supabase.from("tech_stack").update({
      name: item.name, description: item.description, sort_order: item.sort_order,
    }).eq("id", item.id);
    toast({ title: error ? "Failed to save" : `${item.name} updated!`, variant: error ? "destructive" : "default" });
  };

  const deleteTechItem = async (id: string) => {
    await supabase.from("tech_stack").delete().eq("id", id);
    setTechStack(techStack.filter((t) => t.id !== id));
    toast({ title: "Tool removed" });
  };

  const addTechItem = async () => {
    const { data, error } = await supabase.from("tech_stack").insert({ name: "New Tool", description: "Description", sort_order: techStack.length + 1 }).select().single();
    if (error || !data) {
      toast({ title: "Failed to add tool", description: error?.message, variant: "destructive" });
      return;
    }
    setTechStack([...techStack, data]);
    toast({ title: "Tool added" });
  };

  // Portfolio video upload
  const handleVideoUpload = async (index: number, rawFile: File) => {
    if (rawFile.size > MAX_SOURCE_VIDEO_SIZE_MB * 1024 * 1024) {
      toast({ title: `Video must be under ${MAX_SOURCE_VIDEO_SIZE_MB}MB`, variant: "destructive" });
      return;
    }

    setUploadingIndex(index);
    let file = rawFile;
    if (shouldCompress(rawFile)) {
      const key = `portfolio-${index}`;
      setCompressing({ key, progress: 0 });
      try {
        file = await compressVideo(rawFile, (ratio) => setCompressing({ key, progress: ratio }));
      } catch (err) {
        toast({ title: compressionFailureTitle(err), description: err instanceof Error ? err.message : undefined, variant: "destructive" });
      } finally {
        setCompressing(null);
      }
    }

    const blocked = uploadBlocker(file);
    if (blocked) {
      toast({ title: "Upload too large for storage", description: blocked, variant: "destructive" });
      setUploadingIndex(null);
      return;
    }

    const item = portfolio[index];
    const fileExt = file.name.split('.').pop();
    const filePath = `${item.id}.${fileExt}`;

    // Delete old file if exists
    if (item.video_url?.includes('portfolio-videos')) {
      const oldPath = item.video_url.split('/portfolio-videos/')[1];
      if (oldPath) await supabase.storage.from('portfolio-videos').remove([oldPath]);
    }

    const { error: uploadError } = await supabase.storage
      .from('portfolio-videos')
      .upload(filePath, file, { cacheControl: '3600', upsert: true, contentType: contentTypeFor(file) });

    if (uploadError) {
      toast({ title: "Upload failed: " + uploadError.message, variant: "destructive" });
      setUploadingIndex(null);
      return;
    }

    const { data: urlData } = supabase.storage.from('portfolio-videos').getPublicUrl(filePath);
    const videoUrl = urlData.publicUrl;

    // Update DB
    const { error } = await supabase.from("portfolio_items").update({ video_url: videoUrl }).eq("id", item.id);
    if (!error) {
      const u = [...portfolio];
      u[index] = { ...u[index], video_url: videoUrl };
      setPortfolio(u);
      toast({ title: "Video uploaded successfully!" });
    } else {
      toast({ title: "Failed to save video URL", variant: "destructive" });
    }
    setUploadingIndex(null);
  };

  const savePortfolioItem = async (item: any) => {
    const tags: CategoryTag[] = readTags(item).slice(0, MAX_CATEGORY_TAGS);
    const primary = tags[0];
    const { error } = await (supabase as any).from("portfolio_items").update({
      title: item.title, description: item.description, client_name: item.client_name,
      category: getCategory(primary?.category)?.label || item.category || null,
      featured: item.featured, video_url: item.video_url,
      full_video_url: item.full_video_url, sort_order: item.sort_order,
      category_slug: primary?.category || null,
      subcategory_slug: primary?.subcategory || null,
      category_tags: tags,
      preview_seconds: item.preview_seconds || 30, aspect_ratio: item.aspect_ratio || "16:9",
    }).eq("id", item.id);
    toast({
      title: error ? "Failed to save" : `${item.title} updated!`,
      description: error?.message,
      variant: error ? "destructive" : "default",
    });
  };

  // Bulk upload: one portfolio item per file, filename becomes the title
  const handleBulkUpload = async (files: FileList) => {
    const arr = Array.from(files);
    const valid = arr.filter((f) => {
      if (f.size > MAX_SOURCE_VIDEO_SIZE_MB * 1024 * 1024) {
        toast({ title: `Skipped ${f.name}: over ${MAX_SOURCE_VIDEO_SIZE_MB}MB`, variant: "destructive" });
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;

    setBulkUploading({ done: 0, total: valid.length });
    const created: any[] = [];
    let baseOrder = portfolio.length;

    for (let i = 0; i < valid.length; i++) {
      const rawFile = valid[i];
      const title = rawFile.name.replace(/\.[^/.]+$/, "");

      const { data: newRow, error: insErr } = await (supabase as any)
        .from("portfolio_items")
        .insert({ title, description: "", client_name: "", category: getCategory(uploadCat)?.label || "", category_slug: uploadCat || null, subcategory_slug: uploadSub || null, category_tags: uploadCat ? [{ category: uploadCat, subcategory: uploadSub || null }] : [], preview_seconds: 30, sort_order: ++baseOrder })
        .select()
        .single();
      if (insErr || !newRow) {
        toast({ title: `Failed to create row for ${rawFile.name}`, variant: "destructive" });
        setBulkUploading({ done: i + 1, total: valid.length });
        continue;
      }

      let file = rawFile;
      if (shouldCompress(rawFile)) {
        const key = `bulk-${i}`;
        setCompressing({ key, progress: 0 });
        try {
          file = await compressVideo(rawFile, (ratio) => setCompressing({ key, progress: ratio }));
        } catch (err) {
          toast({ title: compressionFailureTitle(err), description: err instanceof Error ? err.message : undefined, variant: "destructive" });
        } finally {
          setCompressing(null);
        }
      }

      const blockedBulk = uploadBlocker(file);
      if (blockedBulk) {
        toast({ title: `Skipped ${rawFile.name}`, description: blockedBulk, variant: "destructive" });
        setBulkUploading({ done: i + 1, total: valid.length });
        continue;
      }

      const ext = file.name.split(".").pop();
      const filePath = `${newRow.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("portfolio-videos")
        .upload(filePath, file, { cacheControl: "3600", upsert: true, contentType: contentTypeFor(file) });

      if (upErr) {
        toast({ title: `Upload failed for ${rawFile.name}: ${upErr.message}`, variant: "destructive" });
        setBulkUploading({ done: i + 1, total: valid.length });
        continue;
      }

      const { data: urlData } = supabase.storage.from("portfolio-videos").getPublicUrl(filePath);
      const videoUrl = urlData.publicUrl;
      await supabase.from("portfolio_items").update({ video_url: videoUrl }).eq("id", newRow.id);
      created.push({ ...newRow, video_url: videoUrl });
      setBulkUploading({ done: i + 1, total: valid.length });
    }

    setPortfolio((prev) => [...prev, ...created]);
    setBulkUploading(null);
    toast({ title: `Uploaded ${created.length} of ${valid.length} videos` });
  };

  const toggleFeatured = async (index: number) => {
    const u = [...portfolio];
    u[index] = { ...u[index], featured: !u[index].featured };
    setPortfolio(u);
    const { error } = await supabase.from("portfolio_items").update({ featured: u[index].featured }).eq("id", u[index].id);
    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } else {
      toast({ title: u[index].featured ? "Added to landing page" : "Removed from landing page" });
    }
  };

  const deletePortfolioItem = async (id: string) => {
    // Also remove video from storage
    const item = portfolio.find(p => p.id === id);
    if (item?.video_url?.includes('portfolio-videos')) {
      const path = item.video_url.split('/portfolio-videos/')[1];
      if (path) await supabase.storage.from('portfolio-videos').remove([path]);
    }
    await supabase.from("portfolio_items").delete().eq("id", id);
    setPortfolio(portfolio.filter((p) => p.id !== id));
    toast({ title: "Project removed" });
  };

  const addPortfolioItem = async () => {
    if (addingProject) return;
    setAddingProject(true);
    try {
      const { data, error } = await (supabase as any).from("portfolio_items").insert({
        title: "New Project", description: "Project description", client_name: "Client",
        category: getCategory(uploadCat)?.label || "", category_slug: uploadCat || null,
        subcategory_slug: uploadSub || null,
        category_tags: uploadCat ? [{ category: uploadCat, subcategory: uploadSub || null }] : [],
        preview_seconds: 30, sort_order: portfolio.length + 1,
      }).select().single();
      if (error || !data) {
        toast({ title: "Failed to add project", description: error?.message || "Please try again.", variant: "destructive" });
        return;
      }
      setPortfolio((prev) => [...prev, data]);
      // A list filter that doesn't match the new item's category would hide it,
      // making the button look like it did nothing — so clear it here.
      if (filterCat && !tagsMatch(readTags(data), filterCat)) setFilterCat("");
      toast({ title: "Project added", description: "Scroll down to fill in its details." });
      setHighlightedId(data.id);
      setTimeout(() => {
        document.getElementById(`portfolio-item-${data.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      setTimeout(() => setHighlightedId((current) => (current === data.id ? null : current)), 3000);
    } finally {
      setAddingProject(false);
    }
  };

  const saveLayout = async (layout: any) => {
    const { error } = await supabase.from("site_layouts").update({
      display_name: layout.display_name,
      theme: layout.theme,
      tagline: layout.tagline,
      hero_media_url: layout.hero_media_url || null,
      hero_media_type: layout.hero_media_type,
      hero_parallax_urls: layout.hero_parallax_urls || {},
      active: layout.active,
      updated_at: new Date().toISOString(),
    }).eq("id", layout.id);
    toast({ title: error ? "Failed to save layout" : `${layout.display_name} layout updated`, variant: error ? "destructive" : "default" });
  };

  const addLayout = async () => {
    const username = `user-${layouts.length + 1}`;
    const { data, error } = await supabase.from("site_layouts").insert({
      username,
      display_name: "New User",
      theme: "cinematic",
      hero_media_type: "video",
    }).select().single();
    if (data) setLayouts((current) => [...current, data]);
    toast({ title: error ? "Failed to add layout" : "Layout created", variant: error ? "destructive" : "default" });
  };

  const uploadHeroMedia = async (index: number, rawFile: File) => {
    if (rawFile.size > MAX_SOURCE_VIDEO_SIZE_MB * 1024 * 1024) {
      toast({ title: `Hero media must be under ${MAX_SOURCE_VIDEO_SIZE_MB}MB`, variant: "destructive" });
      return;
    }
    const layout = layouts[index];
    setHeroUploading(layout.id);

    let file = rawFile;
    if (shouldCompress(rawFile)) {
      const key = `hero-${layout.id}`;
      setCompressing({ key, progress: 0 });
      try {
        file = await compressVideo(rawFile, (ratio) => setCompressing({ key, progress: ratio }));
      } catch (err) {
        toast({ title: compressionFailureTitle(err), description: err instanceof Error ? err.message : undefined, variant: "destructive" });
      } finally {
        setCompressing(null);
      }
    }

    const blockedHero = uploadBlocker(file);
    if (blockedHero) {
      toast({ title: "Upload too large for storage", description: blockedHero, variant: "destructive" });
      setHeroUploading(null);
      return;
    }

    const ext = file.name.split(".").pop() || (file.type.startsWith("image/") ? "jpg" : "mp4");
    const path = `heroes/${layout.username}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-videos").upload(path, file, { contentType: contentTypeFor(file), upsert: true });
    if (error) {
      toast({ title: `Hero upload failed: ${error.message}`, variant: "destructive" });
      setHeroUploading(null);
      return;
    }
    const { data } = supabase.storage.from("portfolio-videos").getPublicUrl(path);
    const next = [...layouts];
    next[index] = { ...layout, hero_media_url: data.publicUrl, hero_media_type: file.type.startsWith("image/") ? "image" : "video" };
    setLayouts(next);
    await supabase.from("site_layouts").update({ hero_media_url: data.publicUrl, hero_media_type: next[index].hero_media_type, updated_at: new Date().toISOString() }).eq("id", layout.id);
    setHeroUploading(null);
    toast({ title: "Hero media uploaded" });
  };

  // --- Taxonomy (categories / sub-categories) -------------------------------
  //
  // Slugs are deliberately not editable after creation: portfolio_items rows
  // reference them by slug in category_tags, so renaming one would silently
  // orphan every video tagged with it. Labels and blurbs are free to change.

  const reloadTaxonomy = async () => {
    const { data } = await supabase.from("taxonomy").select("*").order("sort_order");
    if (data) setTaxonomy(data as TaxonomyRecord[]);
    await refreshCategories();
  };

  const saveTaxonomyRow = async (row: TaxonomyRecord) => {
    if (!row.label?.trim()) {
      toast({ title: "A label is required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("taxonomy").update({
      label: row.label.trim(),
      blurb: row.blurb || null,
      sort_order: Number(row.sort_order) || 0,
      updated_at: new Date().toISOString(),
    }).eq("id", row.id);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      return;
    }
    await reloadTaxonomy();
    toast({ title: "Saved" });
  };

  const addTaxonomyRow = async (parent: string | null, label: string, slug: string) => {
    const finalLabel = label.trim();
    const finalSlug = slugify(slug || label);
    if (!finalLabel || !finalSlug) {
      toast({ title: "Both a label and a slug are required", variant: "destructive" });
      return;
    }
    const siblings = taxonomy.filter((r) => (r.parent_category || null) === parent);
    if (siblings.some((r) => r.slug === finalSlug)) {
      toast({ title: `"${finalSlug}" already exists here`, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("taxonomy").insert({
      parent_category: parent,
      slug: finalSlug,
      label: finalLabel,
      blurb: "",
      sort_order: siblings.length + 1,
    });
    if (error) {
      toast({ title: "Failed to add", description: error.message, variant: "destructive" });
      return;
    }
    if (parent) setNewSub((prev) => ({ ...prev, [parent]: { label: "", slug: "" } }));
    else setNewCategory({ label: "", slug: "" });
    await reloadTaxonomy();
    toast({ title: `Added ${finalLabel}` });
  };

  /** How many portfolio items are tagged with this category or sub-category. */
  const taxonomyUsage = (row: TaxonomyRecord) =>
    portfolio.filter((item) =>
      readTags(item).some((tag) =>
        row.parent_category
          ? tag.category === row.parent_category && tag.subcategory === row.slug
          : tag.category === row.slug,
      ),
    ).length;

  const deleteTaxonomyRow = async (row: TaxonomyRecord) => {
    const children = row.parent_category ? [] : taxonomy.filter((r) => r.parent_category === row.slug);
    const used = taxonomyUsage(row);
    const warnings = [
      children.length ? `${children.length} sub-categor${children.length === 1 ? "y" : "ies"} under it will also be deleted` : null,
      used ? `${used} video${used === 1 ? "" : "s"} tagged with it will stop appearing on its page` : null,
    ].filter(Boolean);
    const detail = warnings.length ? `\n\n${warnings.join(".\n")}.` : "";
    if (!window.confirm(`Delete "${row.label}"?${detail}\n\nThis cannot be undone.`)) return;

    const ids = [row.id, ...children.map((c) => c.id)];
    const { error } = await supabase.from("taxonomy").delete().in("id", ids);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
      return;
    }
    await reloadTaxonomy();
    toast({ title: `Deleted ${row.label}` });
  };

  const saveTestimonial = async (item: any) => {
    const { error } = await supabase.from("testimonials").update({
      client_name: item.client_name, client_title: item.client_title, content: item.content, rating: item.rating,
      username: item.username,
    }).eq("id", item.id);
    toast({ title: error ? "Failed to save" : "Testimonial updated!", variant: error ? "destructive" : "default" });
  };

  const deleteTestimonial = async (id: string) => {
    await supabase.from("testimonials").delete().eq("id", id);
    setTestimonials(testimonials.filter((t) => t.id !== id));
    toast({ title: "Testimonial removed" });
  };

  const addTestimonial = async () => {
    const { data, error } = await supabase.from("testimonials").insert({
      client_name: "New Client", client_title: "Title", content: "Testimonial text",
      sort_order: testimonials.filter((t) => t.username === testimonialProfile).length + 1,
      username: testimonialProfile,
    }).select().single();
    if (error || !data) {
      toast({ title: "Failed to add testimonial", description: error?.message, variant: "destructive" });
      return;
    }
    setTestimonials([...testimonials, data]);
    toast({ title: "Testimonial added" });
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    setMessages(messages.filter((m) => m.id !== id));
  };

  const updateCredentials = async () => {
    if (newEmail) {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) toast({ title: "Failed to update email", variant: "destructive" });
      else toast({ title: "Email update sent. Check your inbox." });
    }
    if (newPassword) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) toast({ title: "Failed to update password", variant: "destructive" });
      else { toast({ title: "Password updated!" }); setNewPassword(""); }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const sections: { key: SectionName; label: string; icon: any }[] = [
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "hero", label: "Hero Section", icon: ChevronUp },
    { key: "about", label: "About Section", icon: ChevronDown },
    { key: "techStack", label: "Tech Stack", icon: Settings },
    { key: "portfolio", label: "Portfolio", icon: Plus },
    { key: "layouts", label: "User Layouts", icon: ImageIcon },
    { key: "categories", label: "Categories", icon: Tags },
    { key: "testimonials", label: "Testimonials", icon: MessageSquare },
    { key: "messages", label: "Messages", icon: Mail },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  // Every figure below is derived from these, so filtering here is what makes
  // the whole analytics section honour the selected range.
  const rangedPageViews = withinRange(pageViews, timeRange);
  const rangedLinkCopies = withinRange(linkCopies, timeRange);
  const rangedVideoClicks = withinRange(videoClicks, timeRange);

  const uniqueVisitors = new Set(rangedPageViews.map((view) => view.visitor_id).filter(Boolean)).size;
  const countBy = (rows: any[], key: string) => Object.entries(rows.reduce<Record<string, number>>((acc, row) => {
    const value = row[key] || "Unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]);
  const categoryViews = countBy(rangedPageViews.filter((view) => view.category_slug), "category_slug");
  const layoutViews = countBy(rangedPageViews, "username");
  const sourceViews = countBy(rangedPageViews, "source");
  const copiedCategories = countBy(rangedLinkCopies, "category_slug");
  const mostClickedVideos = countBy(rangedVideoClicks.filter((click) => click.title), "title");
  const clicksByLayout = countBy(rangedVideoClicks, "username");
  const topVideo = mostClickedVideos[0];
  const rehostCount = portfolio.filter((item) => needsRehosting(item.video_url)).length;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl">
            <span className="gradient-text">Admin</span> Dashboard
          </h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 hidden md:block">
          <nav className="space-y-1 sticky top-24">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === s.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile nav */}
          <div className="md:hidden mb-6 flex flex-wrap gap-2">
            {sections.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeSection === s.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {activeSection === "analytics" && (
            <div className="space-y-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold">Portfolio Analytics</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Views and link activity recorded across every user layout
                    {timeRange === "all" ? "." : `, ${TIME_RANGES.find((r) => r.value === timeRange)?.label.toLowerCase()}.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Analytics time range">
                  {TIME_RANGES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setTimeRange(r.value)}
                      aria-pressed={timeRange === r.value}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        timeRange === r.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <StatCard icon={Eye} label="Total views" value={rangedPageViews.length} />
                <StatCard icon={Users} label="Unique visitors" value={uniqueVisitors} />
                <StatCard icon={Copy} label="Links copied" value={rangedLinkCopies.length} />
                <StatCard icon={Play} label="Video plays" value={rangedVideoClicks.length} />
              </div>
              {topVideo && (
                <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                    <Play className="h-3.5 w-3.5" /> Most-clicked video
                  </div>
                  <p className="mt-2 font-display text-2xl font-bold">{topVideo[0]}</p>
                  <p className="text-sm text-muted-foreground">{topVideo[1]} {topVideo[1] === 1 ? "play" : "plays"} recorded</p>
                </div>
              )}
              <div className="grid gap-6 lg:grid-cols-2">
                <AnalyticsList title="Most-clicked videos" rows={mostClickedVideos} empty="No video plays recorded yet." rawLabels />
                <AnalyticsList title="Video plays by user layout" rows={clicksByLayout} empty="No video plays recorded yet." />
                <AnalyticsList title="Views by user layout" rows={layoutViews} />
                <AnalyticsList title="Traffic sources" rows={sourceViews} />
                <AnalyticsList title="Most-viewed categories" rows={categoryViews} empty="Category pages have not been viewed yet." />
                <AnalyticsList title="Most-copied categories" rows={copiedCategories} empty="No category links copied yet." />
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-display font-semibold">Upload activity</h3>
                <p className="mt-2 text-3xl font-display font-bold text-primary">{portfolio.length}</p>
                <p className="text-sm text-muted-foreground">videos in the shared library</p>
              </div>
            </div>
          )}

          {/* Hero */}
          {activeSection === "hero" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Hero Section</h2>
              <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <InputField label="Headline" value={hero.headline} onChange={(v) => setHero({ ...hero, headline: v })} />
                <InputField label="Subheadline" value={hero.subheadline} onChange={(v) => setHero({ ...hero, subheadline: v })} textarea />
                <InputField label="CTA Text" value={hero.cta_text} onChange={(v) => setHero({ ...hero, cta_text: v })} />
                <SaveButton onClick={saveHero} />
              </div>
            </div>
          )}

          {/* About */}
          {activeSection === "about" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">About Section</h2>
              <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <InputField label="Title" value={about.title} onChange={(v) => setAbout({ ...about, title: v })} />
                <InputField label="Content" value={about.content} onChange={(v) => setAbout({ ...about, content: v })} textarea rows={10} />
                <SaveButton onClick={saveAbout} />
              </div>
            </div>
          )}

          {/* Tech Stack */}
          {activeSection === "techStack" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Tech Stack</h2>
                <button onClick={addTechItem} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium">
                  <Plus className="w-4 h-4" /> Add Tool
                </button>
              </div>
              {techStack.map((item, i) => (
                <div key={item.id} className="p-6 rounded-xl bg-card border border-border space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Name" value={item.name} onChange={(v) => { const u = [...techStack]; u[i] = { ...u[i], name: v }; setTechStack(u); }} />
                    <InputField label="Description" value={item.description || ""} onChange={(v) => { const u = [...techStack]; u[i] = { ...u[i], description: v }; setTechStack(u); }} />
                  </div>
                  <div className="flex gap-2">
                    <SaveButton onClick={() => saveTechItem(techStack[i])} />
                    <DeleteButton onClick={() => deleteTechItem(item.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Portfolio */}
          {activeSection === "portfolio" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold">Portfolio</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Star items to show them on the landing page. All items appear on the portfolio page.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium cursor-pointer transition-all ${
                    bulkUploading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-accent text-accent-foreground hover:bg-accent/80'
                  }`}>
                    {compressing?.key.startsWith("bulk-") ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Compressing {Math.round(compressing.progress * 100)}%</>
                    ) : bulkUploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Uploading {bulkUploading.done}/{bulkUploading.total}</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Bulk Upload</>
                    )}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      multiple
                      className="hidden"
                      disabled={!!bulkUploading}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) handleBulkUpload(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <button
                    onClick={addPortfolioItem}
                    disabled={addingProject}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingProject ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {addingProject ? "Adding..." : "Add Project"}
                  </button>
                </div>
              </div>

              {/* Upload target + list filter */}
              <div className="grid gap-4 md:grid-cols-3 p-5 rounded-xl bg-card border border-border">
                <SelectField
                  label="Upload into category"
                  value={uploadCat}
                  onChange={(v) => { setUploadCat(v); setUploadSub(""); }}
                  options={categories.map((c) => ({ value: c.slug, label: c.label }))}
                  placeholder="No category"
                />
                <SelectField
                  label="Upload into sub-category"
                  value={uploadSub}
                  onChange={setUploadSub}
                  options={(getCategory(uploadCat)?.subcategories || []).map((s) => ({ value: s.slug, label: s.label }))}
                  placeholder={uploadCat ? "No sub-category" : "Choose category first"}
                  disabled={!uploadCat}
                />
                <SelectField
                  label="Filter list by category"
                  value={filterCat}
                  onChange={setFilterCat}
                  options={categories.map((c) => ({ value: c.slug, label: c.label }))}
                  placeholder="All categories"
                />
                <p className="md:col-span-3 text-xs text-muted-foreground">
                  New projects and every bulk-uploaded file are tagged with the category above automatically. You can still change any item individually below.
                </p>
              </div>

              {/* A Drive/YouTube link is fine as the "full video" link, but it
                  cannot drive an inline <video>, so those previews show nothing
                  until the file is re-uploaded here. */}
              {rehostCount > 0 && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5">
                  <p className="text-sm font-medium text-destructive">
                    {rehostCount} preview{rehostCount === 1 ? "" : "s"} won't play inline
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Their preview URL points at a share page (Google Drive, YouTube, Dropbox…) rather than a video
                    file, so visitors see an empty player. Upload the file with the item's own Upload button to fix it.
                    Keeping the Drive link in “Full Video Link” is fine — that one is a link, not a player.
                  </p>
                </div>
              )}

              {portfolio.map((item, i) => (
                filterCat && !tagsMatch(readTags(item), filterCat) ? null : (
                <div
                  key={item.id}
                  id={`portfolio-item-${item.id}`}
                  className={`p-6 rounded-xl bg-card border transition-colors space-y-4 ${
                    highlightedId === item.id ? 'border-primary ring-2 ring-primary/50' : item.featured ? 'border-primary/60' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleFeatured(i)}
                        className={`p-1.5 rounded-lg transition-colors ${item.featured ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
                        title={item.featured ? "Remove from landing page" : "Show on landing page"}
                      >
                        <Star className={`w-5 h-5 ${item.featured ? 'fill-primary' : ''}`} />
                      </button>
                      <span className="text-sm font-medium text-foreground">{item.title || "Untitled"}</span>
                      {needsRehosting(item.video_url) && (
                        <span
                          title="This preview URL is a share page, not a video file, so it cannot play inline. Re-upload the file here."
                          className="rounded-full border border-destructive/50 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-destructive"
                        >
                          {videoSourceLabel(item.video_url)}
                        </span>
                      )}
                    </div>
                    {item.featured && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        On Landing Page
                      </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Title" value={item.title} onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], title: v }; setPortfolio(u); }} />
                    <InputField label="Client" value={item.client_name || ""} onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], client_name: v }; setPortfolio(u); }} />
                    <SelectField label="Preview length" value={String(item.preview_seconds || 30)} onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], preview_seconds: Number(v) }; setPortfolio(u); }} options={[{ value: "30", label: "30 seconds" }, { value: "60", label: "60 seconds" }]} />
                    <SelectField label="Aspect ratio" value={item.aspect_ratio || "16:9"} onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], aspect_ratio: v }; setPortfolio(u); }} options={ASPECT_RATIOS.map((r) => ({ value: r.slug, label: r.label }))} />
                    <InputField label="Sort Order" value={String(item.sort_order || 0)} onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], sort_order: parseInt(v) || 0 }; setPortfolio(u); }} />
                  </div>
                  <CategoryTagsEditor tags={readTags(item)} onChange={(tags) => { const u = [...portfolio]; u[i] = { ...u[i], category_tags: tags, category_slug: tags[0]?.category || null, subcategory_slug: tags[0]?.subcategory || null }; setPortfolio(u); }} />
                  <InputField label="Description" value={item.description || ""} onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], description: v }; setPortfolio(u); }} textarea />

                  {/* Video Upload / URL */}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">Video</label>
                    {item.video_url && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-border aspect-video max-w-sm">
                        <video src={item.video_url} className="w-full h-full object-cover" preload="metadata" controls />
                      </div>
                    )}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                          uploadingIndex === i
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-accent text-accent-foreground hover:bg-accent/80'
                        }`}>
                          {compressing?.key === `portfolio-${i}` ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Compressing {Math.round(compressing.progress * 100)}%</>
                          ) : uploadingIndex === i ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                          ) : (
                            <><Upload className="w-4 h-4" /> Upload Video</>
                          )}
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            className="hidden"
                            disabled={uploadingIndex === i}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVideoUpload(i, file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                        <span className="text-xs text-muted-foreground">Up to {MAX_SOURCE_VIDEO_SIZE_MB}MB, MP4/WebM/MOV. Large or 4K files are compressed for the web automatically.</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex-1 h-px bg-border" />
                        <span>OR paste a video URL</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <InputField
                        label=""
                        value={item.video_url || ""}
                        onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], video_url: v }; setPortfolio(u); }}
                      />
                    </div>
                  </div>



                  <InputField
                    label="Full Video Link (Google Drive, YouTube, Vimeo, etc.)"
                    value={item.full_video_url || ""}
                    placeholder="https://drive.google.com/file/d/..."
                    onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], full_video_url: v }; setPortfolio(u); }}
                  />

                  <div className="flex gap-2">
                    <SaveButton onClick={() => savePortfolioItem(portfolio[i])} />
                    <DeleteButton onClick={() => deletePortfolioItem(item.id)} />
                  </div>
                 </div>
                )
              ))}
            </div>
          )}

          {activeSection === "categories" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold">Categories</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The shared taxonomy every layout and category page is built from. Add a niche here and it
                  appears in the tag picker and on the site without a code change.
                </p>
              </div>

              {/* New top-level category */}
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Add a top-level category</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <InputField
                    label="Label"
                    value={newCategory.label}
                    placeholder="e.g. 3D Animation"
                    onChange={(v) => setNewCategory((prev) => ({ ...prev, label: v }))}
                  />
                  <InputField
                    label="Slug (used in URLs, cannot change later)"
                    value={newCategory.slug}
                    placeholder={newCategory.label ? slugify(newCategory.label) : "e.g. 3d-animation"}
                    onChange={(v) => setNewCategory((prev) => ({ ...prev, slug: v }))}
                  />
                  <button
                    onClick={() => addTaxonomyRow(null, newCategory.label, newCategory.slug)}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                  >
                    <Plus className="h-4 w-4" /> Add
                  </button>
                </div>
              </div>

              {taxonomy.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No categories stored yet. The site is falling back to its built-in list until you add some.
                </p>
              )}

              {taxonomy
                .filter((row) => !row.parent_category)
                .sort((a, b) => orderOf(a) - orderOf(b))
                .map((parent, pi) => {
                  const subs = taxonomy
                    .filter((row) => row.parent_category === parent.slug)
                    .sort((a, b) => orderOf(a) - orderOf(b));
                  const draft = newSub[parent.slug] || { label: "", slug: "" };
                  const parentIndex = taxonomy.findIndex((r) => r.id === parent.id);
                  return (
                    <div key={parent.id} className="space-y-4 rounded-xl border border-border bg-card p-6">
                      <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto_auto] sm:items-end">
                        <InputField
                          label="Label"
                          value={parent.label}
                          onChange={(v) => { const next = [...taxonomy]; next[parentIndex] = { ...parent, label: v }; setTaxonomy(next); }}
                        />
                        <InputField
                          label="Blurb"
                          value={parent.blurb || ""}
                          onChange={(v) => { const next = [...taxonomy]; next[parentIndex] = { ...parent, blurb: v }; setTaxonomy(next); }}
                        />
                        <InputField
                          label="Order"
                          value={String(parent.sort_order ?? pi + 1)}
                          onChange={(v) => { const next = [...taxonomy]; next[parentIndex] = { ...parent, sort_order: v }; setTaxonomy(next); }}
                        />
                        <div className="flex gap-2">
                          <SaveButton onClick={() => saveTaxonomyRow(taxonomy[parentIndex])} />
                          <DeleteButton onClick={() => deleteTaxonomyRow(parent)} />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Slug <code className="rounded bg-muted px-1.5 py-0.5">{parent.slug}</code> · {taxonomyUsage(parent)} video(s) tagged
                      </p>

                      <div className="space-y-2 border-t border-border pt-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Sub-categories ({subs.length})
                        </p>
                        {subs.map((sub) => {
                          const subIndex = taxonomy.findIndex((r) => r.id === sub.id);
                          return (
                            <div key={sub.id} className="grid gap-2 rounded-lg border border-border/60 bg-background/40 p-3 sm:grid-cols-[1fr_2fr_auto_auto] sm:items-end">
                              <InputField
                                label="Label"
                                value={sub.label}
                                onChange={(v) => { const next = [...taxonomy]; next[subIndex] = { ...sub, label: v }; setTaxonomy(next); }}
                              />
                              <InputField
                                label="Blurb"
                                value={sub.blurb || ""}
                                onChange={(v) => { const next = [...taxonomy]; next[subIndex] = { ...sub, blurb: v }; setTaxonomy(next); }}
                              />
                              <InputField
                                label="Order"
                                value={String(sub.sort_order ?? 0)}
                                onChange={(v) => { const next = [...taxonomy]; next[subIndex] = { ...sub, sort_order: v }; setTaxonomy(next); }}
                              />
                              <div className="flex gap-2">
                                <SaveButton onClick={() => saveTaxonomyRow(taxonomy[subIndex])} />
                                <DeleteButton onClick={() => deleteTaxonomyRow(sub)} />
                              </div>
                            </div>
                          );
                        })}

                        <div className="grid gap-2 pt-1 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                          <InputField
                            label="New sub-category label"
                            value={draft.label}
                            placeholder="e.g. 2D"
                            onChange={(v) => setNewSub((prev) => ({ ...prev, [parent.slug]: { ...draft, label: v } }))}
                          />
                          <InputField
                            label="Slug"
                            value={draft.slug}
                            placeholder={draft.label ? slugify(draft.label) : "e.g. 2d"}
                            onChange={(v) => setNewSub((prev) => ({ ...prev, [parent.slug]: { ...draft, slug: v } }))}
                          />
                          <button
                            onClick={() => addTaxonomyRow(parent.slug, draft.label, draft.slug)}
                            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-primary/40 px-4 text-sm font-medium text-primary"
                          >
                            <Plus className="h-4 w-4" /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {activeSection === "layouts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold">User Layouts</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Manage identity and cinematic hero media. All layouts share one video library.</p>
                </div>
                <button onClick={addLayout} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"><Plus className="h-4 w-4" /> Add Layout</button>
              </div>
              {layouts.map((layout, i) => (
                <div key={layout.id} className="space-y-5 rounded-xl border border-border bg-card p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField label="URL username" value={layout.username} onChange={() => {}} />
                    <InputField label="Display name" value={layout.display_name} onChange={(v) => { const next = [...layouts]; next[i] = { ...layout, display_name: v }; setLayouts(next); }} />
                    <InputField label="Theme" value={layout.theme} onChange={(v) => { const next = [...layouts]; next[i] = { ...layout, theme: v }; setLayouts(next); }} />
                    <SelectField label="Hero media type" value={layout.hero_media_type || "video"} onChange={(v) => { const next = [...layouts]; next[i] = { ...layout, hero_media_type: v }; setLayouts(next); }} options={[{ value: "video", label: "Video" }, { value: "image", label: "Image" }]} />
                  </div>
                  <InputField label="Tagline" value={layout.tagline || ""} onChange={(v) => { const next = [...layouts]; next[i] = { ...layout, tagline: v }; setLayouts(next); }} />
                  <InputField label="Hero media URL" value={layout.hero_media_url || ""} onChange={(v) => { const next = [...layouts]; next[i] = { ...layout, hero_media_url: v }; setLayouts(next); }} />
                  {layout.hero_media_url && (
                    <div className="aspect-video max-w-xl overflow-hidden rounded-lg border border-border bg-background">
                      {layout.hero_media_type === "image" ? <img src={layout.hero_media_url} alt="Hero preview" className="h-full w-full object-cover" /> : <video src={layout.hero_media_url} controls className="h-full w-full object-cover" />}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
                      {compressing?.key === `hero-${layout.id}` ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Compressing {Math.round(compressing.progress * 100)}%</>
                      ) : heroUploading === layout.id ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><Upload className="h-4 w-4" /> Replace Hero</>
                      )}
                      <input type="file" accept="video/*,image/*" className="hidden" disabled={heroUploading === layout.id} onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadHeroMedia(i, file); e.target.value = ""; }} />
                    </label>
                    <SaveButton onClick={() => saveLayout(layout)} />
                  </div>

                  {/* 4-layer cinematic parallax hero, optional. Leave any of
                      these blank and that layer is simply skipped, the single
                      Hero media above still works as the fallback. */}
                  <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Cinematic parallax hero (optional, 4 clips)</p>
                    <InputField
                      label="Layer 4 — Intro reveal (plays once on load)"
                      value={layout.hero_parallax_urls?.intro || ""}
                      onChange={(v) => { const next = [...layouts]; next[i] = { ...layout, hero_parallax_urls: { ...layout.hero_parallax_urls, intro: v } }; setLayouts(next); }}
                    />
                    <InputField
                      label="Layer 1 — Background (slowest)"
                      value={layout.hero_parallax_urls?.back || ""}
                      onChange={(v) => { const next = [...layouts]; next[i] = { ...layout, hero_parallax_urls: { ...layout.hero_parallax_urls, back: v } }; setLayouts(next); }}
                    />
                    <InputField
                      label="Layer 2 — Midground"
                      value={layout.hero_parallax_urls?.mid || ""}
                      onChange={(v) => { const next = [...layouts]; next[i] = { ...layout, hero_parallax_urls: { ...layout.hero_parallax_urls, mid: v } }; setLayouts(next); }}
                    />
                    <InputField
                      label="Layer 3 — Foreground (fastest)"
                      value={layout.hero_parallax_urls?.front || ""}
                      onChange={(v) => { const next = [...layouts]; next[i] = { ...layout, hero_parallax_urls: { ...layout.hero_parallax_urls, front: v } }; setLayouts(next); }}
                    />
                    <p className="text-xs text-muted-foreground">Paste the hosted clip URLs here (or upload them to storage the same way you upload portfolio videos, then paste the public URL). Fill in as many as you have, don't need all 4 to see it work.</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Testimonials */}
          {activeSection === "testimonials" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-display font-bold">Testimonials</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Each profile has its own reviews now, they no longer share one pool.</p>
                </div>
                <button onClick={addTestimonial} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium">
                  <Plus className="w-4 h-4" /> Add Testimonial
                </button>
              </div>

              <div className="flex gap-2">
                {(["caleb", "faith", "daniel"] as const).map((profile) => (
                  <button
                    key={profile}
                    onClick={() => setTestimonialProfile(profile)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      testimonialProfile === profile ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {profile}
                  </button>
                ))}
              </div>

              {testimonials.filter((t) => t.username === testimonialProfile).length === 0 && (
                <p className="text-sm text-muted-foreground">No testimonials for {testimonialProfile} yet. Add one above.</p>
              )}

              {testimonials.map((item, i) => (
                item.username !== testimonialProfile ? null : (
                <div key={item.id} className="p-6 rounded-xl bg-card border border-border space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Client Name" value={item.client_name} onChange={(v) => { const u = [...testimonials]; u[i] = { ...u[i], client_name: v }; setTestimonials(u); }} />
                    <InputField label="Client Title" value={item.client_title || ""} onChange={(v) => { const u = [...testimonials]; u[i] = { ...u[i], client_title: v }; setTestimonials(u); }} />
                  </div>
                  <InputField label="Content" value={item.content} onChange={(v) => { const u = [...testimonials]; u[i] = { ...u[i], content: v }; setTestimonials(u); }} textarea />
                  <SelectField
                    label="Profile"
                    value={item.username}
                    onChange={(v) => { const u = [...testimonials]; u[i] = { ...u[i], username: v }; setTestimonials(u); }}
                    options={[{ value: "caleb", label: "Caleb" }, { value: "faith", label: "Faith" }, { value: "daniel", label: "Daniel" }]}
                  />
                  <div className="flex gap-2">
                    <SaveButton onClick={() => saveTestimonial(testimonials[i])} />
                    <DeleteButton onClick={() => deleteTestimonial(item.id)} />
                  </div>
                </div>
                )
              ))}
            </div>
          )}

          {/* Messages */}
          {activeSection === "messages" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Contact Messages</h2>
              {messages.length === 0 && <p className="text-muted-foreground">No messages yet.</p>}
              {messages.map((msg) => (
                <div key={msg.id} className="p-6 rounded-xl bg-card border border-border space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{msg.name}</div>
                      <div className="text-sm text-primary">{msg.email}</div>
                    </div>
                    <button onClick={() => deleteMessage(msg.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {msg.subject && <div className="text-sm font-medium text-foreground">{msg.subject}</div>}
                  <p className="text-muted-foreground text-sm">{msg.message}</p>
                  <div className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}

          {/* Settings */}
          {activeSection === "settings" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold">Account Settings</h2>
              <div className="p-6 rounded-xl bg-card border border-border space-y-4">
                <InputField label="New Email" value={newEmail} onChange={setNewEmail} placeholder="Leave blank to keep current" />
                <InputField label="New Password" value={newPassword} onChange={setNewPassword} placeholder="Leave blank to keep current" type="password" />
                <SaveButton onClick={updateCredentials} label="Update Credentials" />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Reusable components
const InputField = ({ label, value, onChange, textarea, rows, placeholder, type }: {
  label: string; value: string; onChange: (v: string) => void;
  textarea?: boolean; rows?: number; placeholder?: string; type?: string;
}) => (
  <div>
    <label className="text-sm text-muted-foreground mb-1.5 block">{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows || 4}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none text-sm"
      />
    ) : (
      <input
        type={type || "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
      />
    )}
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder, disabled }: {
  label: string; value: string; onChange: (value: string) => void;
  options: { value: string; label: string }[]; placeholder?: string; disabled?: boolean;
}) => (
  <div>
    <label className="mb-1.5 block text-sm text-muted-foreground">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground transition-colors focus:border-primary/50 focus:outline-none disabled:opacity-50">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </div>
);

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <Icon className="mb-4 h-5 w-5 text-primary" />
    <div className="font-display text-3xl font-bold">{value.toLocaleString()}</div>
    <div className="mt-1 text-sm text-muted-foreground">{label}</div>
  </div>
);

const AnalyticsList = ({ title, rows, empty = "No data yet.", rawLabels = false }: { title: string; rows: [string, number][]; empty?: string; rawLabels?: boolean }) => (
  <div className="rounded-xl border border-border bg-card p-6">
    <h3 className="font-display font-semibold">{title}</h3>
    {rows.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">{empty}</p> : (
      <div className="mt-5 space-y-3">
        {rows.slice(0, 6).map(([label, count]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 text-sm last:border-0">
            <span className={`text-muted-foreground ${rawLabels ? "truncate" : "capitalize"}`}>{rawLabels ? label : label.replace(/-/g, " ")}</span>
            <span className="shrink-0 font-mono text-primary">{count}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const SaveButton = ({ onClick, label }: { onClick: () => void; label?: string }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:shadow-[var(--shadow-glow)] transition-all">
    <Save className="w-4 h-4" /> {label || "Save"}
  </button>
);

const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-2 px-5 py-2.5 bg-destructive/10 text-destructive text-sm font-medium rounded-lg hover:bg-destructive/20 transition-all">
    <Trash2 className="w-4 h-4" /> Delete
  </button>
);

export default AdminDashboard;
