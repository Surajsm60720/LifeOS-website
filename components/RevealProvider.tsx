"use client";

import { createContext, useCallback, useContext, useReducer } from "react";
import { padStateReducer, initialPadState, PAGE_OPEN_ANGLE, type PadState } from "@/lib/pad-state";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { focusFeatures } from "@/lib/focus-features";
import { PAGE_FLIP_STAGGER_MS, PAGE_COUNT } from "@/lib/constants";

type RevealContextValue = {
  padState: PadState;
  /** True exactly when padState.flipped is — content is showing. Fully
   *  reversible: scrolling back closes the pad and this goes false again. */
  revealed: boolean;
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
  const reduced = useReducedMotion();

  const dispatchScroll = useCallback((progress: number) => {
    dispatch({ type: "SCROLL_PROGRESS", progress });
  }, []);

  const flip = useCallback(() => {
    dispatch({ type: "FLIP" });
    for (let i = 0; i < PAGE_COUNT; i++) {
      const delay = reduced ? 0 : i * PAGE_FLIP_STAGGER_MS;
      setTimeout(() => dispatch({ type: "SET_PAGE_TARGET", index: i, value: PAGE_OPEN_ANGLE }), delay);
    }
    const revealDelay = reduced ? 0 : PAGE_COUNT * PAGE_FLIP_STAGGER_MS + 200;
    // "instant", not "auto" — the page sets `scroll-behavior: smooth`
    // globally, and per spec CSS wins over a JS "auto" argument, so
    // "auto" here would silently animate anyway. Only "instant"
    // actually bypasses it.
    setTimeout(() => focusFeatures(reduced ? "instant" : "smooth"), revealDelay);
  }, [reduced]);

  const skipToRevealed = useCallback(() => {
    dispatch({ type: "SKIP_TO_REVEALED" });
    focusFeatures("instant");
  }, []);

  return (
    <RevealContext.Provider
      value={{ padState, revealed: padState.flipped, dispatchScroll, flip, skipToRevealed }}
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
