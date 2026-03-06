import { Navbar }              from "@/components/Navbar";
import { HeroSection }         from "@/components/HeroSection";
import { FeaturesSection }     from "@/components/FeaturesSection";
import { AboutSection }        from "@/components/AboutSection";
import { ShopSection }         from "@/components/ShopSection";
import { GallerySection }      from "@/components/GallerySection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactSection }      from "@/components/ContactSection";
import { FooterSection }       from "@/components/FooterSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <ShopSection />
        <GallerySection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <FooterSection />
    </>
  );
}
