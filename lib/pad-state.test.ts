import { describe, it, expect } from "vitest";
import { initialPadState, padStateReducer, PAGE_OPEN_ANGLE } from "./pad-state";

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

  it("scrolling back after flip resets coverOpen/flipped immediately", () => {
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const flipped = padStateReducer(open, { type: "FLIP" });
    const withOpenPages = padStateReducer(flipped, { type: "SET_PAGE_TARGET", index: 0, value: -3 });
    const afterScrollUp = padStateReducer(withOpenPages, { type: "SCROLL_PROGRESS", progress: 0.5 });
    expect(afterScrollUp.coverOpen).toBe(false);
    expect(afterScrollUp.flipped).toBe(false);
  });

  it("does NOT zero pageTargets on close — that's RevealProvider's staggered job, not the reducer's", () => {
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const flipped = padStateReducer(open, { type: "FLIP" });
    const withOpenPages = padStateReducer(flipped, { type: "SET_PAGE_TARGET", index: 0, value: -3 });
    const afterScrollUp = padStateReducer(withOpenPages, { type: "SCROLL_PROGRESS", progress: 0.5 });
    expect(afterScrollUp.pageTargets).toEqual(withOpenPages.pageTargets);
  });

  it("SET_PAGE_TARGET updates only the targeted page index", () => {
    const next = padStateReducer(initialPadState, { type: "SET_PAGE_TARGET", index: 2, value: -3 });
    expect(next.pageTargets).toEqual([0, 0, -3, 0]);
  });

  it("SKIP_TO_REVEALED forces cover open, flipped, and every page target open from a completely fresh state", () => {
    const next = padStateReducer(initialPadState, { type: "SKIP_TO_REVEALED" });
    expect(next.coverOpen).toBe(true);
    expect(next.flipped).toBe(true);
    expect(next.pageTargets).toEqual(new Array(4).fill(PAGE_OPEN_ANGLE));
  });

  it("SKIP_TO_REVEALED is a no-op once already flipped with every page fully open", () => {
    const revealed = padStateReducer(initialPadState, { type: "SKIP_TO_REVEALED" });
    const again = padStateReducer(revealed, { type: "SKIP_TO_REVEALED" });
    expect(again).toEqual(revealed);
  });

  it("SKIP_TO_REVEALED still forces the stragglers open if flipped but a fast scroll caught the stagger mid-flight", () => {
    // FLIP fired (flipped: true) but only page 0's stagger delay has
    // elapsed so far — pages 1-3 are still sitting at their closed
    // target of 0. A guard that only checked `flipped` used to treat
    // this as "already done" and leave them there, letting the 3D
    // spring keep easing them open underneath the crossfade — which is
    // what read as the opening animation getting cut off mid-swing.
    const open = padStateReducer(initialPadState, { type: "SCROLL_PROGRESS", progress: 0.9 });
    const flipped = padStateReducer(open, { type: "FLIP" });
    const partiallyStaggered = padStateReducer(flipped, { type: "SET_PAGE_TARGET", index: 0, value: PAGE_OPEN_ANGLE });
    expect(partiallyStaggered.pageTargets).toEqual([PAGE_OPEN_ANGLE, 0, 0, 0]);

    const forced = padStateReducer(partiallyStaggered, { type: "SKIP_TO_REVEALED" });
    expect(forced.pageTargets).toEqual(new Array(4).fill(PAGE_OPEN_ANGLE));
  });
});
