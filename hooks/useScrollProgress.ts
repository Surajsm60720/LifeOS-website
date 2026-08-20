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

export function useScrollProgress(): { progress: number; easedProgress: number; narrow: boolean } {
  const [progress, setProgress] = useState(0);
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

  return { progress, easedProgress: ease(progress), narrow };
}
