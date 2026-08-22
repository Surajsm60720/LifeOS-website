import styles from "./SketchLoopMarker.module.css";

const MONTH_TICKS = [30, 84, 138, 192];

/**
 * A fixed-length occurrence bracket sliding steadily across a timeline
 * of evenly-spaced month markers, never landing on them — the card's
 * own distinction ("a live cycle, not a calendar-month approximation")
 * shown as a visible drift rather than a loop that could just as easily
 * be any repeating thing.
 */
export function SketchLoopMarker({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 220 90" fill="none">
        <line className={styles.rail} x1="14" y1="55" x2="206" y2="55" strokeWidth="1.6" />
        {MONTH_TICKS.map((x) => (
          <line key={x} className={styles.monthTick} x1={x} y1="45" x2={x} y2="65" strokeWidth="1.8" />
        ))}
        <g className={styles.bracket} strokeWidth="2.8">
          <path d="M20 32C16.5 32 14 34.5 14 38L14 42" />
          <path d="M14 68L14 72C14 75.5 16.5 78 20 78" />
          <path d="M70 32C73.5 32 76 34.5 76 38L76 42" />
          <path d="M76 68L76 72C76 75.5 73.5 78 70 78" />
        </g>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
