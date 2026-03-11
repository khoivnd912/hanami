import type { Metadata } from "next";
import { Navbar }         from "@/components/Navbar";
import { FooterSection }  from "@/components/FooterSection";
import { ShopPageClient } from "@/components/ShopPageClient";
import { apiFetch }       from "@/lib/fetch";
import type { ApiProduct } from "@/lib/products";

export const metadata: Metadata = {
  title:       "Bộ Sưu Tập Đèn Hoa Cưới",
  description: "Khám phá bộ sưu tập đèn hoa cưới thủ công của Hanami – đèn ngủ hoa cưới lưu giữ từng kỷ niệm. Mỗi sản phẩm là hoa cưới được bảo quản trong ánh sáng ấm áp, giao hàng toàn quốc.",
  keywords:    ["đèn hoa cưới", "đèn ngủ hoa cưới", "lưu giữ hoa cưới", "bộ sưu tập đèn cưới", "mua đèn hoa cưới"],
  alternates:  { canonical: "/shop" },
  openGraph: {
    title:       "Bộ Sưu Tập Đèn Hoa Cưới – Hanami Flower",
    description: "Đèn hoa cưới thủ công – lưu giữ hoa cưới trong ánh sáng ấm áp. Đặt hàng đèn ngủ hoa cưới theo yêu cầu.",
    url:         "https://hanamiflower.vn/shop",
  },
};

const PAGE_SIZE = 8;

export default async function ShopPage() {
  const data = await apiFetch<{ items: ApiProduct[]; total: number }>(`/products?page=1&limit=${PAGE_SIZE}`);
  const { items, total } = data ?? { items: [] as ApiProduct[], total: 0 };

  return (
    <>
      <Navbar />
      <ShopPageClient initialProducts={items} initialTotal={total} />
      <FooterSection />
    </>
  );
}
