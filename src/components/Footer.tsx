import { getProfile } from "@/services/portfolioService";

export default async function Footer() {
  const profile = await getProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8">
      <div className="section-container flex flex-col items-center justify-between gap-2 text-sm text-muted sm:flex-row">
        <p>
          © {year} {profile.name}
        </p>
        <p>Built with Next.js</p>
      </div>
    </footer>
  );
}
