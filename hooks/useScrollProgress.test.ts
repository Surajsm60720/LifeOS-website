import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollProgress } from "./useScrollProgress";

let rafCallbacks: FrameRequestCallback[] = [];

function flushFrame(time = 16) {
  const callbacks = rafCallbacks;
  rafCallbacks = [];
  callbacks.forEach((cb) => cb(time));
}

beforeEach(() => {
  rafCallbacks = [];
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    rafCallbacks.push(cb);
    return rafCallbacks.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  Object.defineProperty(window, "innerWidth", { value: 1200, writable: true });
  Object.defineProperty(window, "innerHeight", { value: 1000, writable: true });
  Object.defineProperty(window, "scrollY", { value: 0, writable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useScrollProgress", () => {
  it("starts at progress 0", () => {
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current.progress).toBe(0);
  });

  it("damps toward the target progress as scrollY changes and frames advance", () => {
    const { result } = renderHook(() => useScrollProgress());
    // desktop runway height = 1000 * 1.9 = 1900; scrolling to 1900 => target 1
    Object.defineProperty(window, "scrollY", { value: 1900, writable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      for (let i = 0; i < 200; i++) flushFrame();
    });
    expect(result.current.progress).toBeGreaterThan(0.99);
  });

  it("reports narrow correctly from viewport width", () => {
    Object.defineProperty(window, "innerWidth", { value: 600, writable: true });
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current.narrow).toBe(true);
  });

  it("rawProgress reflects a scroll jump immediately, with no damping lag", () => {
    const { result } = renderHook(() => useScrollProgress());
    Object.defineProperty(window, "scrollY", { value: 1900, writable: true });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    // No frames flushed — the damped `progress` hasn't moved at all yet,
    // but rawProgress must already read the true value. This is the
    // property a programmatic scrollIntoView (flip()/skipToRevealed())
    // depends on: the pad-state machine reads rawProgress specifically
    // so a big jump can't look like "scrolled back" while damping catches up.
    expect(result.current.rawProgress).toBeCloseTo(1, 5);
    expect(result.current.progress).toBe(0);
  });
});
