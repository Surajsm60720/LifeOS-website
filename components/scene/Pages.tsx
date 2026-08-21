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
const WIDTH_SEGMENTS = 7;
const HEIGHT_SEGMENTS = 20;
// A single smooth arc read as "stiff plastic bending," not paper — real
// paper flutters: a big primary bow, plus a cross-width ripple that's
// most active while actually turning, plus a small continuous idle wave
// so it's never perfectly flat even at rest.
const MAX_CURL = 0.5; // ceiling: world units of primary bow at the free edge, once safely past edge-on
const RIPPLE_AMPLITUDE = 0.15; // ceiling, same story as MAX_CURL
const RIPPLE_FREQUENCY = 2.4;
const IDLE_AMPLITUDE = 0.02;
const IDLE_FREQUENCY = 1.6;
// Cover's hinge sits at world Z 0.115 (Cover.tsx). A vertex's curl is an
// offset along the mesh's local Z, which projects toward the camera/cover
// by roughly cos(rotation) — near-total near closed, near-zero once edge-on.
// A hard on/off gate at 90° reads as "dead, then suddenly alive," which is
// its own kind of stiff. Instead, cap each effect's *raw* amplitude so its
// worst-case projection (amplitude * cos(rotation)) never exceeds a fixed
// safe margin, at every rotation angle — small-but-nonzero flutter from the
// very start of the flip, growing smoothly as cos(rotation) shrinks, and
// reaching full ceiling amplitude once the page is safely near edge-on.
const SAFE_MARGIN_CURL = 0.055;
const SAFE_MARGIN_RIPPLE = 0.02;

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
  // (they can't share one — every page needs independent per-frame
  // motion) subdivided in both directions, so it can bow and ripple as
  // it turns rather than swinging as a rigid panel.
  const geometries = useMemo(
    () => Array.from({ length: PAGE_COUNT }, () => new THREE.PlaneGeometry(PAGE_W, PAGE_H, WIDTH_SEGMENTS, HEIGHT_SEGMENTS)),
    []
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const targets = targetsRef.current;
    hingeRefs.current.forEach((hinge, i) => {
      if (!hinge) return;
      const target = targets[i] ?? 0;
      hinge.rotation.x = reduced ? target : hinge.rotation.x + (target - hinge.rotation.x) * DAMPING;

      if (reduced) return;

      const geometry = geometries[i];
      const position = geometry.attributes.position;
      const progress = Math.min(1, Math.abs(hinge.rotation.x) / MAX_ROTATION);
      const flipShape = Math.sin(progress * Math.PI); // 0 at rest, 1 at mid-flip

      const cosR = Math.abs(Math.cos(hinge.rotation.x));
      const curlCap = cosR > 1e-3 ? Math.min(MAX_CURL, SAFE_MARGIN_CURL / cosR) : MAX_CURL;
      const rippleCap = cosR > 1e-3 ? Math.min(RIPPLE_AMPLITUDE, SAFE_MARGIN_RIPPLE / cosR) : RIPPLE_AMPLITUDE;

      const primaryCurl = flipShape * curlCap;
      // No floor here — ripple must reach exactly 0 at rest, same bug
      // class as the clipping this whole cap scheme guards against (a
      // "never quite zero" strength was enough to bow a closed page's
      // free edge in front of the cover).
      const rippleStrength = flipShape * flipShape * rippleCap;
      const phase = time * 2.2 + i * 1.7;

      for (let v = 0; v < position.count; v++) {
        const localX = position.getX(v);
        const localY = position.getY(v); // -PAGE_H/2 (free edge) .. +PAGE_H/2 (hinge edge)
        const t = (PAGE_H / 2 - localY) / PAGE_H; // 0 at hinge edge, 1 at free edge
        const tFalloff = Math.pow(t, 1.3);

        const bow = primaryCurl * tFalloff;
        const ripple = Math.sin(localX * RIPPLE_FREQUENCY + phase) * rippleStrength * tFalloff;
        // Idle wave is small enough (0.02 peak) to stay within the combined
        // safety budget unconditionally, even at rotation 0 — it's the
        // "never perfectly flat" touch, not part of the flip flourish, so
        // it isn't capped like curl/ripple above.
        const idle = Math.sin(t * Math.PI * 1.4 + time * IDLE_FREQUENCY + i * 0.9) * IDLE_AMPLITUDE * t;

        position.setZ(v, bow + ripple + idle);
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
