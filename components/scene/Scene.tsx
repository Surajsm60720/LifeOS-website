"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import styles from "./Scene.module.css";
import { Lights } from "./Lights";
import { Motes } from "./Motes";
import { Pad } from "./Pad";
import { DPR_CAP_HIGH, DPR_CAP_LOW, LOW_END_HARDWARE_CONCURRENCY_THRESHOLD } from "@/lib/constants";

type SceneProps = {
  easedProgress: number;
  narrow: boolean;
  reduced: boolean;
  revealed: boolean;
  pageTargetsRef: React.RefObject<number[]>;
  coverTargetRef: React.RefObject<number>;
  gateAnchorElRef: React.RefObject<HTMLDivElement | null>;
};

function getDprCap(): number {
  if (typeof navigator === "undefined") return DPR_CAP_HIGH;
  const cores = navigator.hardwareConcurrency ?? DPR_CAP_HIGH;
  return cores < LOW_END_HARDWARE_CONCURRENCY_THRESHOLD ? DPR_CAP_LOW : DPR_CAP_HIGH;
}

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export function Scene(props: SceneProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  // Lazy initializer runs once per render pass (SSR and client); supportsWebGL()
  // guards on `typeof window` so this is safe during server rendering.
  const [webglOk] = useState(() => supportsWebGL());

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && document.visibilityState === "visible"),
      { threshold: 0 }
    );
    io.observe(el);

    function onVisibilityChange() {
      setActive(document.visibilityState === "visible");
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (!webglOk) {
    // Purely decorative — every piece of real content also exists as text
    // elsewhere on the page, so this is hidden from assistive tech rather
    // than left as an unlabeled landmark-less image.
    // eslint-disable-next-line @next/next/no-img-element -- static fallback, no need for next/image's runtime optimization here
    return props.revealed ? null : <img className={styles.fallback} src="/icon-source.png" alt="" aria-hidden="true" />;
  }

  // Once the pages have been flipped and content revealed, the pad stays
  // frozen open (lib/pad-state.ts never re-closes it after FLIP). Left
  // alone that reads as broken — a book stuck half-open forever when you
  // scroll back up. Fade the whole stage out instead, same transition
  // used for the initial fade-in, so scrolling back to the hero shows a
  // clean view rather than a stranded open pad.
  const isShowing = ready && !props.revealed;

  return (
    <div ref={wrapperRef} className={`${styles.stage} ${isShowing ? styles.ready : ""}`} aria-hidden="true">
      <Canvas
        frameloop={active && !props.revealed ? "always" : "never"}
        dpr={getDprCap()}
        camera={{ fov: 40, near: 0.1, far: 100, position: [0, 0, 9] }}
        gl={{ antialias: true, alpha: true }}
        // v1 (three.js r128) rendered untone-mapped; R3F defaults to
        // ACESFilmicToneMapping, which further darkens/desaturates on
        // top of the physically-correct lighting recalibration in
        // Lights.tsx. Flat mode keeps material colors closer to v1's.
        flat
      >
        <Lights />
        <Motes />
        {/*
          Cover.tsx calls useTexture(), which suspends the tree while the
          icon PNG loads. R3F's Canvas does not add a Suspense boundary
          on its own — without one here, the first render attempt throws
          the loading promise with nothing to catch it, that render pass
          is silently dropped, and nothing re-renders the pad until some
          unrelated state change (scroll, HMR, a reload) happens to
          trigger another attempt after the texture's already cached.
          That's the "only shows up after a reload" bug.
        */}
        <Suspense fallback={null}>
          <Pad
            easedProgress={props.easedProgress}
            narrow={props.narrow}
            reduced={props.reduced}
            pageTargetsRef={props.pageTargetsRef}
            coverTargetRef={props.coverTargetRef}
            onCoverLoaded={() => setReady(true)}
            gateAnchorElRef={props.gateAnchorElRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
