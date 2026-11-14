# Julianne Jin — Portfolio

A static portfolio: an index page with every project as a gallery tile, and one page per project with a sticky project list on the left, images in the middle, and the project's text on the right.

```
index.html            generated — the index page
in-progress.html      generated — "Works in Progress" page (empty for now)
work/<slug>.html      generated — one page per project
style.css             the only stylesheet (edit by hand)
build.py              builds the site from the project.md files
Portfolio/<Project>/  original images + project.md + web/ (web-sized copies)
backup old website/   the previous site, kept as-is
```

Edit the `project.md` files, then run `python3 build.py` (macOS; uses the built-in `sips` and `avconvert`) and open `index.html`. Never edit the generated HTML.

## project.md

### Front matter

```
---
title: Astro
date: 2026
order: 2                      position on the index and in the list (decimals work: 2.5)
slug: astro                   page name: work/astro.html
tags: AR/VR Design · HUD Interface · NASA SUITS
role: VR/AR Designer          optional, shown in the right panel
team: Brown–RISD NASA SUITS   optional, shown in the right panel
status: coming soon           optional; "Coming soon" tile, hover tag, and panel note
cover: web/color-test.jpg     optional; index image (default: the first image)
related: prosthesis, astro    optional; "You might also like" (default: picked by shared tags)
link: https://…               optional, with link_label: Play it live
meta: …                       reference only, not shown
---
```

Tags are split at `·`. They show as a list in the right panel and as the hover label on the index.

### Sections

- `## Description` — 1–2 sentences, shown in the right panel. Optional.
- `## About` — text above the images. `### Heading` starts a block; `- ` lines are bullets; other lines are paragraphs. Put an image beside a block with
  `Image left: nasalogo.png, risdlogo.png` or `Image right: photo.jpg — Caption.` (files in the same folder; PNGs stay PNG so logos keep their transparency).
- `## Images` — numbered, in display order:
  ```
  1. `web/title-screen.jpg` — Caption shown under the image.
     Source: `GameStarterScreen.png`
  ```
  The `Source:` file is the original in the same folder; the build makes the `web/` copy from it (HEIC, PNG, JPG → JPG; `.mov` → `.mp4`). Under an image, add one of these to group it with the image above:
  - `Beside: previous` — side by side at the same height
  - `Grid: previous` — two-column grid of equal cells
  - `Toggle: previous` — stacked, with a switch between them (labels come from the caption before `:`)

  `### Heading` inside Images starts a titled section; a line of text under it (before its first image) is the section's intro.
- `## After` — text below the images, same format as About. A paragraph with `→` is set as a one-line route; a line starting `Note:` is set larger as a closing line.
- `## Notes` — reminders for yourself; not shown on the site.

### Coming soon

With `status: coming soon` a project can have no images; it gets a "Coming soon" block instead. Once you add images, the panel reads "In progress · Coming soon". Delete the line when the case study is finished.

For a new project, make a folder in `Portfolio/`, copy an existing `project.md` as a starting point, and add the originals.
