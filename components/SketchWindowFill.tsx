import styles from "./SketchWindowFill.module.css";

/**
 * A single window travelling through the tab's own three buckets —
 * Starting Soon, Active Now (filling as it runs), Recently Ended — the
 * actual lifecycle the card names, rather than one generic bar.
 */
export function SketchWindowFill({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 220 100" fill="none">
        <rect className={styles.zone} x="14" y="30" width="58" height="40" rx="10" strokeDasharray="4 4" />
        <rect className={styles.zone} x="81" y="30" width="58" height="40" rx="10" />
        <rect className={`${styles.zone} ${styles.ended}`} x="148" y="30" width="58" height="40" rx="10" />

        <rect className={styles.activeFill} x="86" y="35" height="30" rx="6" />

        <g className={styles.token}>
          <circle cx="43" cy="50" r="8" />
        </g>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
