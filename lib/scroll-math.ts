import {
  RUNWAY_MULTIPLIER_DESKTOP,
  RUNWAY_MULTIPLIER_NARROW,
  NARROW_BREAKPOINT_PX,
} from "./constants";

/** Cubic in-out easing, ported verbatim from the v1 build. */
export function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Exponential-damping step toward a target value. */
export function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export function isNarrowViewport(viewportWidthPx: number): boolean {
  return viewportWidthPx < NARROW_BREAKPOINT_PX;
}

export function computeRunwayHeightPx(viewportHeightPx: number, narrow: boolean): number {
  return viewportHeightPx * (narrow ? RUNWAY_MULTIPLIER_NARROW : RUNWAY_MULTIPLIER_DESKTOP);
}

export function computeScrollProgress(scrollY: number, runwayHeightPx: number): number {
  if (runwayHeightPx <= 0) return 0;
  return Math.max(0, Math.min(1, scrollY / runwayHeightPx));
}
