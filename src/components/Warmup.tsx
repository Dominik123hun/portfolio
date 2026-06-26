/**
 * <Warmup /> — compiles the scene's shaders up-front (so the first scroll
 * doesn't stutter) and signals the preloader once a couple of frames have
 * rendered. Lives inside the canvas.
 */

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { appState } from '../lib/appState'

export function Warmup() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  const frames = useRef(0)

  useFrame(() => {
    frames.current += 1
    if (frames.current === 1) {
      try {
        // Pre-compile all materials currently in the scene.
        gl.compile(scene, camera)
      } catch {
        /* compile is best-effort */
      }
    }
    // Give it a few frames to flush pipeline / env map bake, then release loader.
    if (frames.current === 4) {
      appState.setReady()
    }
  })

  return null
}
