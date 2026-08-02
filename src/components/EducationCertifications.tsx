import { getEducation, getCertifications } from "@/services/portfolioService";
import { formatFullDate } from "@/lib/date";
import Reveal from "./Reveal";

export default async function EducationCertifications() {
  const [education, certifications] = await Promise.all([
    getEducation(),
    getCertifications(),
  ]);

  return (
    <section
      id="education"
      className="bg-background-alt py-16 sm:py-24 lg:py-32"
    >
      <div className="section-container grid gap-10 md:grid-cols-2 md:gap-12">
        <div>
          <Reveal>
            <p className="font-mono text-sm text-accent-ink">05. Education</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Education & Certifications
            </h2>
          </Reveal>

          <div className="mt-8 space-y-4">
            {education.map((edu, i) => (
              <Reveal key={edu.id} delay={i * 0.08}>
                <div className="glass-card rounded-2xl p-5 sm:p-6">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="mt-1 text-sm text-muted">{edu.institution}</p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {edu.period}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-6 flex flex-wrap gap-2">
              {certifications.certifications.map((cert) => (
                <span
                  key={cert.id}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted"
                >
                  {cert.name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <div>
          <Reveal delay={0.1}>
            <p className="font-mono text-sm text-accent-ink">Recognition</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Highlights
            </h2>
          </Reveal>

          <div className="mt-8 space-y-4">
            {certifications.recognitions.map((rec, i) => (
              <Reveal key={rec.id} delay={0.15 + i * 0.08}>
                <div className="glass-card rounded-2xl p-5 sm:p-6">
                  <p>{rec.title}</p>
                  <p className="mt-2 font-mono text-xs text-muted">
                    {formatFullDate(rec.date + "-01")}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
