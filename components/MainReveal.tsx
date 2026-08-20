"use client";

import styles from "./MainReveal.module.css";
import { useReveal } from "./RevealProvider";

export function MainReveal({ children }: { children: React.ReactNode }) {
  const { revealed } = useReveal();
  return <main className={`${styles.main} ${revealed ? styles.revealed : ""}`}>{children}</main>;
}
