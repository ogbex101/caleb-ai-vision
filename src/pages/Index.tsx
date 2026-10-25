import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TechStackSection from "@/components/TechStackSection";
import PortfolioSection from "@/components/PortfolioSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import CategoryLinkBuilder from "@/components/CategoryLinkBuilder";
import CategorySearch from "@/components/CategorySearch";
import PremiumWorkSection from "@/components/PremiumWorkSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import ServicesSection from "@/components/ServicesSection";
import ProcessSection from "@/components/ProcessSection";
import ClientResultsSection from "@/components/ClientResultsSection";
import { readBeforeAfter, readServices } from "@/lib/siteContent";
import { usePageView } from "@/hooks/usePageView";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSiteLayoutState } from "@/hooks/usePortfolioItems";
import MaintenanceScreen from "@/components/MaintenanceScreen";

const Index = () => {
  usePageView({ username: "caleb" });
  const { layout, loading } = useSiteLayoutState("caleb");
  usePageMeta(
    layout?.seo_title || "AI Video Editing Portfolio | Cinematic Reels",
    layout?.seo_description ||
      "Cinematic AI video and editing portfolio: talking head, UGC, b-roll, reels and long-form work, organised into shareable category reels.",
  );

  if (loading) return <div className="min-h-screen bg-background" />;
  if (layout?.maintenance_mode) {
    return (
      <MaintenanceScreen
        displayName={layout.display_name || "Caleb Peters"}
        message={layout.maintenance_message}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection
        heroUrl={layout?.hero_media_url}
        isImage={layout?.hero_media_url ? layout?.hero_media_type === "image" : true}
      />
      <CategorySearch username="caleb" />
      <PremiumWorkSection />
      <ClientResultsSection />
      <AboutSection />
      <BeforeAfterSection pair={readBeforeAfter(layout?.before_after)} />
      <TechStackSection />
      <CategoryLinkBuilder username="caleb" />
      <section id="portfolio">
        <PortfolioSection />
      </section>
      <ProcessSection />
      <ServicesSection tiers={readServices(layout?.services)} />
      <section id="testimonials">
        <TestimonialsSection username="caleb" />
      </section>
      <FAQSection name="Caleb" />
      <section id="contact">
        <ContactSection email={layout?.contact_email} whatsapp={layout?.whatsapp_number} />
      </section>
      <Footer />
    </div>
  );
};

export default Index;
