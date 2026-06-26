/**
 * <Rig /> — drives the camera along the authored path from the scroll offset.
 * ScrollControls already damps the offset, so we map straight onto the path
 * and add only a whisper of idle sway for life (disabled for reduced motion).
 */

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { sampleCamera } from '../lib/sequence'
import { smoothstep } from '../lib/math'
import { publishScroll } from '../lib/scrollStore'
import type { Tier } from '../lib/tier'

interface RigProps {
  tier: Tier
}

export function Rig({ tier }: RigProps) {
  const scroll = useScroll()
  const { camera } = useThree()
  const pos = useRef(new THREE.Vector3())
  const look = useRef(new THREE.Vector3())

  useFrame((state) => {
    const o = scroll.offset
    // Publish for the DOM overlay, which is rendered outside the canvas.
    publishScroll(o)
    sampleCamera(o, pos.current, look.current)

    if (!tier.reducedMotion) {
      // Idle sway is strongest at the very start and during the fly-through,
      // and is quieted while pushing through the screen for a clean punch.
      const calm = 1 - smoothstep(0.3, 0.4, o) * (1 - smoothstep(0.45, 0.5, o))
      const t = state.clock.elapsedTime
      pos.current.x += Math.sin(t * 0.45) * 0.05 * calm
      pos.current.y += Math.cos(t * 0.4) * 0.035 * calm
    }

    camera.position.copy(pos.current)
    camera.lookAt(look.current)
  })

  return null
}
