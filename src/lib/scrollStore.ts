/**
 * Bridges the scroll offset (0..1) from inside the canvas (Rig) to the DOM
 * overlay, which is rendered outside the canvas. The value is stored as a
 * primitive directly on `globalThis`, so reads and writes hit the exact same
 * slot even if this module ends up duplicated across bundle chunks.
 */

const KEY = '__landingScrollOffset'

type Holder = Record<string, number>

export function publishScroll(offset: number): void {
  ;(globalThis as unknown as Holder)[KEY] = offset
}

export function readScroll(): number {
  return (globalThis as unknown as Holder)[KEY] ?? 0
}
