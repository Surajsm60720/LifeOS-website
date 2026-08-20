"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const W = 3.05;
const H = 3.85;
const DAMPING = 0.11;

type CoverProps = {
  /** Current target rotation (radians), updated externally by the pad-state reducer. */
  targetRef: React.RefObject<number>;
  reduced: boolean;
  onLoaded: () => void;
  /** Ref to the hinge Object3D — consumed by usePadAnchor in Pad.tsx to anchor the DOM gate. */
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

  useFrame(() => {
    const hinge = hingeRef.current;
    if (!hinge) return;
    const target = targetRef.current ?? 0;
    hinge.rotation.x = reduced ? target : hinge.rotation.x + (target - hinge.rotation.x) * DAMPING;
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
