import styles from "./SketchTimelineImport.module.css";

/**
 * Timeline import in three beats: a livestream image, a JSON file, then
 * calendar rows landing. The card's own promise is "image → entries," so
 * the drawing is the handoff, not a screenshot of the Settings sheet.
 */
export function SketchTimelineImport({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 160 120" fill="none">
        <rect className={styles.frame} x="14" y="18" width="42" height="54" rx="5" strokeWidth="2.2" />
        <line className={styles.band} x1="20" y1="34" x2="50" y2="34" strokeWidth="2" />
        <line className={styles.band} x1="20" y1="46" x2="44" y2="46" strokeWidth="2" />
        <line className={styles.band} x1="20" y1="58" x2="48" y2="58" strokeWidth="2" />

        <path className={styles.arrow} strokeWidth="2.2" d="M64 44L78 44" />
        <path className={styles.arrowHead} strokeWidth="2.2" d="M72 38L80 44L72 50" />

        <path
          className={styles.file}
          strokeWidth="2.2"
          d="M90 22L112 22L122 32L122 70C122 72.2 120.2 74 118 74L90 74C87.8 74 86 72.2 86 70L86 26C86 23.8 87.8 22 90 22Z"
        />
        <path className={styles.fold} strokeWidth="1.8" d="M112 22L112 32L122 32" />
        <text className={styles.json} x="104" y="54">
          {"{ }"}
        </text>

        <rect className={`${styles.row} ${styles.row1}`} x="20" y="88" width="52" height="10" rx="4" />
        <rect className={`${styles.row} ${styles.row2}`} x="78" y="88" width="40" height="10" rx="4" />
        <rect className={`${styles.row} ${styles.row3}`} x="124" y="88" width="22" height="10" rx="4" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
