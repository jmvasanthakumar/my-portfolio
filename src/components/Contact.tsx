import { getProfile } from "@/services/portfolioService";
import Reveal from "./Reveal";

export default async function Contact() {
  const profile = await getProfile();

  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-32">
      <div className="section-container text-center">
        <Reveal>
          <p className="font-mono text-sm text-accent-ink">06. Contact</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Let&apos;s talk
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Open to interesting conversations, opportunities, and
            collaborations. Reach out through any of the channels below.
          </p>

          {/* Full-width stacked pills on phones — comfortable tap targets and
              no risk of a long email string overflowing its pill. */}
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
            <a
              href={`mailto:${profile.email}`}
              className="break-all rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-contrast transition-transform hover:scale-105"
            >
              {profile.email}
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent-ink"
            >
              LinkedIn
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
