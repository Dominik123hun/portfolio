/**
 * <Scene /> — the 90s office cubicle, viewed first-person from the chair.
 *
 * No scroll system: the camera sits in the chair with subtle mouse parallax,
 * and clicking the monitor eases the view in to the CRT (RoomRig). The CRT
 * portfolio is interactive DOM mapped onto the screen (added in the next step).
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdaptiveDpr,
  AdaptiveEvents,
  Environment,
  Lightformer,
  Preload,
} from '@react-three/drei'
import * as THREE from 'three'
import { Room, SCREEN } from './Room'
import { RoomRig } from './RoomRig'
import { CRTScreen } from './CRTScreen'
import { LangNote } from './LangNote'
import { Warmup } from './Warmup'
import { Effects } from './Effects'
import { makeGlowTexture } from '../lib/textures'
import { theme } from '../theme'
import { damp } from '../lib/math'
import type { Lang } from '../data/i18n'
import type { Tier } from '../lib/tier'

/** Accent glow halo over the monitor that fades in on hover. */
function MonitorGlow({ hovered }: { hovered: boolean }) {
  const ref = useRef<THREE.Mesh>(null!)
  const tex = useMemo(() => makeGlowTexture(theme.accent), [])
  useEffect(() => () => tex.dispose(), [tex])
  const quat = useMemo(() => {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), SCREEN.normal)
    return [q.x, q.y, q.z, q.w] as [number, number, number, number]
  }, [])
  const pos = useMemo(
    () => SCREEN.center.clone().addScaledVector(SCREEN.normal, 0.03).toArray(),
    [],
  )
  useFrame((_, dt) => {
    const m = ref.current.material as THREE.MeshBasicMaterial
    m.opacity = damp(m.opacity, hovered ? 0.6 : 0, 9, dt)
  })
  return (
    <mesh ref={ref} position={pos} quaternion={quat}>
      <planeGeometry args={[0.74, 0.62]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

interface SceneProps {
  tier: Tier
  focused: boolean
  onFocus: (v: boolean) => void
  lang: Lang
  onLang: (l: Lang) => void
}

export function Scene({ tier, focused, onFocus, lang, onLang }: SceneProps) {
  const [hover, setHover] = useState(false)
  const [bites, setBites] = useState(0)

  // Drop hover state when entering focus (the hitbox unmounts).
  useEffect(() => {
    if (focused) {
      setHover(false)
      document.body.classList.remove('cursor-hot')
    }
  }, [focused])

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
        <Room bites={bites} />
        <CRTScreen tier={tier} focused={focused} lang={lang} />
        {!focused && <MonitorGlow hovered={hover} />}
        {!focused && <LangNote lang={lang} onLang={onLang} />}

        {/* Eat the burger — each click removes a 90° wedge (4 = gone). */}
        {bites < 4 && (
          <mesh
            position={[-0.736, 0.8, -0.09]}
            onClick={(e) => {
              e.stopPropagation()
              setBites((b) => Math.min(4, b + 1))
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.classList.add('cursor-hot')
            }}
            onPointerOut={() => document.body.classList.remove('cursor-hot')}
          >
            <boxGeometry args={[0.26, 0.2, 0.26]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}

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
              setHover(true)
              document.body.classList.add('cursor-hot')
            }}
            onPointerOut={() => {
              setHover(false)
              document.body.classList.remove('cursor-hot')
            }}
          >
            <boxGeometry args={[0.46, 0.42, 0.3]} />
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
