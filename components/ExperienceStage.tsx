"use client";

import { useEffect, useRef } from "react";
import styles from "./ExperienceStage.module.css";
import { Scene } from "./scene/Scene";
import { Gate } from "./Gate";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useReveal } from "./RevealProvider";

export function ExperienceStage() {
  const { easedProgress, rawProgress, narrow } = useScrollProgress();
  const reduced = useReducedMotion();
  const { padState, revealed, dispatchScroll, flip } = useReveal();

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
    dispatchScroll(rawProgress);
  }, [rawProgress, dispatchScroll]);

  return (
    <>
      <div className={styles.runway} aria-hidden="true" />
      <Scene
        easedProgress={easedProgress}
        narrow={narrow}
        reduced={reduced}
        revealed={revealed}
        pageTargetsRef={pageTargetsRef}
        coverTargetRef={coverTargetRef}
        gateAnchorElRef={gateAnchorElRef}
      />
      <Gate
        coverOpen={padState.coverOpen}
        flipped={padState.flipped}
        anchorElRef={gateAnchorElRef}
        onFlipClick={flip}
      />
    </>
  );
}
