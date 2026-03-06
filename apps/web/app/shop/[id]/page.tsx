import { notFound }            from "next/navigation";
import type { Metadata }       from "next";
import { Navbar }              from "@/components/Navbar";
import { FooterSection }       from "@/components/FooterSection";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import type { ApiProductDetail, ApiProduct } from "@/lib/products";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function fetchProduct(
  slug: string,
): Promise<{ product: ApiProductDetail; related: ApiProduct[] } | null> {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success) return null;
    return json.data as { product: ApiProductDetail; related: ApiProduct[] };
  } catch {
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchProduct(id);
  if (!data) return { title: "Product Not Found – Hanami" };
  const { product } = data;
  return {
    title:       `${product.nameEn} (${product.nameVi}) – Hanami`,
    description: product.descriptionEn?.[0],
    openGraph: {
      title:       `${product.nameEn} – Hanami Wedding Flower Lamps`,
      description: product.descriptionEn?.[0],
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
  const data = await fetchProduct(id);
  if (!data) notFound();

  return (
    <>
      <Navbar />
      <ProductDetailClient product={data.product} related={data.related} />
      <FooterSection />
    </>
  );
}
