import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://humphreywedding.co.uk"),
  title: "Benjamin & Chloe | 19 December 2026",
  description:
    "Join Benjamin and Chloe as they celebrate their wedding on 19 December 2026.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Benjamin & Chloe | 19 December 2026",
    description:
      "Join Benjamin and Chloe as they celebrate their wedding on 19 December 2026.",
    siteName: "Benjamin & Chloe",
    locale: "en_GB",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${cormorant.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
