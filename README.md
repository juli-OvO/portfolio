# Julianne Jin — Portfolio Design System

A design system extracted from Julianne Jin's personal portfolio site (RISD, BFA Art & Computation). This is a **live-codebase-first** system — tokens, components, and motifs were lifted directly from the attached codebase (`TA/`), not invented. The portfolio is an interactive, mono-forward, warm-earthy-toned site with folder-tab navigation, a flocking-boids background, and a custom cursor.

## Source

- **Attached codebase:** `TA/` (HTML + CSS + vanilla JS)
  - `TA/index.html` — landing (folder-tab nav + boids background + preview panel)
  - `TA/css/style.css` — global styles, cursor, music-boids case study
  - `TA/css/landing.css` — landing layout tokens (folder stack, CV/BIO wipe panels)
  - `TA/js/{boids,cursor,main,loader,intro}.js` — interaction
  - `TA/pages/` — project case-study pages (music-boids, orbit-of-desire, drawing, illustration, blender, archive)
- **References for vibe (user-provided):** sutera.ch, heyefi.com

---

## Products

Single product: the portfolio website. Surfaces covered in UI kit:

1. **Homepage / Landing** — left folder-tab nav (Works / CV / BIO) + right image-preview panel over boids canvas
2. **Project case study** — hero with big serif title + mono body, scroll-triggered panel grid (patterned after `music-boids`)
3. **Resume / CV** — print-friendly, two-column, mono-typeset
4. **404 / fun page** — playful warm-tone error page with boids callback

---

## Content Fundamentals

**Voice.** Third-person in bio, first-person in working notes. Quiet, declarative, no marketing language. Julianne "builds systems where algorithmic logic meets human imagination" — describing work by what it *does*, not by hype. No emoji. No exclamation points.

**Casing.** `WORKS`, `CV`, `BIO`, `EDUCATION`, `SKILLS` — all-caps for section tabs/headings only, always in Inconsolata mono with tight letter-spacing. Body copy and nav items are sentence case (`Music Boids`, `Orbit of Desire`).

**Examples pulled from the site:**
- Title: *"Julianne Jin is a visual artist and designer studying Art and Computation at the Rhode Island School of Design."*
- Work tags (mono, pipe-prefixed):  `| Spatial-to-Sound Mapping`, `| Generative Audio`, `| Event-Driven Architecture`
- Footer: `"More works in progress..."`
- Site credit: `"This website was concepted, designed, and coded by Julianne Jin."` — self-contained, no call to action.
- Mode toggle tooltip: `"MODE: day time"` / `"MODE: night time"` — labels feel like system readouts, not commands.

**Dates + meta as fixtures.** Status bar constantly prints `[ Apr 18, 2026  3:42:15 PM ]   [ 1440 × 900 ]`. Treated as furniture, not content. Carries the "lab instrument" vibe.

**Pipe motif.** Work tags and meta readouts prefix with `|` — a mono-native bullet that reads as code/terminal, not decoration.

---

## Visual Foundations

### Color

Warm, earthy, paper-over-orange. Entire palette is extracted hsl() values from the live stylesheets.

- **Folder tones** (layered manila-folder metaphor, increasing saturation as you descend):
  - WORKS: `hsl(30, 55%, 93%)` — lightest cream
  - CV:    `hsl(28, 58%, 82%)` — mid tan
  - BIO:   `hsl(25, 62%, 68%)` — deepest terracotta
- **Primary orange:** `#f28d2b` (CV headings, accent) / `#f59453` (letter-swap hover)
- **Ink:** `#000` on paper, `#fff` on black for night mode
- **Secondary text:** `#666` (day) / `#999` (night)
- **Cursor:** `rgba(0, 213, 255, 0.697)` cyan blob with `mix-blend-mode: difference` — inverts over anything
- **Boid hues:** hsl 0–60, 85% sat, ~55% light (orange / coral / yellow band)

### Type

**Primary:** `Inconsolata` (Google Fonts, wght 200–900). EVERYTHING mono — name, nav, body, labels. This is non-negotiable; the site's identity hangs on mono discipline.
**Secondary (case-study hero only):** `Fraunces` — italic serif for the giant hero titles (`boid-hero__title`, clamp 42→96px).
**Tertiary (case-study body only):** `Space Grotesk` — body copy inside project detail pages.

Tight tracking on all-caps (`.12em` labels, `.14em` folder tabs). Letter-swap interaction: characters slide up on hover, replaced by an orange `#f59453` duplicate (see `.letter-swap` in style.css).

### Spacing

4px base. Layout uses `clamp()` aggressively for fluid scaling across 768 → 4K. Key tokens:
- Nav width: `clamp(260px, 24vw, 420px)`
- Folder tab height: fixed `50px`
- Folder min-height: `clamp(65px, 8vh, 106px)`
- Section padding: `clamp(40px, 6vh, 90px) clamp(36px, 5vw, 100px)`

### Backgrounds

- **Landing:** animated boids canvas (`#boids`, z-index -1), 3 flocks of ~60 agents, circle-outlines only, wrap at edges, mouse-repulse within 70px.
- **Case studies:** static photograph (`boid.png`) with warm white gradient overlay `linear-gradient(120deg, rgba(255,255,255,0.82), rgba(255,255,255,0.58), rgba(255,255,255,0.36))`.
- **Panels (CV/BIO):** solid `#fff` sliding in from the nav edge, wiping right.

No gradients as decoration. No repeating patterns. No grain/noise.

### Animation

- **Easing library:** three curves in heavy rotation.
  - `cubic-bezier(0.2, 0.8, 0.2, 1)` — calm default (mode toggle, night-mode)
  - `cubic-bezier(0.16, 1, 0.3, 1)` — quintic (panel wipes, scroll cards)
  - `cubic-bezier(0.175, 0.885, 0.32, 1.275)` — slight overshoot (letter swap)
- **Durations:** 200ms (fast), 300ms (base), 600–700ms (panel/letter), 1200ms (hero entry).
- **Signature moves:**
  - Folder body grid-template-rows 0fr → 1fr (600ms) on hover — "opening a folder"
  - Letter-swap hover: each char slides up with per-index delay `0.03s * var(--i)`
  - Preview image tilts in 3D based on cursor position in right panel (max ±10°, lerp 0.07)
  - CV/BIO panels wipe left→right from the nav edge (550ms width + 420ms left)
- **Scroll reveals:** panel cards `translateY(40px) scale(0.96)` → `0,1`, 800ms staggered by `--panel-delay`.

### Hover & Press

- **Topic items:** scale(1.2) + color → `#f59453` + letter animation (see above)
- **Contact buttons (pills):** `opacity: 0.5` on hover (no color change — just fade)
- **Folder:** grid-row expansion, body-inner min-height from 0 → `clamp(300px, 45vh, 400px)`
- **Image cards (case study):** `translateY(-4px)` + `shadow 0 12px 40px rgba(0,0,0,0.5)` + boid-image gets `filter: grayscale(1) brightness(1.35) contrast(0.9)` + caption fade-in

### Borders

Fat, unambiguous. `2px solid #000` is the workhorse — nav edges, contact buttons, folder tab strokes, mode toggle. `3px` at 4K breakpoint. In night mode all black borders switch to `#fff`. **Never** colored borders except for the tabbed SVG fill.

### Shadows

Restrained. Only used on the music-boids detail panels:
- Card hover: `0 12px 40px rgba(0, 0, 0, 0.5)` (dark bg, so heavy shadow reads)
- Sticky link: `0 4px 16px rgba(0, 0, 0, 0.25)` → `0 6px 24px rgba(0, 0, 0, 0.35)` on hover

Landing page has **no shadows at all**. Depth comes from the folder-overlap metaphor and z-ordering.

### Transparency & Blur

Minimal. `backdrop-filter: blur(6px)` only on the circular back button (`.boid-back`) against photo backgrounds. Right panel of landing is fully transparent — the boids canvas shows through.

### Corner Radii

Square by default (`--radius-0: 0`). Exceptions:
- **Pill:** `50%` for cursor dot, mode-toggle icon dot, circular back buttons
- **4px:** only the panel cards in the music-boids case study grid
The square-edged discipline is a design *statement* — matches the terminal/lab-readout tone.

### Layout rules

- **Fixed chrome:** mode toggle top-right 18px, site credit bottom-right 10px, boid-back top-left on case studies. All `position: fixed`, high z-index.
- **Landing split:** opaque nav-width strip on left, full-bleed boid canvas on right.
- **Case study:** centered content column, max 600–1200px, full-bleed dark "details" sections break out of the column.

### Imagery vibe

Warm-toned personal/studio photography. The boid background photo is desaturated-ish warm; illustration pages show painterly digital work; drawing pages are scanned charcoal/graphite. **Not** stock, **not** 3D-cool-blue. When in doubt: warmer, softer, slightly washed.

### Cards

Present only on case-study grids. Thin border `1px solid rgba(255,255,255,0.08)`, radius `4px`, subtle bg `rgba(255,255,255,0.03)` (they live on dark sections). Hover lifts 4px with heavy shadow.

---

## Iconography

**Approach: near-zero icons.** The system relies on typography and geometric primitives instead of iconography. This is deliberate — it reinforces the mono-lab feel and avoids visual noise.

Specifically:
- **No icon font** is used. No Font Awesome, no Material, no Lucide.
- **No SVG icon set.** The only SVG in the codebase is the folder-tab trapezoid polygon (drawn inline).
- **No emoji.**
- **Unicode as iconography.** When an "icon" is needed, a single typographic glyph stands in:
  - `↗` — external link (case-study hero titles)
  - `→` — "hover to read CV →"
  - `›` — bullet for CV experience lines (`.cvp-bullet`)
  - `|` — bullet for work tags
  - Rotated CSS triangle (`border-left + border-bottom + rotate(45deg)`) — back arrow
- **Geometric CSS shapes** — mode toggle is a 18×18 circle with a black dot that slides inside (sun → moon metaphor). Pure CSS.

**If you need an icon that isn't already in the system**: substitute a Unicode character first. If you must use an SVG, draw it inline with `stroke: currentColor` and keep it to 1–2px strokes matching the site's 2px border language. **Do not** introduce Lucide/Heroicons — they'd clash with the hand-drawn, mono-typographic tone.

### Assets copied into this system
- `assets/boid.png` — boid background reference (case studies)
- `assets/orbit-title.png`, `assets/orbit-uba-lab.png` — Orbit of Desire game art
- `assets/drawing-class-1.jpeg`, `assets/drawing-class-2.jpeg` — charcoal class drawings
- `assets/illustration-{1-preview, 2, 3}.{jpg,png}` — digital illustration work
- `assets/blender-scene5.png`, `assets/blender-prison.png` — 3D modeling stills
- `assets/hellorsell.png` — Hell or Sell game mock
- `assets/boids.js` — the actual flocking simulation source (works standalone)

---

## File Index (root of this project)

| File | Purpose |
|---|---|
| `README.md` | You are here. |
| `SKILL.md` | Agent-skill manifest (Claude Code compatible). |
| `colors_and_type.css` | All CSS custom properties + base element styles. Import this first. |
| `assets/` | Logos, project images, boids.js runtime. |
| `preview/` | Cards for the Design System tab (tokens, type, components). |
| `ui_kits/portfolio/` | Hi-fi React recreation of the live site's core screens. |
| `ui_kits/portfolio/index.html` | Interactive click-thru of Home / Case study / Resume / 404. |

UI kits:
- `ui_kits/portfolio/` — the single product. See its own README.

---

## Caveats

- **No custom font files attached** — Inconsolata, Fraunces, and Space Grotesk are loaded from Google Fonts (same as the live site does). If the user has a specific licensed variant, drop a `.woff2` in `fonts/` and update the `@font-face` in `colors_and_type.css`.
- **Two binary copies failed** at attachment-read time: `boidpreview.gif` and `illustration/1.png`. Re-drop them into the project if animated previews are needed.
- **The `music-boids` detail page** has a very elaborate bespoke layout (cross-connecting lines between images) — it was *read* for token extraction but not re-implemented as a reusable component. Ask if you want it componentized.
