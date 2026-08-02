import type { MetadataRoute } from "next";
import { getProfile, getUpdates } from "@/services/portfolioService";

/**
 * Generates /sitemap.xml. The site is a single indexable page — the sections
 * are anchors on it, not routes, and listing anchors as separate URLs would
 * just report duplicates to crawlers. `lastModified` tracks the newest entry
 * in the updates feed, which is the only content that changes regularly.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [profile, updates] = await Promise.all([getProfile(), getUpdates()]);

  // getUpdates() returns newest-first.
  const lastModified = updates[0]?.date
    ? new Date(updates[0].date)
    : new Date();

  return [
    {
      url: profile.siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
