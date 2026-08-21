"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PAGE_COUNT } from "@/lib/constants";

const W = 3.05;
const H = 3.85;
// Dark, not the cream of the icon's own calendar illustration — the
// icon's cover texture stays untouched (that's real product art), but
// these are the site's own invented page material, and the site is
// dark-theme only with no light surfaces, full stop.
const SHADES = [0x28282c, 0x2c2c30, 0x252529, 0x302f34];
const DAMPING = 0.1;

type PagesProps = {
  /** Current per-page rotation targets (radians), updated externally by the pad-state reducer. */
  targetsRef: React.RefObject<number[]>;
  /** When true (prefers-reduced-motion), snap instead of damp. */
  reduced: boolean;
};

export function Pages({ targetsRef, reduced }: PagesProps) {
  const hingeRefs = useRef<(THREE.Object3D | null)[]>([]);

  const materials = useMemo(
    () => SHADES.map((shade) => new THREE.MeshStandardMaterial({ color: shade, roughness: 0.7, side: THREE.DoubleSide })),
    []
  );
  const geometry = useMemo(() => new THREE.PlaneGeometry(W - 0.22, H - 0.62), []);

  useFrame(() => {
    const targets = targetsRef.current;
    hingeRefs.current.forEach((hinge, i) => {
      if (!hinge) return;
      const target = targets[i] ?? 0;
      hinge.rotation.x = reduced ? target : hinge.rotation.x + (target - hinge.rotation.x) * DAMPING;
    });
  });

  return (
    <>
      {Array.from({ length: PAGE_COUNT }, (_, i) => (
        <object3D
          key={i}
          ref={(el) => {
            hingeRefs.current[i] = el;
          }}
          position={[0, H / 2 - 0.3, 0.02 + (3 - i) * 0.022]}
        >
          <mesh geometry={geometry} material={materials[i]} position={[0, -(H - 0.62) / 2, 0]} />
        </object3D>
      ))}
    </>
  );
}
