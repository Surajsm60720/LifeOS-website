"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Reveal.module.css";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Fades/slides a block in the instant it scrolls into view — the
 * "revealed little by little as people scroll" entries within each
 * notebook page. Ported from v1's `.rise`/`.in` IntersectionObserver
 * pattern, which never made it into the Next.js rebuild.
 */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [observed, setObserved] = useState(false);
  const reduced = useReducedMotion();
  // Lazy initializer, not an effect — computed once at mount, same
  // pattern as Scene.tsx's supportsWebGL() check.
  const [ioUnsupported] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));

  useEffect(() => {
    const el = ref.current;
    if (!el || ioUnsupported) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setObserved(true);
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ioUnsupported]);

  const visible = reduced || ioUnsupported || observed;

  return (
    <div ref={ref} className={`${styles.reveal} ${visible ? styles.in : ""} ${className ?? ""}`}>
      {children}
    </div>
  );
}
