import { COVER_OPEN_THRESHOLD, COVER_CLOSE_THRESHOLD, PAGE_COUNT } from "./constants";

export type PadState = {
  coverOpen: boolean;
  flipped: boolean;
  pageTargets: number[];
};

export type PadAction =
  | { type: "SCROLL_PROGRESS"; progress: number }
  | { type: "FLIP" }
  | { type: "SET_PAGE_TARGET"; index: number; value: number }
  | { type: "SKIP_TO_REVEALED" };

export const PAGE_OPEN_ANGLE = -Math.PI * 0.97;

function freshPadState(): PadState {
  return { coverOpen: false, flipped: false, pageTargets: new Array(PAGE_COUNT).fill(0) };
}

export const initialPadState: PadState = freshPadState();

export function padStateReducer(state: PadState, action: PadAction): PadState {
  switch (action.type) {
    case "SCROLL_PROGRESS": {
      if (!state.coverOpen && !state.flipped && action.progress >= COVER_OPEN_THRESHOLD) {
        return { ...state, coverOpen: true };
      }
      // Scrolling back closes everything — cover and, if the pages had
      // been turned, the pages too. This is the reversible "closing
      // animation": pageTargets/coverOpen resetting to 0 here is what
      // Pages.tsx/Cover.tsx pick up and damp back toward closed each
      // frame, so the notebook visibly shuts as you scroll back to it.
      if ((state.coverOpen || state.flipped) && action.progress <= COVER_CLOSE_THRESHOLD) {
        return freshPadState();
      }
      return state;
    }
    case "FLIP": {
      if (!state.coverOpen || state.flipped) return state;
      return { ...state, flipped: true };
    }
    case "SET_PAGE_TARGET": {
      const pageTargets = state.pageTargets.slice();
      pageTargets[action.index] = action.value;
      return { ...state, pageTargets };
    }
    case "SKIP_TO_REVEALED": {
      // The hero's skip-intro link bypasses the 3D pad entirely — it
      // doesn't scroll through the open threshold, so it can't rely on
      // FLIP's coverOpen precondition. Force full-open state directly
      // (cover open, pages at their open angle, no stagger) so Gate/
      // Scene visibility — both driven by this same state — stay
      // consistent regardless of which path revealed the content.
      if (state.flipped) return state;
      return {
        coverOpen: true,
        flipped: true,
        pageTargets: state.pageTargets.map(() => PAGE_OPEN_ANGLE),
      };
    }
    default:
      return state;
  }
}
