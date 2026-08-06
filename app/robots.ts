import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/rsvp"],
    },
    sitemap: "https://www.humphreywedding.co.uk/sitemap.xml",
    host: "https://www.humphreywedding.co.uk",
  };
}
