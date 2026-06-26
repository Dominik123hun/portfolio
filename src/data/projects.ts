/**
 * ─────────────────────────────────────────────────────────────────────────
 *  PROJECTS — edit this one file to change the showcase.
 * ─────────────────────────────────────────────────────────────────────────
 *  Each entry becomes a floating 3D "slab" the camera flies past, plus a
 *  synced text card in the DOM overlay (title / description / link).
 *
 *  • `kind`  drives the placeholder screenshot that is generated procedurally
 *            (no image files needed) — one of the four UI mockups.
 *  • `image` is optional. Leave it undefined to use the generated placeholder.
 *            To use a real screenshot, drop a file in /public and set e.g.
 *            image: '/projects/my-shot.jpg'  (or import it).
 *  • `hue`   tints only that project's placeholder mockup, for visual variety.
 *            The site-wide accent (theme.ts) is unaffected.
 *
 *  Add or remove items freely — the 3D layout, camera path windows and the
 *  overlay all derive from this array's length.
 */

export type ProjectKind = 'marketing' | 'shop' | 'app' | 'dashboard'

export interface Project {
  id: string
  /** Short category label shown as a pill. */
  category: string
  /** Project title. */
  title: string
  /** One-line description. */
  description: string
  /** Outbound link (opens in a new tab). */
  link: string
  /** Which procedural mockup to draw. */
  kind: ProjectKind
  /** Optional real screenshot path/url. Overrides the generated placeholder. */
  image?: string
  /** Optional per-mockup tint (hex). Purely cosmetic. */
  hue?: string
}

export const projects: Project[] = [
  {
    id: 'aurora',
    category: 'Marketing Site',
    title: 'Aurora Labs',
    description: 'A cinematic brand site with scroll-led storytelling and buttery-smooth motion.',
    link: 'https://example.com/aurora',
    kind: 'marketing',
    hue: '#3b82f6',
  },
  {
    id: 'monogram',
    category: 'Webshop',
    title: 'Monogram Goods',
    description: 'Headless commerce storefront — fast, conversion-tuned and fully responsive.',
    link: 'https://example.com/monogram',
    kind: 'shop',
    hue: '#a855f7',
  },
  {
    id: 'fieldkit',
    category: 'Web App',
    title: 'Fieldkit',
    description: 'A realtime collaboration app with offline-first sync and a delightful UX.',
    link: 'https://example.com/fieldkit',
    kind: 'app',
    hue: '#22d3ee',
  },
  {
    id: 'pulse',
    category: 'Analytics Dashboard',
    title: 'Pulse Metrics',
    description: 'An analytics dashboard turning billions of events into clear, fast insight.',
    link: 'https://example.com/pulse',
    kind: 'dashboard',
    hue: '#f59e0b',
  },
]
