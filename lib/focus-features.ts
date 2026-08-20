/**
 * Moves focus to the #features heading and scrolls it into view.
 * Shared by the hero's "skip intro" link and the gate's flip button so
 * both interaction paths land in the same place (v1 rough edge P1 #2 —
 * v1 lost focus to <body> after the flip with no recovery).
 */
export function focusFeatures(behavior: ScrollBehavior = "smooth"): void {
  const el = document.getElementById("features");
  if (!el) return;
  el.scrollIntoView({ behavior, block: "start" });
  el.focus({ preventScroll: true });
}
