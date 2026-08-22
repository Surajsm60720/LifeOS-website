import styles from "./SketchFaceID.module.css";

/**
 * A Face ID glyph drawn in blue pen, in place of the taped "photo
 * pending" slot on the App Lock entry.
 *
 * The rest of the site already carries one hand-drawn accent — the
 * gate's `planned on paper first —` scrawl in Caveat — and this is the
 * same idea extended from lettering to a drawing, so the App Lock entry
 * gets something real instead of a placeholder waiting on a screen
 * recording that would have to be captured, exported and shipped.
 *
 * Everything is inline SVG animated with CSS: no image, no GIF, no
 * runtime JS, and it stays a server component. Paths carry
 * `pathLength="1"` so the draw-on animation is just dashoffset 1 -> 0
 * without hardcoding a measured length per path.
 *
 * Decorative — the entry's own heading and body already say "Face ID on
 * return", so this is hidden from assistive tech rather than given a
 * label that would just repeat the sentence beside it.
 */
export function SketchFaceID({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 120 120" fill="none">
        {/* Corner brackets. Coordinates are deliberately a unit or two off
            square and the corners are drawn as slightly lopsided curves —
            a mechanically perfect rounded rectangle reads as an exported
            icon, not as something drawn by hand. */}
        <g className={styles.frame} strokeWidth="3.4">
          <path className={styles.stroke} pathLength="1" d="M18.4 47.2C17.2 38.4 16.6 29.4 22.3 23.4C27.8 17.7 36.4 17.4 45.6 18.2" />
          <path className={styles.stroke} pathLength="1" d="M74.8 17.9C84.2 17.4 93.1 18.2 98.2 23.6C103.1 28.8 102.4 37.6 101.8 46.4" />
          <path className={styles.stroke} pathLength="1" d="M101.9 74.6C102.6 83.6 103.2 92.7 97.7 98.1C92.4 103.3 83.6 102.7 74.6 102.1" />
          <path className={styles.stroke} pathLength="1" d="M45.2 102.2C36.2 102.7 27.1 102.2 22 97C17.1 91.9 17.6 83.2 18.2 74.2" />
        </g>

        {/* Eyes, nose and mouth, in the arrangement Apple's own Face ID
            glyph uses — two short eye ticks, a hooked nose, a wide smile.
            The group gets the recognition pulse; the paths inside draw
            themselves on independently. */}
        <g className={styles.face} strokeWidth="3.2">
          <path className={styles.stroke} pathLength="1" d="M45.8 48.6C45.2 51.8 45.4 55.2 46.4 58.4" />
          <path className={styles.stroke} pathLength="1" d="M74.4 48.4C75.1 51.6 74.8 55.1 73.8 58.2" />
          <path className={styles.stroke} pathLength="1" d="M60.2 47.8C59.4 53.4 59 58.8 59.4 62.6C59.7 65.2 61.6 65.8 64 65.2" />
          <path className={styles.stroke} pathLength="1" d="M46.6 73.4C50.8 79.6 56.4 82.4 60.6 82.3C65 82.2 70.4 79.2 74 73.1" />
        </g>

        {/* The tick the face resolves into — "unlocked", without a word of
            copy. Deliberately no scan line anywhere in here: a bar
            travelling down the face just reads as a strike-through, and
            Apple's own Face ID animation doesn't have one either. */}
        <path
          className={`${styles.stroke} ${styles.check}`}
          pathLength="1"
          strokeWidth="3.6"
          d="M42.4 61.8C46.8 67.2 51.2 72.6 55.2 78.4C61.6 66.2 69.4 54.8 78.8 44.6"
        />
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
