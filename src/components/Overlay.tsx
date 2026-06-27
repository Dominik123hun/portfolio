/**
 * <Overlay /> — the DOM copy layered over the canvas. Rendered as a fixed layer
 * OUTSIDE the canvas, synced to the same scroll offset that drives the camera
 * (published to a shared store by <Rig>).
 *
 * Each block cross-fades by the scroll offset, and its text is split into
 * masked lines that slide up in a stagger as the section enters — the intro
 * plays once on load, the rest reveal on scroll. Copy is driven by projects.ts.
 */

import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { theme } from '../theme'
import { projects } from '../data/projects'
import { INTRO_WINDOW, OUTRO_WINDOW, projectWindow } from '../lib/sequence'
import { clamp, envelope } from '../lib/math'
import { readScroll } from '../lib/scrollStore'
import { appState } from '../lib/appState'
import type { Tier } from '../lib/tier'

type Win = [number, number, number, number]

interface Block {
  key: string
  className: string
  window: Win
  /** Intro plays a one-time load reveal; others reveal on scroll. */
  loadReveal?: boolean
  node: ReactNode
}

interface OverlayProps {
  tier: Tier
}

/** A masked line whose inner element the rAF slides up into view. */
function Reveal({ children }: { children: ReactNode }) {
  return (
    <span className="reveal-line">
      <span className="reveal">{children}</span>
    </span>
  )
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const STAGGER = 0.09
const WINDOW = 0.5

export function Overlay({ tier }: OverlayProps) {
  const refs = useRef<(HTMLElement | null)[]>([])
  const hintRef = useRef<HTMLDivElement | null>(null)

  const blocks = useMemo<Block[]>(() => {
    const list: Block[] = []
    const headlineLines = theme.headline.split('\n')

    list.push({
      key: 'intro',
      className: 'center',
      window: INTRO_WINDOW,
      loadReveal: true,
      node: (
        <div className="ov-inner">
          <Reveal>
            <span className="kicker">{theme.kicker}</span>
          </Reveal>
          <h1 className="headline">
            {headlineLines.map((line, i) => (
              <Reveal key={i}>{line}</Reveal>
            ))}
          </h1>
          <Reveal>
            <p className="subhead">
              A digital product studio crafting cinematic, high-performance web
              experiences end to end.
            </p>
          </Reveal>
        </div>
      ),
    })

    projects.forEach((p, i) => {
      const side = i % 2 === 0 ? 'right' : 'left'
      list.push({
        key: p.id,
        className: side,
        window: projectWindow(i),
        node: (
          <div className="ov-inner ov-card">
            <Reveal>
              <div className="card-index">
                {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              </div>
            </Reveal>
            <Reveal>
              <span className="card-cat">{p.category}</span>
            </Reveal>
            <h2 className="card-title">
              <Reveal>{p.title}</Reveal>
            </h2>
            <Reveal>
              <p className="card-desc">{p.description}</p>
            </Reveal>
            <Reveal>
              <a
                className="btn btn-ghost"
                href={p.link}
                target="_blank"
                rel="noreferrer"
                data-magnetic
              >
                View project <span className="arrow">→</span>
              </a>
            </Reveal>
          </div>
        ),
      })
    })

    list.push({
      key: 'outro',
      className: 'center',
      window: OUTRO_WINDOW,
      node: (
        <div className="ov-inner">
          <Reveal>
            <span className="kicker">{theme.studioName}</span>
          </Reveal>
          <h2 className="headline" style={{ fontSize: 'clamp(30px, 5.4vw, 70px)' }}>
            {theme.ctaTitle.split('\n').map((line, i) => (
              <Reveal key={i}>{line}</Reveal>
            ))}
          </h2>
          <div style={{ marginTop: 32 }}>
            <Reveal>
              <a className="btn btn-primary" href={`mailto:${theme.contactEmail}`} data-magnetic>
                {theme.ctaButton} <span className="arrow">→</span>
              </a>
            </Reveal>
          </div>
          <Reveal>
            <div className="contact">
              <a href={`mailto:${theme.contactEmail}`}>{theme.contactEmail}</a>
              <span>{theme.contactLocation}</span>
            </div>
          </Reveal>
        </div>
      ),
    })

    return list
  }, [])

  useEffect(() => {
    let raf = 0
    const reduced = tier.reducedMotion
    const meta = blocks.map((b) => ({ window: b.window, load: !!b.loadReveal }))
    let introStart = 0

    const tick = () => {
      const o = readScroll()
      const now = performance.now()
      if (!introStart && appState.ready) introStart = now
      const introP = introStart ? clamp((now - introStart - 150) / 950, 0, 1) : 0

      for (let i = 0; i < meta.length; i++) {
        const el = refs.current[i]
        if (!el) continue
        const [a, b, c, d] = meta[i].window
        const op = envelope(o, a, b, c, d)
        el.style.opacity = String(op)
        el.classList.toggle('shown', op > 0.55)

        // Stagger the masked lines in this block.
        const base = meta[i].load ? introP : op
        const lines = el.querySelectorAll<HTMLElement>('.reveal')
        for (let j = 0; j < lines.length; j++) {
          if (reduced) {
            lines[j].style.transform = 'none'
            lines[j].style.opacity = '1'
            continue
          }
          const t = clamp((base - j * STAGGER) / WINDOW, 0, 1)
          const e = easeOutCubic(t)
          lines[j].style.transform = `translateY(${(1 - e) * 110}%)`
          lines[j].style.opacity = String(e)
        }
      }

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
