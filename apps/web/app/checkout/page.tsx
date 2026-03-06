import type { Metadata } from "next";
import { Navbar }        from "@/components/Navbar";
import { FooterSection } from "@/components/FooterSection";
import { CheckoutClient } from "@/components/CheckoutClient";

export const metadata: Metadata = {
  title: "Thanh toán – Hanami",
  description:
    "Hoàn tất đơn hàng của bạn tại Hanami — đèn hoa cưới thủ công bảo quản hoa tươi.",
};

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <CheckoutClient />
      <FooterSection />
    </>
  );
}
