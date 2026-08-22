import styles from "./SketchMarkdownLines.module.css";

/**
 * A heading, three lines of body text drawing in, and a blinking cursor
 * at the end — "Markdown built for summarising", drawn as text being
 * composed rather than a screenshot of an export sheet.
 */
export function SketchMarkdownLines({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 160 120" fill="none">
        <path className={styles.heading} pathLength="1" strokeWidth="3.4" d="M20 28C34 26.4 48 27.6 60 27" />
        <path
          className={`${styles.line} ${styles.line1}`}
          pathLength="1"
          strokeWidth="2"
          d="M20 50C42 48 66 51 92 49C104 51 116 48 130 50"
        />
        <path
          className={`${styles.line} ${styles.line2}`}
          pathLength="1"
          strokeWidth="2"
          d="M20 66C40 64 60 67 80 65C92 67 100 64 110 66"
        />
        <path className={`${styles.line} ${styles.line3}`} pathLength="1" strokeWidth="2" d="M20 82C36 80 52 83 68 81" />
        <rect className={styles.cursor} x="70" y="73" width="3" height="12" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
