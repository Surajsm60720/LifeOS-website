import styles from "./ContentPage.module.css";
import { MarginRings } from "./MarginRings";

export function ContentPage({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className={styles.page} aria-label={`Page ${label}`}>
      <MarginRings />
      <span className={styles.pageNumber} aria-hidden="true">
        {label}
      </span>
      {children}
    </section>
  );
}
