import { getProfile } from "@/services/portfolioService";

export default async function Footer() {
  const profile = await getProfile();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8">
      <div className="section-container text-center text-sm text-muted">
        <p>
          © {year} {profile.name}
        </p>
      </div>
    </footer>
  );
}
