# Julianne Jin — Portfolio

A simple static portfolio: one index page listing each work (title, date, image, short description) and one page per project.

```
index.html            generated — the index page
work/<slug>.html      generated — one page per project
style.css             the only stylesheet (edit by hand)
build.py              builds the site from the project.md files
Portfolio/<Project>/  original images + project.md + web/ (web-sized copies)
backup old website/   the previous site, kept as-is
```

## Adding or editing a project

1. Put the original images in the project's folder, e.g. `Portfolio/HellOrSell/`.
2. Edit that folder's `project.md`:
   - front matter: `title`, `date`, `order` (position on the index), `slug` (page name), optional `meta`, `link`, `link_label`, `cover` (which image shows on the index; defaults to the first)
   - `## Description` — keep it to 1–2 sentences
   - `## Images` — one numbered line per image, in display order (the first one is the cover):
     ```
     1. `web/title-screen.jpg` — Caption shown under the image.
        Source: `GameStarterScreen.png`
     ```
     The `Source:` file is the original in the same folder; the build makes the `web/` copy from it (HEIC, PNG, JPG → JPG; `.mov` → `.mp4`).
   - `## Notes` — anything you want to remember; not shown on the site.
3. Run `python3 build.py` (macOS; uses the built-in `sips` and `avconvert`).
4. Open `index.html` in a browser.

For a new project, copy an existing folder's `project.md` as a starting point.
