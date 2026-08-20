import { COVER_OPEN_THRESHOLD, COVER_CLOSE_THRESHOLD, PAGE_COUNT } from "./constants";

export type PadState = {
  coverOpen: boolean;
  flipped: boolean;
  pageTargets: number[];
};

export type PadAction =
  | { type: "SCROLL_PROGRESS"; progress: number }
  | { type: "FLIP" }
  | { type: "SET_PAGE_TARGET"; index: number; value: number };

export const initialPadState: PadState = {
  coverOpen: false,
  flipped: false,
  pageTargets: new Array(PAGE_COUNT).fill(0),
};

export function padStateReducer(state: PadState, action: PadAction): PadState {
  switch (action.type) {
    case "SCROLL_PROGRESS": {
      // Once the pages have been flipped, scrolling back up must never
      // re-show the gate or reset the cover (v1 rough edge P2 #7 — this
      // migration resolves the "undefined-feeling" state explicitly by
      // freezing pad state after the flip).
      if (state.flipped) return state;

      if (!state.coverOpen && action.progress >= COVER_OPEN_THRESHOLD) {
        return { ...state, coverOpen: true };
      }
      if (state.coverOpen && action.progress <= COVER_CLOSE_THRESHOLD) {
        return { ...state, coverOpen: false };
      }
      return state;
    }
    case "FLIP": {
      if (state.flipped) return state;
      return { ...state, flipped: true };
    }
    case "SET_PAGE_TARGET": {
      const pageTargets = state.pageTargets.slice();
      pageTargets[action.index] = action.value;
      return { ...state, pageTargets };
    }
    default:
      return state;
  }
}
