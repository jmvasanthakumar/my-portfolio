export interface Profile {
  name: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  yearsOfExperience: number;
  /** Personal photo — a blob/CDN URL, swappable without touching components. */
  avatarUrl: string;
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
