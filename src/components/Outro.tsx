/**
 * <Outro /> — the final CTA backdrop the camera settles on: a glowing accent
 * halo and a faint receding grid floor. The CTA copy itself is DOM (Overlay).
 */

import { useEffect, useMemo } from 'react'
import { Grid } from '@react-three/drei'
import * as THREE from 'three'
import { theme } from '../theme'
import { OUTRO_Z } from '../lib/sequence'
import { makeGlowTexture } from '../lib/textures'
import type { Tier } from '../lib/tier'

interface OutroProps {
  tier: Tier
}

export function Outro({ tier }: OutroProps) {
  const glow = useMemo(() => makeGlowTexture(theme.accent), [])
  const accent = useMemo(() => new THREE.Color(theme.accent), [])

  useEffect(() => () => glow.dispose(), [glow])

  return (
    <group position={[0, 0, OUTRO_Z]}>
      {/* Big soft halo behind the CTA text */}
      <mesh position={[0, 0.4, -1.5]}>
        <planeGeometry args={[26, 18]} />
        <meshBasicMaterial
          map={glow}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Thin glowing accent ring */}
      <mesh position={[0, 0.4, -0.6]}>
        <ringGeometry args={[3.0, 3.06, 96]} />
        <meshBasicMaterial color={accent} transparent opacity={0.8} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Faint, finite grid floor that only reads near the outro (a finite
          grid has no fragments under the far-away intro camera). */}
      {!tier.reducedMotion && (
        <Grid
          position={[0, -1.6, 2]}
          args={[60, 60]}
          cellSize={0.8}
          cellThickness={0.6}
          cellColor={theme.accent}
          sectionSize={4}
          sectionThickness={1}
          sectionColor={theme.accent}
          fadeDistance={30}
          fadeStrength={1.4}
          followCamera={false}
        />
      )}
    </group>
  )
}
