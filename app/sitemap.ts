import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.humphreywedding.co.uk",
      lastModified: new Date("2026-08-06T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
