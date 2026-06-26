/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SEQUENCE — the single source of truth for the scroll-driven story.
 * ─────────────────────────────────────────────────────────────────────────
 *  Everything that needs to agree on "where are we in the scroll" reads from
 *  here: the camera rig, the laptop open/fade timing, the 3D panel layout and
 *  the DOM overlay windows. Tweak the numbers here to re-time the whole film.
 *
 *  Scroll offset goes 0 → 1 across the whole page.
 *
 *    0.00 – 0.10  Intro      closed laptop, idle float, headline
 *    0.10 – 0.30  Open       lid opens, screen ignites, camera dollies in
 *    0.30 – 0.40  Enter      camera pushes through the screen, laptop fades
 *    0.40 – 0.90  Projects   fly past the floating project slabs
 *    0.90 – 1.00  Outro      settle on the CTA scene
 */

import * as THREE from 'three'
import { projects } from '../data/projects'
import { smoothstep } from './math'

/** Number of viewport-heights of scroll. More = slower, more cinematic. */
export const PAGES = 8

/** ScrollControls damping (seconds-ish). 0 disables smoothing (reduced motion). */
export const SCROLL_DAMPING = 0.3

/** Phase boundaries, in scroll-offset units. */
export const PHASE = {
  introStart: 0.0,
  introEnd: 0.1,
  openStart: 0.1,
  openEnd: 0.3,
  enterStart: 0.3,
  enterEnd: 0.4,
  projectsStart: 0.4,
  projectsEnd: 0.9,
  outroStart: 0.9,
  outroEnd: 1.0,
} as const

/** Laptop animation timing (sub-windows of the open/enter phases). */
export const LAPTOP = {
  openIn: 0.1,
  openOut: 0.28,
  igniteIn: 0.13,
  igniteOut: 0.3,
  fadeIn: 0.34,
  fadeOut: 0.44,
  /** Fully-open lid angle (radians). ~112° past flat. */
  openAngle: -1.96,
}

/** 3D layout of the project slabs. */
export const PANEL = {
  startZ: -10,
  spacing: -9.5,
  offsetX: 2.7,
  tilt: 0.17,
  /** Slabs are hidden until the camera enters the screen, then fade in. */
  revealIn: 0.33,
  revealOut: 0.42,
}

/** World position of project slab `i`. Slabs alternate left / right. */
export function panelPosition(i: number): [number, number, number] {
  const side = i % 2 === 0 ? -1 : 1
  return [side * PANEL.offsetX, 0, PANEL.startZ + i * PANEL.spacing]
}

/** Y-rotation so a slab angles its face back toward the camera corridor. */
export function panelRotationY(i: number): number {
  const side = i % 2 === 0 ? -1 : 1
  return -side * PANEL.tilt
}

/** Where the outro CTA scene lives. */
export const OUTRO_Z = -56

/**
 * Cross-fade windows for the DOM overlay blocks, aligned to the camera path
 * so each project's text appears as the camera draws level with its slab.
 * [inStart, inEnd, outStart, outEnd]
 */
// inStart/inEnd are negative so the intro is already fully visible at offset 0.
export const INTRO_WINDOW: [number, number, number, number] = [-0.05, -0.02, 0.07, 0.12]
export const OUTRO_WINDOW: [number, number, number, number] = [0.9, 0.94, 1.01, 1.02]
export const PROJECT_WINDOWS: Array<[number, number, number, number]> = [
  [0.42, 0.46, 0.5, 0.54],
  [0.51, 0.55, 0.59, 0.63],
  [0.6, 0.64, 0.68, 0.72],
  [0.69, 0.73, 0.77, 0.81],
]

/** Returns the overlay window for project `i`, with a fallback for >4 items. */
export function projectWindow(i: number): [number, number, number, number] {
  if (PROJECT_WINDOWS[i]) return PROJECT_WINDOWS[i]
  // Spread any extra projects evenly across the remaining projects phase.
  const n = projects.length
  const span = PHASE.projectsEnd - PHASE.projectsStart
  const c = PHASE.projectsStart + (span * (i + 0.5)) / n
  return [c - 0.05, c - 0.02, c + 0.02, c + 0.05]
}

/* ───────────────────────── Camera path ──────────────────────────────────
 * Hand-authored keyframes (pos = camera position, look = lookAt target).
 * Sampled with a centripetal-style Catmull-Rom for smooth, continuous motion
 * that passes exactly through each pose. The look targets sway side-to-side
 * to frame the alternating project slabs.
 */

export interface CamKey {
  at: number
  pos: [number, number, number]
  look: [number, number, number]
}

export const CAM_KEYS: CamKey[] = [
  { at: 0.0, pos: [0, 0.62, 6.6], look: [0, 0.18, 0] }, // intro, closed laptop
  { at: 0.1, pos: [0, 0.55, 5.4], look: [0, 0.28, 0] }, // begin approach
  { at: 0.22, pos: [0, 0.45, 3.0], look: [0, 0.55, -0.3] }, // lid opening
  { at: 0.3, pos: [0, 0.35, 1.2], look: [0, 0.55, -1.0] }, // right at the screen
  { at: 0.37, pos: [0, 0.25, -1.5], look: [-2.0, 0.1, -10] }, // through the screen
  { at: 0.46, pos: [1.2, 0.1, -5.5], look: [-2.4, 0.0, -10] }, // passing slab 0 (left)
  { at: 0.55, pos: [-1.2, 0.1, -14], look: [2.4, 0.0, -19.5] }, // toward slab 1 (right)
  { at: 0.64, pos: [1.2, 0.1, -23.5], look: [-2.4, 0.0, -29] }, // toward slab 2 (left)
  { at: 0.73, pos: [-1.2, 0.1, -33], look: [2.4, 0.0, -38.5] }, // toward slab 3 (right)
  { at: 0.82, pos: [0.4, 0.2, -43], look: [0, 0.2, -48] }, // past the last slab
  { at: 0.9, pos: [0, 0.4, -47], look: [0, 0.5, -52] }, // approach outro
  { at: 1.0, pos: [0, 0.6, -51], look: [0, 0.55, -56] }, // settle on CTA
]

function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t
  const t3 = t2 * t
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  )
}

/**
 * Samples the camera path at scroll offset `o`, writing into `outPos`/`outLook`.
 * Uses Catmull-Rom across the keyframes for C1-continuous, jerk-free motion.
 */
export function sampleCamera(
  o: number,
  outPos: THREE.Vector3,
  outLook: THREE.Vector3,
): void {
  const keys = CAM_KEYS
  const last = keys.length - 1

  if (o <= keys[0].at) {
    outPos.set(...keys[0].pos)
    outLook.set(...keys[0].look)
    return
  }
  if (o >= keys[last].at) {
    outPos.set(...keys[last].pos)
    outLook.set(...keys[last].look)
    return
  }

  // Find the segment [i, i+1] containing `o`.
  let i = 0
  for (; i < last; i++) {
    if (o >= keys[i].at && o <= keys[i + 1].at) break
  }

  const k1 = keys[i]
  const k2 = keys[i + 1]
  const k0 = keys[Math.max(0, i - 1)]
  const k3 = keys[Math.min(last, i + 2)]

  const span = k2.at - k1.at
  const t = span === 0 ? 0 : (o - k1.at) / span

  for (let a = 0; a < 3; a++) {
    outPos.setComponent(a, catmull(k0.pos[a], k1.pos[a], k2.pos[a], k3.pos[a], t))
    outLook.setComponent(a, catmull(k0.look[a], k1.look[a], k2.look[a], k3.look[a], t))
  }
}

/** Convenience: 0..1 progress within the projects phase. */
export function projectsProgress(o: number): number {
  return smoothstep(PHASE.projectsStart, PHASE.projectsEnd, o)
}
