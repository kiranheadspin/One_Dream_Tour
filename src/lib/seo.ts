const FALLBACK_SITE_URL = "http://localhost:3000";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL;

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
