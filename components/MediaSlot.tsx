import styles from "./MediaSlot.module.css";

/**
 * Reserved layout slot for a future screenshot/recording per feature
 * section (spec §8 — no real assets exist yet, so this ships empty
 * rather than with a fabricated placeholder image).
 */
export function MediaSlot() {
  return <div className={styles.slot} aria-hidden="true" />;
}
