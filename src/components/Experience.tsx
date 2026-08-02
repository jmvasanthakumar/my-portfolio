import { getExperience } from "@/services/portfolioService";
import { formatMonthYear } from "@/lib/date";
import Reveal from "./Reveal";

export default async function Experience() {
  const experience = await getExperience();

  return (
    <section
      id="experience"
      className="bg-background-alt py-16 sm:py-24 lg:py-32"
    >
      <div className="section-container">
        <Reveal>
          <p className="font-mono text-sm text-accent-ink">01. Journey</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Experience
          </h2>
        </Reveal>

        <div className="relative mt-10 space-y-8 border-l border-border pl-6 sm:mt-14 sm:space-y-10 sm:pl-10">
          {experience.map((role, i) => (
            <Reveal key={role.id} delay={i * 0.08}>
              <div className="relative">
                <span
                  className={`absolute -left-[calc(1.5rem+5px)] top-1.5 h-3 w-3 rounded-full sm:-left-[calc(2.5rem+5px)] ${
                    role.current ? "bg-accent" : "bg-border"
                  }`}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-lg font-semibold sm:text-xl">
                    {role.role}{" "}
                    <span className="font-normal text-muted">
                      · {role.company}
                    </span>
                  </h3>
                  <span className="font-mono text-xs text-muted sm:text-sm">
                    {formatMonthYear(role.startDate)} —{" "}
                    {role.current ? "Present" : formatMonthYear(role.endDate)}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-muted">
                  {role.bullets.map((bullet, bi) => (
                    <li key={bi} className="flex gap-3 text-sm sm:text-base">
                      <span className="text-accent-ink">▸</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
