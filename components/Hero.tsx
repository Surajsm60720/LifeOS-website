"use client";

import styles from "./Hero.module.css";
import { heroEyebrow, heroLede, heroChips, scrollCueText } from "@/lib/content";
import { useReveal } from "./RevealProvider";

export function Hero() {
  const { skipToRevealed } = useReveal();

  function handleSkip(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    skipToRevealed();
  }

  return (
    <header className={styles.hero}>
      {/*
        Full keyboard path to the content with zero interaction with the
        3D piece (v1 rough edge P1 #1 — v1 had no way to reach the
        feature content without clicking "Turn the page").
      */}
      <a href="#features" className={styles.skip} onClick={handleSkip}>
        Skip intro — jump to features
      </a>
      <div className={`wrap ${styles.grid}`}>
        <div>
          <p className="eyebrow">{heroEyebrow}</p>
          <h1 className={styles.wordmark}>
            Life<em>OS</em>
          </h1>
          <p className={styles.lede}>{heroLede}</p>
          <div className={styles.chips}>
            {heroChips.map((chip, i) => (
              <span className={styles.chip} key={i}>
                {chip.map((segment, j) =>
                  segment.bold ? (
                    <b className={styles.chipBold} key={j}>
                      {segment.text}
                    </b>
                  ) : (
                    <span key={j}>{segment.text}</span>
                  )
                )}
              </span>
            ))}
          </div>
          <p className={styles.scrollCue}>
            <span className={styles.scrollCueMark} /> {scrollCueText}
          </p>
        </div>
        <div aria-hidden="true" />
      </div>
    </header>
  );
}
