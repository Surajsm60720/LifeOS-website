import styles from "./SketchLoopMarker.module.css";

/**
 * A marker travelling around a fixed loop, passing the same start tick
 * every lap — "this occurrence to the next" as a cycle you can watch
 * repeat, rather than two static dates on a calendar.
 */
export function SketchLoopMarker({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 140 140" fill="none">
        <line className={styles.mark} x1="70" y1="20" x2="70" y2="30" strokeWidth="2.6" />
        <circle className={styles.loop} cx="70" cy="70" r="42" strokeWidth="2.6" />
        <g className={styles.orbit}>
          <circle className={styles.marker} cx="70" cy="28" r="5.5" />
        </g>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
