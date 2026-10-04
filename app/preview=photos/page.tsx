import type { Metadata } from "next";

import PhotoGallery from "@/components/PhotoGallery";

export const metadata: Metadata = {
  title: "Share Wedding Photos | Benjamin & Chloe",
  description: "Share and view photographs from Benjamin and Chloe's wedding.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PhotoPreviewPage() {
  return (
    <main className="min-h-screen bg-[#181818]">
      <PhotoGallery forceOpen previewUploads />
    </main>
  );
}
