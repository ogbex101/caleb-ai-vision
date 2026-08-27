import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Save, Trash2, Plus, MessageSquare, Mail, Settings, ChevronDown, ChevronUp, Upload, Star, Loader2, BarChart3, Eye, Copy, Users, Image as ImageIcon } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { CATEGORIES, getCategory } from "@/lib/categories";

type SectionName = "analytics" | "hero" | "about" | "techStack" | "portfolio" | "layouts" | "testimonials" | "messages" | "settings";

const MAX_VIDEO_SIZE_MB = 50;

const AdminDashboard = () => {
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

  // Upload states
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [bulkUploading, setBulkUploading] = useState<{ done: number; total: number } | null>(null);
  const [heroUploading, setHeroUploading] = useState<string | null>(null);

  // Upload target category (applied to bulk uploads + new projects) and list filter
  const [uploadCat, setUploadCat] = useState("");
  const [uploadSub, setUploadSub] = useState("");
  const [filterCat, setFilterCat] = useState("");

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
    const [h, a, t, p, te, m, l, pv, lc] = await Promise.all([
      supabase.from("hero_section").select("*").limit(1).single(),
      supabase.from("about_section").select("*").limit(1).single(),
      supabase.from("tech_stack").select("*").order("sort_order"),
      supabase.from("portfolio_items").select("*").order("sort_order"),
      supabase.from("testimonials").select("*").order("sort_order"),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("site_layouts").select("*").order("created_at"),
      supabase.from("page_views").select("*").order("created_at", { ascending: false }).limit(5000),
      supabase.from("link_copies").select("*").order("created_at", { ascending: false }).limit(5000),
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
    const { data } = await supabase.from("tech_stack").insert({ name: "New Tool", description: "Description", sort_order: techStack.length + 1 }).select().single();
    if (data) setTechStack([...techStack, data]);
  };

  // Portfolio video upload
  const handleVideoUpload = async (index: number, file: File) => {
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      toast({ title: `Video must be under ${MAX_VIDEO_SIZE_MB}MB`, variant: "destructive" });
      return;
    }

    setUploadingIndex(index);
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
      .upload(filePath, file, { cacheControl: '3600', upsert: true, contentType: file.type });

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
    const { error } = await supabase.from("portfolio_items").update({
      title: item.title, description: item.description, client_name: item.client_name,
      category: item.category, featured: item.featured, video_url: item.video_url,
      full_video_url: item.full_video_url, sort_order: item.sort_order,
      category_slug: item.category_slug || null, subcategory_slug: item.subcategory_slug || null,
      preview_seconds: item.preview_seconds || 30,
    }).eq("id", item.id);
    toast({ title: error ? "Failed to save" : `${item.title} updated!`, variant: error ? "destructive" : "default" });
  };

  // Bulk upload: one portfolio item per file, filename becomes the title
  const handleBulkUpload = async (files: FileList) => {
    const arr = Array.from(files);
    const valid = arr.filter((f) => {
      if (f.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        toast({ title: `Skipped ${f.name}: over ${MAX_VIDEO_SIZE_MB}MB`, variant: "destructive" });
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;

    setBulkUploading({ done: 0, total: valid.length });
    const created: any[] = [];
    let baseOrder = portfolio.length;

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      const title = file.name.replace(/\.[^/.]+$/, "");

      const { data: newRow, error: insErr } = await supabase
        .from("portfolio_items")
        .insert({ title, description: "", client_name: "", category: getCategory(uploadCat)?.label || "", category_slug: uploadCat || null, subcategory_slug: uploadSub || null, preview_seconds: 30, sort_order: ++baseOrder })
        .select()
        .single();
      if (insErr || !newRow) {
        toast({ title: `Failed to create row for ${file.name}`, variant: "destructive" });
        setBulkUploading({ done: i + 1, total: valid.length });
        continue;
      }

      const ext = file.name.split(".").pop();
      const filePath = `${newRow.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("portfolio-videos")
        .upload(filePath, file, { cacheControl: "3600", upsert: true, contentType: file.type });

      if (upErr) {
        toast({ title: `Upload failed for ${file.name}: ${upErr.message}`, variant: "destructive" });
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
    const { data } = await supabase.from("portfolio_items").insert({
      title: "New Project", description: "Project description", client_name: "Client",
      category: getCategory(uploadCat)?.label || "", category_slug: uploadCat || null,
      subcategory_slug: uploadSub || null, preview_seconds: 30, sort_order: portfolio.length + 1,
    }).select().single();
    if (data) setPortfolio([...portfolio, data]);
  };

  const saveLayout = async (layout: any) => {
    const { error } = await supabase.from("site_layouts").update({
      display_name: layout.display_name,
      theme: layout.theme,
      tagline: layout.tagline,
      hero_media_url: layout.hero_media_url || null,
      hero_media_type: layout.hero_media_type,
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

  const uploadHeroMedia = async (index: number, file: File) => {
    if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
      toast({ title: `Hero media must be under ${MAX_VIDEO_SIZE_MB}MB`, variant: "destructive" });
      return;
    }
    const layout = layouts[index];
    setHeroUploading(layout.id);
    const ext = file.name.split(".").pop() || (file.type.startsWith("image/") ? "jpg" : "mp4");
    const path = `heroes/${layout.username}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("portfolio-videos").upload(path, file, { contentType: file.type, upsert: true });
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

  const saveTestimonial = async (item: any) => {
    const { error } = await supabase.from("testimonials").update({
      client_name: item.client_name, client_title: item.client_title, content: item.content, rating: item.rating,
    }).eq("id", item.id);
    toast({ title: error ? "Failed to save" : "Testimonial updated!", variant: error ? "destructive" : "default" });
  };

  const deleteTestimonial = async (id: string) => {
    await supabase.from("testimonials").delete().eq("id", id);
    setTestimonials(testimonials.filter((t) => t.id !== id));
    toast({ title: "Testimonial removed" });
  };

  const addTestimonial = async () => {
    const { data } = await supabase.from("testimonials").insert({
      client_name: "New Client", client_title: "Title", content: "Testimonial text", sort_order: testimonials.length + 1,
    }).select().single();
    if (data) setTestimonials([...testimonials, data]);
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
    { key: "testimonials", label: "Testimonials", icon: MessageSquare },
    { key: "messages", label: "Messages", icon: Mail },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const uniqueVisitors = new Set(pageViews.map((view) => view.visitor_id).filter(Boolean)).size;
  const countBy = (rows: any[], key: string) => Object.entries(rows.reduce<Record<string, number>>((acc, row) => {
    const value = row[key] || "Unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1]);
  const categoryViews = countBy(pageViews.filter((view) => view.category_slug), "category_slug");
  const layoutViews = countBy(pageViews, "username");
  const sourceViews = countBy(pageViews, "source");
  const copiedCategories = countBy(linkCopies, "category_slug");

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
              <div>
                <h2 className="text-2xl font-display font-bold">Portfolio Analytics</h2>
                <p className="mt-1 text-sm text-muted-foreground">Views and link activity recorded across every user layout.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard icon={Eye} label="Total views" value={pageViews.length} />
                <StatCard icon={Users} label="Unique visitors" value={uniqueVisitors} />
                <StatCard icon={Copy} label="Links copied" value={linkCopies.length} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
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
                    {bulkUploading ? (
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
                  <button onClick={addPortfolioItem} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium">
                    <Plus className="w-4 h-4" /> Add Project
                  </button>
                </div>
              </div>

              {/* Upload target + list filter */}
              <div className="grid gap-4 md:grid-cols-3 p-5 rounded-xl bg-card border border-border">
                <SelectField
                  label="Upload into category"
                  value={uploadCat}
                  onChange={(v) => { setUploadCat(v); setUploadSub(""); }}
                  options={CATEGORIES.map((c) => ({ value: c.slug, label: c.label }))}
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
                  options={CATEGORIES.map((c) => ({ value: c.slug, label: c.label }))}
                  placeholder="All categories"
                />
                <p className="md:col-span-3 text-xs text-muted-foreground">
                  New projects and every bulk-uploaded file are tagged with the category above automatically — you can still change any item individually below.
                </p>
              </div>

              {portfolio.map((item, i) => (
                filterCat && item.category_slug !== filterCat ? null : (
                <div key={item.id} className={`p-6 rounded-xl bg-card border transition-colors space-y-4 ${item.featured ? 'border-primary/60' : 'border-border'}`}>
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
                    <SelectField label="Top-level category" value={item.category_slug || ""} onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], category_slug: v, subcategory_slug: "", category: getCategory(v)?.label || "" }; setPortfolio(u); }} options={CATEGORIES.map((category) => ({ value: category.slug, label: category.label }))} placeholder="Choose a category" />
                    <SelectField label="Sub-category" value={item.subcategory_slug || ""} onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], subcategory_slug: v }; setPortfolio(u); }} options={(getCategory(item.category_slug)?.subcategories || []).map((sub) => ({ value: sub.slug, label: sub.label }))} placeholder={item.category_slug ? "All sub-categories" : "Choose category first"} disabled={!item.category_slug} />
                    <SelectField label="Preview length" value={String(item.preview_seconds || 30)} onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], preview_seconds: Number(v) }; setPortfolio(u); }} options={[{ value: "30", label: "30 seconds" }, { value: "60", label: "60 seconds" }]} />
                    <InputField label="Sort Order" value={String(item.sort_order || 0)} onChange={(v) => { const u = [...portfolio]; u[i] = { ...u[i], sort_order: parseInt(v) || 0 }; setPortfolio(u); }} />
                  </div>
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
                          {uploadingIndex === i ? (
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
                        <span className="text-xs text-muted-foreground">Max {MAX_VIDEO_SIZE_MB}MB • MP4, WebM, MOV</span>
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
              ))}
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
                      {heroUploading === layout.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Replace Hero
                      <input type="file" accept="video/*,image/*" className="hidden" disabled={heroUploading === layout.id} onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadHeroMedia(i, file); e.target.value = ""; }} />
                    </label>
                    <SaveButton onClick={() => saveLayout(layout)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Testimonials */}
          {activeSection === "testimonials" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold">Testimonials</h2>
                <button onClick={addTestimonial} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-medium">
                  <Plus className="w-4 h-4" /> Add Testimonial
                </button>
              </div>
              {testimonials.map((item, i) => (
                <div key={item.id} className="p-6 rounded-xl bg-card border border-border space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField label="Client Name" value={item.client_name} onChange={(v) => { const u = [...testimonials]; u[i] = { ...u[i], client_name: v }; setTestimonials(u); }} />
                    <InputField label="Client Title" value={item.client_title || ""} onChange={(v) => { const u = [...testimonials]; u[i] = { ...u[i], client_title: v }; setTestimonials(u); }} />
                  </div>
                  <InputField label="Content" value={item.content} onChange={(v) => { const u = [...testimonials]; u[i] = { ...u[i], content: v }; setTestimonials(u); }} textarea />
                  <div className="flex gap-2">
                    <SaveButton onClick={() => saveTestimonial(testimonials[i])} />
                    <DeleteButton onClick={() => deleteTestimonial(item.id)} />
                  </div>
                </div>
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

const AnalyticsList = ({ title, rows, empty = "No data yet." }: { title: string; rows: [string, number][]; empty?: string }) => (
  <div className="rounded-xl border border-border bg-card p-6">
    <h3 className="font-display font-semibold">{title}</h3>
    {rows.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">{empty}</p> : (
      <div className="mt-5 space-y-3">
        {rows.slice(0, 6).map(([label, count]) => (
          <div key={label} className="flex items-center justify-between border-b border-border/60 pb-3 text-sm last:border-0">
            <span className="capitalize text-muted-foreground">{label.replace(/-/g, " ")}</span>
            <span className="font-mono text-primary">{count}</span>
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
