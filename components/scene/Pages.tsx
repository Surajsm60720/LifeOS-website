"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PAGE_COUNT } from "@/lib/constants";

const W = 3.05;
const H = 3.85;
const PAGE_W = W - 0.22;
const PAGE_H = H - 0.62;
// Dark, not the cream of the icon's own calendar illustration — the
// icon's cover texture stays untouched (that's real product art), but
// these are the site's own invented page material, and the site is
// dark-theme only with no light surfaces, full stop.
const SHADES = [0x28282c, 0x2c2c30, 0x252529, 0x302f34];
const DAMPING = 0.1;
const MAX_ROTATION = Math.PI * 0.97; // matches PAGE_OPEN_ANGLE's magnitude in lib/pad-state.ts
const HEIGHT_SEGMENTS = 14;
const MAX_CURL = 0.16; // world units of Z-bow at the free edge, at peak mid-flip

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

  // A flat, unsegmented PlaneGeometry rotating around one hinge reads as
  // a rigid board flipping, not paper. Each page gets its own geometry
  // (they can't share one — every page needs an independent per-frame
  // curl) subdivided along its height, so it can bow along Z as it
  // turns. Width stays a single segment; only the hinge-to-free-edge
  // axis needs resolution for the curl.
  const geometries = useMemo(
    () => Array.from({ length: PAGE_COUNT }, () => new THREE.PlaneGeometry(PAGE_W, PAGE_H, 1, HEIGHT_SEGMENTS)),
    []
  );

  useFrame(() => {
    const targets = targetsRef.current;
    hingeRefs.current.forEach((hinge, i) => {
      if (!hinge) return;
      const target = targets[i] ?? 0;
      hinge.rotation.x = reduced ? target : hinge.rotation.x + (target - hinge.rotation.x) * DAMPING;

      if (reduced) return;

      // Bow the free edge out along Z as a function of how far through
      // the flip this page currently is — zero at rest (closed or fully
      // open), peaking mid-flip — so the page visibly flexes like paper
      // instead of swinging as a rigid panel.
      const geometry = geometries[i];
      const position = geometry.attributes.position;
      const progress = Math.min(1, Math.abs(hinge.rotation.x) / MAX_ROTATION);
      const curl = Math.sin(progress * Math.PI) * MAX_CURL;
      for (let v = 0; v < position.count; v++) {
        const localY = position.getY(v); // -PAGE_H/2 (free edge) .. +PAGE_H/2 (hinge edge)
        const t = (PAGE_H / 2 - localY) / PAGE_H; // 0 at hinge edge, 1 at free edge
        position.setZ(v, curl * t * t);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
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
          <mesh geometry={geometries[i]} material={materials[i]} position={[0, -PAGE_H / 2, 0]} />
        </object3D>
      ))}
    </>
  );
}
