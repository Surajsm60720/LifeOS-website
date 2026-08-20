// Layout/animation constants ported 1:1 from the v1 index.html build.
// Single source of truth — nothing here may be duplicated as a literal
// elsewhere (v1 rough edge P2 #4: these were previously duplicated
// between inline <style> and inline <script> and could silently desync).

export const RUNWAY_MULTIPLIER_DESKTOP = 1.9;
export const RUNWAY_MULTIPLIER_NARROW = 1.5;
export const NARROW_BREAKPOINT_PX = 880;

export const SCROLL_DAMPING = 0.075;

export const COVER_OPEN_THRESHOLD = 0.86;
export const COVER_CLOSE_THRESHOLD = 0.78;

export const PAGE_COUNT = 4;
export const PAGE_FLIP_STAGGER_MS = 135;
export const COVER_OPEN_GATE_DELAY_MS = 420;

export const MOTE_COUNT_HIGH = 140;
export const MOTE_COUNT_LOW = 60;
export const DPR_CAP_HIGH = 2;
export const DPR_CAP_LOW = 1;
export const LOW_END_HARDWARE_CONCURRENCY_THRESHOLD = 4;
