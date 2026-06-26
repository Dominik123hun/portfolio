/**
 * ─────────────────────────────────────────────────────────────────────────
 *  THEME — the one place to brand this site.
 * ─────────────────────────────────────────────────────────────────────────
 *  Change the accent color, studio name and contact details here and they
 *  propagate everywhere (3D scene, post-processing glow, DOM overlay, CSS).
 *
 *  • accent       → the single accent color used across the whole experience
 *                   (placeholder: electric blue). Change it once, here.
 *  • studioName   → shown in the loader, the laptop screen and the outro CTA.
 *  • the rest      → headline / tagline / contact placeholders.
 */

export const theme = {
  /** Studio name — appears in the loader, the laptop screen, and the outro. */
  studioName: 'NOVA STUDIO',

  /** Hero headline (intro section). The \n is a deliberate line break. */
  headline: 'We build websites, webshops,\napps & software',
  // (kept as two balanced lines so it never clips on any font/viewport)

  /** Small kicker above the headline. */
  kicker: 'Digital product studio',

  /** Outro call-to-action copy. */
  ctaTitle: "Let's build something premium.",
  ctaButton: 'Start a project',

  /** Contact placeholders. */
  contactEmail: 'hello@novastudio.dev',
  contactLocation: 'Remote · Worldwide',

  /**
   * THE accent color. Electric-blue placeholder.
   * Keep `accent` and `accentRgb` in sync (rgb is used for soft glows/shadows).
   */
  accent: '#3b82f6',
  accentRgb: '59, 130, 246',

  /** Near-black background of the whole scene. */
  background: '#05060a',

  /** Primary text color for the DOM overlay. */
  text: '#e8ecf5',
} as const

export type Theme = typeof theme

/**
 * Pushes the theme colors into CSS custom properties so the DOM overlay,
 * loader and buttons all read from the same source as the 3D scene.
 * Called once on app mount.
 */
export function applyThemeToCss(): void {
  const root = document.documentElement
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-rgb', theme.accentRgb)
  root.style.setProperty('--bg', theme.background)
  root.style.setProperty('--text', theme.text)
  document.title = `${theme.studioName} — ${theme.headline.replace(/\n/g, ' ')}`
}
