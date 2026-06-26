# Scroll-driven 3D Laptop Landing

A single-page, scroll-driven WebGL experience for a web & software studio. The
page opens on a 3D laptop floating in dark space; as you scroll the lid opens,
the screen ignites, the camera pushes **through** the screen, and you fly past a
sequence of floating project "slabs" before settling on a final call-to-action.

Built with **Vite + React + TypeScript**, **three.js**, **@react-three/fiber**,
**@react-three/drei**, **@react-three/postprocessing** and **GSAP**. It ships
with placeholder branding and procedurally-drawn project screenshots, so the
whole experience works on first load — swap in your own content afterwards.

---

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

Other scripts:

```bash
npm run build     # type-check + production build to /dist
npm run preview   # serve the production build locally
npm run typecheck # types only
```

> Requires a modern, WebGL-capable browser. If WebGL is unavailable the page
> shows a graceful fallback instead of a blank screen.

---

## Make it yours — the 3 things you'll want to change

Everything brand-related lives in two files.

### 1. Accent color

`src/theme.ts` → `accent` (and keep `accentRgb` in sync — it's the same color as
`r, g, b` for soft glows). It's the **single** accent used everywhere: the
laptop screen, the panel frames, the bloom glow, buttons and the grid.

```ts
accent: '#3b82f6',      // ← change me (electric-blue placeholder)
accentRgb: '59, 130, 246',
```

### 2. Studio name & copy

`src/theme.ts` → `studioName`, `headline`, `kicker`, `ctaTitle`, `ctaButton`,
`contactEmail`, `contactLocation`. These flow into the loader, the laptop
screen, the overlay and the outro CTA.

### 3. The projects

`src/data/projects.ts` — one array drives the 3D slabs, the camera fly-through
windows and the overlay text. Each entry:

```ts
{
  id: 'aurora',
  category: 'Marketing Site',
  title: 'Aurora Labs',
  description: 'One-line description.',
  link: 'https://…',
  kind: 'marketing',   // 'marketing' | 'shop' | 'app' | 'dashboard'
  hue: '#3b82f6',      // optional: tints only this card's mockup
  // image: '/projects/real-shot.jpg',  // optional: real screenshot
}
```

- Leave `image` out to use the **procedurally-drawn placeholder** for that
  `kind` (no asset files needed).
- To use a **real screenshot**, drop the file in `/public` (e.g.
  `public/projects/aurora.jpg`) and set `image: '/projects/aurora.jpg'`.
- Add or remove projects freely — the layout, camera path and overlay all
  derive from the array's length.

---

## How it's structured

```
src/
  theme.ts                 Accent color, studio name, copy  ← brand here
  data/projects.ts         The project list                 ← content here
  App.tsx                  Canvas + preloader + error boundary
  lib/
    sequence.ts            The scroll "script": phases, camera keyframes,
                           panel layout, overlay cross-fade windows
    tier.ts                Device/perf tier (mobile / reduced-motion / desktop)
    textures.ts            Procedural canvas mockups + laptop screen + sprites
    math.ts                lerp / smoothstep / envelope helpers
    appState.ts            Loader ↔ scene "ready" signal
  components/
    Scene.tsx              Assembles the 3D world + lights + environment
    Laptop.tsx             Hero laptop from primitives (openAmount prop)
    Projects.tsx           Maps projects → ProjectPanel
    ProjectPanel.tsx       One floating slab (image + accent frame + glow)
    Particles.tsx          Drifting particle field
    Rig.tsx                Camera driven by the scroll offset
    Effects.tsx            Bloom / CA / DoF / vignette / film grain
    Overlay.tsx            Crisp DOM copy over the canvas, cross-faded to scroll
    Preloader.tsx          Progress ring + shader warm-up gate
    Warmup.tsx             Pre-compiles shaders, signals "ready"
    Outro.tsx              CTA backdrop (halo + grid)
    ErrorBoundary.tsx      WebGL fallback
```

### The scroll story (offset 0 → 1)

| Range       | Scene                                                        |
| ----------- | ----------------------------------------------------------- |
| 0.00 – 0.10 | Intro — closed laptop, idle float, headline                 |
| 0.10 – 0.30 | Open — lid opens, screen ignites, camera dollies in         |
| 0.30 – 0.40 | Enter — camera pushes through the screen, laptop fades       |
| 0.40 – 0.90 | Projects — fly past the floating slabs, one at a time        |
| 0.90 – 1.00 | Outro — settle on the CTA                                    |

All of this is timed in `src/lib/sequence.ts`. To re-time the film, edit the
`PHASE` boundaries, the `CAM_KEYS` keyframes and the overlay `*_WINDOW`s there.

---

## Performance & accessibility

- **One scroll system** (drei `ScrollControls` + `useScroll`) — no competing
  smooth-scroll libraries, so nothing fights for the wheel. The camera reads the
  scroll offset directly; the DOM overlay reads that same offset (published once
  per frame to a tiny shared store) and renders as a fixed layer over the canvas
  so the copy stays crisp and pin-accurate while cross-fading.
- **Tiers** (`src/lib/tier.ts`): desktop gets the full post-processing stack;
  mobile drops depth-of-field / grain, trims particles and caps DPR; a simpler,
  lighter path runs on small screens so it never janks on a phone.
- **`prefers-reduced-motion`**: auto-motion (idle float, sway, particle drift)
  is disabled, scroll damping is removed for a stepped feel, and heavy
  post-processing collapses to a single vignette.
- **Preloader** eases in while shaders **pre-compile** (`<Preload all />` +
  `gl.compile`) so the first scroll doesn't stutter, with an 8s safety timeout.
- Three.js is code-split into its own chunk for a fast initial shell.

---

## The laptop model

`Laptop.tsx` loads a real GLB (`src/components/source/laptop.glb`) with a baked
open/close animation clip, which it **scrubs** from `openAmount` (0 = closed,
1 = open). The lid node is `Cube001`; the studio screen is an emissive plane
parented to the lid (the model's own material is a single texture, so the
glowing "fly-through" screen is recreated this way). The ignite / camera path /
fade-through are unchanged.

To fit a different model, tune the constants at the top of `Laptop.tsx`:
`MODEL_SCALE`, `MODEL_ROT_Y`, `MODEL_POS`, and the `SCREEN_*` placement; flip
`(1 - open)` → `open` in the clip scrub if it opens the wrong way.

### Credit

3D model: **"Low Poly Modern Laptop (with closing animation)"** via Sketchfab,
licensed **CC BY 4.0**. You must keep attribution to the original author — add
their name and the model URL here (and ideally a small credit in the site
footer) before publishing.
