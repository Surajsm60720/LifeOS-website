import styles from "./SketchDynamicIsland.module.css";

/**
 * The Dynamic Island itself, hand-drawn: a compact pill draws on, then
 * gives way to a wider one carrying a count badge — the two states the
 * Live Activity card's own copy names ("A count badge in the Island and
 * up to three events on the Lock Screen"). Two discrete pill shapes
 * cross-fade rather than one shape stretching, so the badge text never
 * has to ride along on a horizontal scale and come out squashed.
 *
 * Same convention as SketchFaceID: inline SVG, CSS-only animation,
 * pathLength="1" so draw-on is a plain dashoffset 1 -> 0.
 */
export function SketchDynamicIsland({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 200 100" fill="none">
        <g className={styles.compact} strokeWidth="3.2">
          <path
            className={styles.stroke}
            pathLength="1"
            d="M74 26.6C64.4 26.2 58.6 32 58.4 41.2C58.2 50.6 63.8 57.2 74 57.4L106.4 57.6C116 57.8 121.8 52 122 42.6C122.2 33.2 116.6 26.6 106.4 26.4Z"
          />
          <circle className={styles.stroke} pathLength="1" cx="73" cy="41.8" r="6.4" />
        </g>

        <g className={styles.expanded} strokeWidth="3.2">
          <path
            className={styles.stroke}
            pathLength="1"
            d="M68 25.8C56.6 25.4 49.4 32 49.2 41.6C49 51.4 55.6 58.6 68 58.8L132.6 59C144.2 59.2 151.6 52.4 151.8 42.4C152 33 145.2 25.6 133 25.4Z"
          />
          <circle className={styles.stroke} pathLength="1" cx="70.4" cy="42.2" r="6.4" />
          <text className={styles.badge} x="132" y="50">
            3
          </text>
        </g>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
