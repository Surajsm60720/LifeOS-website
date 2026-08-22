import styles from "./SketchSplitReceipt.module.css";

// The total is derived, not a third hardcoded number sitting next to
// the two line items — a typo'd literal here is exactly the "$18 + $24
// = $62" bug a reader would notice immediately and read as the app
// itself being unable to add.
const LINE_ITEMS = [18, 24];
const TOTAL = LINE_ITEMS.reduce((sum, amount) => sum + amount, 0);

/**
 * Real line-item amounts and a subtotal rule above the split, rather
 * than stand-in squiggles — "split the evening" reads as an actual
 * expense only once there's real-looking money on the page.
 */
export function SketchSplitReceipt({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 120 150" fill="none">
        <rect className={styles.paper} x="20" y="14" width="80" height="92" rx="6" strokeWidth="2.4" />
        <text className={`${styles.amount} ${styles.line1}`} x="30" y="42">
          ${LINE_ITEMS[0]}
        </text>
        <text className={`${styles.amount} ${styles.line2}`} x="30" y="60">
          ${LINE_ITEMS[1]}
        </text>
        <g className={styles.totalGroup}>
          <line className={styles.rule} x1="30" y1="70" x2="90" y2="70" strokeWidth="1.6" />
          <text className={styles.total} x="30" y="93">
            ${TOTAL}
          </text>
        </g>
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
