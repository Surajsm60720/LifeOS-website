"use client";

import { useEffect, useRef, useState } from "react";
import {
  ease,
  lerp,
  isNarrowViewport,
  computeRunwayHeightPx,
  computeScrollProgress,
} from "@/lib/scroll-math";
import { SCROLL_DAMPING } from "@/lib/constants";

type ScrollProgressResult = {
  /** Damped, for smooth visual interpolation of the 3D pad only. */
  progress: number;
  easedProgress: number;
  /**
   * Instantaneous, undamped scroll progress — reflects the real current
   * scroll position immediately, with no lag. The open/close state
   * machine (lib/pad-state.ts) must key off this, not the damped
   * `progress`: a programmatic scrollIntoView (from flip()/skipToRevealed())
   * jumps scrollY immediately, but the damped value only catches up over
   * several frames — using it for state decisions would read that
   * catch-up lag as "the user scrolled back" and incorrectly close a pad
   * that was just explicitly opened.
   */
  rawProgress: number;
  narrow: boolean;
};

export function useScrollProgress(): ScrollProgressResult {
  const [progress, setProgress] = useState(0);
  const [rawProgress, setRawProgress] = useState(0);
  const [narrow, setNarrow] = useState(false);

  const targetRef = useRef(0);
  const progRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function recomputeTarget() {
      const isNarrow = isNarrowViewport(window.innerWidth);
      setNarrow(isNarrow);
      const runway = computeRunwayHeightPx(window.innerHeight, isNarrow);
      targetRef.current = computeScrollProgress(window.scrollY, runway);
      setRawProgress(targetRef.current);
    }

    recomputeTarget();
    window.addEventListener("scroll", recomputeTarget, { passive: true });
    window.addEventListener("resize", recomputeTarget);

    function frame() {
      progRef.current = lerp(progRef.current, targetRef.current, SCROLL_DAMPING);
      setProgress(progRef.current);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("scroll", recomputeTarget);
      window.removeEventListener("resize", recomputeTarget);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { progress, easedProgress: ease(progress), rawProgress, narrow };
}
