import { getProfile } from "@/services/portfolioService";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Updates from "@/components/Updates";
import EducationCertifications from "@/components/EducationCertifications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";

export default async function Home() {
  const profile = await getProfile();

  return (
    <>
      <StructuredData />
      <Nav name={profile.name} />
      <main>
        <Hero />
        <Experience />
        <Projects />
        <Skills />
        <Updates />
        <EducationCertifications />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
