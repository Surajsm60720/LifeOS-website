"use client";

import styles from "./MainReveal.module.css";
import { useReveal } from "./RevealProvider";
import { ContentPage } from "./ContentPage";
import { FeatureSection } from "./FeatureSection";
import { SpecList } from "./SpecList";
import { DeliberatelyAbsent } from "./DeliberatelyAbsent";
import { contentPages } from "@/lib/content";

export function MainReveal() {
  const { contentVisible } = useReveal();
  return (
    <main className={`${styles.main} ${contentVisible ? styles.revealed : ""}`}>
      {contentPages.map((page) => (
        <ContentPage key={page.label} label={page.label}>
          {page.blocks.map((block, i) => {
            if (block.kind === "feature") {
              return <FeatureSection section={block.section} key={block.section.heading} />;
            }
            if (block.kind === "spec") return <SpecList key={`spec-${i}`} />;
            return <DeliberatelyAbsent key={`absent-${i}`} />;
          })}
        </ContentPage>
      ))}
    </main>
  );
}
