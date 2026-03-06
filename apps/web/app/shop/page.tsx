import type { Metadata } from "next";
import { Navbar }         from "@/components/Navbar";
import { FooterSection }  from "@/components/FooterSection";
import { ShopPageClient } from "@/components/ShopPageClient";
import type { ApiProduct } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop – Hanami Wedding Flower Lamps",
  description:
    "Browse our complete collection of handcrafted wedding flower night lamps. Each piece is a preserved floral keepsake designed to glow for a lifetime.",
};

const PAGE_SIZE = 8;

async function fetchProducts(page: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
  try {
    const res = await fetch(
      `${apiUrl}/products?page=${page}&limit=${PAGE_SIZE}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`API ${res.status}`);
    const json = await res.json();
    return json.data as { items: ApiProduct[]; total: number };
  } catch (err) {
    console.error("[ShopPage] failed to fetch products:", err);
    return { items: [] as ApiProduct[], total: 0 };
  }
}

export default async function ShopPage() {
  const { items, total } = await fetchProducts(1);

  return (
    <>
      <Navbar />
      <ShopPageClient initialProducts={items} initialTotal={total} />
      <FooterSection />
    </>
  );
}
