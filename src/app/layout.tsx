import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { GlobalLoadingIndicator } from "@/components/app/loading-overlay";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "One Dream Cup 2026–27 | Corporate Cricket Tournament",
    template: "%s | One Dream Cup",
  },
  description:
    "Enter your company team in the One Dream Cup corporate tennis-ball cricket tournament across Bangalore, Chennai, Hyderabad and Pune, with the road to Goa finals.",
  applicationName: "One Dream Cup",
  keywords: ["corporate cricket tournament", "corporate cricket Bangalore", "corporate cricket Chennai", "corporate cricket Hyderabad", "corporate cricket Pune", "tennis-ball cricket tournament", "One Dream Cup"],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "One Dream Cup",
    title: "One Dream Cup 2026–27 | Corporate Cricket Tournament",
    description: "Corporate cricket across four cities. One road to Goa.",
    images: [{ url: "/images/one-dream-cup-hero.png", width: 1200, height: 630, alt: "One Dream Cup corporate cricket tournament" }],
  },
  twitter: { card: "summary_large_image", title: "One Dream Cup 2026–27 | Corporate Cricket Tournament", description: "Corporate cricket across four cities. One road to Goa.", images: ["/images/one-dream-cup-hero.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Suspense fallback={null}>
          <GlobalLoadingIndicator />
        </Suspense>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
