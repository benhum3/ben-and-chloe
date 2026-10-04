import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://www.humphreywedding.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Benjamin and Chloe — 19 December 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Benjamin & Chloe | 19 December 2026",
    description:
      "Join Benjamin and Chloe as they celebrate their wedding on 19 December 2026.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#f8f6f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
