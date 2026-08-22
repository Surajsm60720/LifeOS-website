/**
 * Jumps to notebook page 0 and moves focus to the #features heading.
 * Shared by the hero's "skip intro" link and the gate's flip button so
 * both interaction paths land in the same place (v1 rough edge P1 #2 —
 * v1 lost focus to <body> after the flip with no recovery).
 *
 * This only dispatches a request — MainReveal owns the actual page
 * index and is the only thing that knows when the target page's DOM
 * (including #features) has actually mounted, so it does the real
 * scrollIntoView/focus itself once its own state has caught up.
 */
export function focusFeatures(behavior: ScrollBehavior = "smooth"): void {
  window.dispatchEvent(new CustomEvent("lifeos:goto-page", { detail: { index: 0, focus: true, behavior } }));
}
