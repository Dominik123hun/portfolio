/** Small, dependency-free math helpers used across the scene. */

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v))

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** Hermite smoothstep. Returns 0..1, eased at both ends. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const denom = edge1 - edge0
  const t = clamp(denom === 0 ? 0 : (x - edge0) / denom, 0, 1)
  return t * t * (3 - 2 * t)
}

/** Linear remap of v from one range into another, clamped. */
export function mapRange(
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const denom = inMax - inMin
  const t = clamp(denom === 0 ? 0 : (v - inMin) / denom, 0, 1)
  return lerp(outMin, outMax, t)
}

/**
 * Fade-in / fade-out envelope. Ramps 0→1 across [inStart,inEnd], holds at 1,
 * then ramps 1→0 across [outStart,outEnd]. Used to cross-fade overlay blocks.
 */
export function envelope(
  o: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number,
): number {
  return smoothstep(inStart, inEnd, o) * (1 - smoothstep(outStart, outEnd, o))
}

/**
 * Frame-rate independent damping toward a target.
 * `lambda` is the approach rate (higher = snappier).
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}
