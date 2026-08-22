import styles from "./SketchPulseRow.module.css";

const POSITIONS = [30, 65, 100, 135, 170];

/**
 * Five dots pulsing in sequence like a metronome — the Games card's own
 * words, "cadence you can actually see", as a literal beat rather than
 * a screenshot of a schedule.
 */
export function SketchPulseRow({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 200 90" fill="none">
        {POSITIONS.map((x, i) => (
          <circle
            key={x}
            className={styles.dot}
            cx={x}
            cy="45"
            r="9"
            style={{ "--delay": `${i * 0.14}s` } as React.CSSProperties}
          />
        ))}
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
