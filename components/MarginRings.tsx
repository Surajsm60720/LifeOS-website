import styles from "./MarginRings.module.css";

const RING_COUNT = 7;

/**
 * Static decorative spiral-binding dots along the page card's left edge —
 * a restrained echo of the 3D pad's ring geometry, so the bounded content
 * column still reads as "the notebook" rather than a plain card.
 */
export function MarginRings() {
  return (
    <div className={styles.rings} aria-hidden="true">
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <span key={i} className={i % 2 ? styles.mint : styles.coral} />
      ))}
    </div>
  );
}
