import styles from "./FeatureSection.module.css";
import type { FeatureSection as FeatureSectionData } from "@/lib/content";
import { MediaSlot } from "./MediaSlot";

export function FeatureSection({ section }: { section: FeatureSectionData }) {
  return (
    <section className={styles.section} id={section.id} tabIndex={section.id ? -1 : undefined}>
      <div className={styles.head}>
        <p className="eyebrow">{section.eyebrow}</p>
        <h2>{section.heading}</h2>
        {section.lede && <p>{section.lede}</p>}
      </div>
      <div className={styles.list}>
        {section.cards.map((card) => (
          <div className={styles.row} key={card.title}>
            <span className={styles.tag}>
              <i className={styles.dot} style={{ background: `var(${card.dotVar})` }} />
              {card.tag}
            </span>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
            <MediaSlot />
          </div>
        ))}
      </div>
    </section>
  );
}
