import { describe, expect, it } from "vitest";
import {
  MAX_DISPLACEMENT,
  SAG_GAIN,
  edgePresence,
  flexLimits,
  flexOffset,
  softClip,
  stepEnergy,
  stepSpring,
  type SpringState,
} from "./page-flex";
import { PAGE_OPEN_ANGLE } from "./pad-state";

// Mirrors the layout literals in components/scene/Pages.tsx, Cover.tsx
// and Pad.tsx. Page 0 is the topmost sheet, with the least room in front.
const COVER_Z = 0.115;
const BOARD_FRONT_Z = -0.01;
const PAGE_ZS = [0, 1, 2, 3].map((i) => 0.02 + (3 - i) * 0.022);
const PAGE_H = 3.85 - 0.62;
const BOARD_TOP_Y = 3.85 / 2;
const HINGE_Y = 3.85 / 2 - 0.3;
const BOARD_EDGE_BAND = 0.15;
const COVER_OPEN = -Math.PI * 0.98;

function sweepRotations(step: number): number[] {
  const out: number[] = [];
  for (let r = 0; r >= PAGE_OPEN_ANGLE; r -= step) out.push(r);
  return out;
}

/** Where a vertex sits in world Z before any deformation is applied. */
function undeformedZ(pageZ: number, t: number, rotation: number): number {
  return pageZ - t * PAGE_H * Math.sin(rotation);
}

/** How much of the board is still underneath this vertex (0 once it swings above the top edge). */
function boardPresenceAt(t: number, rotation: number): number {
  const vertexY = HINGE_Y - t * PAGE_H * Math.cos(rotation);
  return edgePresence(vertexY - BOARD_TOP_Y, BOARD_EDGE_BAND);
}

/**
 * The property that actually matters: run the real pipeline (offset ->
 * limits -> clip) and check the vertex never ends up inside the cover or
 * the board. Returns the deformed world Z.
 */
function deformedZ(args: {
  pageZ: number;
  t: number;
  rotation: number;
  angularVelocity: number;
  energy: number;
  time: number;
  coverRotation: number;
}): number {
  const { pageZ, t, rotation, angularVelocity, energy, time, coverRotation } = args;
  const cosRotation = Math.cos(rotation);
  const coverPresence = Math.max(0, Math.cos(coverRotation));
  const vertexZ = undeformedZ(pageZ, t, rotation);
  const raw = flexOffset({ t, xNorm: 1, rotation, angularVelocity, energy, time, phase: 1.3 });
  const { forward, backward } = flexLimits({
    vertexZ,
    coverZ: COVER_Z,
    boardFrontZ: BOARD_FRONT_Z,
    cosRotation,
    coverPresence,
    boardPresence: boardPresenceAt(t, rotation),
  });
  return vertexZ + softClip(raw, forward, backward) * cosRotation;
}

describe("flexLimits", () => {
  it("keeps a shut cover un-pierced wherever the rigid page is still behind it", () => {
    for (const pageZ of PAGE_ZS) {
      for (const rotation of sweepRotations(0.01)) {
        for (const t of [0.25, 0.5, 0.75, 1]) {
          const vertexZ = undeformedZ(pageZ, t, rotation);
          if (vertexZ >= COVER_Z) continue; // rigid body is already through — not a deformation question
          const cosRotation = Math.cos(rotation);
          const { forward, backward } = flexLimits({
            vertexZ,
            coverZ: COVER_Z,
            boardFrontZ: BOARD_FRONT_Z,
            cosRotation,
            coverPresence: 1, // worst case: cover fully shut
            boardPresence: boardPresenceAt(t, rotation),
          });
          expect(vertexZ + forward * cosRotation).toBeLessThanOrEqual(COVER_Z);
          expect(vertexZ - backward * cosRotation).toBeLessThanOrEqual(COVER_Z);
        }
      }
    }
  });

  it("keeps every page out of the board", () => {
    for (const pageZ of PAGE_ZS) {
      for (const rotation of sweepRotations(0.01)) {
        for (const t of [0.25, 0.5, 0.75, 1]) {
          const vertexZ = undeformedZ(pageZ, t, rotation);
          const cosRotation = Math.cos(rotation);
          const { forward, backward } = flexLimits({
            vertexZ,
            coverZ: COVER_Z,
            boardFrontZ: BOARD_FRONT_Z,
            cosRotation,
            coverPresence: 0,
            boardPresence: boardPresenceAt(t, rotation),
          });
          if (boardPresenceAt(t, rotation) === 0) continue; // swung clear above the board
          expect(vertexZ + forward * cosRotation).toBeGreaterThanOrEqual(BOARD_FRONT_Z);
          expect(vertexZ - backward * cosRotation).toBeGreaterThanOrEqual(BOARD_FRONT_Z);
        }
      }
    }
  });

  it("stops constraining against the cover once the cover has swung open", () => {
    // The whole point of the rewrite: pages only animate after the cover
    // is open, so mid-flip they should be free to flex.
    const { forward, backward } = flexLimits({
      vertexZ: undeformedZ(PAGE_ZS[0], 1, -Math.PI / 2),
      coverZ: COVER_Z,
      boardFrontZ: BOARD_FRONT_Z,
      cosRotation: Math.cos(-Math.PI / 2),
      coverPresence: Math.max(0, Math.cos(COVER_OPEN)),
      boardPresence: boardPresenceAt(1, -Math.PI / 2),
    });
    expect(forward).toBe(MAX_DISPLACEMENT);
    expect(backward).toBe(MAX_DISPLACEMENT);
  });

  it("still pins a resting top page tight against its cover clearance", () => {
    const { forward } = flexLimits({
      vertexZ: PAGE_ZS[0],
      coverZ: COVER_Z,
      boardFrontZ: BOARD_FRONT_Z,
      cosRotation: 1,
      coverPresence: 1,
      boardPresence: 1,
    });
    expect(forward).toBeCloseTo(COVER_Z - PAGE_ZS[0] - 0.004, 6);
  });
});

describe("a real flip", () => {
  /** Replays one page's actual spring + energy timeline, frame by frame. */
  function simulate(pageZ: number) {
    let spring: SpringState = { angle: 0, velocity: 0 };
    let energy = 0;
    const frames: { raw: number; clipped: number; rotation: number }[] = [];
    for (let i = 0; i < 120; i++) {
      spring = stepSpring(spring, PAGE_OPEN_ANGLE, 1 / 60);
      energy = stepEnergy(energy, spring.velocity, 1 / 60);
      const cosRotation = Math.cos(spring.angle);
      const vertexZ = undeformedZ(pageZ, 1, spring.angle);
      const raw = flexOffset({
        t: 1,
        xNorm: 1,
        rotation: spring.angle,
        angularVelocity: spring.velocity,
        energy,
        time: i / 60,
        phase: 1.3,
      });
      const { forward, backward } = flexLimits({
        vertexZ,
        coverZ: COVER_Z,
        boardFrontZ: BOARD_FRONT_Z,
        cosRotation,
        coverPresence: 0, // the cover is always open by the time pages move
        boardPresence: boardPresenceAt(1, spring.angle),
      });
      frames.push({ raw, clipped: softClip(raw, forward, backward), rotation: spring.angle });
    }
    return frames;
  }

  it("is never touched by the safety limits — that clamping was the stiffness", () => {
    // The old cap held the free edge under 0.11 for everything below 60
    // degrees and clamped it again past 90. Nothing should be clipped now.
    for (const pageZ of PAGE_ZS) {
      for (const { raw, clipped } of simulate(pageZ)) {
        expect(clipped).toBeCloseTo(raw, 2);
      }
    }
  });

  it("bows hard, reverses, and settles", () => {
    const frames = simulate(PAGE_ZS[0]);
    const lowest = Math.min(...frames.map((f) => f.clipped));
    const highest = Math.max(...frames.map((f) => f.clipped));
    expect(lowest).toBeLessThan(-0.3); // trailing bow while whipping over
    expect(highest).toBeGreaterThan(0.05); // rebound the other way
    expect(Math.abs(frames[frames.length - 1].clipped)).toBeLessThan(0.08); // settled to a faint resting curl
  });

  it("keeps flexing early in the flip, not only near edge-on", () => {
    const early = simulate(PAGE_ZS[0]).filter((f) => f.rotation > -Math.PI / 4);
    expect(Math.max(...early.map((f) => Math.abs(f.clipped)))).toBeGreaterThan(0.1);
  });
});

describe("end-to-end vertex placement", () => {
  it("never puts a vertex inside the board while it is still over the board", () => {
    for (const pageZ of PAGE_ZS) {
      for (const rotation of sweepRotations(0.02)) {
        for (const t of [0.3, 0.6, 1]) {
          if (boardPresenceAt(t, rotation) < 1) continue; // past the board's top edge, nothing to hit
          for (const angularVelocity of [-13, -6, 0, 6, 13]) {
            for (let time = 0; time < 1.5; time += 0.25) {
              const z = deformedZ({ pageZ, t, rotation, angularVelocity, energy: 1, time, coverRotation: COVER_OPEN });
              expect(z).toBeGreaterThanOrEqual(BOARD_FRONT_Z - 1e-9);
            }
          }
        }
      }
    }
  });

  it("never lifts a resting page in front of a shut cover", () => {
    for (const pageZ of PAGE_ZS) {
      for (let time = 0; time < 6; time += 0.05) {
        const z = deformedZ({ pageZ, t: 1, rotation: 0, angularVelocity: 0, energy: 0, time, coverRotation: 0 });
        expect(z).toBeLessThan(COVER_Z);
        expect(z).toBeGreaterThan(BOARD_FRONT_Z);
      }
    }
  });
});

describe("softClip", () => {
  it("passes small offsets through nearly untouched", () => {
    expect(softClip(0.01, 0.8, 0.8)).toBeCloseTo(0.01, 3);
  });

  it("is continuous and non-decreasing through zero", () => {
    let previous = -Infinity;
    for (let v = -1; v <= 1; v += 0.01) {
      const clipped = softClip(v, 0.05, 0.03);
      expect(clipped).toBeGreaterThanOrEqual(previous);
      previous = clipped;
    }
  });

  it("never exceeds either bound", () => {
    for (let v = -5; v <= 5; v += 0.05) {
      const clipped = softClip(v, 0.05, 0.03);
      expect(clipped).toBeLessThanOrEqual(0.05);
      expect(clipped).toBeGreaterThanOrEqual(-0.03);
    }
  });
});

describe("stepSpring", () => {
  it("settles on its target", () => {
    let state: SpringState = { angle: 0, velocity: 0 };
    for (let i = 0; i < 240; i++) state = stepSpring(state, PAGE_OPEN_ANGLE, 1 / 60);
    expect(state.angle).toBeCloseTo(PAGE_OPEN_ANGLE, 3);
    expect(Math.abs(state.velocity)).toBeLessThan(0.01);
  });

  it("overshoots before settling, so the page flops rather than easing", () => {
    let state: SpringState = { angle: 0, velocity: 0 };
    let furthest = 0;
    for (let i = 0; i < 240; i++) {
      state = stepSpring(state, PAGE_OPEN_ANGLE, 1 / 60);
      furthest = Math.min(furthest, state.angle);
    }
    expect(furthest).toBeLessThan(PAGE_OPEN_ANGLE);
  });

  it("is most of the way over in under half a second", () => {
    let state: SpringState = { angle: 0, velocity: 0 };
    for (let i = 0; i < 30; i++) state = stepSpring(state, PAGE_OPEN_ANGLE, 1 / 60);
    expect(state.angle / PAGE_OPEN_ANGLE).toBeGreaterThan(0.9);
  });

  it("runs at the same speed regardless of frame rate", () => {
    // The lerp this replaced flipped twice as fast on a 120Hz display.
    const at = (fps: number, seconds: number) => {
      let state: SpringState = { angle: 0, velocity: 0 };
      for (let i = 0; i < fps * seconds; i++) state = stepSpring(state, PAGE_OPEN_ANGLE, 1 / fps);
      return state.angle;
    };
    expect(at(120, 0.5)).toBeCloseTo(at(60, 0.5), 1); // mid-overshoot: integrator error only
    expect(at(120, 1.5)).toBeCloseTo(at(60, 1.5), 3); // settled: identical
  });
});

describe("stepEnergy", () => {
  it("snaps up to current speed immediately", () => {
    expect(stepEnergy(0, -8, 1 / 60)).toBeCloseTo(1, 6);
  });

  it("bleeds away rather than cutting out when the page stops", () => {
    let energy = 1;
    for (let i = 0; i < 30; i++) energy = stepEnergy(energy, 0, 1 / 60);
    expect(energy).toBeGreaterThan(0.2); // still fluttering half a second after landing
    for (let i = 0; i < 180; i++) energy = stepEnergy(energy, 0, 1 / 60);
    expect(energy).toBeLessThan(0.05);
  });
});

describe("flexOffset", () => {
  it("is flat at the hinge edge regardless of motion", () => {
    const offset = flexOffset({ t: 0, xNorm: 1, rotation: -1.5, angularVelocity: -12, energy: 1, time: 3, phase: 0 });
    expect(offset).toBeCloseTo(0, 6);
  });

  it("is essentially flat at rest", () => {
    for (let time = 0; time < 10; time += 0.05) {
      const offset = flexOffset({ t: 1, xNorm: 1, rotation: 0, angularVelocity: 0, energy: 0, time, phase: 0.7 });
      expect(Math.abs(offset)).toBeLessThan(0.02);
    }
  });

  it("bows backward hard at peak flip speed instead of cancelling itself flat", () => {
    // The failure this guards against: gravity sag and inertial lag peak
    // at the same instant with opposite signs and sum to ~zero, so the
    // sheet looks rigid exactly when it should look most like paper.
    const offset = flexOffset({
      t: 1,
      xNorm: 0,
      rotation: -1.27, // where the spring's angular velocity peaks
      angularVelocity: -12.4,
      energy: 1,
      time: 0,
      phase: 0,
    });
    expect(offset).toBeLessThan(-0.25);
  });

  it("reverses its bow when the page decelerates past its target", () => {
    const base = { t: 1, xNorm: 0, rotation: -Math.PI / 2, energy: 0, time: 0, phase: 0 };
    expect(flexOffset({ ...base, angularVelocity: 6 })).toBeGreaterThan(flexOffset({ ...base, angularVelocity: -6 }));
  });

  it("droops under gravity when edge-on and slow", () => {
    const edgeOn = flexOffset({ t: 1, xNorm: 0, rotation: -Math.PI / 2, angularVelocity: 0, energy: 0, time: 0, phase: 0 });
    expect(edgeOn).toBeGreaterThan(0.4);
    expect(edgeOn).toBeLessThanOrEqual(SAG_GAIN + 0.05);
  });

  it("curls the free corners further than the middle of the free edge", () => {
    const base = { t: 1, rotation: -Math.PI / 2, angularVelocity: -10, energy: 1, time: 0, phase: 0 };
    const corner = flexOffset({ ...base, xNorm: 1 });
    const middle = flexOffset({ ...base, xNorm: 0 });
    expect(Math.abs(corner - middle)).toBeGreaterThan(0.01);
  });
});
