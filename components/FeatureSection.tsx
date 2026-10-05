import styles from "./FeatureSection.module.css";
import type { FeatureSection as FeatureSectionData } from "@/lib/content";
import { SketchFaceID } from "./SketchFaceID";
import { SketchDynamicIsland } from "./SketchDynamicIsland";
import { SketchHeatGrid } from "./SketchHeatGrid";
import { SketchMapPin } from "./SketchMapPin";
import { SketchSwipeRow } from "./SketchSwipeRow";
import { SketchDurationBar } from "./SketchDurationBar";
import { SketchPulseRow } from "./SketchPulseRow";
import { SketchPityRamp } from "./SketchPityRamp";
import { SketchQuietProgress } from "./SketchQuietProgress";
import { SketchWindowFill } from "./SketchWindowFill";
import { SketchLoopMarker } from "./SketchLoopMarker";
import { SketchBlockStack } from "./SketchBlockStack";
import { SketchQuotaRing } from "./SketchQuotaRing";
import { SketchSplitReceipt } from "./SketchSplitReceipt";
import { SketchFileArrow } from "./SketchFileArrow";
import { SketchMarkdownLines } from "./SketchMarkdownLines";
import { SketchGitBranch } from "./SketchGitBranch";
import { SketchTerminal } from "./SketchTerminal";
import { SketchNoCloud } from "./SketchNoCloud";
import { Reveal } from "./Reveal";

function cardMedia(card: FeatureSectionData["cards"][number]) {
  switch (card.sketch) {
    case "faceid":
      return <SketchFaceID caption={card.sketchCaption} />;
    case "dynamicIsland":
      return <SketchDynamicIsland caption={card.sketchCaption} />;
    case "heatGrid":
      return <SketchHeatGrid caption={card.sketchCaption} />;
    case "mapPin":
      return <SketchMapPin caption={card.sketchCaption} />;
    case "swipeRow":
      return <SketchSwipeRow caption={card.sketchCaption} />;
    case "durationBar":
      return <SketchDurationBar caption={card.sketchCaption} />;
    case "pulseRow":
      return <SketchPulseRow caption={card.sketchCaption} />;
    case "pityRamp":
      return <SketchPityRamp caption={card.sketchCaption} />;
    case "quietProgress":
      return <SketchQuietProgress caption={card.sketchCaption} />;
    case "windowFill":
      return <SketchWindowFill caption={card.sketchCaption} />;
    case "loopMarker":
      return <SketchLoopMarker caption={card.sketchCaption} />;
    case "blockStack":
      return <SketchBlockStack caption={card.sketchCaption} />;
    case "quotaRing":
      return <SketchQuotaRing caption={card.sketchCaption} />;
    case "splitReceipt":
      return <SketchSplitReceipt caption={card.sketchCaption} />;
    case "fileArrow":
      return <SketchFileArrow caption={card.sketchCaption} />;
    case "markdownLines":
      return <SketchMarkdownLines caption={card.sketchCaption} />;
    case "gitBranch":
      return <SketchGitBranch caption={card.sketchCaption} />;
    case "terminal":
      return <SketchTerminal caption={card.sketchCaption} />;
    case "noCloud":
      return <SketchNoCloud caption={card.sketchCaption} />;
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
        {section.cards.map((card) => (
          <Reveal key={card.title} className={styles.row}>
            <div className={styles.text}>
              <span className={styles.tag}>
                <i className={styles.dot} style={{ background: `var(${card.dotVar})` }} />
                {card.tag}
              </span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
              {card.link && (
                <a className={styles.link} href={card.link.href} target="_blank" rel="noopener">
                  {card.link.label}
                </a>
              )}
            </div>
            {cardMedia(card)}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
