/**
 * <Overlay /> — the DOM copy layered over the canvas. Rendered as a fixed layer
 * OUTSIDE the canvas (a transformed <Scroll html> wrapper can't host pinned,
 * full-screen cross-fade overlays), but synced to the very same scroll offset:
 * <Rig> publishes it to a tiny shared store each frame and this reads it.
 *
 * Each block is a fixed, centered layer cross-faded by the scroll offset, so
 * text appears exactly as its scene enters view. Copy is driven by projects.ts.
 */

import { useEffect, useMemo, useRef } from 'react'
import { theme } from '../theme'
import { projects } from '../data/projects'
import { INTRO_WINDOW, OUTRO_WINDOW, projectWindow } from '../lib/sequence'
import { envelope } from '../lib/math'
import { readScroll } from '../lib/scrollStore'
import type { Tier } from '../lib/tier'

type Win = [number, number, number, number]

interface Block {
  key: string
  className: string
  window: Win
  node: React.ReactNode
}

interface OverlayProps {
  tier: Tier
}

export function Overlay({ tier }: OverlayProps) {
  const refs = useRef<(HTMLElement | null)[]>([])
  const hintRef = useRef<HTMLDivElement | null>(null)

  const blocks = useMemo<Block[]>(() => {
    const list: Block[] = []

    // Intro
    list.push({
      key: 'intro',
      className: 'center',
      window: INTRO_WINDOW,
      node: (
        <div className="ov-inner">
          <span className="kicker">{theme.kicker}</span>
          <h1 className="headline">{theme.headline}</h1>
          <p className="subhead">
            A digital product studio crafting cinematic, high-performance web
            experiences end to end.
          </p>
        </div>
      ),
    })

    // One block per project — card sits opposite the slab's side.
    projects.forEach((p, i) => {
      const side = i % 2 === 0 ? 'right' : 'left'
      list.push({
        key: p.id,
        className: side,
        window: projectWindow(i),
        node: (
          <div className="ov-inner ov-card">
            <div className="card-index">
              {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
            </div>
            <span className="card-cat">{p.category}</span>
            <h2 className="card-title">{p.title}</h2>
            <p className="card-desc">{p.description}</p>
            <a className="btn btn-ghost" href={p.link} target="_blank" rel="noreferrer">
              View project <span className="arrow">→</span>
            </a>
          </div>
        ),
      })
    })

    // Outro CTA
    list.push({
      key: 'outro',
      className: 'center',
      window: OUTRO_WINDOW,
      node: (
        <div className="ov-inner">
          <span className="kicker">{theme.studioName}</span>
          <h2 className="headline" style={{ fontSize: 'clamp(30px, 5.4vw, 68px)' }}>
            {theme.ctaTitle}
          </h2>
          <div style={{ marginTop: 30 }}>
            <a className="btn btn-primary" href={`mailto:${theme.contactEmail}`}>
              {theme.ctaButton} <span className="arrow">→</span>
            </a>
          </div>
          <div className="contact">
            <a href={`mailto:${theme.contactEmail}`}>{theme.contactEmail}</a>
            <span>{theme.contactLocation}</span>
          </div>
        </div>
      ),
    })

    return list
  }, [])

  // Own rAF loop reading the shared scroll offset — independent of R3F context
  // across the <Scroll html> portal, so cross-fades always track the scroll.
  useEffect(() => {
    let raf = 0
    const reduced = tier.reducedMotion
    const windows = blocks.map((b) => b.window)
    const tick = () => {
      const o = readScroll()
      for (let i = 0; i < windows.length; i++) {
        const el = refs.current[i]
        if (!el) continue
        const [a, b, c, d] = windows[i]
        const op = envelope(o, a, b, c, d)
        el.style.opacity = String(op)
        el.style.transform = reduced ? 'none' : `translateY(${(1 - op) * 16}px)`
        // Toggle interactivity of this section's CONTROLS only (the full-screen
        // block stays pointer-events:none so it never blocks scrolling).
        el.classList.toggle('shown', op > 0.55)
      }
      // Scroll hint: visible at the very start, gone once scrolling begins.
      if (hintRef.current) {
        hintRef.current.style.opacity = String(envelope(o, -1, -0.5, 0.03, 0.08))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [blocks, tier.reducedMotion])

  return (
    <div className="overlay-root">
      <div className="wordmark">
        {theme.studioName.split(' ')[0]}
        <span className="dot">.</span>
      </div>
      <div className="scroll-hint" ref={hintRef} aria-hidden>
        <span className="mouse" />
        Scroll
      </div>
      {blocks.map((block, i) => (
        <section
          key={block.key}
          ref={(el) => {
            refs.current[i] = el
          }}
          className={`ov-block ${block.className}`}
        >
          {block.node}
        </section>
      ))}
    </div>
  )
}
