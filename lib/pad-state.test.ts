import { describe, it, expect } from "vitest";
import { initialPadState, padStateReducer } from "./pad-state";

describe("padStateReducer", () => {
  it("starts closed and unflipped with all page targets at 0", () => {
    expect(initialPadState.coverOpen).toBe(false);
    expect(initialPadState.flipped).toBe(false);
    expect(initialPadState.pageTargets).toEqual([0, 0, 0, 0]);
  });

  it("opens the cover once scroll progress crosses the open threshold", () => {
    const next = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    expect(next.coverOpen).toBe(true);
  });

  it("does not open below the open threshold", () => {
    const next = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.5 });
    expect(next.coverOpen).toBe(false);
  });

  it("closes once scroll progress drops to/below the close threshold", () => {
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const closed = padStateReducer(open, { type: "SCROLL_PROGRESS", progress: 0.5 });
    expect(closed.coverOpen).toBe(false);
  });

  it("holds open state inside the hysteresis band (between close and open thresholds)", () => {
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const stillOpen = padStateReducer(open, { type: "SCROLL_PROGRESS", progress: 0.8 });
    expect(stillOpen.coverOpen).toBe(true);
  });

  it("FLIP sets flipped true and leaves coverOpen as-is", () => {
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const flipped = padStateReducer(open, { type: "FLIP" });
    expect(flipped.flipped).toBe(true);
    expect(flipped.coverOpen).toBe(true);
  });

  it("FLIP does nothing if the cover isn't open yet", () => {
    const next = padStateReducer(initialPadState, { type: "FLIP" });
    expect(next).toEqual(initialPadState);
  });

  it("scrolling back after flip resets everything to closed — the closing animation", () => {
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const flipped = padStateReducer(open, { type: "FLIP" });
    const withOpenPages = padStateReducer(flipped, { type: "SET_PAGE_TARGET", index: 0, value: -3 });
    const afterScrollUp = padStateReducer(withOpenPages, { type: "SCROLL_PROGRESS", progress: 0.5 });
    expect(afterScrollUp.coverOpen).toBe(false);
    expect(afterScrollUp.flipped).toBe(false);
    expect(afterScrollUp.pageTargets).toEqual([0, 0, 0, 0]);
  });

  it("SET_PAGE_TARGET updates only the targeted page index", () => {
    const next = padStateReducer(initialPadState, { type: "SET_PAGE_TARGET", index: 2, value: -3 });
    expect(next.pageTargets).toEqual([0, 0, -3, 0]);
  });
});
