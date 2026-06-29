/**
 * <Scene /> — the 90s office cubicle, viewed first-person from the chair.
 *
 * No scroll system: the camera sits in the chair with subtle mouse parallax,
 * and clicking the monitor eases the view in to the CRT (RoomRig). The CRT
 * portfolio is interactive DOM mapped onto the screen (added in the next step).
 */

import { Suspense } from 'react'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Lightformer,
  Preload,
} from '@react-three/drei'
import { Room, SCREEN } from './Room'
import { RoomRig } from './RoomRig'
import { CRTScreen } from './CRTScreen'
import { Warmup } from './Warmup'
import { Effects } from './Effects'
import type { Tier } from '../lib/tier'

interface SceneProps {
  tier: Tier
  focused: boolean
  onFocus: (v: boolean) => void
}

export function Scene({ tier, focused, onFocus }: SceneProps) {
  return (
    <>
      <color attach="background" args={['#04050a']} />

      {/* Lighting — the model's textures are already bright, so keep this low
          and let a warm overhead "fluorescent" shape it. */}
      <ambientLight intensity={0.28} />
      <hemisphereLight args={['#cfe0ff', '#241c14', 0.12]} />
      <directionalLight position={[2, 3.4, 2]} intensity={0.45} color="#fff6ea" />
      <pointLight
        position={[-0.45, 1.55, -0.45]}
        intensity={2.2}
        distance={6}
        decay={2}
        color="#fff3df"
      />

      <Suspense fallback={null}>
        <Environment resolution={128} frames={1} environmentIntensity={0.25}>
          <Lightformer form="rect" intensity={1.2} position={[0, 3, 1]} scale={[8, 5, 1]} color="#ffffff" />
          <Lightformer form="rect" intensity={0.7} position={[-4, 1, 1]} scale={[4, 6, 1]} color="#aebfff" />
        </Environment>

        <Warmup />
        <RoomRig tier={tier} focused={focused} />
        <Room />
        <CRTScreen tier={tier} focused={focused} />

        {/* Invisible hitbox over the monitor — click to focus (room mode only). */}
        {!focused && (
          <mesh
            position={SCREEN.center.toArray()}
            onClick={(e) => {
              e.stopPropagation()
              onFocus(true)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.classList.add('cursor-hot')
            }}
            onPointerOut={() => document.body.classList.remove('cursor-hot')}
          >
            <boxGeometry args={[0.36, 0.32, 0.14]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}

        <Preload all />
      </Suspense>

      <Effects tier={tier} dof={false} />

      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
    </>
  )
}
