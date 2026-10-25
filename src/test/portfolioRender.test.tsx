import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { PortfolioItem } from "@/hooks/usePortfolioItems";

// The grid is pure presentation; nothing here should need the network.
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: () => ({ select: () => ({ order: () => Promise.resolve({ data: [] }) }) }) },
}));

import PortfolioGrid from "@/components/PortfolioGrid";
import ServicesSection from "@/components/ServicesSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";

const base: PortfolioItem = {
  id: "1",
  title: "Hosted Preview",
  video_url: "https://x.supabase.co/storage/v1/object/public/portfolio-videos/a.mp4",
  category_slug: "ai-video",
  subcategory_slug: "ugc",
};

const posterOnly: PortfolioItem = {
  id: "2",
  title: "Drive Hosted Film",
  video_url: null,
  thumbnail_url: "https://x.supabase.co/storage/v1/object/public/portfolio-videos/posters/2.jpg",
  full_video_url: "https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9I0jKlMnOpQrStUv/view",
  category_slug: "video-editing",
  subcategory_slug: "wedding",
};

const bare: PortfolioItem = { id: "3", title: "No Media Yet" };

const inRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("PortfolioGrid", () => {
  it("renders every item, whichever card each one routes to", () => {
    inRouter(<PortfolioGrid items={[base, posterOnly, bare]} />);
    expect(screen.getByText("Hosted Preview")).toBeInTheDocument();
    expect(screen.getByText("Drive Hosted Film")).toBeInTheDocument();
    expect(screen.getByText("No Media Yet")).toBeInTheDocument();
  });

  it("sends a poster-only item to the poster card, not an empty player", () => {
    inRouter(<PortfolioGrid items={[posterOnly]} />);
    expect(screen.getByLabelText("Play Drive Hosted Film")).toBeInTheDocument();
  });

  it("still renders an item with no media at all rather than dropping it", () => {
    inRouter(<PortfolioGrid items={[bare]} />);
    expect(screen.getByText("No Media Yet")).toBeInTheDocument();
  });

  it("says so when a category is genuinely empty", () => {
    inRouter(<PortfolioGrid items={[]} />);
    expect(screen.getByText(/no videos in this category yet/i)).toBeInTheDocument();
  });
});

describe("ServicesSection", () => {
  it("renders saved tiers, and falls back when given none", () => {
    const { unmount } = inRouter(
      <ServicesSection tiers={[{ name: "Reels", from: "£200", summary: "s", includes: ["a"] }]} />,
    );
    expect(screen.getByText("Reels")).toBeInTheDocument();
    unmount();
    inRouter(<ServicesSection />);
    expect(screen.getByText("Social cutdowns")).toBeInTheDocument();
  });
});

describe("BeforeAfterSection", () => {
  it("hides itself without two frames, rather than comparing one with itself", () => {
    const { container, unmount } = inRouter(<BeforeAfterSection />);
    expect(container).toBeEmptyDOMElement();
    unmount();
    inRouter(
      <BeforeAfterSection pair={{ label: "Grade", note: "n", beforeUrl: "/b.jpg", afterUrl: "/a.jpg" }} />,
    );
    expect(screen.getByText("Before and after")).toBeInTheDocument();
  });
});
