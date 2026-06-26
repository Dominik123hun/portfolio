/**
 * Procedural textures — everything the scene "shows" is drawn to a <canvas>
 * at runtime, so the experience is complete on first load with zero image
 * assets. Swap `Project.image` in data/projects.ts to use real screenshots.
 */

import * as THREE from 'three'
import type { Project } from '../data/projects'

/* ───────────────────────────── helpers ──────────────────────────────── */

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  return [c, ctx]
}

function toTexture(c: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '')
  const v = parseInt(m.length === 3 ? m.replace(/(.)/g, '$1$1') : m, 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

const BG = '#0a0d16'
const PANEL_BG = '#11151f'
const INK = '#e8ecf5'
const MUTE = 'rgba(232,236,245,0.55)'

/* ───────────────────────── particle sprite ──────────────────────────── */

export function makeParticleTexture(): THREE.Texture {
  const s = 64
  const [c, ctx] = canvas(s, s)
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.55)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  return toTexture(c)
}

/* ───────────────────── radial glow (outro halo) ─────────────────────── */

export function makeGlowTexture(accent: string): THREE.Texture {
  const s = 512
  const [c, ctx] = canvas(s, s)
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, rgba(accent, 0.55))
  g.addColorStop(0.4, rgba(accent, 0.18))
  g.addColorStop(1, rgba(accent, 0))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  return toTexture(c)
}

/* ───────────────────────── laptop screen ────────────────────────────── */

export function makeScreenTexture(accent: string, studioName: string): THREE.Texture {
  const w = 1024
  const h = 668
  const [c, ctx] = canvas(w, h)

  // backdrop
  ctx.fillStyle = '#04060c'
  ctx.fillRect(0, 0, w, h)
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, h * 0.8)
  glow.addColorStop(0, rgba(accent, 0.55))
  glow.addColorStop(0.45, rgba(accent, 0.12))
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  // faint window chrome
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  roundRect(ctx, 60, 54, w - 120, 70, 16)
  ctx.fill()
  const dots = ['#ff5f57', '#febc2e', '#28c840']
  dots.forEach((d, i) => {
    ctx.fillStyle = d
    ctx.beginPath()
    ctx.arc(96 + i * 26, 89, 7, 0, Math.PI * 2)
    ctx.fill()
  })

  // hero wordmark
  ctx.textAlign = 'center'
  ctx.fillStyle = INK
  ctx.font = '800 84px Inter, system-ui, sans-serif'
  ctx.fillText(studioName, w / 2, h * 0.5)

  // accent underline
  ctx.fillStyle = accent
  roundRect(ctx, w / 2 - 90, h * 0.5 + 34, 180, 8, 4)
  ctx.fill()

  // tagline
  ctx.fillStyle = MUTE
  ctx.font = '500 30px Inter, system-ui, sans-serif'
  ctx.fillText('websites · webshops · apps · software', w / 2, h * 0.62)

  // CTA pill
  ctx.fillStyle = accent
  roundRect(ctx, w / 2 - 110, h * 0.72, 220, 64, 32)
  ctx.fill()
  ctx.fillStyle = '#04060c'
  ctx.font = '700 26px Inter, system-ui, sans-serif'
  ctx.fillText('Enter ↵', w / 2, h * 0.72 + 41)

  return toTexture(c)
}

/* ─────────────────────── project mockups ────────────────────────────── */

const PW = 1024
const PH = 640

function frame(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, PW, PH)
}

function browserBar(ctx: CanvasRenderingContext2D, label: string): void {
  ctx.fillStyle = '#0d111b'
  ctx.fillRect(0, 0, PW, 56)
  const dots = ['#ff5f57', '#febc2e', '#28c840']
  dots.forEach((d, i) => {
    ctx.fillStyle = d
    ctx.beginPath()
    ctx.arc(30 + i * 24, 28, 7, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  roundRect(ctx, 130, 14, PW - 260, 28, 14)
  ctx.fill()
  ctx.fillStyle = MUTE
  ctx.textAlign = 'left'
  ctx.font = '500 15px Inter, system-ui, sans-serif'
  ctx.fillText(label, 150, 34)
}

function drawMarketing(ctx: CanvasRenderingContext2D, p: Project, hue: string): void {
  frame(ctx)
  browserBar(ctx, p.id + '.com')

  // nav
  ctx.fillStyle = INK
  ctx.textAlign = 'left'
  ctx.font = '800 24px Inter, system-ui, sans-serif'
  ctx.fillText(p.title, 56, 110)
  ctx.font = '500 16px Inter, system-ui, sans-serif'
  ctx.fillStyle = MUTE
  ;['Work', 'Studio', 'Journal', 'Contact'].forEach((t, i) => {
    ctx.fillText(t, PW - 360 + i * 90, 110)
  })

  // hero blob (right)
  const cx = PW * 0.74
  const cy = PH * 0.5
  const blob = ctx.createRadialGradient(cx, cy, 10, cx, cy, 230)
  blob.addColorStop(0, rgba(hue, 0.95))
  blob.addColorStop(1, rgba(hue, 0.05))
  ctx.fillStyle = blob
  ctx.beginPath()
  ctx.arc(cx, cy, 210, 0, Math.PI * 2)
  ctx.fill()

  // hero headline (left)
  ctx.fillStyle = INK
  ctx.font = '800 64px Inter, system-ui, sans-serif'
  ctx.fillText('Design that', 56, 300)
  ctx.fillText('moves.', 56, 372)
  ctx.fillStyle = MUTE
  ctx.font = '400 20px Inter, system-ui, sans-serif'
  ctx.fillText('A brand experience built to convert.', 58, 418)

  // CTA
  ctx.fillStyle = hue
  roundRect(ctx, 58, 452, 200, 56, 28)
  ctx.fill()
  ctx.fillStyle = '#06080f'
  ctx.font = '700 18px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Get started', 158, 487)

  // feature row
  ctx.textAlign = 'left'
  for (let i = 0; i < 3; i++) {
    const x = 58 + i * 175
    ctx.fillStyle = PANEL_BG
    roundRect(ctx, x, 548, 158, 64, 14)
    ctx.fill()
    ctx.fillStyle = rgba(hue, 0.9)
    roundRect(ctx, x + 16, 566, 28, 28, 8)
    ctx.fill()
  }
}

function drawShop(ctx: CanvasRenderingContext2D, p: Project, hue: string): void {
  frame(ctx)
  browserBar(ctx, p.id + '.shop')

  // header
  ctx.fillStyle = INK
  ctx.textAlign = 'left'
  ctx.font = '800 22px Inter, system-ui, sans-serif'
  ctx.fillText(p.title, 56, 104)
  ctx.fillStyle = MUTE
  ctx.font = '500 15px Inter, system-ui, sans-serif'
  ctx.fillText('New · Bestsellers · Sale', PW - 320, 104)
  // cart pill
  ctx.fillStyle = hue
  roundRect(ctx, PW - 110, 84, 54, 30, 15)
  ctx.fill()

  // product grid 3 x 2
  const cols = 3
  const rows = 2
  const gw = (PW - 56 * 2 - 24 * (cols - 1)) / cols
  const gh = 210
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = 56 + c * (gw + 24)
      const y = 140 + r * (gh + 22)
      ctx.fillStyle = PANEL_BG
      roundRect(ctx, x, y, gw, gh, 16)
      ctx.fill()
      // product image area with tint
      const img = ctx.createLinearGradient(x, y, x + gw, y + gh - 70)
      img.addColorStop(0, rgba(hue, 0.85))
      img.addColorStop(1, rgba(hue, 0.25))
      ctx.fillStyle = img
      roundRect(ctx, x + 12, y + 12, gw - 24, gh - 90, 12)
      ctx.fill()
      // title + price
      ctx.fillStyle = INK
      ctx.font = '600 15px Inter, system-ui, sans-serif'
      ctx.fillText('Product ' + (r * cols + c + 1), x + 16, y + gh - 42)
      ctx.fillStyle = hue
      ctx.font = '700 15px Inter, system-ui, sans-serif'
      ctx.fillText('$' + (29 + (r * cols + c) * 10), x + 16, y + gh - 18)
      // add button
      ctx.fillStyle = rgba('#ffffff', 0.08)
      roundRect(ctx, x + gw - 52, y + gh - 56, 40, 40, 12)
      ctx.fill()
      ctx.fillStyle = hue
      ctx.font = '700 22px Inter, system-ui, sans-serif'
      ctx.fillText('+', x + gw - 39, y + gh - 28)
    }
  }
}

function drawApp(ctx: CanvasRenderingContext2D, p: Project, hue: string): void {
  frame(ctx)

  // left sidebar
  ctx.fillStyle = '#0c0f18'
  ctx.fillRect(0, 0, 220, PH)
  ctx.fillStyle = hue
  roundRect(ctx, 28, 32, 32, 32, 9)
  ctx.fill()
  ctx.fillStyle = INK
  ctx.textAlign = 'left'
  ctx.font = '700 18px Inter, system-ui, sans-serif'
  ctx.fillText(p.title, 72, 54)
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i === 1 ? rgba(hue, 0.18) : 'transparent'
    roundRect(ctx, 20, 100 + i * 50, 180, 38, 10)
    ctx.fill()
    ctx.fillStyle = i === 1 ? hue : MUTE
    roundRect(ctx, 36, 112 + i * 50, 16, 16, 5)
    ctx.fill()
    ctx.fillStyle = i === 1 ? INK : MUTE
    ctx.font = '500 15px Inter, system-ui, sans-serif'
    ctx.fillText(['Home', 'Boards', 'Tasks', 'Files', 'Team', 'Settings'][i], 64, 124 + i * 50)
  }

  // top bar
  ctx.fillStyle = '#0d111b'
  ctx.fillRect(220, 0, PW - 220, 64)
  ctx.fillStyle = INK
  ctx.font = '700 18px Inter, system-ui, sans-serif'
  ctx.fillText('Workspace', 250, 40)
  ctx.fillStyle = hue
  roundRect(ctx, PW - 150, 16, 110, 32, 16)
  ctx.fill()
  ctx.fillStyle = '#06080f'
  ctx.textAlign = 'center'
  ctx.font = '700 14px Inter, system-ui, sans-serif'
  ctx.fillText('+ New', PW - 95, 37)
  ctx.textAlign = 'left'

  // kanban columns
  const colNames = ['To do', 'In progress', 'Done']
  for (let k = 0; k < 3; k++) {
    const x = 250 + k * 248
    ctx.fillStyle = MUTE
    ctx.font = '600 14px Inter, system-ui, sans-serif'
    ctx.fillText(colNames[k], x, 104)
    const cardCount = 3 - (k % 2)
    for (let j = 0; j < cardCount; j++) {
      const y = 124 + j * 96
      ctx.fillStyle = PANEL_BG
      roundRect(ctx, x, y, 224, 80, 14)
      ctx.fill()
      ctx.fillStyle = rgba(hue, 0.85)
      roundRect(ctx, x + 14, y + 14, 44, 8, 4)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.16)'
      roundRect(ctx, x + 14, y + 34, 180, 7, 3)
      ctx.fill()
      roundRect(ctx, x + 14, y + 50, 120, 7, 3)
      ctx.fill()
    }
  }
}

function drawDashboard(ctx: CanvasRenderingContext2D, p: Project, hue: string): void {
  frame(ctx)
  browserBar(ctx, p.id + '.app/analytics')

  ctx.fillStyle = INK
  ctx.textAlign = 'left'
  ctx.font = '800 22px Inter, system-ui, sans-serif'
  ctx.fillText(p.title, 56, 104)

  // KPI cards
  const kpis = [
    ['Revenue', '$1.24M'],
    ['Active users', '48.2k'],
    ['Conversion', '4.7%'],
    ['Churn', '1.2%'],
  ]
  const kw = (PW - 56 * 2 - 18 * 3) / 4
  kpis.forEach((kpi, i) => {
    const x = 56 + i * (kw + 18)
    ctx.fillStyle = PANEL_BG
    roundRect(ctx, x, 124, kw, 92, 14)
    ctx.fill()
    ctx.fillStyle = MUTE
    ctx.font = '500 13px Inter, system-ui, sans-serif'
    ctx.fillText(kpi[0], x + 16, 152)
    ctx.fillStyle = INK
    ctx.font = '800 26px Inter, system-ui, sans-serif'
    ctx.fillText(kpi[1], x + 16, 188)
    ctx.fillStyle = rgba(hue, 0.9)
    roundRect(ctx, x + kw - 28, 140, 14, 14, 4)
    ctx.fill()
  })

  // line chart
  const lx = 56
  const ly = 244
  const lw = PW - 112
  const lh = 200
  ctx.fillStyle = PANEL_BG
  roundRect(ctx, lx, ly, lw, lh, 16)
  ctx.fill()
  // gridlines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  for (let g = 1; g < 4; g++) {
    const y = ly + (lh / 4) * g
    ctx.beginPath()
    ctx.moveTo(lx + 16, y)
    ctx.lineTo(lx + lw - 16, y)
    ctx.stroke()
  }
  // line path
  const pts = [0.2, 0.35, 0.28, 0.5, 0.46, 0.66, 0.6, 0.82, 0.74, 0.92]
  ctx.beginPath()
  pts.forEach((v, i) => {
    const x = lx + 24 + (i / (pts.length - 1)) * (lw - 48)
    const y = ly + lh - 24 - v * (lh - 56)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.strokeStyle = hue
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.stroke()
  // area fill
  ctx.lineTo(lx + lw - 24, ly + lh - 24)
  ctx.lineTo(lx + 24, ly + lh - 24)
  ctx.closePath()
  const area = ctx.createLinearGradient(0, ly, 0, ly + lh)
  area.addColorStop(0, rgba(hue, 0.3))
  area.addColorStop(1, rgba(hue, 0))
  ctx.fillStyle = area
  ctx.fill()

  // bars row
  const by = 466
  const bh = 140
  ctx.fillStyle = PANEL_BG
  roundRect(ctx, lx, by, lw, bh, 16)
  ctx.fill()
  const bars = [0.4, 0.7, 0.55, 0.85, 0.6, 0.95, 0.5, 0.75]
  const bw = (lw - 80) / bars.length
  bars.forEach((v, i) => {
    const x = lx + 32 + i * bw
    const hgt = v * (bh - 48)
    ctx.fillStyle = i % 2 ? rgba(hue, 0.5) : hue
    roundRect(ctx, x, by + bh - 20 - hgt, bw - 14, hgt, 6)
    ctx.fill()
  })
}

/**
 * Generates a placeholder "screenshot" texture for a project, drawn to match
 * its `kind`. The `accent` is used as a fallback when the project has no `hue`.
 */
export function makeProjectTexture(project: Project, accent: string): THREE.Texture {
  const [c, ctx] = canvas(PW, PH)
  const hue = project.hue ?? accent
  switch (project.kind) {
    case 'marketing':
      drawMarketing(ctx, project, hue)
      break
    case 'shop':
      drawShop(ctx, project, hue)
      break
    case 'app':
      drawApp(ctx, project, hue)
      break
    case 'dashboard':
      drawDashboard(ctx, project, hue)
      break
  }
  return toTexture(c)
}
