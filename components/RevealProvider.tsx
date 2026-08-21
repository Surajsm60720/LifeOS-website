"use client";

import { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { padStateReducer, initialPadState, PAGE_OPEN_ANGLE, type PadState } from "@/lib/pad-state";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { focusFeatures } from "@/lib/focus-features";
import { PAGE_FLIP_STAGGER_MS, PAGE_COUNT } from "@/lib/constants";

type RevealContextValue = {
  padState: PadState;
  /** True exactly when padState.flipped is — used for Gate, which must
   *  hide the instant you click (or skip), not wait on any animation. */
  revealed: boolean;
  /** True once the page-flip animation has actually finished (or
   *  immediately, for skipToRevealed's instant path) — MainReveal and
   *  Scene key their crossfade off this, not `revealed`, so the content
   *  page doesn't fade in over the pad while it's still mid-flip. Goes
   *  false the instant the pad closes, same as `revealed`. */
  contentVisible: boolean;
  dispatchScroll: (progress: number) => void;
  /** Deliberate "turn the page" interaction — requires the cover to
   *  already be open (via scroll), animates pages open with a stagger. */
  flip: () => void;
  /** Accessibility bypass (hero's skip-intro link) — jumps straight to
   *  revealed content without depending on scroll position, forcing the
   *  pad into a consistent fully-open state so Gate/Scene never desync
   *  from what's actually on screen. */
  skipToRevealed: () => void;
};

const RevealContext = createContext<RevealContextValue | null>(null);

export function RevealProvider({ children }: { children: React.ReactNode }) {
  const [padState, dispatch] = useReducer(padStateReducer, initialPadState);
  const [contentVisible, setContentVisible] = useState(false);
  const reduced = useReducedMotion();

  // Scrolling back closes the pad (padState resets, flipped -> false) —
  // the content crossfade must follow that immediately, same as Gate
  // does. This genuinely isn't derivable during render: contentVisible
  // tracks padState.flipped asymmetrically (closes in lockstep, but
  // opens later, from the delayed setTimeout in flip() below) — so it
  // needs its own state that's reset here, not computed inline.
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (!padState.flipped) setContentVisible(false);
  }, [padState.flipped]);

  const dispatchScroll = useCallback((progress: number) => {
    dispatch({ type: "SCROLL_PROGRESS", progress });
  }, []);

  const flip = useCallback(() => {
    dispatch({ type: "FLIP" });
    for (let i = 0; i < PAGE_COUNT; i++) {
      const delay = reduced ? 0 : i * PAGE_FLIP_STAGGER_MS;
      setTimeout(() => dispatch({ type: "SET_PAGE_TARGET", index: i, value: PAGE_OPEN_ANGLE }), delay);
    }
    // Don't crossfade to content until the page-flip animation has
    // actually finished playing — this is the same delay used for
    // focus, just also gating the visual handoff now instead of firing
    // it at click time and racing the still-mid-flip 3D animation.
    const revealDelay = reduced ? 0 : PAGE_COUNT * PAGE_FLIP_STAGGER_MS + 200;
    setTimeout(() => {
      setContentVisible(true);
      // "instant", not "auto" — the page sets `scroll-behavior: smooth`
      // globally, and per spec CSS wins over a JS "auto" argument, so
      // "auto" here would silently animate anyway. Only "instant"
      // actually bypasses it.
      focusFeatures(reduced ? "instant" : "smooth");
    }, revealDelay);
  }, [reduced]);

  const skipToRevealed = useCallback(() => {
    dispatch({ type: "SKIP_TO_REVEALED" });
    setContentVisible(true);
    focusFeatures("instant");
  }, []);

  return (
    <RevealContext.Provider
      value={{ padState, revealed: padState.flipped, contentVisible, dispatchScroll, flip, skipToRevealed }}
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
