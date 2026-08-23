import styles from "./SketchNoCloud.module.css";

/**
 * A cloud, struck through, over a lone device — "local-first" as the
 * absence of a server rather than an abstract lock or shield.
 */
export function SketchNoCloud({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 140 140" fill="none">
        <path
          className={styles.cloud}
          strokeWidth="2.6"
          d="M45 62C36 62 29 55.5 29 47C29 38.5 36 32 44.5 32C46.5 24 54 18 63 18C73 18 81.5 25 83 35C91.5 35.5 98 42.5 98 51C98 59.5 91 66 82.5 66L45 66Z"
        />
        <path className={styles.strike} pathLength="1" strokeWidth="3" d="M22 26L106 74" />
        <rect className={styles.device} x="56" y="92" width="28" height="34" rx="5" strokeWidth="2.4" />
        <circle className={styles.dot} cx="70" cy="118" r="1.8" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
