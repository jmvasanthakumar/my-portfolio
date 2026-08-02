import { getSkills } from "@/services/portfolioService";
import Reveal from "./Reveal";

const GROUPS: { key: keyof Awaited<ReturnType<typeof getSkills>>; label: string }[] = [
  { key: "technical", label: "Technical" },
  { key: "functional", label: "Functional" },
  { key: "domain", label: "Domain" },
];

export default async function Skills() {
  const skills = await getSkills();

  return (
    <section id="skills" className="bg-background-alt py-16 sm:py-24 lg:py-32">
      <div className="section-container">
        <Reveal>
          <p className="font-mono text-sm text-accent-ink">03. Toolkit</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Skills
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-3 sm:gap-8">
          {GROUPS.map((group, i) => (
            <Reveal key={group.key} delay={i * 0.1}>
              <div className="glass-card h-full rounded-2xl p-5 sm:p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-accent-ink">
                  {group.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills[group.key].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border px-3 py-1.5 text-sm text-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
