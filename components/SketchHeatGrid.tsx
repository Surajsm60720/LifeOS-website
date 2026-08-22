import styles from "./SketchHeatGrid.module.css";

// 5 weeks x 7 days, intensity 0 (empty) to 3 (hottest) — a fixed,
// hand-picked pattern rather than anything derived from real usage data.
// There's no real heatmap to show yet, so this reads as "the shape of
// the feature" — cells that fill in over time — not a claim about
// actual activity.
const INTENSITIES = [
  0, 1, 0, 2, 1, 0, 0,
  1, 2, 2, 3, 2, 1, 0,
  0, 2, 3, 3, 3, 2, 1,
  1, 3, 3, 2, 3, 2, 0,
  0, 1, 2, 1, 1, 0, 0,
];
const COLUMNS = 7;

/**
 * A contribution-map-style heat grid, for the "year at a glance" entry.
 * Cells light up on a staggered diagonal wave rather than sitting
 * static, so the drawing demonstrates what a heat grid IS — activity
 * accumulating over time — instead of just being an icon beside the copy.
 */
export function SketchHeatGrid({ caption }: { caption: string }) {
  return (
    <figure className={styles.sketch} aria-hidden="true">
      <div className={styles.grid}>
        {INTENSITIES.map((level, i) => {
          const row = Math.floor(i / COLUMNS);
          const col = i % COLUMNS;
          const delay = (row + col) * 0.11;
          return (
            <span
              key={i}
              className={styles.cell}
              style={{ "--level": level, "--delay": `${delay}s` } as React.CSSProperties}
            />
          );
        })}
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
