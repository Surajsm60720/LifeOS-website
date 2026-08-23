"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { stepSpring, type SpringState } from "@/lib/page-flex";

const W = 3.05;
const H = 3.85;
// Same spring integrator as the pages, tuned heavier: the cover is a
// stiff board, so it's near-critically damped and swings once without
// the paper's overshoot. A plain per-frame lerp (what this replaced)
// also ran at double speed on a 120Hz display.
const SPRING_STIFFNESS = 42;
const SPRING_DAMPING = 11.5;
const MAX_STEP = 1 / 30;

type CoverProps = {
  /** Current target rotation (radians), updated externally by the pad-state reducer. */
  targetRef: React.RefObject<number>;
  reduced: boolean;
  onLoaded: () => void;
  /** Ref to the hinge Object3D — shared with Pages.tsx so pages swing from the same pivot the cover does. */
  hingeRef: React.RefObject<THREE.Object3D | null>;
};

export function Cover({ targetRef, reduced, onLoaded, hingeRef }: CoverProps) {
  const texture = useTexture("/icon-source.png", () => onLoaded());
  // three.js Texture objects are mutated in place by design (not React
  // state) — the React Compiler immutability rule doesn't model this;
  // this is the standard R3F pattern for configuring a loaded texture.
  // eslint-disable-next-line react-hooks/immutability
  texture.colorSpace = THREE.SRGBColorSpace;

  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const spring = useRef<SpringState>({ angle: 0, velocity: 0 });

  useFrame((_, delta) => {
    const hinge = hingeRef.current;
    if (!hinge) return;
    const target = targetRef.current ?? 0;
    if (reduced) {
      hinge.rotation.x = target;
      spring.current = { angle: target, velocity: 0 };
      return;
    }
    spring.current = stepSpring(spring.current, target, Math.min(delta, MAX_STEP), SPRING_STIFFNESS, SPRING_DAMPING);
    hinge.rotation.x = spring.current.angle;
  });

  return (
    <object3D ref={hingeRef} position={[0, H / 2 - 0.3, 0.115]}>
      <mesh position={[0, -(W - 0.2) / 2 - 0.06, 0]}>
        <planeGeometry args={[W - 0.2, W - 0.2]} />
        <meshStandardMaterial ref={materialRef} map={texture} roughness={0.66} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
    </object3D>
  );
}
