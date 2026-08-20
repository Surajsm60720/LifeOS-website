import { useMemo } from "react";
import * as THREE from "three";

const RING_COUNT = 7;
const W = 3.05;
const H = 3.85;

export function Rings() {
  const geometry = useMemo(() => new THREE.TorusGeometry(0.115, 0.032, 10, 26), []);
  const materialCoral = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0xf0876e, roughness: 0.42, metalness: 0.15 }),
    []
  );
  const materialMint = useMemo(
    () => new THREE.MeshStandardMaterial({ color: 0x8cc8b4, roughness: 0.42, metalness: 0.15 }),
    []
  );

  const rings = useMemo(
    () =>
      Array.from({ length: RING_COUNT }, (_, r) => ({
        key: r,
        material: r % 2 ? materialMint : materialCoral,
        position: [-W / 2 + 0.34 + r * ((W - 0.68) / 6), H / 2 - 0.29, 0.05] as [number, number, number],
      })),
    [materialCoral, materialMint]
  );

  return (
    <>
      {rings.map((ring) => (
        <mesh
          key={ring.key}
          geometry={geometry}
          material={ring.material}
          position={ring.position}
          rotation={[0, Math.PI / 2, 0]}
        />
      ))}
    </>
  );
}
