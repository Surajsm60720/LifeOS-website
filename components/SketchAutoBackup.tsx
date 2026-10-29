import styles from "./SketchAutoBackup.module.css";

/**
 * A folder that catches weekly, monthly, and yearly files in turn —
 * automatic backup as a destination you own, not another manual export.
 */
export function SketchAutoBackup({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <svg className={styles.glyph} viewBox="0 0 140 120" fill="none">
        <path
          className={styles.folder}
          strokeWidth="2.4"
          d="M18 38L18 96C18 99 20.5 101.5 23.5 101.5L116.5 101.5C119.5 101.5 122 99 122 96L122 46C122 43 119.5 40.5 116.5 40.5L64 40.5L56 32L23.5 32C20.5 32 18 34.5 18 37.5Z"
        />
        <rect className={`${styles.strip} ${styles.weekly}`} x="34" y="56" width="72" height="12" rx="3" />
        <text className={`${styles.label} ${styles.weeklyLabel}`} x="70" y="65">
          weekly
        </text>
        <rect className={`${styles.strip} ${styles.monthly}`} x="34" y="72" width="72" height="12" rx="3" />
        <text className={`${styles.label} ${styles.monthlyLabel}`} x="70" y="81">
          month
        </text>
        <rect className={`${styles.strip} ${styles.yearly}`} x="34" y="88" width="72" height="12" rx="3" />
        <text className={`${styles.label} ${styles.yearlyLabel}`} x="70" y="97">
          year
        </text>
      </svg>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
