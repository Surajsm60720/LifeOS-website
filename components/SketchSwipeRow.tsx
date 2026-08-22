import styles from "./SketchSwipeRow.module.css";

/**
 * A calendar row sliding to reveal complete (mint check) or delete
 * (coral cross) — the exact gesture the Calendar card's own copy names
 * ("swipe-to-complete or delete straight from Day, Week and Month
 * rows"), rather than a static screenshot of a list.
 *
 * The reveal targets sit at the row's own edges, under its opaque fill —
 * they only become visible once the row (and everything drawn inside
 * it) has physically slid clear of that position, the same occlusion a
 * real swipeable row relies on.
 */
export function SketchSwipeRow({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 240 90" fill="none">
        <path className={styles.check} pathLength="1" strokeWidth="4" d="M48 46L56 54L70 32" />
        <path className={styles.trash} pathLength="1" strokeWidth="4" d="M162 34L182 56M182 34L162 56" />

        <g className={styles.row}>
          <path
            className={styles.rowOutline}
            d="M54 20.4C46 20.1 40.3 25.2 40.2 33L40.2 57C40 64.8 45.6 69.8 53.6 70L186.4 70.2C194.4 70.4 200 65.4 200.2 57.4L200.2 33.6C200.4 25.6 194.8 20.4 186.8 20.2Z"
          />
          <circle className={styles.dot} cx="64" cy="45" r="4" />
          <path className={styles.text} strokeWidth="2.2" d="M78 40C94 38 112 42 128 39C144 42 160 38 176 40" />
        </g>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
