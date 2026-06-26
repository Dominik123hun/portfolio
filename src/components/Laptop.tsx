/**
 * <Laptop /> — the hero object, built entirely from primitives.
 *
 *  `openAmount` (0 = closed, 1 = fully open) drives the lid hinge so it's
 *  trivial to animate and easy to later swap for a real GLB: keep the same
 *  prop, replace the meshes.
 *
 *  When used inside the scroll story it reads the scroll offset itself and
 *  derives open / ignite / fade. You can also drive it manually via the
 *  `openAmount` prop for a static preview.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useScroll } from '@react-three/drei'
import gsap from 'gsap'
import * as THREE from 'three'
import { theme } from '../theme'
import { LAPTOP } from '../lib/sequence'
import { lerp, smoothstep } from '../lib/math'
import { makeScreenTexture } from '../lib/textures'
import type { Tier } from '../lib/tier'

const easeOpen = gsap.parseEase('power3.inOut')

// Body dimensions.
const W = 3.2
const H = 0.16
const D = 2.2

interface LaptopProps {
  tier: Tier
  /** Optional manual control. When omitted, the scroll story drives it. */
  openAmount?: number
}

export function Laptop({ tier, openAmount }: LaptopProps) {
  const scroll = useScroll()
  const group = useRef<THREE.Group>(null!)
  const lid = useRef<THREE.Group>(null!)
  const screenMat = useRef<THREE.MeshStandardMaterial>(null!)

  const screenTex = useMemo(
    () => makeScreenTexture(theme.accent, theme.studioName),
    [],
  )
  const accent = useMemo(() => new THREE.Color(theme.accent), [])
  const lastOpacity = useRef(-1)

  // Free the GPU texture when the laptop unmounts.
  useEffect(() => () => screenTex.dispose(), [screenTex])

  useFrame((state) => {
    const manual = openAmount !== undefined
    const o = scroll ? scroll.offset : 0

    const openRaw = manual ? openAmount! : smoothstep(LAPTOP.openIn, LAPTOP.openOut, o)
    const open = easeOpen(openRaw)
    const ignite = manual ? openAmount! : smoothstep(LAPTOP.igniteIn, LAPTOP.igniteOut, o)
    const opacity = manual ? 1 : 1 - smoothstep(LAPTOP.fadeIn, LAPTOP.fadeOut, o)

    // Lid hinge.
    lid.current.rotation.x = lerp(0, LAPTOP.openAngle, open)

    // Screen ignites as it opens.
    if (screenMat.current) {
      screenMat.current.emissiveIntensity = lerp(0.0, 1.9, ignite)
    }

    // Idle float + slight rotation during the intro only (auto-motion).
    const idle = tier.reducedMotion ? 0 : 1 - smoothstep(0.08, 0.22, o)
    const t = state.clock.elapsedTime
    group.current.position.y = Math.sin(t * 0.8) * 0.06 * idle
    group.current.rotation.y = Math.sin(t * 0.35) * 0.12 * idle
    group.current.rotation.z = Math.sin(t * 0.5) * 0.02 * idle

    // Fade the whole laptop out as the camera flies through the screen.
    const visible = opacity > 0.001
    group.current.visible = visible
    // Only re-walk the materials when the opacity actually changed.
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
    <group ref={group} position={[0, 0, 0]} dispose={null}>
      {/* Base / keyboard deck */}
      <RoundedBox args={[W, H, D]} radius={0.05} smoothness={4} castShadow>
        <meshStandardMaterial color="#888d96" metalness={0.95} roughness={0.34} envMapIntensity={1.2} />
      </RoundedBox>

      {/* Recessed keyboard area */}
      <mesh position={[0, H / 2 + 0.002, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.88, D * 0.62]} />
        <meshStandardMaterial color="#13161d" metalness={0.4} roughness={0.7} />
      </mesh>

      {/* Trackpad */}
      <mesh position={[0, H / 2 + 0.003, D * 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.34, D * 0.26]} />
        <meshStandardMaterial color="#1b1f28" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Front accent light bar (a small bloom source / premium detail) */}
      <mesh position={[0, 0, D / 2 + 0.001]}>
        <boxGeometry args={[W * 0.28, 0.018, 0.012]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>

      {/* Lid — hinged at the rear-top edge of the base. */}
      <group ref={lid} position={[0, H / 2, -D / 2]}>
        {/* Lid shell */}
        <RoundedBox args={[W, 0.1, D]} radius={0.04} smoothness={4} position={[0, 0.05, D / 2]}>
          <meshStandardMaterial
            color="#888d96"
            metalness={0.95}
            roughness={0.34}
            envMapIntensity={1.2}
          />
        </RoundedBox>

        {/* Inner dark bezel (faces the keyboard when closed, the camera when open) */}
        <mesh position={[0, -0.002, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W * 0.95, D * 0.93]} />
          <meshStandardMaterial color="#04060c" metalness={0.2} roughness={0.5} />
        </mesh>

        {/* The glowing screen */}
        <mesh position={[0, -0.004, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W * 0.86, D * 0.82]} />
          <meshStandardMaterial
            ref={screenMat}
            map={screenTex}
            emissive="#ffffff"
            emissiveMap={screenTex}
            emissiveIntensity={0}
            roughness={0.32}
            metalness={0}
          />
        </mesh>
      </group>
    </group>
  )
}
