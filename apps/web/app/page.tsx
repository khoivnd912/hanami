import { Navbar }              from "@/components/Navbar";
import { HeroSection }         from "@/components/HeroSection";
import { FeaturesSection }     from "@/components/FeaturesSection";
import { AboutSection }        from "@/components/AboutSection";
import { ShopSection }         from "@/components/ShopSection";
import { GallerySection }      from "@/components/GallerySection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ContactSection }      from "@/components/ContactSection";
import { FooterSection }       from "@/components/FooterSection";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id":   "https://hanamiflower.vn/#business",
      name:          "Hanami Flower",
      description:   "Chuyên đèn hoa cưới thủ công – lưu giữ hoa cưới trong ánh sáng ấm áp. Đèn ngủ hoa cưới độc đáo cho cặp đôi Việt Nam.",
      url:           "https://hanamiflower.vn",
      telephone:     "+84901234567",
      priceRange:    "₫₫",
      image:         "https://hanamiflower.vn/og-image.jpg",
      address: {
        "@type":           "PostalAddress",
        streetAddress:     "12 Hoa Hồng Lane",
        addressLocality:   "Tây Hồ",
        addressRegion:     "Hà Nội",
        addressCountry:    "VN",
      },
      geo: {
        "@type":     "GeoCoordinates",
        latitude:    21.0585,
        longitude:   105.8174,
      },
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "18:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "09:00", closes: "16:00" },
      ],
      sameAs: ["https://www.instagram.com/hanamiflower.vn"],
    },
    {
      "@type": "WebSite",
      "@id":   "https://hanamiflower.vn/#website",
      url:     "https://hanamiflower.vn",
      name:    "Hanami Flower – Đèn Hoa Cưới",
      inLanguage: "vi",
      publisher: { "@id": "https://hanamiflower.vn/#business" },
      potentialAction: {
        "@type":       "SearchAction",
        target:        "https://hanamiflower.vn/shop?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
