/**
 * <PortfolioOverlay /> — the retro PORTFOLIO.EXE window, shown when the
 * monitor is focused.
 *
 * Rendered as a plain DOM overlay (centered, responsive) rather than mapped
 * onto the 3D screen with drei <Html transform>. The transform approach
 * projects DOM through a CSS matrix3d that mis-scales / mis-positions on some
 * devices and breaks outright inside mobile in-app browsers (their viewport &
 * DPR quirks throw off the projection). A normal overlay is crisp and
 * correctly placed everywhere; the 3D room still shows, dimmed, behind it.
 */

import { projects } from '../data/projects'
import { theme } from '../theme'
import { projectText, ui, itemsLabel, type Lang } from '../data/i18n'
import type { Tier } from '../lib/tier'

interface PortfolioOverlayProps {
  focused: boolean
  lang: Lang
  tier: Tier
  onClose: () => void
}

export function PortfolioOverlay({ focused, lang, tier, onClose }: PortfolioOverlayProps) {
  const t = ui[lang]
  return (
    <div
      className={`crt-overlay ${focused ? 'is-open' : ''}`}
      onClick={onClose}
      aria-hidden={!focused}
    >
      <div
        className={`crt ${focused ? 'is-on' : ''} ${tier.reducedMotion ? 'no-flicker' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="crt-win">
          <div className="crt-titlebar">
            <span className="crt-title">PORTFOLIO.EXE</span>
            <button type="button" className="crt-winbtns" onClick={onClose} aria-label="close">
              _&nbsp;□&nbsp;✕
            </button>
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
                    {String(i + 1).padStart(2, '0')} · {projectText(p.id, lang).category}
                  </span>
                </span>
                <span className="crt-open">{t.open} ▸</span>
              </a>
            ))}
          </div>
          <div className="crt-status">
            {projects.length} {itemsLabel(projects.length, lang)} · {theme.studioName}
          </div>
        </div>
        <div className="crt-scan" aria-hidden />
        <div className="crt-glow" aria-hidden />
      </div>
    </div>
  )
}
