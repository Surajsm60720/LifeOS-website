import styles from "./MediaSlot.module.css";

const TILT_DEG = [-1.4, 1.1, -0.7, 1.6];

/**
 * Reserved slot for a future screenshot/recording per feature entry —
 * styled as a photo taped to the page rather than a generic empty box,
 * since no real assets exist yet (spec §8) and a physical "photo
 * pending" frame reads as intentional instead of broken.
 */
export function MediaSlot({ seed = 0 }: { seed?: number }) {
  const tilt = TILT_DEG[seed % TILT_DEG.length];
  return (
    <div className={styles.slot} style={{ "--tilt": `${tilt}deg` } as React.CSSProperties} aria-hidden="true">
      <span className={styles.label}>photo pending</span>
    </div>
  );
}
