import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { applyThemeToCss, theme } from './theme'
import { useTier } from './lib/tier'
import { Scene } from './components/Scene'
import { Overlay } from './components/Overlay'
import { Cursor } from './components/Cursor'
import { Preloader } from './components/Preloader'
import { ErrorBoundary } from './components/ErrorBoundary'

export default function App() {
  const tier = useTier()

  useEffect(() => {
    applyThemeToCss()
  }, [])

  return (
    <ErrorBoundary>
      <Preloader />
      <Canvas
        // `dpr` capped per-tier for performance; composer handles AA.
        dpr={[1, tier.maxDpr]}
        gl={{
          antialias: tier.msaa === 0,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 38, near: 0.1, far: 220, position: [0, 0.75, 7.5] }}
        performance={{ min: 0.5 }}
        // StrictMode double-invoke is fine; we never want a transparent clear.
        onCreated={({ gl }) => gl.setClearColor(theme.background, 1)}
      >
        <Scene tier={tier} />
      </Canvas>
      {/* Crisp DOM copy over the canvas, synced to scroll via the shared store. */}
      <Overlay tier={tier} />
      <Cursor tier={tier} />
    </ErrorBoundary>
  )
}
