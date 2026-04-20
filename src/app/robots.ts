import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/for-facilities/dashboard",
          "/api/",
          "/staff",
          "/match",
          "/unsubscribe",
          "/auth/",
        ],
      },
    ],
    sitemap: "https://comfyseniors.com/sitemap.xml",
  };
}
