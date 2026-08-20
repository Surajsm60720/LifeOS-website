"use client";

import styles from "./MainReveal.module.css";
import { useReveal } from "./RevealProvider";
import { MarginRings } from "./MarginRings";

export function MainReveal({ children }: { children: React.ReactNode }) {
  const { revealed } = useReveal();
  return (
    <main className={`${styles.main} ${revealed ? styles.revealed : ""}`}>
      <div className={styles.page}>
        <MarginRings />
        {children}
      </div>
    </main>
  );
}
