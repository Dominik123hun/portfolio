/**
 * Device / preference "tier" — one hook that decides how heavy the experience
 * should be. Drives DPR, post-processing, particle counts and whether
 * auto-motion runs at all (prefers-reduced-motion).
 */

import { useEffect, useState } from 'react'

export interface Tier {
  isMobile: boolean
  reducedMotion: boolean
  /** Max device pixel ratio to render at. */
  maxDpr: number
  /** EffectComposer multisampling (0 = off). */
  msaa: number
  /** Particle count for the drifting field. */
  particles: number
  /** Bloom intensity (0 keeps it off). */
  bloom: number
  dof: boolean
  chromaticAberration: boolean
  grain: boolean
  vignette: boolean
}

function computeTier(): Tier {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const isMobile =
    typeof window !== 'undefined' &&
    (window.matchMedia('(max-width: 820px)').matches ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 1024))

  // Reduced motion: lightest possible, no auto-motion, minimal post.
  if (reducedMotion) {
    return {
      isMobile,
      reducedMotion: true,
      maxDpr: 1.25,
      msaa: 0,
      particles: 180,
      bloom: 0.6,
      dof: false,
      chromaticAberration: false,
      grain: false,
      vignette: true,
    }
  }

  // Mobile: trimmed particles, no DoF, no grain, capped DPR.
  if (isMobile) {
    return {
      isMobile: true,
      reducedMotion: false,
      maxDpr: 1.6,
      msaa: 0,
      particles: 450,
      bloom: 0.8,
      dof: false,
      chromaticAberration: true,
      grain: false,
      vignette: true,
    }
  }

  // Desktop: the full premium experience.
  return {
    isMobile: false,
    reducedMotion: false,
    maxDpr: 2,
    msaa: 4,
    particles: 1400,
    bloom: 1.0,
    dof: true,
    chromaticAberration: true,
    grain: true,
    vignette: true,
  }
}

function sameTier(a: Tier, b: Tier): boolean {
  return (
    a.isMobile === b.isMobile &&
    a.reducedMotion === b.reducedMotion &&
    a.maxDpr === b.maxDpr &&
    a.msaa === b.msaa &&
    a.particles === b.particles &&
    a.bloom === b.bloom &&
    a.dof === b.dof &&
    a.chromaticAberration === b.chromaticAberration &&
    a.grain === b.grain &&
    a.vignette === b.vignette
  )
}

export function useTier(): Tier {
  const [tier, setTier] = useState<Tier>(() => computeTier())

  useEffect(() => {
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const widthMq = window.matchMedia('(max-width: 820px)')

    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      // Debounce resize storms to a single recompute, and keep the SAME object
      // identity when nothing actually changed — otherwise every resize event
      // would remount the entire canvas subtree (and leak GPU resources).
      raf = requestAnimationFrame(() =>
        setTier((prev) => {
          const next = computeTier()
          return sameTier(prev, next) ? prev : next
        }),
      )
    }

    reduceMq.addEventListener('change', update)
    widthMq.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      reduceMq.removeEventListener('change', update)
      widthMq.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return tier
}
