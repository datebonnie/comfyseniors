import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://comfyseniors.com";
  const supabase = createClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/match`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/for-facilities`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  // Facility pages
  let facilityPages: MetadataRoute.Sitemap = [];
  try {
    const allSlugs: { slug: string; updated_at: string }[] = [];
    for (let offset = 0; offset < 2000; offset += 1000) {
      const { data } = await supabase
        .from("facilities")
        .select("slug, updated_at")
        .range(offset, offset + 999);
      if (data) allSlugs.push(...(data as { slug: string; updated_at: string }[]));
    }

    facilityPages = allSlugs.map((f) => ({
      url: `${baseUrl}/facility/${f.slug}`,
      lastModified: new Date(f.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Skip if Supabase unavailable
  }

  // City pages
  let cityPages: MetadataRoute.Sitemap = [];
  try {
    const allCities: { city: string }[] = [];
    for (let offset = 0; offset < 2000; offset += 1000) {
      const { data } = await supabase
        .from("facilities")
        .select("city")
        .not("city", "is", null)
        .range(offset, offset + 999);
      if (data) allCities.push(...(data as { city: string }[]));
    }

    const uniqueCities = Array.from(new Set(allCities.map((r) => r.city).filter(Boolean)));
    cityPages = uniqueCities.map((city) => ({
      url: `${baseUrl}/cities/${city.toLowerCase().replace(/\s+/g, "-")}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Skip
  }

  // Care type pages
  const careTypePages: MetadataRoute.Sitemap = [
    "assisted-living",
    "memory-care",
    "independent-living",
    "nursing-home",
    "home-care",
    "hospice",
  ].map((slug) => ({
    url: `${baseUrl}/care-types/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...facilityPages, ...cityPages, ...careTypePages];
}
