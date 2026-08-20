import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { projectToScreenPx } from "./project-to-screen";

function makeCamera() {
  const camera = new THREE.PerspectiveCamera(40, 1200 / 1000, 0.1, 100);
  camera.position.set(0, 0, 9);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

describe("projectToScreenPx", () => {
  it("projects the world origin to the viewport center when the camera looks straight at it", () => {
    const camera = makeCamera();
    const { xPx, yPx } = projectToScreenPx(new THREE.Vector3(0, 0, 0), camera, 1200, 1000);
    expect(xPx).toBeCloseTo(600, 0);
    expect(yPx).toBeCloseTo(500, 0);
  });

  it("moves right on screen as world x increases", () => {
    const camera = makeCamera();
    const center = projectToScreenPx(new THREE.Vector3(0, 0, 0), camera, 1200, 1000);
    const right = projectToScreenPx(new THREE.Vector3(1, 0, 0), camera, 1200, 1000);
    expect(right.xPx).toBeGreaterThan(center.xPx);
  });

  it("moves up on screen (smaller yPx) as world y increases", () => {
    const camera = makeCamera();
    const center = projectToScreenPx(new THREE.Vector3(0, 0, 0), camera, 1200, 1000);
    const up = projectToScreenPx(new THREE.Vector3(0, 1, 0), camera, 1200, 1000);
    expect(up.yPx).toBeLessThan(center.yPx);
  });
});
