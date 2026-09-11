import type { MetadataRoute } from "next";
import { TOURNAMENT } from "@/lib/constants";
import { publicPages } from "@/lib/public-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes = ["", "cities", "faq", "register", ...Object.keys(publicPages), ...TOURNAMENT.cities.map((city) => `cities/${city.toLowerCase()}`)];
  return [...new Set(routes)].map((route) => ({ url: `${base}/${route}`, lastModified: new Date("2026-08-02"), changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : route === "register" ? 0.9 : 0.7 }));
}
