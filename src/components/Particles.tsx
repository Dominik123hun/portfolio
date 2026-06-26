/**
 * <Particles /> — a drifting field of soft points for depth. Spread along the
 * whole camera journey (z: +10 → -60). Count and motion scale with the tier.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { theme } from '../theme'
import { makeParticleTexture } from '../lib/textures'
import type { Tier } from '../lib/tier'

interface ParticlesProps {
  tier: Tier
}

export function Particles({ tier }: ParticlesProps) {
  const points = useRef<THREE.Points>(null!)
  const sprite = useMemo(() => makeParticleTexture(), [])

  const geometry = useMemo(() => {
    const count = tier.particles
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const accent = new THREE.Color(theme.accent)
    const white = new THREE.Color('#cfe0ff')

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 30
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16
      positions[i * 3 + 2] = 10 - Math.random() * 72

      // Mostly cool-white, occasionally accent-tinted, varied brightness.
      const c = Math.random() < 0.25 ? accent : white
      const b = 0.35 + Math.random() * 0.65
      colors[i * 3 + 0] = c.r * b
      colors[i * 3 + 1] = c.g * b
      colors[i * 3 + 2] = c.b * b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [tier.particles])

  // Free GPU buffers / the sprite when the field is rebuilt or unmounts.
  useEffect(() => () => geometry.dispose(), [geometry])
  useEffect(() => () => sprite.dispose(), [sprite])

  useFrame((state, dt) => {
    if (!points.current) return
    if (tier.reducedMotion) return
    // Very slow parallax drift + a gentle global sway.
    points.current.rotation.y += dt * 0.012
    const t = state.clock.elapsedTime
    points.current.position.y = Math.sin(t * 0.1) * 0.3
  })

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={sprite}
        size={tier.isMobile ? 0.085 : 0.07}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.9}
        toneMapped={false}
      />
    </points>
  )
}
