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
  title: "Hanami – Wedding Flower Night Lamps",
  description:
    "Handcrafted wedding flower night lamps where love blooms in light. Bespoke floral lamps designed for your most precious moments.",
  keywords: ["wedding lamps", "flower night lamp", "handcrafted", "wedding decor", "Hanami"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
