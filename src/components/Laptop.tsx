/**
 * <Laptop /> — hero object, now backed by a real GLB with a baked open/close
 * animation clip. The same `openAmount` (0 = closed, 1 = open) drives the clip
 * by scrubbing it; ignite / idle float / fade-through are unchanged.
 *
 * Model: "Low Poly Modern Laptop (with closing animation)" (Sketchfab, CC-BY).
 * See README for attribution.
 *
 *  - base  = node "Cube"
 *  - lid   = node "Cube.001" (animated by clip "Cube.001Action", ~6s)
 *  - single shared material "pc" (texture embedded in the .glb), so the glowing
 *    screen is recreated with an emissive plane parented to the lid.
 */

import { useEffect, useMemo, useRef } from 'react'
import { createPortal, useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF, useScroll } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import laptopUrl from './source/laptop.glb?url'
import { theme } from '../theme'
import { LAPTOP } from '../lib/sequence'
import { clamp, lerp, smoothstep } from '../lib/math'
import { makeScreenTexture } from '../lib/textures'
import type { Tier } from '../lib/tier'

const easeOpen = gsap.parseEase('power3.inOut')

useGLTF.preload(laptopUrl)

// ── Tuning (model-space) ─────────────────────────────────────────────────
// Fit the imported model to the camera framing (≈3 units wide, hinge at rear,
// screen facing +Z toward the opening camera).
const MODEL_SCALE = 2.4
const MODEL_ROT_Y = Math.PI
const MODEL_POS: [number, number, number] = [0, -0.18, 0]

// Emissive screen overlay, in the LID's local space (so it opens with the lid).
// Sits just in front of the model's display face and faces the camera.
const SCREEN_SIZE: [number, number] = [1.33, 0.87]
const SCREEN_POS: [number, number, number] = [0, 0.46, -0.02]
const SCREEN_ROT: [number, number, number] = [0, Math.PI, 0]
// ─────────────────────────────────────────────────────────────────────────

interface LaptopProps {
  tier: Tier
  /** Optional manual control. When omitted, the scroll story drives it. */
  openAmount?: number
}

export function Laptop({ tier, openAmount }: LaptopProps) {
  const scroll = useScroll()
  const group = useRef<THREE.Group>(null!)
  const screenMat = useRef<THREE.MeshStandardMaterial>(null!)
  const lastOpacity = useRef(-1)

  const { scene, animations } = useGLTF(laptopUrl)
  const { actions, names, mixer } = useAnimations(animations, group)
  // The lid node (animated by the clip) — we parent the glowing screen to it.
  // three.js sanitizes the glTF node name "Cube.001" → "Cube001".
  const lid = useMemo(
    () => (scene.getObjectByName('Cube001') ?? scene.getObjectByName('Cube.001')) as THREE.Object3D | null,
    [scene],
  )

  const screenTex = useMemo(() => makeScreenTexture(theme.accent, theme.studioName), [])
  useEffect(() => () => screenTex.dispose(), [screenTex])

  // Pause the clip so we can scrub it by hand from the scroll offset.
  useEffect(() => {
    const action = actions[names[0]]
    if (!action) return
    action.play()
    action.paused = true
    return () => {
      action.stop()
    }
  }, [actions, names])

  useFrame((state) => {
    const manual = openAmount !== undefined
    const o = scroll ? scroll.offset : 0

    const open = easeOpen(manual ? openAmount! : smoothstep(LAPTOP.openIn, LAPTOP.openOut, o))
    const ignite = manual ? openAmount! : smoothstep(LAPTOP.igniteIn, LAPTOP.igniteOut, o)
    const opacity = manual ? 1 : 1 - smoothstep(LAPTOP.fadeIn, LAPTOP.fadeOut, o)

    // Scrub the baked clip. It's a CLOSING clip, so open=1 → start (t=0).
    const action = actions[names[0]]
    if (action) {
      const dur = action.getClip().duration
      action.time = clamp((1 - open) * dur, 0, dur)
      mixer.update(0)
    }

    // Screen ignites as the lid opens.
    if (screenMat.current) {
      screenMat.current.emissiveIntensity = lerp(0.0, 2.0, ignite)
    }

    // Idle float + slight rotation during the intro only (auto-motion).
    const idle = tier.reducedMotion ? 0 : 1 - smoothstep(0.08, 0.22, o)
    const t = state.clock.elapsedTime
    group.current.position.y = MODEL_POS[1] + Math.sin(t * 0.8) * 0.06 * idle
    group.current.rotation.y = MODEL_ROT_Y + Math.sin(t * 0.35) * 0.12 * idle
    group.current.rotation.z = Math.sin(t * 0.5) * 0.02 * idle

    // Fade the whole laptop out as the camera flies through the screen.
    const visible = opacity > 0.001
    group.current.visible = visible
    if (visible && Math.abs(opacity - lastOpacity.current) > 0.001) {
      lastOpacity.current = opacity
      group.current.traverse((obj) => {
        const mat = (obj as THREE.Mesh).material as THREE.Material | undefined
        if (mat && 'opacity' in mat) {
          mat.transparent = opacity < 1
          ;(mat as THREE.Material & { opacity: number }).opacity = opacity
        }
      })
    }
  })

  return (
    <group
      ref={group}
      dispose={null}
      scale={MODEL_SCALE}
      rotation={[0, MODEL_ROT_Y, 0]}
      position={MODEL_POS}
    >
      <primitive object={scene} />
      {/* Glowing screen, parented to the lid so it opens & tilts with it. */}
      {lid &&
        createPortal(
          <mesh position={SCREEN_POS} rotation={SCREEN_ROT}>
            <planeGeometry args={SCREEN_SIZE} />
            <meshStandardMaterial
              ref={screenMat}
              map={screenTex}
              emissive="#ffffff"
              emissiveMap={screenTex}
              emissiveIntensity={0}
              roughness={0.3}
              metalness={0}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>,
          lid,
        )}
    </group>
  )
}
