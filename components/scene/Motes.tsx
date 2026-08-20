"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MOTE_COUNT_HIGH, MOTE_COUNT_LOW, LOW_END_HARDWARE_CONCURRENCY_THRESHOLD } from "@/lib/constants";

function getMoteCount(): number {
  if (typeof navigator === "undefined") return MOTE_COUNT_HIGH;
  const cores = navigator.hardwareConcurrency ?? MOTE_COUNT_HIGH;
  return cores < LOW_END_HARDWARE_CONCURRENCY_THRESHOLD ? MOTE_COUNT_LOW : MOTE_COUNT_HIGH;
}

export function Motes() {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const count = getMoteCount();
    const positions = new Float32Array(count * 3);
    // Deliberately random, one-time starfield scatter — memoized so it
    // only runs once per mount. The React Compiler purity rule flags any
    // Math.random() reachable from render regardless of memoization;
    // that's a legitimate false positive for one-shot procedural geometry.
    /* eslint-disable react-hooks/purity */
    for (let m = 0; m < count; m++) {
      positions[m * 3 + 0] = (Math.random() - 0.5) * 22;
      positions[m * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[m * 3 + 2] = (Math.random() - 0.5) * 10 - 4;
    }
    /* eslint-enable react-hooks/purity */
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: 0xc7ccd6,
        size: 0.035,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: true,
      }),
    []
  );

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.014;
    pointsRef.current.position.y = Math.sin(t * 0.25) * 0.25;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
