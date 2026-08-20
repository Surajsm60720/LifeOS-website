import type * as THREE from "three";

/**
 * Projects a world-space position through a camera to CSS pixel
 * coordinates. Used to anchor the DOM-based #gate overlay to the 3D
 * pad's actual on-screen position (v1 rough edge P2 #5 — v1 positioned
 * the gate with fixed percentage offsets that drifted on unusual
 * aspect ratios).
 */
export function projectToScreenPx(
  worldPosition: THREE.Vector3,
  camera: THREE.Camera,
  viewportWidthPx: number,
  viewportHeightPx: number
): { xPx: number; yPx: number } {
  const ndc = worldPosition.clone().project(camera);
  const xPx = (ndc.x * 0.5 + 0.5) * viewportWidthPx;
  const yPx = (-ndc.y * 0.5 + 0.5) * viewportHeightPx;
  return { xPx, yPx };
}
