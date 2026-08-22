import styles from "./SketchDynamicIsland.module.css";

/**
 * The Island itself actually widening — its width is animated as a real
 * SVG geometry property, the same technique as SketchDurationBar, not a
 * crossfade between two static pills — with three activities appearing
 * as it opens, one per life the app tracks (IRL, games, entertainment),
 * rather than a single count that only hints at what's running.
 */
export function SketchDynamicIsland({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 220 110" fill="none">
        <rect className={styles.pill} x="60" y="30" width="46" height="50" rx="25" />
        <circle className={styles.indicator} cx="75" cy="55" r="6" />
        <circle className={`${styles.activity} ${styles.a1}`} cx="112" cy="55" r="7" />
        <circle className={`${styles.activity} ${styles.a2}`} cx="140" cy="55" r="7" />
        <circle className={`${styles.activity} ${styles.a3}`} cx="168" cy="55" r="7" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
