"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { RefObject } from "react";
import * as THREE from "three";
import { projectToScreenPx } from "@/lib/project-to-screen";

// Reused across frames to avoid allocating a new Vector3 60 times/sec.
const TMP_VECTOR = new THREE.Vector3();

/**
 * Writes the projected screen position of `padRef.current` directly to
 * `targetElRef.current`'s inline style each frame, bypassing React
 * state so the DOM-positioned gate overlay can track the 3D pad at 60fps
 * without triggering a React re-render per frame.
 */
export function usePadAnchor(
  padRef: RefObject<THREE.Object3D | null>,
  targetElRef: RefObject<HTMLElement | null>
): void {
  const { camera, size } = useThree();

  useFrame(() => {
    const pad = padRef.current;
    const el = targetElRef.current;
    if (!pad || !el) return;
    const worldPosition = pad.getWorldPosition(TMP_VECTOR);
    const { xPx, yPx } = projectToScreenPx(worldPosition, camera, size.width, size.height);
    el.style.setProperty("--gate-x", `${xPx}px`);
    el.style.setProperty("--gate-y", `${yPx}px`);
  });
}
