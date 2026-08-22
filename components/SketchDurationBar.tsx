import styles from "./SketchDurationBar.module.css";

/**
 * A single event block stretching from a short, timed sliver to a
 * full-width all-day bar and back — the IRL card's own range ("minutes
 * through 365 days, with an end date") rather than a calendar
 * screenshot. Width is animated directly as an SVG geometry property,
 * not a CSS transform, so nothing else on the bar has to be
 * counter-scaled to avoid distortion.
 */
export function SketchDurationBar({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 200 100" fill="none">
        <line className={styles.rail} x1="20" y1="70" x2="180" y2="70" strokeWidth="2" />
        <line className={styles.tick} x1="180" y1="62" x2="180" y2="78" strokeWidth="2.4" />
        <rect className={styles.bar} x="24" y="55" width="26" height="26" rx="8" />
        <g className={styles.clock} strokeWidth="2.2">
          <circle cx="30" cy="52" r="9" />
          <path d="M30 46L30 52L35 55" />
        </g>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
