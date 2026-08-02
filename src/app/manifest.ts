import type { MetadataRoute } from "next";
import { getProfile } from "@/services/portfolioService";

/**
 * Web app manifest. Not strictly required for indexing, but it's what gives
 * the site a proper name, icon and theme colour when someone adds it to a
 * phone home screen — and it's one of the signals Lighthouse's SEO/PWA audits
 * look for.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const profile = await getProfile();

  return {
    name: `${profile.name} — ${profile.title}`,
    short_name: profile.name.split(" ")[0],
    description: profile.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#fdfcf9",
    theme_color: "#f59e0b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
