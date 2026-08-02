import { getProfile } from "@/services/portfolioService";
import Reveal from "./Reveal";
import { GitHubIcon, InstagramIcon, LinkedInIcon } from "./icons";

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

          {/* Email stays a labelled pill — full width on phones, so a long
              address never overflows. The socials sit beside it as icon
              buttons, 48px square so they stay comfortable tap targets. */}
          <div className="mt-8 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center">
            <a
              href={`mailto:${profile.email}`}
              className="w-full break-all rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-contrast transition-transform hover:scale-105 sm:w-auto"
            >
              {profile.email}
            </a>

            <div className="flex items-center gap-3">
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent-ink"
              >
                <LinkedInIcon className="h-5 w-5" />
              </a>
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent-ink"
              >
                <GitHubIcon className="h-5 w-5" />
              </a>
              <a
                href={profile.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                title="Instagram"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent-ink"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
