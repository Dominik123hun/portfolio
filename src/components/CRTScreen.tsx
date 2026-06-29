/**
 * <CRTScreen /> — the retro portfolio UI mapped onto the monitor's screen via
 * drei <Html transform>, coplanar with the real screen so it reads as content
 * displayed on the CRT. Hidden in room mode (the model's screensaver shows);
 * fades in and becomes scrollable/clickable when the monitor is focused.
 */

import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { SCREEN } from './Room'
import { projects } from '../data/projects'
import { theme } from '../theme'
import type { Tier } from '../lib/tier'

interface CRTScreenProps {
  tier: Tier
  focused: boolean
}

export function CRTScreen({ tier, focused }: CRTScreenProps) {
  // Orient the panel coplanar with the screen (its +Z faces the viewer).
  const quat = useMemo(() => {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), SCREEN.normal)
    return [q.x, q.y, q.z, q.w] as [number, number, number, number]
  }, [])

  return (
    <group position={SCREEN.center.toArray()} quaternion={quat}>
      <Html
        transform
        occlude={false}
        position={[0, 0, 0.02]}
        scale={0.043}
        zIndexRange={[2, 0]}
        pointerEvents={focused ? 'auto' : 'none'}
        wrapperClass="crt-wrap"
      >
        <div className={`crt ${focused ? 'is-on' : ''} ${tier.reducedMotion ? 'no-flicker' : ''}`}>
          <div className="crt-win">
            <div className="crt-titlebar">
              <span className="crt-title">PORTFOLIO.EXE</span>
              <span className="crt-winbtns">_&nbsp;□&nbsp;✕</span>
            </div>
            <div className="crt-path">C:\{theme.studioName.replace(/\s+/g, '_')}\WORK&gt;</div>
            <div className="crt-list">
              {projects.map((p, i) => (
                <a
                  key={p.id}
                  className="crt-item"
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="crt-ic">▣</span>
                  <span className="crt-col">
                    <span className="crt-name">{p.title}</span>
                    <span className="crt-cat">
                      {String(i + 1).padStart(2, '0')} · {p.category}
                    </span>
                  </span>
                  <span className="crt-open">OPEN ▸</span>
                </a>
              ))}
            </div>
            <div className="crt-status">
              {projects.length} ITEMS · {theme.studioName}
            </div>
          </div>
          <div className="crt-scan" aria-hidden />
          <div className="crt-glow" aria-hidden />
        </div>
      </Html>
    </group>
  )
}
