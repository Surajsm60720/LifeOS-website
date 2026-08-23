"use client";

import { useEffect, useRef } from "react";
import styles from "./ExperienceStage.module.css";
import { Scene } from "./scene/Scene";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useReveal } from "./RevealProvider";

export function ExperienceStage() {
  const { easedProgress, rawProgress, narrow } = useScrollProgress();
  const reduced = useReducedMotion();
  const { padState, contentVisible, visualCoverOpen, notebookReached, dispatchScroll } = useReveal();

  const pageTargetsRef = useRef<number[]>(padState.pageTargets);
  const coverTargetRef = useRef<number>(0);

  // Keep the mutable refs Pad/Pages/Cover read every frame in sync with
  // reducer state, without forcing the R3F tree to re-render each tick.
  // Cover uses visualCoverOpen, not padState.coverOpen directly — see
  // RevealProvider: closing holds the cover open until the staggered
  // page-close has finished, so it doesn't slam shut over them.
  useEffect(() => {
    pageTargetsRef.current = padState.pageTargets;
    coverTargetRef.current = visualCoverOpen ? -Math.PI * 0.98 : 0;
  }, [padState.pageTargets, visualCoverOpen]);

  useEffect(() => {
    dispatchScroll(rawProgress);
  }, [rawProgress, dispatchScroll]);

  return (
    <>
      <div className={styles.runway} aria-hidden="true" />
      <Scene
        easedProgress={easedProgress}
        narrow={narrow}
        reduced={reduced}
        contentVisible={contentVisible || notebookReached}
        pageTargetsRef={pageTargetsRef}
        coverTargetRef={coverTargetRef}
      />
    </>
  );
}
