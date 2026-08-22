"use client";

import { useEffect, useRef } from "react";
import styles from "./Footer.module.css";
import { footerEyebrow, footerBody, footerSmallLines, repoUrl } from "@/lib/content";
import { useReveal } from "./RevealProvider";

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { setFooterVisible } = useReveal();

  // The fixed 3D stage covers the full viewport for as long as the pad
  // hasn't been flipped open — including while a visitor has scrolled
  // straight past it without clicking "Turn the page". Nothing about
  // scroll position alone can tell that apart from "still mid-intro",
  // so instead this reports the one fact that actually matters: the
  // footer itself has become visible, which is exactly when the fixed
  // pad needs to be gone regardless of whether it was ever flipped.
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [setFooterVisible]);

  return (
    <footer ref={ref} className={styles.footer}>
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
