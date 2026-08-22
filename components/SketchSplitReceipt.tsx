import styles from "./SketchSplitReceipt.module.css";

/**
 * Line items draw in, a heavier total line settles at the bottom, then
 * the bill fans out into three people — "split the evening, not the
 * app" as the receipt itself dividing, rather than a screenshot of a
 * balance sheet.
 */
export function SketchSplitReceipt({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 120 150" fill="none">
        <rect className={styles.paper} x="20" y="14" width="80" height="92" rx="6" strokeWidth="2.4" />
        <path
          className={`${styles.line} ${styles.line1}`}
          pathLength="1"
          strokeWidth="2"
          d="M32 36C46 34 58 37 70 35C78 34 84 36 88 35"
        />
        <path
          className={`${styles.line} ${styles.line2}`}
          pathLength="1"
          strokeWidth="2"
          d="M32 52C44 50 56 53 68 51C76 50 82 52 88 51"
        />
        <path className={styles.total} pathLength="1" strokeWidth="3" d="M32 78C46 76 60 79 88 77" />
        <path
          className={`${styles.connector} ${styles.c1}`}
          pathLength="1"
          strokeWidth="1.8"
          d="M50 106C42 116 36 122 30 128"
        />
        <path className={`${styles.connector} ${styles.c2}`} pathLength="1" strokeWidth="1.8" d="M60 106L60 128" />
        <path
          className={`${styles.connector} ${styles.c3}`}
          pathLength="1"
          strokeWidth="1.8"
          d="M70 106C78 116 84 122 90 128"
        />
        <circle className={`${styles.person} ${styles.p1}`} cx="30" cy="133" r="9" />
        <circle className={`${styles.person} ${styles.p2}`} cx="60" cy="133" r="9" />
        <circle className={`${styles.person} ${styles.p3}`} cx="90" cy="133" r="9" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
