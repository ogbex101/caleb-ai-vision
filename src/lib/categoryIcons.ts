import {
  AudioLines, BookOpen, Building2, Camera, Clapperboard, Film, GraduationCap, Heart,
  Megaphone, MessageSquareQuote, Mic, MonitorPlay, Music, PartyPopper, Presentation,
  Scissors, Shapes, Shirt, ShoppingBag, Smartphone, Sparkles, Tag, Video, Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * An icon per niche, so a visitor scanning for the kind of video they want
 * reads a picture before a label. Keyed on slug, because the taxonomy now
 * lives in the database: a niche added from the admin dashboard simply gets
 * the fallback until a slug is added here, which is why nothing depends on
 * every slug being present.
 */
const ICONS: Record<string, LucideIcon> = {
  // Top-level categories
  "ai-video": Sparkles,
  "video-editing": Scissors,

  // Niches, shared across both categories
  "talking-head": Mic,
  ugc: Smartphone,
  podcast: AudioLines,
  "b-roll": Film,
  "reels-shorts": MonitorPlay,
  "long-form": Clapperboard,
  "product-ads": ShoppingBag,
  faceless: Megaphone,
  explainer: GraduationCap,
  documentary: BookOpen,
  vlog: Video,
  testimonial: MessageSquareQuote,
  event: PartyPopper,
  "music-video": Music,
  fashion: Shirt,
  corporate: Building2,
  trailer: Zap,
  bts: Camera,
  "motion-graphics": Shapes,
  wedding: Heart,
};

/** Fallbacks differ so an unmapped category still reads as a category. */
export const categoryIcon = (slug?: string | null): LucideIcon =>
  (slug && ICONS[slug]) || Presentation;

export const nicheIcon = (slug?: string | null): LucideIcon =>
  (slug && ICONS[slug]) || Tag;

/** The right icon for a hit whose kind is already known. */
export const iconForKind = (kind: "category" | "subcategory" | "video", slug?: string | null) => {
  if (kind === "video") return Video;
  return kind === "category" ? categoryIcon(slug) : nicheIcon(slug);
};
