import styles from "./SketchBlockStack.module.css";

/**
 * Three connected blocks snapping into a stack — "built like Shortcuts",
 * drawn as the same connected-step shape that app itself uses, rather
 * than a screenshot of the rule editor.
 */
export function SketchBlockStack({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 140 140" fill="none">
        <line className={`${styles.stem} ${styles.stem1}`} x1="70" y1="51" x2="70" y2="63" strokeWidth="2.2" />
        <line className={`${styles.stem} ${styles.stem2}`} x1="70" y1="89" x2="70" y2="101" strokeWidth="2.2" />
        <rect className={`${styles.block} ${styles.block1}`} x="25" y="25" width="90" height="26" rx="8" />
        <rect className={`${styles.block} ${styles.block2}`} x="25" y="63" width="90" height="26" rx="8" />
        <rect className={`${styles.block} ${styles.block3}`} x="25" y="101" width="90" height="26" rx="8" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
