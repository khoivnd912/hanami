import type { Metadata } from "next";
import { Roboto, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hanamiflower.vn"),
  title: {
    default:  "Hanami – Đèn Hoa Cưới & Đèn Ngủ Hoa Cưới Thủ Công",
    template: "%s | Hanami Flower",
  },
  description:
    "Hanami chuyên thiết kế đèn hoa cưới thủ công – lưu giữ hoa cưới trong ánh sáng ấm áp vĩnh cửu. Đèn ngủ hoa cưới độc đáo, quà tặng cưới ý nghĩa cho cặp đôi Việt Nam.",
  keywords: [
    "đèn hoa cưới",
    "lưu giữ hoa cưới",
    "đèn ngủ hoa cưới",
    "đèn hoa cưới thủ công",
    "hoa cưới bảo quản",
    "đèn trang trí bàn cưới",
    "quà tặng đám cưới",
    "wedding flower lamp",
    "preserved wedding flowers",
    "Hanami flower",
  ],
  openGraph: {
    type:        "website",
    locale:      "vi_VN",
    siteName:    "Hanami Flower",
    title:       "Hanami – Đèn Hoa Cưới & Đèn Ngủ Hoa Cưới Thủ Công",
    description: "Chuyên đèn hoa cưới thủ công – lưu giữ hoa cưới trong ánh sáng ấm áp. Đèn ngủ hoa cưới độc đáo cho cặp đôi.",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Hanami – Đèn Hoa Cưới Thủ Công",
    description: "Đèn ngủ hoa cưới – lưu giữ hoa cưới trong ánh sáng ấm áp mãi mãi.",
  },
  robots:     { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body
        className={`${roboto.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
