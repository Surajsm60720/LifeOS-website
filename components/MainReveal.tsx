"use client";

import styles from "./MainReveal.module.css";
import { useReveal } from "./RevealProvider";
import { ContentPage } from "./ContentPage";
import { FeatureSection } from "./FeatureSection";
import { contentPages } from "@/lib/content";

export function MainReveal() {
  const { contentVisible } = useReveal();
  return (
    <main className={`${styles.main} ${contentVisible ? styles.revealed : ""}`}>
      {contentPages.map((page) => (
        <ContentPage key={page.label} label={page.label}>
          {page.sections.map((section) => (
            <FeatureSection section={section} key={section.heading} />
          ))}
        </ContentPage>
      ))}
    </main>
  );
}
