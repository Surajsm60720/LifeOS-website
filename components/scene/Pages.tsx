"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PAGE_COUNT } from "@/lib/constants";
import {
  edgePresence,
  flexLimits,
  flexOffset,
  softClip,
  stepEnergy,
  stepSpring,
  SPRING_DAMPING,
  SPRING_STIFFNESS,
  type SpringState,
} from "@/lib/page-flex";

const W = 3.05;
const H = 3.85;
const PAGE_W = W - 0.22;
const PAGE_H = H - 0.62;
// Dark, not the cream of the icon's own calendar illustration — the
// icon's cover texture stays untouched (that's real product art), but
// these are the site's own invented page material, and the site is
// dark-theme only with no light surfaces, full stop.
const SHADES = [0x28282c, 0x2c2c30, 0x252529, 0x302f34];
const WIDTH_SEGMENTS = 9;
const HEIGHT_SEGMENTS = 24;

const HINGE_Y = H / 2 - 0.3;
/** Where each sheet rests in the stack; index 0 is the topmost. */
const PAGE_Z = (i: number) => 0.02 + (PAGE_COUNT - 1 - i) * 0.022;
/** Cover.tsx hinges its plane at this depth; Pad.tsx's board box fronts here. */
const COVER_Z = 0.115;
const BOARD_FRONT_Z = -0.09 + 0.16 / 2;
const BOARD_TOP_Y = H / 2;
/** Blend width for the board's top edge, so its limit fades in rather than popping. */
const BOARD_EDGE_BAND = 0.15;

/** Longest frame the spring integrator is asked to swallow, in seconds. */
const MAX_STEP = 1 / 30;

type PagesProps = {
  /** Current per-page rotation targets (radians), updated externally by the pad-state reducer. */
  targetsRef: React.RefObject<number[]>;
  /**
   * The cover's hinge, shared from Pad. Read to know whether the cover is
   * actually in the way this frame — with it open (which it always is by
   * the time pages move) the pages are free to flex as far as they like.
   */
  coverHingeRef: React.RefObject<THREE.Object3D | null>;
  /** When true (prefers-reduced-motion), snap instead of animating. */
  reduced: boolean;
};

export function Pages({ targetsRef, coverHingeRef, reduced }: PagesProps) {
  const hingeRefs = useRef<(THREE.Object3D | null)[]>([]);
  // Per-page spring + flutter state, persisted across frames.
  const springs = useRef<SpringState[]>(Array.from({ length: PAGE_COUNT }, () => ({ angle: 0, velocity: 0 })));
  const energies = useRef<number[]>(new Array(PAGE_COUNT).fill(0));

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

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    // Clamped: a stalled tab or a GC pause hands back a huge delta, and a
    // stiff spring integrated over it explodes.
    const dt = Math.min(delta, MAX_STEP);
    const targets = targetsRef.current;

    const coverRotation = coverHingeRef.current?.rotation.x ?? 0;
    const coverPresence = Math.max(0, Math.cos(coverRotation));

    hingeRefs.current.forEach((hinge, i) => {
      if (!hinge) return;
      const target = targets[i] ?? 0;

      if (reduced) {
        hinge.rotation.x = target;
        springs.current[i] = { angle: target, velocity: 0 };
        return;
      }

      // Each sheet is given slightly different stiffness/damping so the
      // stack never swings as one slab even where the stagger overlaps.
      const spring = stepSpring(
        springs.current[i],
        target,
        dt,
        SPRING_STIFFNESS * (1 - i * 0.05),
        SPRING_DAMPING * (1 - i * 0.04)
      );
      springs.current[i] = spring;
      hinge.rotation.x = spring.angle;

      const energy = stepEnergy(energies.current[i], spring.velocity, dt);
      energies.current[i] = energy;

      const geometry = geometries[i];
      const position = geometry.attributes.position;
      const sinRotation = Math.sin(spring.angle);
      const cosRotation = Math.cos(spring.angle);
      const pageZ = PAGE_Z(i);
      const phase = i * 1.7;

      for (let v = 0; v < position.count; v++) {
        const localY = position.getY(v); // +PAGE_H/2 at the hinge edge, -PAGE_H/2 at the free edge
        const t = (PAGE_H / 2 - localY) / PAGE_H; // 0 at hinge, 1 at free edge
        const xNorm = position.getX(v) / (PAGE_W / 2);
        const armLength = t * PAGE_H;

        const raw = flexOffset({ t, xNorm, rotation: spring.angle, angularVelocity: spring.velocity, energy, time, phase });

        // Where this vertex already sits, rigidly, before flexing — the
        // obstacle gaps are measured from here, not from the page's
        // resting depth, so a free edge that has swung out in front of
        // the pad isn't limited as though the board were still behind it.
        const vertexZ = pageZ - armLength * sinRotation;
        const vertexY = HINGE_Y - armLength * cosRotation;
        const { forward, backward } = flexLimits({
          vertexZ,
          coverZ: COVER_Z,
          boardFrontZ: BOARD_FRONT_Z,
          cosRotation,
          coverPresence,
          boardPresence: edgePresence(vertexY - BOARD_TOP_Y, BOARD_EDGE_BAND),
        });

        position.setZ(v, softClip(raw, forward, backward));
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
          position={[0, HINGE_Y, PAGE_Z(i)]}
        >
          <mesh geometry={geometries[i]} material={materials[i]} position={[0, -PAGE_H / 2, 0]} />
        </object3D>
      ))}
    </>
  );
}
