import styles from "./SketchWindowFill.module.css";

/**
 * A fixed bracket — the window itself never changes size — with a fill
 * advancing inside it: "windows, not just start dates" as a span you can
 * see filling, rather than a single point on a calendar.
 */
export function SketchWindowFill({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 200 100" fill="none">
        <g className={styles.bracket} strokeWidth="3">
          <path d="M34 26C29.5 26 26 29.5 26 34L26 66C26 70.5 29.5 74 34 74" />
          <path d="M166 26C170.5 26 174 29.5 174 34L174 66C174 70.5 170.5 74 166 74" />
        </g>
        <rect className={styles.fill} x="32" y="40" height="20" rx="5" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
