// Paper physics for the pad's page flip (components/scene/Pages.tsx).
//
// Kept as pure functions here rather than inline in the useFrame loop so
// the collision limits — the part that's easy to get subtly wrong and
// impossible to eyeball — can be swept numerically in page-flex.test.ts.
//
// Frame convention: each page is a plane hinged along its TOP edge,
// rotating about local X from 0 (lying on the board) to PAGE_OPEN_ANGLE
// (~-PI, folded fully over the top). Deformation is written into the
// geometry's local Z; local +Z is the page's own face normal, which maps
// onto world Z by cos(rotation).

/** Distance along local Z past which a page is doing something silly rather than flexing. */
export const MAX_DISPLACEMENT = 0.8;

/** Spring driving the hinge rotation. Underdamped on purpose: paper overshoots and settles. */
export const SPRING_STIFFNESS = 68;
export const SPRING_DAMPING = 10.5;

/**
 * Inertial lag — the lead term, and the one that makes this read as a
 * sheet rather than a board. The free edge trails the hinge by roughly
 * (angular velocity x response time), and in the page's OWN frame that
 * trailing is a local -Z offset growing with distance from the hinge.
 * Signed, so it reverses by itself when the spring decelerates past its
 * target: bow backward on the way up, flop forward on the way down.
 */
export const LAG_GAIN = 0.035;
export const LAG_FALLOFF = 1.25;

/**
 * Gravity droop. Bending moment on a cantilevered sheet follows the
 * component of gravity along the face normal, which for this hinge is
 * -sin(rotation): zero when the page lies flat (gravity is in-plane, so
 * no bending), maximal edge-on. It is a *static* deflection though, so
 * it's faded out while the page is whipping — otherwise it cancels the
 * inertial lag almost exactly at peak speed and the sheet goes flat at
 * the one moment it should look most alive.
 */
export const SAG_GAIN = 0.5;
export const SAG_FALLOFF = 1.6;
export const SAG_MOTION_FADE = 0.8;

/** Cross-width flutter, driven by leftover motion energy so it outlives the flip. */
export const RIPPLE_GAIN = 0.11;
export const RIPPLE_FREQUENCY = 2.2;
export const RIPPLE_SPEED = 5.5;
/** Angular speed (rad/s) counted as "full energy" for ripple and sag fade. */
export const FULL_SPEED = 8;
/** How fast flutter energy bleeds off once the page stops moving (per second, exponential). */
export const ENERGY_RELEASE = 2.2;
/** Free corners flex more than the middle of the free edge. */
export const CORNER_GAIN = 0.4;

/** Never perfectly flat, even at rest. Small enough to clear every gap unconditionally. */
export const IDLE_GAIN = 0.016;
export const IDLE_FREQUENCY = 1.5;

/** Clearance kept between a page and whatever it could hit. */
const CONTACT_EPSILON = 0.004;

export type SpringState = { angle: number; velocity: number };

/**
 * Semi-implicit Euler step. Frame-rate independent, unlike the plain
 * `x += (target - x) * k` lerp this replaced — which silently ran at
 * double speed on a 120Hz display.
 */
export function stepSpring(
  state: SpringState,
  target: number,
  dt: number,
  stiffness = SPRING_STIFFNESS,
  damping = SPRING_DAMPING
): SpringState {
  const velocity = state.velocity + ((target - state.angle) * stiffness - state.velocity * damping) * dt;
  return { angle: state.angle + velocity * dt, velocity };
}

/**
 * Flutter energy: snaps up to current speed, bleeds away slowly. Gives
 * the page a lingering shiver after it lands instead of freezing solid
 * the instant the spring settles.
 */
export function stepEnergy(energy: number, angularVelocity: number, dt: number): number {
  const decayed = energy * Math.exp(-ENERGY_RELEASE * dt);
  return Math.max(decayed, Math.min(1, Math.abs(angularVelocity) / FULL_SPEED));
}

export type FlexLimitsInput = {
  /** This vertex's world Z *before* deformation (page depth plus its swing out of the stack). */
  vertexZ: number;
  /** World Z of the cover plane when shut. */
  coverZ: number;
  /** World Z of the board's front face. */
  boardFrontZ: number;
  /** cos(page rotation) — the factor turning a local-Z offset into world Z. */
  cosRotation: number;
  /** 1 while the cover lies shut over the stack, 0 once it has swung past edge-on. */
  coverPresence: number;
  /** 1 where this vertex is over the board, 0 where it has swung clear of the board's edges. */
  boardPresence: number;
};

/** Softens a presence factor to 0 over `band` units past an edge, so a limit never pops. */
export function edgePresence(distanceBeyondEdge: number, band: number): number {
  if (distanceBeyondEdge <= 0) return 1;
  if (distanceBeyondEdge >= band) return 0;
  const u = distanceBeyondEdge / band;
  return 1 - u * u * (3 - 2 * u);
}

/**
 * How far this vertex may move along local +Z (`forward`) and local -Z
 * (`backward`) before it would intersect the cover in front or the board
 * behind. A local offset d lands the vertex at `vertexZ + d * cosRotation`,
 * so each obstacle's remaining gap divides by that projection.
 *
 * Three things the previous whole-page version got wrong, all of which
 * read as stiffness:
 *   - it used |cos(rotation)|, re-tightening through the entire second
 *     half of the flip even though a +Z offset there points away from
 *     the cover;
 *   - it constrained against the cover unconditionally, though pages
 *     only ever move once the cover is already swung open;
 *   - it measured every gap from the page's resting depth, as if both
 *     obstacles sat right behind the free edge at all times — but at -73
 *     degrees that edge has swung three units out in front of the board,
 *     and by the overshoot past -PI it is a clear three units above the
 *     board's top edge. Neither has anything left to hit.
 */
export function flexLimits({
  vertexZ,
  coverZ,
  boardFrontZ,
  cosRotation,
  coverPresence,
  boardPresence,
}: FlexLimitsInput): { forward: number; backward: number } {
  // An obstacle that isn't there imposes no limit — note Infinity, not a
  // zeroed gap: clamping the gap at 0 first and *then* scaling by
  // presence pins the limit to 0 for any page that has swung out past
  // the obstacle's plane, which is most of the flip.
  const coverGap =
    coverPresence > 1e-3 ? Math.max(0, coverZ - vertexZ - CONTACT_EPSILON) / coverPresence : Infinity;
  const boardGap =
    boardPresence > 1e-3 ? Math.max(0, vertexZ - boardFrontZ - CONTACT_EPSILON) / boardPresence : Infinity;

  const cap = (gap: number, factor: number) =>
    factor > 1e-3 ? Math.min(MAX_DISPLACEMENT, gap / factor) : MAX_DISPLACEMENT;

  if (cosRotation >= 0) {
    // Still facing the viewer: +Z heads for the cover, -Z for the board.
    return { forward: cap(coverGap, cosRotation), backward: cap(boardGap, cosRotation) };
  }
  // Past edge-on, the page's own normal has flipped: now -Z is the one
  // heading back toward the cover, and +Z retreats behind the board.
  return { forward: cap(boardGap, -cosRotation), backward: cap(coverGap, -cosRotation) };
}

/** Fraction of a limit that passes through completely unaltered. */
const CLIP_KNEE = 0.7;

/**
 * Asymmetric soft clip. A hard `Math.min` would flatten every vertex
 * that reaches a limit into a visible crease straight across the sheet,
 * so the last stretch before the bound is compressed with tanh instead.
 *
 * The knee matters: a bare `L * tanh(v / L)` bends the curve everywhere,
 * shaving ~8% off the peak bow even when the nearest obstacle is three
 * units away — the safety net quietly damping the animation it is only
 * supposed to catch. Below the knee this is the identity; above it,
 * tanh's unit slope at 0 keeps the join smooth.
 */
function clipOneSided(magnitude: number, limit: number): number {
  if (limit <= 0) return 0;
  const linear = limit * CLIP_KNEE;
  if (magnitude <= linear) return magnitude;
  const remaining = limit - linear;
  return linear + remaining * Math.tanh((magnitude - linear) / remaining);
}

export function softClip(value: number, forward: number, backward: number): number {
  return value >= 0 ? clipOneSided(value, forward) : -clipOneSided(-value, backward);
}

export type FlexOffsetInput = {
  /** 0 at the hinge edge, 1 at the free edge. */
  t: number;
  /** Vertex X in page space, normalized to [-1, 1] across the width. */
  xNorm: number;
  rotation: number;
  angularVelocity: number;
  /** Decaying flutter energy from stepEnergy, 0..1. */
  energy: number;
  time: number;
  /** Per-page offset so the stack never flutters in lockstep. */
  phase: number;
};

/** Raw (pre-clip) local-Z displacement for one vertex. */
export function flexOffset({ t, xNorm, rotation, angularVelocity, energy, time, phase }: FlexOffsetInput): number {
  const corner = 1 + CORNER_GAIN * xNorm * xNorm;
  const speed = Math.min(1, Math.abs(angularVelocity) / FULL_SPEED);

  const lag = angularVelocity * LAG_GAIN * Math.pow(t, LAG_FALLOFF) * corner;
  const sag = -Math.sin(rotation) * SAG_GAIN * (1 - SAG_MOTION_FADE * speed) * Math.pow(t, SAG_FALLOFF);

  // Travelling wave: the crest runs hinge-to-free-edge rather than the
  // whole sheet pulsing in place, which is what sold the old version as
  // a vibrating board instead of paper.
  const ripple =
    Math.sin(xNorm * Math.PI * RIPPLE_FREQUENCY + t * Math.PI * 1.5 - time * RIPPLE_SPEED + phase) *
    RIPPLE_GAIN *
    energy *
    t *
    corner;

  const idle = Math.sin(t * Math.PI * 1.4 + time * IDLE_FREQUENCY + phase) * IDLE_GAIN * t;

  return lag + sag + ripple + idle;
}
