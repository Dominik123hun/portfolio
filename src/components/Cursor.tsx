/**
 * <Cursor /> — a custom dot + ring pointer that follows the mouse, grows over
 * interactive elements, and gives buttons (marked `data-magnetic`) a subtle
 * magnetic pull. Desktop / fine-pointer only; no-ops on touch and respects
 * reduced motion (no magnetic).
 */

import { useEffect, useRef } from 'react'
import { lerp } from '../lib/math'
import type { Tier } from '../lib/tier'

export function Cursor({ tier }: { tier: Tier }) {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine || !dotRef.current || !ringRef.current) return

    const dot = dotRef.current
    const ring = ringRef.current
    document.body.classList.add('cursor-on')

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const ringPos = { x: mouse.x, y: mouse.y }
    const offsets = new Map<HTMLElement, { x: number; y: number }>()
    let visible = false
    let raf = 0

    const show = () => {
      if (visible) return
      visible = true
      dot.classList.remove('is-hidden')
      ring.classList.remove('is-hidden')
    }
    const hide = () => {
      visible = false
      dot.classList.add('is-hidden')
      ring.classList.add('is-hidden')
    }
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      show()
      const target = e.target as Element | null
      const interactive = target?.closest?.('a, button, .btn, [data-hover]')
      ring.classList.toggle('is-hover', !!interactive)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    document.addEventListener('mouseleave', hide)
    window.addEventListener('blur', hide)

    const tick = () => {
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`
      ringPos.x = lerp(ringPos.x, mouse.x, 0.2)
      ringPos.y = lerp(ringPos.y, mouse.y, 0.2)
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`

      if (!tier.reducedMotion) {
        const els = document.querySelectorAll<HTMLElement>('[data-magnetic]')
        els.forEach((el) => {
          const r = el.getBoundingClientRect()
          if (r.width === 0) return
          const cx = r.left + r.width / 2
          const cy = r.top + r.height / 2
          const dx = mouse.x - cx
          const dy = mouse.y - cy
          const dist = Math.hypot(dx, dy)
          const radius = Math.max(r.width, r.height) * 0.7 + 60
          let tx = 0
          let ty = 0
          if (dist < radius) {
            const f = 1 - dist / radius
            tx = dx * 0.35 * f
            ty = dy * 0.5 * f
          }
          let cur = offsets.get(el)
          if (!cur) {
            cur = { x: 0, y: 0 }
            offsets.set(el, cur)
          }
          cur.x = lerp(cur.x, tx, 0.18)
          cur.y = lerp(cur.y, ty, 0.18)
          el.style.transform =
            Math.abs(cur.x) < 0.02 && Math.abs(cur.y) < 0.02
              ? ''
              : `translate(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px)`
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      document.removeEventListener('mouseleave', hide)
      window.removeEventListener('blur', hide)
      document.body.classList.remove('cursor-on')
      offsets.forEach((_, el) => {
        el.style.transform = ''
      })
    }
  }, [tier.reducedMotion])

  return (
    <>
      <div ref={ringRef} className="cursor-ring is-hidden" aria-hidden />
      <div ref={dotRef} className="cursor-dot is-hidden" aria-hidden />
    </>
  )
}
