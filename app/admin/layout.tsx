import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Dashboard | Benjamin & Chloe",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-admin-page className="min-w-0 overflow-x-clip">
      {children}
    </div>
  );
}
