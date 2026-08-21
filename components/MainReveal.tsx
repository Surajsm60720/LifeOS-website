"use client";

import styles from "./MainReveal.module.css";
import { useReveal } from "./RevealProvider";
import { MarginRings } from "./MarginRings";

export function MainReveal({ children }: { children: React.ReactNode }) {
  const { contentVisible } = useReveal();
  return (
    <main className={`${styles.main} ${contentVisible ? styles.revealed : ""}`}>
      <div className={styles.page}>
        <MarginRings />
        {children}
      </div>
    </main>
  );
}
