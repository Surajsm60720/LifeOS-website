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
      // Scrolling back closes the cover/flipped flags immediately — the
      // content crossfade keys off these and must react right away.
      // pageTargets is deliberately left as-is here, not
      // zeroed: RevealProvider watches flipped's true->false edge and
      // staggers them closed itself (mirroring flip()'s staggered open),
      // so the pages visibly shut one at a time instead of all snapping
      // to closed in the same frame.
      if ((state.coverOpen || state.flipped) && action.progress <= COVER_CLOSE_THRESHOLD) {
        return { ...state, coverOpen: false, flipped: false };
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
      // (cover open, pages at their open angle, no stagger) so Scene's
      // visibility, driven by this same state, stays consistent
      // regardless of which path revealed the content.
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
