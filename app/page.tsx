import { RevealProvider } from "@/components/RevealProvider";
import { Hero } from "@/components/Hero";
import { ExperienceStage } from "@/components/ExperienceStage";
import { MainReveal } from "@/components/MainReveal";

export default function Home() {
  return (
    <RevealProvider>
      <Hero />
      <ExperienceStage />
      <MainReveal />
    </RevealProvider>
  );
}
