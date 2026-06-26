/**
 * <Preloader /> — a DOM overlay (outside the canvas) with a progress ring.
 * Progress eases up while shaders compile, then completes and fades out once
 * the scene reports ready (see Warmup + appState). Includes a safety timeout
 * so it can never get permanently stuck.
 */

import { useEffect, useState } from 'react'
import { appState } from '../lib/appState'
import { theme } from '../theme'

export function Preloader() {
  const [progress, setProgress] = useState(0)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let raf = 0
    let ready = appState.ready
    const start = performance.now()
    const unsub = appState.subscribe(() => {
      ready = true
    })

    // Hard safety net: never block the page for more than 8s.
    const safety = window.setTimeout(() => {
      ready = true
    }, 8000)

    const tick = () => {
      const elapsed = performance.now() - start
      // Ease toward 92% over ~1s while loading; snap to 100 when ready.
      const target = ready ? 1 : Math.min(0.92, elapsed / 1000)
      setProgress((p) => Math.max(p, target))
      if (target < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setProgress(1)
        window.setTimeout(() => setHidden(true), 650)
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(safety)
      unsub()
    }
  }, [])

  if (hidden) return null

  const pct = Math.round(progress * 100)
  const done = progress >= 1

  return (
    <div className={`preloader ${done ? 'done' : ''}`} role="status" aria-live="polite">
      <div className="ring" style={{ ['--p' as string]: pct }}>
        <span className="pct">{pct}%</span>
      </div>
      <div className="pl-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
      <div className="pl-name">{theme.studioName}</div>
    </div>
  )
}
