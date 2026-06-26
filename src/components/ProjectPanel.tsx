/**
 * <ProjectPanel /> — one floating "ice slab" showing a project screenshot,
 * framed with an accent edge and a soft backlight. Title / description / link
 * live in the synced DOM overlay (see Overlay.tsx) so the text stays crisp.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges, RoundedBox, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { theme } from '../theme'
import { PANEL, panelPosition, panelRotationY } from '../lib/sequence'
import { smoothstep } from '../lib/math'
import { makeProjectTexture } from '../lib/textures'
import type { Project } from '../data/projects'
import type { Tier } from '../lib/tier'

interface ProjectPanelProps {
  project: Project
  index: number
  tier: Tier
}

/** Loads a real screenshot if `project.image` is set; else null. */
function useProjectTexture(project: Project): THREE.Texture {
  const generated = useMemo(
    () => makeProjectTexture(project, theme.accent),
    [project],
  )

  // Dispose the generated canvas texture on unmount.
  useEffect(() => () => generated.dispose(), [generated])

  // If an explicit image is provided, load and use it once ready.
  const [loaded, setLoaded] = useState<THREE.Texture | null>(null)
  useEffect(() => {
    if (!project.image) {
      setLoaded(null)
      return
    }
    let alive = true
    let tex: THREE.Texture | null = null
    new THREE.TextureLoader().load(project.image, (t) => {
      if (!alive) {
        t.dispose()
        return
      }
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      tex = t
      setLoaded(t)
    })
    return () => {
      alive = false
      tex?.dispose()
    }
  }, [project.image])

  return loaded ?? generated
}

export function ProjectPanel({ project, index, tier }: ProjectPanelProps) {
  const scroll = useScroll()
  const group = useRef<THREE.Group>(null!)
  const tex = useProjectTexture(project)
  const base = useMemo(() => panelPosition(index), [index])
  const ry = useMemo(() => panelRotationY(index), [index])
  const hue = useMemo(() => new THREE.Color(project.hue ?? theme.accent), [project.hue])
  const lastOpacity = useRef(-1)

  useFrame((state) => {
    if (!group.current) return

    // Slabs are invisible during the intro/laptop scenes, then fade in as the
    // camera pushes through the screen into project space.
    const o = scroll.offset
    const opacity = smoothstep(PANEL.revealIn, PANEL.revealOut, o)
    const visible = opacity > 0.001
    group.current.visible = visible
    if (!visible) return

    // Only re-walk the materials when the reveal actually changed.
    if (Math.abs(opacity - lastOpacity.current) > 0.001) {
      lastOpacity.current = opacity
      group.current.traverse((obj) => {
        const mat = (obj as THREE.Mesh).material as
          | (THREE.Material & { opacity: number })
          | undefined
        if (mat && 'opacity' in mat) {
          // Preserve each material's authored opacity, just scale it by reveal.
          if (mat.userData.baseOpacity === undefined) mat.userData.baseOpacity = mat.opacity
          mat.transparent = true
          mat.opacity = mat.userData.baseOpacity * opacity
        }
      })
    }

    if (tier.reducedMotion) {
      group.current.position.y = base[1]
      return
    }
    const t = state.clock.elapsedTime
    // Gentle, offset-per-slab float so the corridor feels alive.
    group.current.position.y = base[1] + Math.sin(t * 0.6 + index * 1.3) * 0.09
    group.current.rotation.z = Math.sin(t * 0.4 + index) * 0.012
  })

  return (
    <group ref={group} position={base} rotation={[0, ry, 0]}>
      {/* Soft accent backlight halo */}
      <mesh position={[0, 0, -0.45]}>
        <planeGeometry args={[6.2, 4.3]} />
        <meshBasicMaterial
          color={hue}
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Glass slab frame */}
      <RoundedBox args={[5.3, 3.55, 0.18]} radius={0.09} smoothness={4} position={[0, 0, -0.12]}>
        <meshStandardMaterial
          color="#0b0e16"
          metalness={0.6}
          roughness={0.15}
          envMapIntensity={1.1}
          transparent
          opacity={0.92}
        />
      </RoundedBox>

      {/* Screenshot */}
      <mesh position={[0, 0, 0.0]}>
        <planeGeometry args={[4.8, 3.0]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
        <Edges scale={1} threshold={15} color={theme.accent} />
      </mesh>
    </group>
  )
}
