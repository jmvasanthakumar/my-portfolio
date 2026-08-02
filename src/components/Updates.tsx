import { getUpdates } from "@/services/portfolioService";
import { formatFullDate } from "@/lib/date";
import Reveal from "./Reveal";

export default async function Updates() {
  const updates = await getUpdates();

  return (
    <section id="updates" className="py-16 sm:py-24 lg:py-32">
      <div className="section-container">
        <Reveal>
          <p className="font-mono text-sm text-accent-ink">04. Now</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Latest Updates
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            A running log of what I&apos;ve been up to recently — new roles,
            certifications, and things I&apos;m learning.
          </p>
        </Reveal>

        <div className="mt-10 space-y-4 sm:mt-14">
          {updates.map((update, i) => (
            <Reveal key={update.id} delay={i * 0.06}>
              <div className="glass-card flex flex-col gap-2 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
                <div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-ink">
                    {update.tag}
                  </span>
                  <h3 className="mt-3 text-base font-semibold sm:text-lg">
                    {update.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted sm:text-base">
                    {update.description}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {formatFullDate(update.date)}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
