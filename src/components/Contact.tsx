import { getProfile } from "@/services/portfolioService";
import Reveal from "./Reveal";
import { GitHubIcon, GmailIcon, InstagramIcon, LinkedInIcon } from "./icons";

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

          {/* Every channel is the same icon button — 48px square, so they stay
              comfortable tap targets and read as one set. Email leads the row;
              the address lives in the label and title rather than on screen,
              so a long address can never overflow on a phone. */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10">
            <a
              href={`mailto:${profile.email}`}
              aria-label={`Email ${profile.email}`}
              title={profile.email}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-accent hover:text-accent-ink"
            >
              <GmailIcon className="h-[18px] w-[18px]" />
            </a>

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
        </Reveal>
      </div>
    </section>
  );
}
