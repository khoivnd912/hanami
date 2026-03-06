import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hanami Admin",
  description: "Trang quản trị hệ thống Hanami",
  robots: "noindex,nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${roboto.variable} antialiased`}>{children}</body>
    </html>
  );
}
