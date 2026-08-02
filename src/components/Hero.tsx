import { getProfile } from "@/services/portfolioService";
import HeroScene from "./HeroScene";

export default async function Hero() {
  const profile = await getProfile();

  return (
    <section id="top" className="relative">
      <HeroScene
        name={profile.name}
        title={profile.title}
        tagline={profile.tagline}
        yearsOfExperience={profile.yearsOfExperience}
        avatarUrl={profile.avatarUrl}
        avatarHdUrl={profile.avatarHdUrl}
      />
    </section>
  );
}
