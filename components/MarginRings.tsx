import styles from "./MarginRings.module.css";

const RING_COUNT = 7;

/**
 * Static spiral-binding rings astride a page's top edge — matches the
 * gate card and the 3D pad's own ring geometry, so a content page reads
 * as literally a page of the same notebook, not a generic dark card.
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
