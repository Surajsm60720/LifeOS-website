import styles from "./SpecList.module.css";
import { specSectionEyebrow, specSectionHeading, specRows } from "@/lib/content";

export function SpecList() {
  return (
    <section className={`wrap ${styles.section}`}>
      <div className={styles.head}>
        <p className="eyebrow">{specSectionEyebrow}</p>
        <h2>{specSectionHeading}</h2>
      </div>
      <dl className={styles.spec}>
        {specRows.map((row) => (
          <div className={styles.row} key={row.term}>
            <dt>{row.term}</dt>
            <dd>
              {row.definition.map((segment, i) =>
                segment.code ? <code key={i}>{segment.text}</code> : <span key={i}>{segment.text}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
