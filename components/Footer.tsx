import styles from "./Footer.module.css";
import { footerEyebrow, footerBody, footerSmallLines, repoUrl } from "@/lib/content";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <p className="eyebrow" style={{ marginBottom: ".9rem" }}>
            {footerEyebrow}
          </p>
          <p className={styles.body}>{footerBody}</p>
          <a className={styles.link} href={repoUrl} target="_blank" rel="noopener">
            {repoUrl.replace("https://", "")}
          </a>
        </div>
        <small className={styles.small}>
          {footerSmallLines.map((line, i) => (
            <span key={line}>
              {line}
              {i < footerSmallLines.length - 1 && <br />}
            </span>
          ))}
        </small>
      </div>
    </footer>
  );
}
