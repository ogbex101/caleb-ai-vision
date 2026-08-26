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
import { usePageView } from "@/hooks/usePageView";

const Index = () => {
  usePageView({ username: "caleb" });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TechStackSection />
      <CategoryLinkBuilder username="caleb" />
      <section id="portfolio">
        <PortfolioSection />
      </section>
      <section id="testimonials">
        <TestimonialsSection />
      </section>
      <FAQSection name="Caleb" />
      <section id="contact">
        <ContactSection />
      </section>
      <Footer />
    </div>
  );
};

export default Index;
