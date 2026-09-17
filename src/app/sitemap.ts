import type { MetadataRoute } from "next";
import { TOURNAMENT } from "@/lib/constants";
import { publicPages } from "@/lib/public-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const lastModified = new Date("2026-09-14");
  const routes = ["", "cities", "faq", ...Object.keys(publicPages), ...TOURNAMENT.cities.map((city) => `cities/${city.toLowerCase()}`)];
  return [...new Set(routes)].map((route) => ({
    url: `${base}/${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "cities" || route.startsWith("cities/") ? 0.8 : route === "faq" || route === "tournament" || route === "road-to-goa" ? 0.7 : route === "privacy" || route === "terms" || route === "refund-policy" ? 0.3 : 0.6,
  }));
}
