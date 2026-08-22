import styles from "./SketchQuotaRing.module.css";

/**
 * A ring filling toward the cap and emptying again — the Budget card's
 * own frame ("a live count of where you stand against the cap"), with
 * the cap number itself as the one fixed, unambiguous label rather than
 * a count that would imply this is real data.
 */
export function SketchQuotaRing({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 140 140" fill="none">
        <circle className={styles.track} cx="70" cy="70" r="46" strokeWidth="8" />
        <circle
          className={styles.arc}
          pathLength="1"
          cx="70"
          cy="70"
          r="46"
          strokeWidth="8"
          transform="rotate(-90 70 70)"
        />
        <text className={styles.cap} x="70" y="66" textAnchor="middle">
          64
        </text>
        <text className={styles.label} x="70" y="86" textAnchor="middle">
          cap
        </text>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
