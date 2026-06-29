/**
 * <RoomRig /> — the first-person camera sitting in the chair. Subtle mouse
 * parallax in "room" mode; on focus it eases in to the monitor. No scroll —
 * the CRT content scrolls natively once focused.
 */

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { clamp, damp, lerp } from '../lib/math'
import { SCREEN } from './Room'
import type { Tier } from '../lib/tier'

// Seated point of view, looking at the desk / monitor corner.
const ROOM_POS = new THREE.Vector3(0.12, 1.26, 0.42)
const ROOM_LOOK = new THREE.Vector3(-0.62, 1.0, -0.72)
const ROOM_FOV = 52

// The chair sits to the lower-right, so cap how far right/down you can look.
const MAX_RIGHT = 0.12
const MIN_DOWN = -0.4

// Pulled in to the monitor so the screen fills the view.
const FOCUS_POS = SCREEN.center.clone().addScaledVector(SCREEN.normal, 0.52)
const FOCUS_LOOK = SCREEN.center.clone()
const FOCUS_FOV = 34

const DESIGN_ASPECT = 1.6

interface RoomRigProps {
  tier: Tier
  focused: boolean
}

export function RoomRig({ tier, focused }: RoomRigProps) {
  const { camera } = useThree()
  const t = useRef(0)
  const pos = useRef(new THREE.Vector3().copy(ROOM_POS))
  const look = useRef(new THREE.Vector3().copy(ROOM_LOOK))

  useFrame((state, dt) => {
    t.current = damp(t.current, focused ? 1 : 0, 3.5, dt)
    const tt = t.current

    // Interpolate base pose between room and focus.
    pos.current.copy(ROOM_POS).lerp(FOCUS_POS, tt)
    look.current.copy(ROOM_LOOK).lerp(FOCUS_LOOK, tt)

    // Mouse look-around (room mode): sweep the gaze so you can glance around
    // the room. Strong on the look target (yaw/pitch), gentle on position.
    if (!tier.reducedMotion) {
      const par = 1 - tt
      // Look freely (and further) left/up, but limit right/down so the chair
      // stays out of view. Leftward gets a bigger swing than rightward.
      const px = Math.min(state.pointer.x, MAX_RIGHT)
      const py = Math.max(state.pointer.y, MIN_DOWN)
      const lookX = px < 0 ? 0.85 : 0.38
      pos.current.x += px * (px < 0 ? 0.2 : 0.1) * par
      pos.current.y += py * 0.05 * par
      look.current.x += px * lookX * par
      look.current.y += py * 0.2 * par
    }

    camera.position.copy(pos.current)
    camera.lookAt(look.current)

    // FOV: zoom in on focus, widen on narrow/portrait screens.
    const cam = camera as THREE.PerspectiveCamera
    const aspect = state.size.width / Math.max(1, state.size.height)
    const baseFov = lerp(ROOM_FOV, FOCUS_FOV, tt)
    const targetFov = clamp(baseFov * Math.max(1, DESIGN_ASPECT / aspect), baseFov, 78)
    if (Math.abs(cam.fov - targetFov) > 0.05) {
      cam.fov = targetFov
      cam.updateProjectionMatrix()
    }
  })

  return null
}
