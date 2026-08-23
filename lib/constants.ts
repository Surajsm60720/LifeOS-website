// Layout/animation constants ported 1:1 from the v1 index.html build.
// Single source of truth — nothing here may be duplicated as a literal
// elsewhere (v1 rough edge P2 #4: these were previously duplicated
// between inline <style> and inline <script> and could silently desync).

// Shorter than the original 1.9/1.5 — that reserved more scroll distance
// than the auto-flip sequence (see AUTO_FLIP_DELAY_MS below) actually
// needs once it kicks in at COVER_OPEN_THRESHOLD.
export const RUNWAY_MULTIPLIER_DESKTOP = 1.3;
export const RUNWAY_MULTIPLIER_NARROW = 1.1;
export const NARROW_BREAKPOINT_PX = 880;

export const SCROLL_DAMPING = 0.075;

export const COVER_OPEN_THRESHOLD = 0.86;
export const COVER_CLOSE_THRESHOLD = 0.78;

export const PAGE_COUNT = 4;
export const PAGE_FLIP_STAGGER_MS = 135;
/** How long one page's spring takes to swing over and stop wobbling (see lib/page-flex.ts). */
export const PAGE_SETTLE_MS = 420;
/**
 * Hold the cover open this long when closing: every page must be back
 * down AND done wobbling before the cover drops over them, or the cover
 * hides the tail of the animation.
 */
export const PAGE_CLOSE_HOLD_MS = PAGE_COUNT * PAGE_FLIP_STAGGER_MS + PAGE_SETTLE_MS;
/** Beat between the cover finishing its own opening swing and the pages auto-flipping open — scroll alone drives this now, no click. */
export const AUTO_FLIP_DELAY_MS = 420;

export const MOTE_COUNT_HIGH = 140;
export const MOTE_COUNT_LOW = 60;
export const DPR_CAP_HIGH = 2;
export const DPR_CAP_LOW = 1;
export const LOW_END_HARDWARE_CONCURRENCY_THRESHOLD = 4;
