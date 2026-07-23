import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RSVP | Benjamin & Chloe",
  description: "Respond to Benjamin and Chloe's wedding invitation.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

export default function RSVPLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
