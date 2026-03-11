import { PRODUCTS, type ApiProduct } from "@/lib/products";
import { apiFetch } from "@/lib/fetch";
import { ShopSectionClient } from "./ShopSectionClient";

export async function ShopSection() {
  const products = await apiFetch<ApiProduct[]>("/products/featured") ??
    PRODUCTS.slice(0, 4).map((p) => ({
      _id:           p.id,
      slug:          p.id,
      nameVi:        p.nameVi,
      nameEn:        p.nameEn,
      price:         p.price,
      originalPrice: p.originalPrice,
      tag:           p.tag,
      gradient:      p.gradient,
    }));
  return <ShopSectionClient products={products} />;
}
