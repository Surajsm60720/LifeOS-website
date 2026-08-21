import styles from "./ContentPage.module.css";

export function ContentPage({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className={styles.page} aria-label={`Page ${label}`}>
      <span className={styles.pageNumber} aria-hidden="true">
        {label}
      </span>
      <div className={styles.inner}>{children}</div>
    </section>
  );
}
