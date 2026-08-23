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
/**
 * Swallow wheel-driven page advances for this long right after `inView`
 * turns true. The scroll gesture that carries the visitor into the
 * notebook is still sending momentum wheel events (a continuous stream,
 * unrelated to how hard they actually flicked) at the exact moment the
 * IntersectionObserver's callback flips `inView` — without this, the
 * very next one of those already sees `inView === true` and immediately
 * satisfies the deltaY threshold below, advancing straight to page two
 * before the visitor has seen page one at all.
 */
const ENTRY_SETTLE_MS = 500;
/**
 * After a wheel-triggered page turn, further turns are blocked until
 * this much time has passed — a fixed, self-expiring cooldown, not a
 * "has the gesture paused yet" guess. An earlier version tried to reset
 * on any >150ms gap between wheel events, on the theory that a gap
 * means one gesture ended and a new one can begin; trackpad momentum
 * doesn't reliably leave gaps that clean, though — it can keep sending
 * events under that gap for a second or more, so a visitor's genuinely
 * new, deliberate scroll made soon after landing on a page could arrive
 * while the *previous* flick's tail was still technically "ongoing" by
 * that test, and got silently swallowed — reads as scrolling having
 * stopped working entirely. A flat cooldown timestamp instead guarantees
 * scrolling is live again by a fixed, predictable point no matter what
 * the wheel event stream looks like, while still absorbing most of a
 * single flick's momentum tail (which is what was cascading through
 * several pages at once, and occasionally reversing direction on a
 * stray sign-flip near the end of the decay).
 */
const ADVANCE_COOLDOWN_MS = 900;

type PendingFocus = { behavior: ScrollBehavior } | null;

export function MainReveal() {
  const { contentVisible, setNotebookReached } = useReveal();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<{ direction: 1 | -1 } | null>(null);
  // True whenever scroll has reached the slot this section reserves in
  // the document — see the .runway placeholder below. The notebook
  // itself is a fixed overlay now (see .main), not a normal-flow block,
  // so this is the only thing that actually knows "the visitor has
  // scrolled to where this section lives."
  const [inView, setInView] = useState(false);

  const busyRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const pendingFocusRef = useRef<PendingFocus>(null);
  /** Timestamp before which wheel-triggered turns are suppressed — see ENTRY_SETTLE_MS / ADVANCE_COOLDOWN_MS. */
  const lockedUntilRef = useRef(0);

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

  // The notebook only ever occupied its slot correctly if scroll landed
  // *exactly* on the boundary of a normal-flow 100dvh block — anything
  // short of that (scrolling that doesn't hover precisely over the
  // element the old wheel listener was attached to, momentum scroll
  // continuing under a stationary cursor, a dvh rounding difference)
  // left it showing some scrolled-past middle slice of itself with the
  // footer already bleeding in underneath. Confirmed from a screen
  // recording: page content with its own top cut off and "BUILD IT
  // YOURSELF" visible in the same frame, which is only possible if the
  // block actually on screen is shorter than the real viewport.
  //
  // Fixed the same way Scene already solves this exact problem for
  // the 3D pad: the thing that's actually visible is `position: fixed;
  // inset: 0`, which is unambiguous about matching the real viewport no
  // matter what scroll position got you there. `.runway` below is a
  // plain normal-flow placeholder that exists purely to reserve 100dvh
  // of document height (so the footer still lands in the right place)
  // and to tell us, via IntersectionObserver, whether we're currently
  // scrolled to where this section lives.
  useEffect(() => {
    const el = runwayRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    // rootMargin shrinks the effective viewport used for this test —
    // a bare threshold:0 counts *any* overlap at all, which stays true
    // for up to a full extra viewport-height of scroll distance past
    // the placeholder's own edge on either side (its 100dvh height
    // plus the real viewport's own 100dvh both have to clear before
    // "zero overlap" is reached). On the way out toward the footer,
    // that read as the notebook getting stuck on screen well after the
    // visitor had already scrolled on. This keeps enough margin that a
    // fast incoming scroll still reliably engages, while cutting the
    // worst-case lingering roughly in half.
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
      rootMargin: "-15% 0px -15% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Notebook is now the last section in the document — no separate
  // footer after it to independently report "we're past the pad". This
  // forwards the same local `inView` signal into RevealProvider so
  // Scene can hide the pad once scroll reaches here, whether or not the
  // pad was ever explicitly flipped open (see notebookReached there).
  useEffect(() => {
    setNotebookReached(inView);
  }, [inView, setNotebookReached]);

  // Arms the entry-settle lock the moment `inView` actually becomes
  // true — see ENTRY_SETTLE_MS.
  useEffect(() => {
    if (inView) lockedUntilRef.current = performance.now() + ENTRY_SETTLE_MS;
  }, [inView]);

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

  // Wheel and touchmove are wired up as raw, non-passive listeners on
  // `window` — not React's onWheel/onTouchMove (passive by default,
  // e.preventDefault() silently does nothing — confirmed live, Chrome
  // logged the exact warning), and not on the notebook element itself
  // either anymore. Attaching to one specific element meant scroll that
  // didn't dispatch its event to that exact target — cursor position
  // slightly off it, a scrollbar drag, momentum scroll continuing
  // elsewhere — bypassed pagination entirely. `inView` (from the
  // IntersectionObserver above) is what gates this now: engaged
  // whenever scroll has reached this section, regardless of where the
  // pointer happens to be.
  useEffect(() => {
    function onWheel(e: WheelEvent) {
      if (!inView) return;
      const wantsNext = e.deltaY > 0;
      // At either end, do nothing at all — that lets the gesture fall
      // through to native scroll, carrying the visitor on into the
      // footer or back up toward the pad, without this ever trapping
      // the page. This boundary check must be the ONLY thing deciding
      // whether native scroll gets a look at the event — it used to
      // also skip preventDefault for small deltas, on the theory that
      // tiny ticks aren't a deliberate flick, but real trackpad
      // scrolling sends a continuous stream of small-delta events
      // (gesture noise, deceleration tail) that all leaked through to
      // native scroll while still deep in the middle of pagination.
      if (wantsNext ? index === lastIndex : index === 0) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return;
      // Covers both the entry-settle window and the post-turn cooldown
      // — see ADVANCE_COOLDOWN_MS. Trapping the scroll above but not
      // advancing here is what swallows a flick's lingering momentum.
      const now = performance.now();
      if (now < lockedUntilRef.current) return;
      lockedUntilRef.current = now + ADVANCE_COOLDOWN_MS;
      containerRef.current?.focus({ preventScroll: true });
      goTo(index + (wantsNext ? 1 : -1));
    }

    function onTouchMove(e: TouchEvent) {
      if (!inView || touchStartYRef.current === null) return;
      const dy = touchStartYRef.current - (e.touches[0]?.clientY ?? touchStartYRef.current);
      const wantsNext = dy > 0;
      const atBoundary = wantsNext ? index === lastIndex : index === 0;
      if (!atBoundary) e.preventDefault();
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [goTo, index, lastIndex, inView]);

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
  const visible = contentVisible && inView;

  return (
    <>
      {/* Reserves this section's place in the document's scroll height
          and tells us (via the observer above) when we've arrived —
          nothing is ever drawn here. */}
      <div ref={runwayRef} className={styles.runway} aria-hidden="true" />
      <main
        ref={containerRef}
        id="notebook"
        tabIndex={-1}
        className={`${styles.main} ${visible ? styles.visible : ""}`}
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
    </>
  );
}
