import styles from "./SketchTerminal.module.css";

/**
 * A terminal window with a blinking prompt — "built plainly" as
 * something you'd actually run, not a logo for the language.
 */
export function SketchTerminal({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 140 116" fill="none">
        <rect
          className={styles.window}
          x="12"
          y="10"
          width="116"
          height="96"
          rx="10"
          strokeWidth="2.4"
        />
        <line className={styles.bar} x1="12" y1="32" x2="128" y2="32" strokeWidth="2" />
        <g className={styles.dots} strokeWidth="2">
          <circle cx="24" cy="21" r="2.6" />
          <circle cx="34" cy="21" r="2.6" />
          <circle cx="44" cy="21" r="2.6" />
        </g>
        <path className={styles.prompt} strokeWidth="3" d="M26 56L42 68L26 80" />
        <line className={styles.cursor} x1="52" y1="80" x2="76" y2="80" strokeWidth="3" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
