import { RevealProvider } from "@/components/RevealProvider";
import { Hero } from "@/components/Hero";
import { ExperienceStage } from "@/components/ExperienceStage";
import { MainReveal } from "@/components/MainReveal";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <RevealProvider>
      <Hero />
      <ExperienceStage />
      <MainReveal />
      <Footer />
    </RevealProvider>
  );
}
