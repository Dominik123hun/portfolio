/**
 * <Effects /> — tasteful post-processing, tuned per tier.
 *   Bloom (screen glow) · Chromatic aberration · Depth of field · Vignette ·
 *   Film grain. Reduced-motion / mobile get progressively lighter passes.
 */

import { useMemo } from 'react'
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import type { Tier } from '../lib/tier'

interface EffectsProps {
  tier: Tier
}

export function Effects({ tier }: EffectsProps) {
  const caOffset = useMemo(() => new THREE.Vector2(0.0006, 0.0006), [])

  // Reduced motion: a single, cheap vignette — nothing animated or heavy.
  if (tier.reducedMotion) {
    return (
      <EffectComposer>
        <Vignette offset={0.3} darkness={0.8} />
      </EffectComposer>
    )
  }

  // Build the pass list conditionally — EffectComposer wants elements, not
  // `false`, as children, so we collect into a typed array.
  const passes: JSX.Element[] = [
    <Bloom
      key="bloom"
      luminanceThreshold={0.55}
      luminanceSmoothing={0.25}
      intensity={tier.bloom}
      mipmapBlur
      radius={0.75}
    />,
  ]
  if (tier.dof) {
    passes.push(
      <DepthOfField key="dof" focusDistance={0.012} focalLength={0.04} bokehScale={2.4} height={480} />,
    )
  }
  if (tier.chromaticAberration) {
    passes.push(
      <ChromaticAberration
        key="ca"
        offset={caOffset}
        radialModulation={false}
        modulationOffset={0}
      />,
    )
  }
  if (tier.vignette) {
    passes.push(<Vignette key="vignette" offset={0.28} darkness={0.82} />)
  }
  if (tier.grain) {
    passes.push(
      <Noise key="grain" opacity={0.03} premultiply blendFunction={BlendFunction.OVERLAY} />,
    )
  }

  return (
    <EffectComposer multisampling={tier.msaa} enableNormalPass={false}>
      {passes}
    </EffectComposer>
  )
}
