import { notFound }            from "next/navigation";
import type { Metadata }       from "next";
import { Navbar }              from "@/components/Navbar";
import { FooterSection }       from "@/components/FooterSection";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { apiFetch }            from "@/lib/fetch";
import type { ApiProductDetail, ApiProduct } from "@/lib/products";

type ProductPageData = { product: ApiProductDetail; related: ApiProduct[] };

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await apiFetch<ProductPageData>(`/products/${id}`);
  if (!data) return { title: "Không tìm thấy sản phẩm" };
  const { product } = data;
  const desc = `${product.descriptionVi?.[0] ?? product.descriptionEn?.[0] ?? ""} – Đèn hoa cưới thủ công, lưu giữ hoa cưới Hanami.`;
  const images = product.imageUrl ? [{ url: product.imageUrl, alt: product.nameVi }] : [];
  return {
    title:       `${product.nameVi} – Đèn Hoa Cưới`,
    description: desc,
    keywords:    ["đèn hoa cưới", "lưu giữ hoa cưới", "đèn ngủ hoa cưới", product.nameVi, product.nameEn],
    alternates:  { canonical: `/shop/${product.slug}` },
    openGraph: {
      title:       `${product.nameVi} (${product.nameEn}) – Đèn Hoa Cưới Hanami`,
      description: desc,
      url:         `https://hanamiflower.vn/shop/${product.slug}`,
      images,
    },
    twitter: {
      card:        "summary_large_image",
      title:       `${product.nameVi} – Hanami Flower`,
      description: product.descriptionVi?.[0] ?? product.descriptionEn?.[0],
      images:      images.map((i) => i.url),
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await apiFetch<ProductPageData>(`/products/${id}`);
  if (!data) notFound();

  const { product } = data;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "Product",
    name:        product.nameVi,
    alternateName: product.nameEn,
    description: product.descriptionVi?.[0] ?? product.descriptionEn?.[0],
    image:       product.imageUrl ?? undefined,
    brand: { "@type": "Brand", name: "Hanami Flower" },
    offers: {
      "@type":       "Offer",
      priceCurrency: "VND",
      price:          product.price,
      availability:   product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url:            `https://hanamiflower.vn/shop/${product.slug}`,
      seller: { "@type": "Organization", name: "Hanami Flower" },
    },
    category: "Đèn hoa cưới",
    keywords:  "đèn hoa cưới, lưu giữ hoa cưới, đèn ngủ hoa cưới",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <ProductDetailClient product={data.product} related={data.related} />
      <FooterSection />
    </>
  );
}
