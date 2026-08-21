import styles from "./DeliberatelyAbsent.module.css";
import {
  deliberatelyAbsentEyebrow,
  deliberatelyAbsentHeading,
  deliberatelyAbsentLede,
  deliberatelyAbsent,
} from "@/lib/content";
import { Reveal } from "./Reveal";

export function DeliberatelyAbsent() {
  return (
    <section className={styles.section}>
      <Reveal className={styles.out}>
        <p className="eyebrow">{deliberatelyAbsentEyebrow}</p>
        <h2 className={styles.heading}>{deliberatelyAbsentHeading}</h2>
        <p>{deliberatelyAbsentLede}</p>
        <ul className={styles.list}>
          {deliberatelyAbsent.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
