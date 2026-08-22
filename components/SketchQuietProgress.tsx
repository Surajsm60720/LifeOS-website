import styles from "./SketchQuietProgress.module.css";

/**
 * A bell that never rings — the mute stroke draws across it and holds,
 * with no bar, badge, or count anywhere in the drawing. The card's own
 * words are "deliberately notification-free"; the sketch's only motion
 * is the act of silencing it, not a stand-in metric for progress.
 */
export function SketchQuietProgress({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 140 140" fill="none">
        <g className={styles.bell} strokeWidth="2.6">
          <path d="M70 34C61 34 55 41.5 55 50.5L55 62C55 68 51 72 47 75L93 75C89 72 85 68 85 62L85 50.5C85 41.5 79 34 70 34Z" />
          <path d="M62 79C64.5 84 75.5 84 78 79" />
        </g>
        <path className={styles.mute} pathLength="1" strokeWidth="3" d="M42 30L98 90" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
