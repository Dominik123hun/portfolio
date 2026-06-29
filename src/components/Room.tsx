/**
 * <Room /> — the 90s office cubicle (Sketchfab GLB). The monitor's screen is
 * the emissive material "Screen_Emission" (node "Glowing Screen"); we boost its
 * glow so it reads as a powered-on CRT and gives the bloom something to catch.
 */

import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import roomUrl from './low_poly_90s_office_cubicle.glb?url'

useGLTF.preload(roomUrl)

/** World position / size of the monitor screen, measured from the GLB. */
export const SCREEN = {
  center: new THREE.Vector3(-0.777, 1.071, -0.744),
  // The screen faces front-right toward the chair.
  normal: new THREE.Vector3(0.69, 0.02, 0.72).normalize(),
}

export function Room() {
  const { scene } = useGLTF(roomUrl)

  // Boost the CRT screen's emissive so it glows.
  useMemo(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined
      if (mat && mat.name === 'Screen_Emission') {
        mat.emissiveIntensity = 1.4
        mat.toneMapped = false
      }
    })
  }, [scene])

  useEffect(() => () => useGLTF.clear(roomUrl), [])

  return <primitive object={scene} />
}
