"use client";

import { useEffect, useReducer, useRef } from "react";
import styles from "./ExperienceStage.module.css";
import { Scene } from "./scene/Scene";
import { Gate } from "./Gate";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { padStateReducer, initialPadState } from "@/lib/pad-state";
import { useReveal } from "./RevealProvider";
import { focusFeatures } from "@/lib/focus-features";
import { PAGE_FLIP_STAGGER_MS, PAGE_COUNT } from "@/lib/constants";

export function ExperienceStage() {
  const { progress, easedProgress, narrow } = useScrollProgress();
  const reduced = useReducedMotion();
  const { reveal } = useReveal();
  const [padState, dispatch] = useReducer(padStateReducer, initialPadState);

  const gateAnchorElRef = useRef<HTMLDivElement>(null);
  const pageTargetsRef = useRef<number[]>(padState.pageTargets);
  const coverTargetRef = useRef<number>(0);

  // Keep the mutable refs Pad/Pages/Cover read every frame in sync with
  // reducer state, without forcing the R3F tree to re-render each tick.
  useEffect(() => {
    pageTargetsRef.current = padState.pageTargets;
    coverTargetRef.current = padState.coverOpen ? -Math.PI * 0.98 : 0;
  }, [padState.pageTargets, padState.coverOpen]);

  useEffect(() => {
    dispatch({ type: "SCROLL_PROGRESS", progress });
  }, [progress]);

  function handleFlipClick() {
    dispatch({ type: "FLIP" });
    for (let i = 0; i < PAGE_COUNT; i++) {
      const delay = reduced ? 0 : i * PAGE_FLIP_STAGGER_MS;
      setTimeout(() => dispatch({ type: "SET_PAGE_TARGET", index: i, value: -Math.PI * 0.97 }), delay);
    }
    reveal();
    const revealDelay = reduced ? 0 : PAGE_COUNT * PAGE_FLIP_STAGGER_MS + 200;
    setTimeout(() => focusFeatures(reduced ? "auto" : "smooth"), revealDelay);
  }

  return (
    <>
      <div className={styles.runway} aria-hidden="true" />
      <Scene
        easedProgress={easedProgress}
        narrow={narrow}
        reduced={reduced}
        pageTargetsRef={pageTargetsRef}
        coverTargetRef={coverTargetRef}
        gateAnchorElRef={gateAnchorElRef}
      />
      <Gate
        coverOpen={padState.coverOpen}
        flipped={padState.flipped}
        anchorElRef={gateAnchorElRef}
        onFlipClick={handleFlipClick}
      />
    </>
  );
}
