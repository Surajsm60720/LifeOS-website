import styles from "./SketchPityRamp.module.css";

const PULLS = [
  { x: 30, y: 104, step: "a" },
  { x: 50, y: 98, step: "b" },
  { x: 70, y: 106, step: "c" },
  { x: 90, y: 98, step: "d" },
  { x: 110, y: 104, step: "e" },
] as const;

/** Five stars on one horizontal line. They only arrive after 76 is showing. */
const STARS = [
  { x: 22, y: 26, step: "s1" },
  { x: 46, y: 26, step: "s2" },
  { x: 70, y: 26, step: "s3" },
  { x: 94, y: 26, step: "s4" },
  { x: 118, y: 26, step: "s5" },
] as const;

const STAR_PATH = "M0-6L1.7-1.8L6.2-1.3L2.7 2L3.8 6.4L0 3.8L-3.8 6.4L-2.7 2L-6.2-1.3L-1.7-1.8Z";

/**
 * A wish session, not a meter. The count steps 41 → 52 → 76 as +1 and
 * +10 land, the later pulls heat from gray to coral, and only then
 * do five stars appear in a straight line. Same slot as the other cards:
 * no bar, no chrome, and the still frame (reduced motion) is the hot
 * count with all five stars already there.
 */
export function SketchPityRamp({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 140 124" fill="none">
        {STARS.map((star) => (
          <g key={star.step} transform={`translate(${star.x} ${star.y})`}>
            <path className={`${styles.star} ${styles[star.step]}`} d={STAR_PATH} />
          </g>
        ))}
        <text className={`${styles.count} ${styles.early}`} x="70" y="86">
          41
        </text>
        <text className={`${styles.count} ${styles.mid}`} x="70" y="86">
          52
        </text>
        <text className={`${styles.count} ${styles.hot}`} x="70" y="86">
          76
        </text>
        <text className={styles.plus} x="18" y="62">
          +1
        </text>
        <text className={styles.plusTen} x="98" y="62">
          +10
        </text>
        {PULLS.map((pull) => (
          <circle
            key={pull.step}
            className={`${styles.pull} ${styles[pull.step]}`}
            cx={pull.x}
            cy={pull.y}
            r="5.5"
          />
        ))}
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
