import {
  getProfile,
  getExperience,
  getSkills,
  getEducation,
} from "@/services/portfolioService";

/**
 * schema.org JSON-LD for the site: a `Person` (who this is, what they do,
 * where they work, what they know, where else they are online) wrapped in the
 * `ProfilePage` that describes it.
 *
 * This is what lets search engines show a knowledge-panel-style result rather
 * than just a blue link, so it's built from the same service-layer data the
 * page renders — it can never drift from the visible content.
 */
export default async function StructuredData() {
  const [profile, experience, skills, education] = await Promise.all([
    getProfile(),
    getExperience(),
    getSkills(),
    getEducation(),
  ]);

  const currentRole = experience.find((role) => role.current) ?? experience[0];

  const person = {
    "@type": "Person",
    "@id": `${profile.siteUrl}/#person`,
    name: profile.name,
    jobTitle: profile.title,
    description: profile.tagline,
    email: `mailto:${profile.email}`,
    url: profile.siteUrl,
    image: `${profile.siteUrl}${profile.avatarUrl}`,
    address: {
      "@type": "PostalAddress",
      addressCountry: profile.location,
    },
    sameAs: [profile.linkedin, profile.instagram].filter(Boolean),
    knowsAbout: [
      ...skills.technical,
      ...skills.functional,
      ...skills.domain,
    ],
    ...(currentRole && {
      worksFor: {
        "@type": "Organization",
        name: currentRole.company,
      },
    }),
    alumniOf: education.map((edu) => ({
      "@type": "EducationalOrganization",
      name: edu.institution,
    })),
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${profile.siteUrl}/#profilepage`,
        url: profile.siteUrl,
        name: `${profile.name} — ${profile.title}`,
        description: profile.tagline,
        inLanguage: "en",
        mainEntity: { "@id": `${profile.siteUrl}/#person` },
        isPartOf: { "@id": `${profile.siteUrl}/#website` },
      },
      {
        "@type": "WebSite",
        "@id": `${profile.siteUrl}/#website`,
        url: profile.siteUrl,
        name: `${profile.name} — Portfolio`,
        inLanguage: "en",
        publisher: { "@id": `${profile.siteUrl}/#person` },
      },
      person,
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is data, not markup; `<` is escaped so the
      // payload can't terminate the script element early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
