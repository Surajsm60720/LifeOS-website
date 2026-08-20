import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReducedMotion } from "./useReducedMotion";

function mockMatchMedia(initialMatches: boolean) {
  let changeListener: ((e: MediaQueryListEvent) => void) | null = null;
  const mql = {
    matches: initialMatches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
      changeListener = cb;
    },
    removeEventListener: () => {
      changeListener = null;
    },
  };
  vi.stubGlobal("matchMedia", () => mql);
  return {
    triggerChange: (matches: boolean) => {
      mql.matches = matches;
      changeListener?.({ matches } as MediaQueryListEvent);
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useReducedMotion", () => {
  it("returns the initial matchMedia state", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it("updates when the media query change fires", () => {
    const { triggerChange } = mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => triggerChange(true));
    expect(result.current).toBe(true);
  });
});
