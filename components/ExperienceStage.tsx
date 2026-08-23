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

  // Once scroll has reached the notebook, the pad is going away
  // regardless of how far its own opening animation got — a fast scroll
  // can get there well inside the stagger+spring's own ~1s duration,
  // and letting the spring keep easing toward it underneath the
  // crossfade is what read as the animation getting cut off mid-swing
  // (RevealProvider's SKIP_TO_REVEALED already forces any still-closed
  // pageTargets open the moment this happens — see lib/pad-state.ts).
  // Treating that same moment as reduced-motion makes Pages/Cover snap
  // straight to the target instead of easing, so whatever's glimpsed
  // during the crossfade is always the finished pose. Harmless the rest
  // of the time: by a normal-paced scroll, the animation has long since
  // settled at that same target anyway, so snapping to it changes nothing.
  const instant = reduced || notebookReached;

  return (
    <>
      <div className={styles.runway} aria-hidden="true" />
      <Scene
        easedProgress={easedProgress}
        narrow={narrow}
        reduced={instant}
        contentVisible={contentVisible || notebookReached}
        pageTargetsRef={pageTargetsRef}
        coverTargetRef={coverTargetRef}
      />
    </>
  );
}
