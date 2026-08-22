import styles from "./SketchQuietProgress.module.css";

/**
 * A muted bell sitting still while a progress bar quietly fills beneath
 * it — the Entertainment card's own tension ("deliberately
 * notification-free... it never chases you") drawn as a contrast rather
 * than stated in an icon that needs a caption to explain it.
 */
export function SketchQuietProgress({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 140 140" fill="none">
        <g className={styles.bell} strokeWidth="2.6">
          <path d="M70 34C61 34 55 41.5 55 50.5L55 62C55 68 51 72 47 75L93 75C89 72 85 68 85 62L85 50.5C85 41.5 79 34 70 34Z" />
          <path d="M62 79C64.5 84 75.5 84 78 79" />
          <line x1="45" y1="31" x2="95" y2="88" />
        </g>
        <rect className={styles.track} x="30" y="97" width="80" height="14" rx="7" strokeWidth="2" />
        <rect className={styles.fill} x="34" y="101" height="6" rx="3" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
