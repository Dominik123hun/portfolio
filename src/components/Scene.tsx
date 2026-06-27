/**
 * <Scene /> — assembles the whole 3D world inside the canvas.
 *
 * One scroll system only: drei <ScrollControls> + useScroll. No Lenis, no
 * GSAP ScrollTrigger. The camera <Rig>, the <Laptop> and the <Overlay> all
 * read the same scroll offset.
 *
 * Lighting is fully procedural (Environment built from <Lightformer>s) so the
 * premium reflections need no external HDRI and work offline.
 */

import { Suspense, useEffect, useMemo } from 'react'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Lightformer,
  Preload,
  ScrollControls,
} from '@react-three/drei'
import * as THREE from 'three'
import { theme } from '../theme'
import { PAGES, SCROLL_DAMPING } from '../lib/sequence'
import { makeGlowTexture } from '../lib/textures'
import type { Tier } from '../lib/tier'
import { Background } from './Background'
import { Rig } from './Rig'
import { Warmup } from './Warmup'
import { Laptop } from './Laptop'
import { Projects } from './Projects'
import { Outro } from './Outro'
import { Particles } from './Particles'
import { Effects } from './Effects'

interface SceneProps {
  tier: Tier
}

export function Scene({ tier }: SceneProps) {
  const groundGlow = useMemo(() => makeGlowTexture(theme.accent), [])
  useEffect(() => () => groundGlow.dispose(), [groundGlow])

  return (
    <>
      <color attach="background" args={[theme.background]} />
      <fog attach="fog" args={[theme.background, 16, 78]} />

      {/* Animated aurora/nebula backdrop, behind everything. */}
      <Background tier={tier} />

      {/* Base + key + accent lighting (env supplies the glossy reflections) */}
      <ambientLight intensity={0.16} />
      <directionalLight position={[5, 8, 4]} intensity={2.2} color="#ffffff" />
      {/* Accent rim light from behind for premium edge separation */}
      <directionalLight position={[-4, 2.5, -6]} intensity={1.5} color={theme.accent} />
      <pointLight position={[-5, 1.5, -3]} intensity={5} distance={30} decay={0} color={theme.accent} />
      <pointLight position={[0, 1, 6]} intensity={3} distance={24} decay={0} color="#9db4ff" />

      {/* Soft accent light-pool grounding the laptop — reads as the glowing
          screen spilling onto a surface. Cheap (no reflection pass) and stays
          on-concept with the floating-in-space look. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0.2]} scale={[1.7, 1, 1]}>
        <planeGeometry args={[6, 4.4]} />
        <meshBasicMaterial
          map={groundGlow}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <Suspense fallback={null}>
        {/* Procedural studio environment for soft, premium reflections. */}
        <Environment resolution={256} frames={1} environmentIntensity={0.55}>
          <Lightformer form="rect" intensity={2.2} position={[0, 3, -5]} scale={[10, 5, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={1.1} position={[-6, 1, 2]} scale={[5, 8, 1]} color="#aebfff" />
          <Lightformer form="rect" intensity={1.0} position={[6, 1, 2]} scale={[5, 8, 1]} color="#ffffff" />
          <Lightformer form="ring" intensity={1.6} position={[3, 3, 4]} scale={2.4} color={theme.accent} />
          <Lightformer form="circle" intensity={1.2} position={[0, -3, 2]} scale={6} color="#1b2233" />
        </Environment>

        {/* Single scroll system. The DOM overlay reads the same scroll offset
            (published to a shared store by <Rig>) but is rendered outside the
            canvas as a fixed layer — a transformed <Scroll html> wrapper can't
            host pinned, cross-faded full-screen overlays. */}
        <ScrollControls pages={PAGES} damping={tier.reducedMotion ? 0 : SCROLL_DAMPING}>
          <Warmup />
          <Rig tier={tier} />

          <Laptop tier={tier} />
          <Projects tier={tier} />
          <Outro tier={tier} />
        </ScrollControls>

        <Particles tier={tier} />

        <Preload all />
      </Suspense>

      <Effects tier={tier} />

      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
    </>
  )
}
