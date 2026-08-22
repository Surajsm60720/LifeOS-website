import styles from "./SketchPulseRow.module.css";

const DAY_X = [24, 54, 84, 114, 144, 174, 204];

/**
 * Daily resets ticking off one after another along a week, with a
 * weekly reset landing on top once the week completes — two different
 * cadences overlaid on the same timeline, the way the card's own copy
 * distinguishes "dailies" from "weeklies" rather than treating every
 * reset as the same beat.
 */
export function SketchPulseRow({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 228 100" fill="none">
        <line className={styles.rail} x1="20" y1="70" x2="208" y2="70" strokeWidth="2" />
        {DAY_X.map((x) => (
          <line key={x} className={styles.dayTick} x1={x} y1="65" x2={x} y2="75" strokeWidth="1.6" />
        ))}
        {DAY_X.map((x, i) => (
          <circle
            key={x}
            className={styles.daily}
            cx={x}
            cy="46"
            r="7"
            style={{ "--delay": `${i * 0.1}s` } as React.CSSProperties}
          />
        ))}
        <path className={styles.weekly} d="M204 20L214 30L204 40L194 30Z" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
