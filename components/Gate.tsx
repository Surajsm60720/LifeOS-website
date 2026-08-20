"use client";

import type { RefObject } from "react";
import styles from "./Gate.module.css";
import { gateScrawl, gateHeading, gateBody, gateFlipLabel, gateSourceLabel, repoUrl } from "@/lib/content";

type GateProps = {
  coverOpen: boolean;
  flipped: boolean;
  anchorElRef: RefObject<HTMLDivElement | null>;
  onFlipClick: () => void;
};

export function Gate({ coverOpen, flipped, anchorElRef, onFlipClick }: GateProps) {
  const isShown = coverOpen && !flipped;
  const stateClass = flipped ? styles.gone : coverOpen ? styles.on : "";
  return (
    <div ref={anchorElRef} className={`${styles.gate} ${stateClass}`} aria-hidden={!isShown}>
      <div className={styles.page}>
        <span className={styles.scrawl}>{gateScrawl}</span>
        <h2>{gateHeading}</h2>
        <p>{gateBody}</p>
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.primary}`}
            onClick={onFlipClick}
            tabIndex={isShown ? undefined : -1}
          >
            {gateFlipLabel}
          </button>
          <a
            className={`${styles.btn} ${styles.ghost}`}
            href={repoUrl}
            target="_blank"
            rel="noopener"
            tabIndex={isShown ? undefined : -1}
          >
            {gateSourceLabel}
          </a>
        </div>
      </div>
    </div>
  );
}
