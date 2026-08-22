import styles from "./FeatureSection.module.css";
import type { FeatureSection as FeatureSectionData } from "@/lib/content";
import { MediaSlot } from "./MediaSlot";
import { SketchFaceID } from "./SketchFaceID";
import { SketchDynamicIsland } from "./SketchDynamicIsland";
import { SketchHeatGrid } from "./SketchHeatGrid";
import { SketchMapPin } from "./SketchMapPin";
import { SketchSwipeRow } from "./SketchSwipeRow";
import { Reveal } from "./Reveal";

function cardMedia(card: FeatureSectionData["cards"][number], seed: number) {
  switch (card.sketch) {
    case "faceid":
      return <SketchFaceID caption={card.sketchCaption ?? ""} />;
    case "dynamicIsland":
      return <SketchDynamicIsland caption={card.sketchCaption ?? ""} />;
    case "heatGrid":
      return <SketchHeatGrid caption={card.sketchCaption ?? ""} />;
    case "mapPin":
      return <SketchMapPin caption={card.sketchCaption ?? ""} />;
    case "swipeRow":
      return <SketchSwipeRow caption={card.sketchCaption ?? ""} />;
    default:
      return <MediaSlot seed={seed} />;
  }
}

export function FeatureSection({ section }: { section: FeatureSectionData }) {
  return (
    <section className={styles.section} id={section.id} tabIndex={section.id ? -1 : undefined}>
      <div className={styles.head}>
        <p className="eyebrow">{section.eyebrow}</p>
        <h2>{section.heading}</h2>
        {section.lede && <p>{section.lede}</p>}
      </div>
      <div className={styles.list}>
        {section.cards.map((card, i) => (
          <Reveal key={card.title} className={styles.row}>
            <div className={styles.text}>
              <span className={styles.tag}>
                <i className={styles.dot} style={{ background: `var(${card.dotVar})` }} />
                {card.tag}
              </span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
            {cardMedia(card, i)}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
