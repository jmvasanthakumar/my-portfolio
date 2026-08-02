import Image from "next/image";
import { getAbout } from "@/services/portfolioService";
import Reveal from "./Reveal";

export default async function About() {
  const about = await getAbout();

  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="section-container">
        <Reveal>
          <p className="font-mono text-sm text-accent-ink">06. About</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {about.headline}
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <Reveal delay={0.1}>
            <div className="glass-card relative aspect-square w-full max-w-xs overflow-hidden rounded-2xl">
              <Image
                src={about.photoUrl}
                alt="About me"
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div className="space-y-10">
            <Reveal delay={0.15}>
              <div className="space-y-4 text-base leading-relaxed text-muted sm:text-lg">
                {about.bio.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
                  Beyond work
                </h3>
                <div className="flex flex-wrap gap-3">
                  {about.interests.map((interest) => (
                    <span
                      key={interest.label}
                      className="glass-card flex items-center gap-2 rounded-full px-4 py-2 text-sm"
                    >
                      <span aria-hidden>{interest.emoji}</span>
                      {interest.label}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.25}>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
                  What I value
                </h3>
                <ul className="space-y-2 text-muted">
                  {about.values.map((value, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-accent-ink">▸</span>
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
                  Fun facts
                </h3>
                <ul className="space-y-2 text-muted">
                  {about.funFacts.map((fact, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-accent-2-ink">✦</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
