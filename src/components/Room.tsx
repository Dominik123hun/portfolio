/**
 * <Room /> — the 90s office cubicle (Sketchfab GLB).
 *
 *  - The monitor screen ("Screen_Emission") is forced OFF/black by default (no
 *    screensaver); it gives a faint power-on glow on hover. Clicking it opens
 *    the portfolio (PortfolioOverlay) as a DOM overlay over the dimmed room.
 *  - The burger ("Burger") can be eaten: each `bites` step removes a 90° wedge
 *    via clipping planes through its vertical axis (4 bites = gone).
 */

import { useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import roomUrl from './low_poly_90s_office_cubicle.glb?url'

useGLTF.preload(roomUrl)

/** World position / facing of the monitor screen, measured from the GLB. */
export const SCREEN = {
  center: new THREE.Vector3(-0.777, 1.071, -0.744),
  normal: new THREE.Vector3(0.69, 0.02, 0.72).normalize(),
}

/** Burger centre (vertical axis) for the wedge clipping. */
const BURGER = new THREE.Vector3(-0.736, 0, -0.09)

const dir = (deg: number) =>
  new THREE.Vector3(Math.cos((deg * Math.PI) / 180), 0, Math.sin((deg * Math.PI) / 180))

function planeThrough(normal: THREE.Vector3): THREE.Plane {
  return new THREE.Plane(normal.clone(), -normal.dot(BURGER))
}

/** Clipping planes for `bites` (0..4). intersect=true removes the wedge;
 *  intersect=false keeps the remaining wedge. */
function bitePlanes(bites: number): { planes: THREE.Plane[]; intersect: boolean } {
  if (bites <= 0) return { planes: [], intersect: false }
  if (bites <= 2) {
    const b = bites * 90
    return { planes: [planeThrough(dir(-90)), planeThrough(dir(b + 90))], intersect: true }
  }
  // 3 bites → keep the last 90° wedge [270,360]
  return { planes: [planeThrough(dir(360)), planeThrough(dir(270))], intersect: false }
}

interface RoomProps {
  bites?: number
}

export function Room({ bites = 0 }: RoomProps) {
  const { scene } = useGLTF(roomUrl)
  const burgerMat = useRef<THREE.MeshStandardMaterial | null>(null)
  const burgerMesh = useRef<THREE.Mesh | null>(null)

  useMemo(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined
      if (!mat) return
      if (mat.name === 'Screen_Emission') {
        // Power the CRT OFF: matte dark glass, no screensaver.
        mat.toneMapped = false
        mat.map = null
        mat.emissiveMap = null
        mat.color = new THREE.Color('#05070c')
        mat.emissive = new THREE.Color('#000000')
        mat.emissiveIntensity = 0
        mat.metalness = 0.1
        mat.roughness = 0.55
        mat.needsUpdate = true
      }
      if (mat.name === 'Burger') {
        burgerMat.current = mat
        burgerMesh.current = mesh
      }
    })
  }, [scene])

  // Apply the burger "bites" as clipping wedges.
  useEffect(() => {
    const mat = burgerMat.current
    if (!mat) return
    const { planes, intersect } = bitePlanes(bites)
    mat.clippingPlanes = planes
    mat.clipIntersection = intersect
    mat.needsUpdate = true
    if (burgerMesh.current) burgerMesh.current.visible = bites < 4
  }, [bites])

  useEffect(() => () => useGLTF.clear(roomUrl), [])

  return <primitive object={scene} />
}
