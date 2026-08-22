"use client";

import { useEffect, useRef } from "react";
import styles from "./PageCurl.module.css";

type PageCurlProps = {
  /** +1 turning toward the next page, -1 turning back toward the previous one. */
  direction: 1 | -1;
  durationMs: number;
};

const EDGE_TICKS = 6;
const SPRING_STIFFNESS = 68;
const SPRING_DAMPING = 10.5;

/**
 * Same underdamped-spring character as the intro pad's own page-turn
 * physics (lib/page-flex.ts) — rewritten fresh here rather than
 * imported, since that one drives WebGL mesh vertices in radians and
 * this drives a CSS rotateX in degrees, and forcing the two onto a
 * shared coordinate system would cost more than it would save. The k/c
 * constants are lifted directly across, though: a linear spring's
 * settle time as a *fraction* of its own target doesn't depend on the
 * target's units or magnitude, so the same values give the same feel.
 */
function stepSpring(angle: number, velocity: number, target: number, dt: number) {
  const v = velocity + ((target - angle) * SPRING_STIFFNESS - velocity * SPRING_DAMPING) * dt;
  return { angle: angle + v * dt, velocity: v };
}

/**
 * The visual sold on this page-to-page turn is a stylized clone of the
 * page's own shell (rings, ruled lines, the same card shape) flipping
 * over a top hinge — not the literal feature content underneath, which
 * swaps instantly beneath this overlay. Simulating a true multi-segment
 * paper bend of arbitrary live HTML (real text, animated sketches)
 * would mean rendering every card several times over during the
 * transition purely for clip-path slicing; this gets the same springy,
 * overshooting, never-quite-rigid character from the spring itself plus
 * a velocity-driven skew and a handful of fluttering ticks along the
 * free edge, at a fraction of the cost.
 */
export function PageCurl({ direction, durationMs }: PageCurlProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const tickRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let angle = 0;
    let velocity = 0;
    let last = performance.now();
    const start = last;
    const target = direction > 0 ? -180 : 180;
    let raf = 0;

    function frame(now: number) {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const stepped = stepSpring(angle, velocity, target, dt);
      angle = stepped.angle;
      velocity = stepped.velocity;

      const sheet = sheetRef.current;
      if (sheet) {
        const flutter = velocity * 0.01;
        sheet.style.transform = `rotateX(${angle}deg) skewY(${flutter}deg)`;
      }

      const swing = Math.sin((angle / target) * (Math.PI / 2));
      tickRefs.current.forEach((el, i) => {
        if (!el) return;
        const t = (i + 1) / EDGE_TICKS;
        el.style.transform = `translateZ(${Math.sin(swing * Math.PI * 2 + i * 0.9) * 6 * t}px)`;
      });

      if (now - start < durationMs) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [direction, durationMs]);

  return (
    <div className={styles.stage} aria-hidden="true">
      <div className={styles.sheet} ref={sheetRef}>
        <div className={`${styles.face} ${styles.front}`}>
          <div className={styles.rings}>
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className={styles.lines} />
        </div>
        <div className={`${styles.face} ${styles.back}`} />
        <div className={styles.edge}>
          {Array.from({ length: EDGE_TICKS }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                tickRefs.current[i] = el;
              }}
              className={styles.tick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
