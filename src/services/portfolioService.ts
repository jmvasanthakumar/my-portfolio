import profileData from "@/data/profile.json";
import experienceData from "@/data/experience.json";
import projectsData from "@/data/projects.json";
import skillsData from "@/data/skills.json";
import educationData from "@/data/education.json";
import certificationsData from "@/data/certifications.json";
import updatesData from "@/data/updates.json";
import type {
  Profile,
  Experience,
  Project,
  Skills,
  Education,
  CertificationsData,
  Update,
} from "@/types/portfolio";

/**
 * Single access point for all portfolio content.
 *
 * Every component reads data through these functions instead of importing
 * JSON directly. Today they resolve from local JSON files; swapping to a
 * real API later (e.g. `fetch("/api/profile")`) only requires editing the
 * function bodies here — no component changes needed.
 */

export async function getProfile(): Promise<Profile> {
  return profileData as Profile;
}

export async function getExperience(): Promise<Experience[]> {
  return experienceData as Experience[];
}

export async function getProjects(): Promise<Project[]> {
  return projectsData as Project[];
}

export async function getSkills(): Promise<Skills> {
  return skillsData as Skills;
}

export async function getEducation(): Promise<Education[]> {
  return educationData as Education[];
}

export async function getCertifications(): Promise<CertificationsData> {
  return certificationsData as CertificationsData;
}

export async function getUpdates(): Promise<Update[]> {
  const updates = updatesData as Update[];
  return [...updates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
