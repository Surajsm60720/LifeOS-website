"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Pages } from "./Pages";
import { Cover } from "./Cover";
import { Rings } from "./Rings";
import { usePadAnchor } from "@/hooks/usePadAnchor";

const W = 3.05;
const H = 3.85;

type PadProps = {
  easedProgress: number;
  narrow: boolean;
  reduced: boolean;
  pageTargetsRef: React.RefObject<number[]>;
  coverTargetRef: React.RefObject<number>;
  onCoverLoaded: () => void;
  gateAnchorElRef: React.RefObject<HTMLDivElement | null>;
};

export function Pad({
  easedProgress,
  narrow,
  reduced,
  pageTargetsRef,
  coverTargetRef,
  onCoverLoaded,
  gateAnchorElRef,
}: PadProps) {
  const { camera } = useThree();
  const padRef = useRef<THREE.Group>(null);
  const coverHingeRef = useRef<THREE.Object3D>(null);
  const pointerRef = useRef({ tx: 0, ty: 0, px: 0, py: 0 });

  const boardMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x1c1c1f, roughness: 0.88, metalness: 0.05 }), []);
  const boardGeometry = useMemo(() => new THREE.BoxGeometry(W, H, 0.16), []);

  usePadAnchor(padRef, gateAnchorElRef);

  useFrame(({ clock }) => {
    const pad = padRef.current;
    if (!pad) return;
    const t = clock.getElapsedTime();
    const e = easedProgress;

    camera.position.z = 9 - e * 3.7;
    pad.position.x = (narrow ? 0 : 1.55) * (1 - e);
    pad.position.y = -0.15 * e;
    pad.rotation.y = -0.52 * (1 - e) + pointerRef.current.px * 0.16;
    pad.rotation.x = 0.2 * (1 - e) + pointerRef.current.py * 0.1;

    if (!reduced) {
      pad.position.y += Math.sin(t * 0.9) * 0.045;
      pad.rotation.z = Math.sin(t * 0.6) * 0.012;
    }

    pointerRef.current.px += (pointerRef.current.tx - pointerRef.current.px) * 0.05;
    pointerRef.current.py += (pointerRef.current.ty - pointerRef.current.py) * 0.05;
  });

  return (
    <group
      ref={padRef}
      onPointerMove={(event) => {
        pointerRef.current.tx = event.pointer.x * 0.5;
        pointerRef.current.ty = -event.pointer.y * 0.5;
      }}
    >
      <mesh geometry={boardGeometry} material={boardMaterial} position={[0, 0, -0.09]} />
      <Pages targetsRef={pageTargetsRef} reduced={reduced} />
      <Cover targetRef={coverTargetRef} reduced={reduced} onLoaded={onCoverLoaded} hingeRef={coverHingeRef} />
      <Rings />
    </group>
  );
}
