"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./MainReveal.module.css";
import { useReveal } from "./RevealProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ContentPage } from "./ContentPage";
import { FeatureSection } from "./FeatureSection";
import { PageCurl } from "./PageCurl";
import { contentPages } from "@/lib/content";

/** How long one page-turn's spring plays before the swap commits — matches PageCurl's own settle time. */
const TURN_MS = 620;
/** Wheel/trackpad deltaY smaller than this is noise, not an intentional flick. */
const WHEEL_THRESHOLD = 4;
/** Vertical touch travel needed before it counts as a deliberate swipe, not a tap or a jitter. */
const SWIPE_THRESHOLD = 48;

type PendingFocus = { behavior: ScrollBehavior } | null;

export function MainReveal() {
  const { contentVisible } = useReveal();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<{ direction: 1 | -1 } | null>(null);

  const busyRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<PendingFocus>(null);

  const lastIndex = contentPages.length - 1;

  const goTo = useCallback(
    (next: number, instant = false) => {
      if (busyRef.current || next < 0 || next > lastIndex || next === index) return;
      if (reduced || instant) {
        setIndex(next);
        return;
      }
      busyRef.current = true;
      // The real content swaps immediately — the curl overlay is what
      // hides that cut, starting fully opaque (covering the just-swapped
      // page) and rotating away over the hinge to reveal it. Deferring
      // the swap to the *end* of the timer instead (the first version of
      // this) left the correct next page invisible until the very last
      // frame: what actually animated for 620ms was a disconnected
      // decorative shape flying off over top of the still-unchanged old
      // page, then an abrupt cut once the timer fired.
      setIndex(next);
      setTurn({ direction: next > index ? 1 : -1 });
      window.setTimeout(() => {
        setTurn(null);
        busyRef.current = false;
      }, TURN_MS);
    },
    [index, lastIndex, reduced]
  );

  // Decoupled from the hero/gate's "see the features" links via a DOM
  // event, since focus-features.ts is a plain utility with no reference
  // to this component's state — it can ask for page 0 and a focus
  // landing, but can't itself know when React has actually finished
  // re-rendering with that page's content mounted.
  useEffect(() => {
    function onJump(e: Event) {
      const detail = (e as CustomEvent<{ index: number; focus?: boolean; behavior?: ScrollBehavior }>).detail;
      // Landing on the site fresh means index is already 0 — goTo(0)
      // is then a no-op (same guard that stops re-navigating to the
      // current page), so nothing will re-render to hang a deferred
      // focus off of. Do it immediately in that case instead of
      // relying on the index-change effect below, which would
      // otherwise silently never fire.
      if (detail.index === index) {
        if (detail.focus) {
          const el = document.getElementById("features");
          el?.scrollIntoView({ behavior: detail.behavior ?? "smooth", block: "start" });
          el?.focus({ preventScroll: true });
        }
        return;
      }
      if (detail.focus) pendingFocusRef.current = { behavior: detail.behavior ?? "smooth" };
      goTo(detail.index, true);
    }
    window.addEventListener("lifeos:goto-page", onJump);
    return () => window.removeEventListener("lifeos:goto-page", onJump);
  }, [goTo, index]);

  // Runs after `index` actually changes, so the target page's DOM
  // (including #features) is guaranteed to exist by the time this fires
  // — doing the focus inline in the event handler above would race
  // React's own re-render.
  useEffect(() => {
    const pending = pendingFocusRef.current;
    if (!pending) return;
    pendingFocusRef.current = null;
    const el = document.getElementById("features");
    if (!el) return;
    el.scrollIntoView({ behavior: pending.behavior, block: "start" });
    el.focus({ preventScroll: true });
  }, [index]);

  // Wheel and touchmove are wired up as raw, non-passive listeners
  // rather than React's onWheel/onTouchMove — React (and browsers, by
  // default) treat those as passive for scroll-performance reasons,
  // which means e.preventDefault() inside them silently does nothing.
  // Confirmed by testing the JSX version first: Chrome logged "Unable
  // to preventDefault inside passive event listener invocation" on
  // every wheel tick, and native scroll kept fighting the page-turn.
  // Re-attached whenever `goTo` changes identity (i.e. whenever `index`
  // changes) so the closure here is never reading a stale page index.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      const wantsNext = e.deltaY > 0;
      // At either end, do nothing at all — that lets the gesture fall
      // through to native scroll, carrying the visitor on into the
      // footer or back up toward the pad, without this ever trapping
      // the page. This boundary check must be the ONLY thing deciding
      // whether native scroll gets a look at the event. It used to also
      // skip preventDefault for small deltas, on the theory that tiny
      // ticks aren't a deliberate flick — but real trackpad scrolling
      // sends a continuous stream of many small-delta events (gesture
      // noise, deceleration tail), and every one of those was leaking
      // straight through to native document scroll while still deep in
      // the middle of pagination. Confirmed live: enough of them in a
      // row drifted window.scrollY back down across the pad's own
      // close threshold, reopening the gate simultaneously with page 5
      // and the footer, all three visible at once. Small deltas now
      // still get swallowed here — they just don't trigger a page turn.
      if (wantsNext ? index === lastIndex : index === 0) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
      el?.focus({ preventScroll: true });
      goTo(index + (wantsNext ? 1 : -1));
    }

    function onTouchMove(e: TouchEvent) {
      if (touchStartYRef.current === null) return;
      const dy = touchStartYRef.current - (e.touches[0]?.clientY ?? touchStartYRef.current);
      const wantsNext = dy > 0;
      const atBoundary = wantsNext ? index === lastIndex : index === 0;
      // Same reasoning as onWheel: only the boundary decides whether
      // native scroll gets the event. Small per-frame touch deltas
      // (finger tremor during an otherwise deliberate swipe) used to
      // fall through here too.
      if (!atBoundary) e.preventDefault();
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [goTo, index, lastIndex]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartYRef.current === null) return;
      const dy = touchStartYRef.current - (e.changedTouches[0]?.clientY ?? touchStartYRef.current);
      touchStartYRef.current = null;
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;
      containerRef.current?.focus({ preventScroll: true });
      goTo(index + (dy > 0 ? 1 : -1));
    },
    [goTo, index]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goTo(index - 1);
      }
    },
    [goTo, index]
  );

  const page = contentPages[index];

  return (
    <main
      ref={containerRef}
      id="notebook"
      tabIndex={-1}
      className={`${styles.main} ${contentVisible ? styles.revealed : ""}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <ContentPage key={page.label} label={page.label}>
        {page.sections.map((section) => (
          <FeatureSection section={section} key={section.heading} />
        ))}
      </ContentPage>
      {turn && <PageCurl direction={turn.direction} durationMs={TURN_MS} />}
      <div className={styles.dots} aria-hidden="true">
        {contentPages.map((p, i) => (
          <span key={p.label} className={i === index ? styles.dotActive : styles.dot} />
        ))}
      </div>
    </main>
  );
}
