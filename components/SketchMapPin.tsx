import styles from "./SketchMapPin.module.css";

/**
 * A pin dropping onto a hand-drawn street map and landing with a ping —
 * the Map-first card's own gesture ("search, drop a pin, or use where
 * you are") rather than a static map screenshot.
 */
export function SketchMapPin({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 140 140" fill="none">
        <g className={styles.roads} strokeWidth="2.2">
          <path className={styles.stroke} pathLength="1" d="M8 96C28 89 44 101 60 93C76 85 96 97 132 90" />
          <path className={styles.stroke} pathLength="1" d="M46 132C51 111 42 91 56 70" />
        </g>

        <circle className={styles.ripple} cx="70" cy="92" r="9" />

        <g className={styles.pin} strokeWidth="3.2">
          <path
            className={styles.pinShape}
            d="M70 40C60 40 52 48.5 52 58.5C52 72 70 92 70 92C70 92 88 72 88 58.5C88 48.5 80 40 70 40Z"
          />
          <circle className={styles.pinShape} cx="70" cy="57" r="6" />
        </g>

        <path className={styles.label} pathLength="1" strokeWidth="2.4" d="M84 60C92 56 100 62 108 57" />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
