/**
 * <Room /> — the 90s office cubicle (Sketchfab GLB). The monitor's screen is
 * the emissive material "Screen_Emission" (node "Glowing Screen"); we boost its
 * glow so it reads as a powered-on CRT, and brighten it further on hover so the
 * monitor visibly highlights as an interactive object.
 */

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { damp } from '../lib/math'
import roomUrl from './low_poly_90s_office_cubicle.glb?url'

useGLTF.preload(roomUrl)

/** World position / facing of the monitor screen, measured from the GLB. */
export const SCREEN = {
  center: new THREE.Vector3(-0.777, 1.071, -0.744),
  // The screen faces front-right toward the chair.
  normal: new THREE.Vector3(0.69, 0.02, 0.72).normalize(),
}

interface RoomProps {
  hovered?: boolean
}

export function Room({ hovered = false }: RoomProps) {
  const { scene } = useGLTF(roomUrl)
  const screenMat = useRef<THREE.MeshStandardMaterial | null>(null)

  useMemo(() => {
    scene.traverse((o) => {
      const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined
      if (mat && mat.name === 'Screen_Emission') {
        mat.toneMapped = false
        mat.emissiveIntensity = 1.3
        screenMat.current = mat
      }
    })
  }, [scene])

  useFrame((_, dt) => {
    if (screenMat.current) {
      screenMat.current.emissiveIntensity = damp(
        screenMat.current.emissiveIntensity,
        hovered ? 3.6 : 1.3,
        9,
        dt,
      )
    }
  })

  useEffect(() => () => useGLTF.clear(roomUrl), [])

  return <primitive object={scene} />
}
