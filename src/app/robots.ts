import type { MetadataRoute } from "next";
import { getProfile } from "@/services/portfolioService";

/**
 * Generates /robots.txt. Everything is crawlable except Next's internal
 * asset routes, which have no indexable content of their own.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const profile = await getProfile();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/_next/"],
    },
    sitemap: `${profile.siteUrl}/sitemap.xml`,
    host: profile.siteUrl,
  };
}
