/**
 * Tiny external store so the preloader (DOM, outside the canvas) can learn
 * when the 3D scene has compiled its shaders and rendered its first frames.
 * No dependency on React context across the canvas boundary.
 */

let ready = false
const subscribers = new Set<() => void>()

export const appState = {
  get ready(): boolean {
    return ready
  },
  setReady(): void {
    if (ready) return
    ready = true
    subscribers.forEach((fn) => fn())
  },
  subscribe(fn: () => void): () => void {
    subscribers.add(fn)
    return () => subscribers.delete(fn)
  },
}
