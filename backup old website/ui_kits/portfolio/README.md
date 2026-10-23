# UI Kit — Portfolio (Julianne Jin)

A click-thru recreation of Julianne Jin's portfolio site (RISD, BFA Art & Computation), extracted from the live codebase in `TA/`. Vanilla JS only — no build step.

## Surfaces covered

| Screen | What it shows |
|---|---|
| **Home** | Folder-tab nav (WORKS / CV / BIO) — continuous trapezoid-tab silhouettes — with a live image-preview panel and flocking-boids canvas behind everything |
| **Project page** | A unified system: one shared chrome + three swappable body layouts (see below) |
| **Resume** | Print-friendly mono CV with orange section heads |
| **404** | Playful terracotta page — "this boid flew off-screen" |

A small fixed bottom-left mini-nav (kit-only) lets you jump between screens.

## Project Page system (the cohesion layer)

Every project page wears the **same chrome** so the portfolio feels like one body of work — back button, eyebrow/index pill (`KIND · 03/06`), Fraunces-italic title, mono caption, circular nav arrows, next-project footer, shared cursor + boids + mode toggle.

Inside that chrome, a case study is an **ordered list of composable section blocks** (`work.sections`). Mix them freely per project:

| Section `type` | What it is |
|---|---|
| `heroBg` | full-bleed image hero + legibility veil + big title |
| `heroSplit` | title + key art side by side |
| `carousel` | 3D image carousel with arrows + caption |
| `slides` | one image at a time + floating glass caption panel |
| `marquee` | rolling tag banner across the page |
| `concept` | large centered serif concept statement |
| `prose` | labelled paragraphs (Purpose / Goal / …) |
| `textImage` | text alongside an image (`flip` to swap sides) |
| `breakdown` | info-at-a-glance grid (key → value) |
| `steps` | numbered "how it was achieved" rows |
| `processGrid` | group of process / detail images |
| `detail` | one large detail image + caption |
| `hoverTerms` | a statement where terms reveal a thumbnail on hover |
| `references` | numbered references list |
| `final` | final display image |

**Three example combos** ship in the kit:
- **Music Boids** — editorial deep-dive: `heroBg → marquee → concept → breakdown → prose → textImage → steps → hoverTerms → processGrid → detail → references → final`
- **Orbit of Desire** — narrative/visual: `heroSplit → concept → textImage → processGrid → textImage(flip) → references → final`
- **Illustration** — gallery-forward: `carousel → marquee → concept → final`

Add a project: push a `WORKS` entry with `id, title, year, kind, img, deck` and a `sections` array. New section types live in `cs-sections.js` (`window.CSX`).

## Motion

- **First load** — a dark intro panel with the name lifts away to reveal the home page (`transitions.js → PX.intro`).
- **Between pages** — a wipe panel sweeps up on every navigation (`PX.wipe`); overlay cleanup is timeout-driven so a throttled tab can never leave a panel stuck.
- **Scroll reveals** — sections fade-up as they enter the viewport (IntersectionObserver, with a reveal-all safety fallback).
- Respects `prefers-reduced-motion` (transitions skipped).

## Files

- `index.html` — entry. Loads everything below.
- `kit.css` — global kit chrome (cursor, boids canvas, mode toggle, credit, status bar).
- `landing.css` — folder-stack nav (SVG trapezoid tabs) + preview panel.
- `case-study.css` — shared project-page chrome + hero / carousel / slides.
- `cs-sections.css` — section library, transitions, scroll-reveal styles.
- `components.js` — vanilla-JS factories (`makeFolder`, `topicItem`, `cvSection`, `pillBtn`, cursor, status bar, mode toggle).
- `cs-sections.js` — section renderers (`window.CSX`).
- `case-study.js` — assembler: chrome + section loop + interactive carousel/slides + reveal observer (`window.CS`).
- `transitions.js` — `window.PX.intro` / `window.PX.wipe`.
- `boids-runtime.js` — flocking simulation behind the page.
- `app.js` — WORKS data + screen routing.
- `assets/` — project images (self-contained copy so the kit is portable).

## Interactions to try

- Hover a work in WORKS → preview image fades into the right panel.
- Click WORKS / CV / BIO tabs → folder body expands (grid-row 0fr → 1fr).
- Click a work → opens the case study; click the back-arrow circle to return.
- Click the day/night toggle (top-right) → palette inverts.
- Move your cursor near boids → they scatter.

## Caveats

- **The detail page** is a representative case study — the live `music-boids` page has bespoke connecting lines between cards that I read for tokens but did not re-implement.
- **Forms / actual links** are stubbed (`alert()`).
- **The boids count** is reduced from ~180 to 60 per flock for kit performance — bump in `boids-runtime.js`.
