"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import styles from "./Scene.module.css";
import { Lights } from "./Lights";
import { Motes } from "./Motes";
import { Pad } from "./Pad";
import { DPR_CAP_HIGH, DPR_CAP_LOW, LOW_END_HARDWARE_CONCURRENCY_THRESHOLD } from "@/lib/constants";

type SceneProps = {
  easedProgress: number;
  narrow: boolean;
  reduced: boolean;
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
    // eslint-disable-next-line @next/next/no-img-element -- static fallback, no need for next/image's runtime optimization here
    return <img className={styles.fallback} src="/icon-source.png" alt="LifeOS app icon" />;
  }

  return (
    <div ref={wrapperRef} className={`${styles.stage} ${ready ? styles.ready : ""}`}>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={getDprCap()}
        camera={{ fov: 40, near: 0.1, far: 100, position: [0, 0, 9] }}
        gl={{ antialias: true, alpha: true }}
      >
        <Lights />
        <Motes />
        <Pad
          easedProgress={props.easedProgress}
          narrow={props.narrow}
          reduced={props.reduced}
          pageTargetsRef={props.pageTargetsRef}
          coverTargetRef={props.coverTargetRef}
          onCoverLoaded={() => setReady(true)}
          gateAnchorElRef={props.gateAnchorElRef}
        />
      </Canvas>
    </div>
  );
}
