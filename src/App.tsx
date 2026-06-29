import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { applyThemeToCss, theme } from './theme'
import { useTier } from './lib/tier'
import { ui, type Lang } from './data/i18n'
import { Scene } from './components/Scene'
import { Cursor } from './components/Cursor'
import { Preloader } from './components/Preloader'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  const tier = useTier()
  const [focused, setFocused] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const t = ui[lang]

  useEffect(() => {
    applyThemeToCss()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocused(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <ErrorBoundary>
      <Preloader />
      <Canvas
        dpr={[1, tier.maxDpr]}
        gl={{
          antialias: tier.msaa === 0,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 52, near: 0.05, far: 60, position: [0.12, 1.26, 0.42] }}
        performance={{ min: 0.5 }}
        onCreated={({ gl }) => {
          gl.setClearColor(theme.background, 1)
          gl.toneMappingExposure = 0.78
          gl.localClippingEnabled = true // for the "eaten" burger wedges
        }}
      >
        <Scene
          tier={tier}
          focused={focused}
          onFocus={setFocused}
          lang={lang}
          onLang={setLang}
        />
      </Canvas>

      {/* DOM overlay: wordmark, the "click the monitor" hint, and a back affordance. */}
      <div className="room-ui">
        <div className="wordmark">
          {theme.studioName.split(' ')[0]}
          <span className="dot">.</span>
        </div>

        <div className={`room-hint ${focused ? 'is-hidden' : ''}`} aria-hidden>
          <span className="blink">▸</span> {t.hint}
        </div>

        <button
          className={`back-btn ${focused ? '' : 'is-hidden'}`}
          onClick={() => setFocused(false)}
        >
          <span className="arrow">←</span> {t.back}
        </button>
      </div>

      <Cursor tier={tier} />
    </ErrorBoundary>
  )
}
