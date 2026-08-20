import { describe, it, expect } from "vitest";
import {
  ease,
  lerp,
  isNarrowViewport,
  computeRunwayHeightPx,
  computeScrollProgress,
} from "./scroll-math";

describe("ease", () => {
  it("returns 0 at t=0 and 1 at t=1", () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
  });
  it("is close to 0.5 at the midpoint", () => {
    expect(ease(0.5)).toBeCloseTo(0.5, 5);
  });
});

describe("lerp", () => {
  it("moves current toward target by factor", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
  });
});

describe("isNarrowViewport", () => {
  it("is true below the breakpoint and false at/above it", () => {
    expect(isNarrowViewport(879)).toBe(true);
    expect(isNarrowViewport(880)).toBe(false);
    expect(isNarrowViewport(1200)).toBe(false);
  });
});

describe("computeRunwayHeightPx", () => {
  it("uses the desktop multiplier when not narrow", () => {
    expect(computeRunwayHeightPx(1000, false)).toBeCloseTo(1900, 5);
  });
  it("uses the narrow multiplier when narrow", () => {
    expect(computeRunwayHeightPx(1000, true)).toBeCloseTo(1500, 5);
  });
});

describe("computeScrollProgress", () => {
  it("clamps to [0,1] and scales linearly with scrollY / runway height", () => {
    expect(computeScrollProgress(0, 1900)).toBe(0);
    expect(computeScrollProgress(950, 1900)).toBeCloseTo(0.5, 5);
    expect(computeScrollProgress(1900, 1900)).toBe(1);
    expect(computeScrollProgress(3000, 1900)).toBe(1);
    expect(computeScrollProgress(-100, 1900)).toBe(0);
  });
  it("returns 0 when runway height is 0 (avoids divide-by-zero)", () => {
    expect(computeScrollProgress(500, 0)).toBe(0);
  });
});
