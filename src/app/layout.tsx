import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getProfile } from "@/services/portfolioService";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Let the page paint under the notch/home indicator on phones; the layout
  // uses svh units so nothing important lands there.
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const title = `${profile.name} — ${profile.title}`;

  return {
    // Everything below resolves relative URLs (OG images, canonical) against
    // this, so it has to be the real deployed origin — it comes from
    // profile.json's siteUrl.
    metadataBase: new URL(profile.siteUrl),
    title: {
      default: title,
      template: `%s — ${profile.name}`,
    },
    description: profile.tagline,
    applicationName: `${profile.name} — Portfolio`,
    authors: [{ name: profile.name, url: profile.siteUrl }],
    creator: profile.name,
    publisher: profile.name,
    keywords: [
      profile.name,
      ...profile.alternateNames,
      profile.title,
      `${profile.name} software engineer`,
      "software engineer portfolio",
      "backend engineer",
      "web developer",
      "Next.js",
      "TypeScript",
      profile.location,
    ],
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "profile",
      url: "/",
      siteName: `${profile.name} — Portfolio`,
      title,
      description: profile.tagline,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: profile.tagline,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        // Let Google use full-size image previews and untruncated snippets.
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "technology",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
