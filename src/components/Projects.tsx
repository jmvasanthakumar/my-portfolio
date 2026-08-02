import { getProjects } from "@/services/portfolioService";
import Reveal from "./Reveal";

export default async function Projects() {
  const projects = await getProjects();

  return (
    <section id="projects" className="py-24 sm:py-32">
      <div className="section-container">
        <Reveal>
          <p className="font-mono text-sm text-accent-ink">02. Work</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Key Projects
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={i * 0.06}>
              <article className="glass-card group h-full rounded-2xl p-6 transition-colors hover:border-accent/40 sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-lg font-semibold sm:text-xl">
                    {project.name}
                  </h3>
                  <span className="font-mono text-xs text-muted">
                    {project.period}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {project.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {project.bullets.map((bullet, bi) => (
                    <li key={bi} className="flex gap-3 text-sm text-muted">
                      <span className="text-accent-ink">▸</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
