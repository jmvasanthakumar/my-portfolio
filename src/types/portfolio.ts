export interface Profile {
  name: string;
  title: string;
  /**
   * Canonical origin of the deployed site, no trailing slash. Everything
   * SEO-facing (canonical URL, sitemap, robots, OG tags) derives from this —
   * change it here and nowhere else.
   */
  siteUrl: string;
  tagline: string;
  location: string;
  email: string;
  linkedin: string;
  instagram: string;
  yearsOfExperience: number;
  /**
   * Personal photo, already compressed and served from `/public` — this is
   * what every visitor loads first.
   */
  avatarUrl: string;
  /**
   * Full-resolution original, served from blob storage (never copied into
   * the repo). Layered over `avatarUrl` after load, and only on a fast
   * connection with a large enough frame — see `HeroScene`. It must go
   * through `next/image` so the optimizer resamples it: letting the browser
   * squeeze the multi-megapixel original down in one step speckles it.
   */
  avatarHdUrl: string;
  resumeUrl: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: string[];
}

export interface Project {
  id: string;
  name: string;
  period: string;
  technologies: string[];
  description: string;
  bullets: string[];
}

export interface Skills {
  technical: string[];
  functional: string[];
  domain: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  period: string;
}

export interface Certification {
  id: string;
  name: string;
}

export interface Recognition {
  id: string;
  title: string;
  date: string;
}

export interface CertificationsData {
  certifications: Certification[];
  recognitions: Recognition[];
}

export interface Update {
  id: string;
  date: string;
  tag: string;
  title: string;
  description: string;
}
