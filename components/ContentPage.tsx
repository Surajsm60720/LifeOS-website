import styles from "./ContentPage.module.css";
import { MarginRings } from "./MarginRings";

export function ContentPage({
  label,
  density,
  children,
}: {
  label: string;
  /** Match FeatureSection density so page chrome and rows stay in step. */
  density?: "dense" | "crowded" | "sparse";
  children: React.ReactNode;
}) {
  const densityClass =
    density === "crowded"
      ? styles.crowded
      : density === "dense"
        ? styles.dense
        : density === "sparse"
          ? styles.sparse
          : "";

  return (
    <section className={`${styles.page} ${densityClass}`} aria-label={`Page ${label}`}>
      <MarginRings />
      <span className={styles.pageNumber} aria-hidden="true">
        {label}
      </span>
      <div className={styles.inner}>{children}</div>
    </section>
  );
}
