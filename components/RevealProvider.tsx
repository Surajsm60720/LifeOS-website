"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from "react";
import { padStateReducer, initialPadState, PAGE_OPEN_ANGLE, type PadState } from "@/lib/pad-state";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { focusFeatures } from "@/lib/focus-features";
import { PAGE_FLIP_STAGGER_MS, PAGE_CLOSE_HOLD_MS, PAGE_COUNT, AUTO_FLIP_DELAY_MS } from "@/lib/constants";

type RevealContextValue = {
  padState: PadState;
  /** True exactly when padState.flipped is. */
  revealed: boolean;
  /** True once the visitor's own scroll has actually reached the
   *  notebook (or immediately, for skipToRevealed's instant path) —
   *  MainReveal and Scene key their crossfade off this, not `revealed`,
   *  so the content page doesn't fade in — or the pad fade out — ahead
   *  of where the visitor has actually scrolled to. Goes false the
   *  instant the pad closes, same as `revealed`. */
  contentVisible: boolean;
  /** What Cover.tsx should actually animate toward — mirrors
   *  padState.coverOpen except when closing from a flipped state: then
   *  it stays open until the staggered page-close below has finished,
   *  so the cover doesn't slam shut and hide that animation behind it. */
  visualCoverOpen: boolean;
  /**
   * True once scroll has reached the notebook's own section (its runway
   * placeholder is in view — see MainReveal). Folds into Scene/Pad's own
   * visibility the same way `contentVisible` does — the fixed 3D stage
   * covers the full viewport, so once the notebook is genuinely on
   * screen underneath it, the pad needs to be gone, whether or not the
   * page-flip ever finished. Scroll progress alone can't drive this:
   * it's clamped to 1 for the entire rest of the page's height once the
   * runway's done, so it can't tell "just finished opening" from
   * "scrolled three screens further" — exactly the two moments that
   * need different pad visibility here.
   */
  notebookReached: boolean;
  /** Wired up by MainReveal's own IntersectionObserver — not meant to be called from anywhere else. */
  setNotebookReached: (reached: boolean) => void;
  dispatchScroll: (progress: number) => void;
  /** Animates the pad's pages open with a stagger — purely the 3D flip,
   *  not the content crossfade (that stays gated on notebookReached, so
   *  a visitor who pauses right after the cover opens isn't left with a
   *  bare pad and nothing revealed behind it). Auto-triggered a beat
   *  after the cover opens, below; there's no button any more. */
  flip: () => void;
  /** Accessibility bypass (hero's skip-intro link) — jumps straight to
   *  revealed content without depending on scroll position, forcing the
   *  pad into a consistent fully-open state so Pad/Scene never desync
   *  from what's actually on screen. */
  skipToRevealed: () => void;
};

const RevealContext = createContext<RevealContextValue | null>(null);

export function RevealProvider({ children }: { children: React.ReactNode }) {
  const [padState, dispatch] = useReducer(padStateReducer, initialPadState);
  const [contentVisible, setContentVisible] = useState(false);
  const [notebookReached, setNotebookReached] = useState(false);
  const reduced = useReducedMotion();

  // Scrolling back closes the pad (padState resets, flipped -> false) —
  // the content crossfade must follow that immediately. This genuinely
  // isn't derivable during render: contentVisible tracks padState.flipped
  // asymmetrically (closes in lockstep, but opens later, gated on
  // notebookReached below) — so it needs its own state that's reset
  // here, not computed inline.
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (!padState.flipped) setContentVisible(false);
  }, [padState.flipped]);

  // Closing the pad only resets coverOpen/flipped in the reducer —
  // pageTargets is deliberately left untouched there. This effect plays
  // the actual closing sequence, mirroring flip()'s opening sequence in
  // reverse: pages stagger shut one at a time (last-opened-first), and
  // the cover is held open (via visualCoverOpen) until that stagger has
  // finished, THEN closes over them last. Without the hold, the cover
  // — which isn't staggered, it just tracks coverOpen directly — snaps
  // shut in the same frame the pages start closing and physically hides
  // the page-close animation behind it, which is why closing read as
  // "instant" even after pageTargets itself was fixed to stagger.
  const wasFlippedRef = useRef(false);
  const [visualCoverOpen, setVisualCoverOpen] = useState(false);
  useEffect(() => {
    const closingFromFlipped = wasFlippedRef.current && !padState.flipped;

    if (padState.coverOpen) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect -- visualCoverOpen tracks coverOpen asymmetrically (opens in lockstep, closes delayed below), not derivable during render */
      setVisualCoverOpen(true);
    } else if (closingFromFlipped) {
      for (let i = 0; i < PAGE_COUNT; i++) {
        const pageIndex = PAGE_COUNT - 1 - i;
        const delay = reduced ? 0 : i * PAGE_FLIP_STAGGER_MS;
        setTimeout(() => dispatch({ type: "SET_PAGE_TARGET", index: pageIndex, value: 0 }), delay);
      }
      // The full sequence, not just the stagger: each page now springs
      // shut over PAGE_SETTLE_MS after its target flips, so holding only
      // for the stagger would drop the cover over the last page
      // mid-swing — the very thing this hold exists to prevent.
      const staggerDuration = reduced ? 0 : PAGE_CLOSE_HOLD_MS;
      const timer = setTimeout(() => setVisualCoverOpen(false), staggerDuration);
      wasFlippedRef.current = padState.flipped;
      return () => clearTimeout(timer);
    } else {
      // Cover closing without ever having been flipped open (approached
      // via scroll, then scrolled back without clicking) — nothing to
      // stagger, close it immediately like before.
      setVisualCoverOpen(false);
    }

    wasFlippedRef.current = padState.flipped;
  }, [padState.coverOpen, padState.flipped, reduced]);

  const dispatchScroll = useCallback((progress: number) => {
    dispatch({ type: "SCROLL_PROGRESS", progress });
  }, []);

  const flip = useCallback(() => {
    dispatch({ type: "FLIP" });
    for (let i = 0; i < PAGE_COUNT; i++) {
      const delay = reduced ? 0 : i * PAGE_FLIP_STAGGER_MS;
      setTimeout(() => dispatch({ type: "SET_PAGE_TARGET", index: i, value: PAGE_OPEN_ANGLE }), delay);
    }
  }, [reduced]);

  // Cover opening used to just show a "Turn the page" prompt and wait
  // for a click. Removed for a seamless scroll-only experience: the
  // pages now flip open on their own, a beat after the cover finishes
  // its swing — purely the visual animation, triggered eagerly since it
  // doesn't hide anything. Crossfading to content and moving focus stay
  // gated on notebookReached (below), not on this: a visitor who pauses
  // scrolling right after the cover opens would otherwise be left
  // staring at a pad that's already faded away with nothing behind it
  // yet — the exact "blank gap" bug fixed once already, this time from
  // a scroll-progress trigger instead of a click.
  useEffect(() => {
    if (!padState.coverOpen || padState.flipped) return;
    const timer = setTimeout(() => flip(), reduced ? 0 : AUTO_FLIP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [padState.coverOpen, padState.flipped, flip, reduced]);

  // The visitor's own scroll arriving at the notebook is what actually
  // reveals content and moves focus — not the page-flip animation above,
  // which can run well ahead of that (or not at all, if reduced motion
  // skips straight to the open state). Mirrors skipToRevealed's instant
  // path, but without the scroll: the visitor already scrolled exactly
  // where they meant to go, only visibility needs to catch up.
  useEffect(() => {
    if (!notebookReached || contentVisible) return;
    dispatch({ type: "SKIP_TO_REVEALED" });
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setContentVisible(true);
  }, [notebookReached, contentVisible]);

  const skipToRevealed = useCallback(() => {
    dispatch({ type: "SKIP_TO_REVEALED" });
    setContentVisible(true);
    focusFeatures("instant");
  }, []);

  return (
    <RevealContext.Provider
      value={{
        padState,
        revealed: padState.flipped,
        contentVisible,
        visualCoverOpen,
        notebookReached,
        setNotebookReached,
        dispatchScroll,
        flip,
        skipToRevealed,
      }}
    >
      {children}
    </RevealContext.Provider>
  );
}

export function useReveal(): RevealContextValue {
  const ctx = useContext(RevealContext);
  if (!ctx) throw new Error("useReveal must be used within a RevealProvider");
  return ctx;
}
