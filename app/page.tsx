import { RevealProvider } from "@/components/RevealProvider";
import { Hero } from "@/components/Hero";
import { ExperienceStage } from "@/components/ExperienceStage";
import { MainReveal } from "@/components/MainReveal";
import { FeatureSection } from "@/components/FeatureSection";
import { SpecList } from "@/components/SpecList";
import { DeliberatelyAbsent } from "@/components/DeliberatelyAbsent";
import { Footer } from "@/components/Footer";
import { featureSections } from "@/lib/content";

export default function Home() {
  return (
    <RevealProvider>
      <Hero />
      <ExperienceStage />
      <MainReveal>
        {featureSections.map((section) => (
          <FeatureSection section={section} key={section.heading} />
        ))}
        <SpecList />
        <DeliberatelyAbsent />
      </MainReveal>
      <Footer />
    </RevealProvider>
  );
}
