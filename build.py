#!/usr/bin/env python3
"""Build the portfolio site from Portfolio/*/project.md.

    python3 build.py

For every project folder it:
  1. makes web-sized copies of the listed images in <folder>/web/ (macOS `sips`
     for images, `avconvert` for video), skipping ones that are already up to date
  2. writes index.html and work/<slug>.html

Edit the project.md files, not the generated HTML.
"""
import html
import re
import subprocess
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "Portfolio"
OUT_WORK = ROOT / "work"

NAME = "Julianne Jin"
INTRO = ("Julianne Jin is a visual artist and designer studying Art and Computation "
         "at the Rhode Island School of Design.")
BIO = ("Visual artist and designer studying Art and Computation "
       "at the Rhode Island School of Design.")
EMAIL = "jjin04@risd.edu"
LINKEDIN = "https://www.linkedin.com/in/chufan-jin-41b727311/"
CV = "Portfolio/JulianneResume.pdf"

WEB_MAX = 1800        # longest edge, px
WEB_QUALITY = "82"    # jpeg quality

IMAGE_LINE = re.compile(r"^\d+\.\s+`([^`]+)`\s+[—-]\s+(.+)$")
SOURCE_LINE = re.compile(r"^\s+Source:\s+`([^`]+)`")


# ---------- parsing ----------

def parse_project(md_path):
    text = md_path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        raise SystemExit(f"{md_path}: missing --- front matter ---")
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()

    sections, current = {}, None
    for line in m.group(2).splitlines():
        h = re.match(r"^##\s+(.+)$", line)
        if h:
            current = h.group(1).strip().lower()
            sections[current] = []
        elif current:
            sections[current].append(line)

    description = " ".join(l.strip() for l in sections.get("description", []) if l.strip())

    images = []
    for line in sections.get("images", []):
        im = IMAGE_LINE.match(line)
        if im:
            images.append({"web": im.group(1), "caption": im.group(2).strip(), "source": None})
            continue
        sm = SOURCE_LINE.match(line)
        if sm and images:
            images[-1]["source"] = sm.group(1)

    for key in ("title", "date", "slug"):
        if not meta.get(key):
            raise SystemExit(f"{md_path}: front matter needs '{key}:'")
    if not images:
        raise SystemExit(f"{md_path}: no images listed under '## Images'")

    return {**meta, "order": int(meta.get("order", 999)), "dir": md_path.parent,
            "description": description, "images": images}


# ---------- images ----------

def make_web_copy(folder, img):
    web = folder / img["web"]
    src = folder / img["source"] if img["source"] else None
    if src is None or not src.exists():
        if not web.exists():
            print(f"  ! missing: {web.relative_to(ROOT)} (and no source to make it from)")
        return
    if web.exists() and web.stat().st_mtime >= src.stat().st_mtime:
        return
    web.parent.mkdir(parents=True, exist_ok=True)
    print(f"  making {web.relative_to(ROOT)}")
    if web.suffix.lower() == ".mp4":
        subprocess.run(["avconvert", "--preset", "Preset640x480", "--replace",
                        "--source", str(src), "--output", str(web)],
                       check=True, capture_output=True)
    else:
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", WEB_QUALITY,
                        "-Z", str(WEB_MAX), str(src), "--out", str(web)],
                       check=True, capture_output=True)


def image_size(path):
    if path.suffix.lower() not in (".jpg", ".jpeg", ".png") or not path.exists():
        return None
    out = subprocess.run(["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
                         capture_output=True, text=True).stdout
    w = re.search(r"pixelWidth: (\d+)", out)
    h = re.search(r"pixelHeight: (\d+)", out)
    return (w.group(1), h.group(1)) if w and h else None


# ---------- html ----------

esc = html.escape


def url(path, prefix=""):
    return prefix + quote(path.relative_to(ROOT).as_posix())


def media(p, img, prefix, alt, lazy=True):
    path = p["dir"] / img["web"]
    src = url(path, prefix)
    if path.suffix.lower() == ".mp4":
        return (f'<video src="{src}" controls muted loop playsinline preload="metadata" '
                f'aria-label="{esc(alt)}"></video>')
    size = image_size(path)
    dims = f' width="{size[0]}" height="{size[1]}"' if size else ""
    load = ' loading="lazy"' if lazy else ""
    return f'<img src="{src}" alt="{esc(alt)}"{dims}{load}>'


FONTS = ("https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500"
         "&family=Inter+Tight:wght@400;500&display=swap")


def page(title, body, prefix="", description=INTRO):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{esc(FONTS)}">
<link rel="stylesheet" href="{prefix}style.css">
</head>
<body>
{body}
</body>
</html>
"""


def num(i):
    return f"{i + 1:02d}"


def sidebar(projects, prefix="", active=None):
    """Left column: name, bio, numbered project list, contact links."""
    rows = []
    for i, p in enumerate(projects):
        cur = ' aria-current="page"' if p is active else ""
        rows.append(f'      <li><a href="{prefix}work/{p["slug"]}.html"{cur}>'
                    f'<span class="n">{num(i)}</span>'
                    f'<span class="t">{esc(p["title"])}</span>'
                    f'<span class="y">{esc(p["date"])}</span></a></li>')
    return f"""<aside class="side">
  <div class="id">
    <a class="name" href="{prefix}index.html">{NAME}</a>
    <p>{esc(BIO)}</p>
  </div>
  <nav aria-label="Projects">
    <h2 class="label">Work</h2>
    <ol class="list">
{chr(10).join(rows)}
    </ol>
  </nav>
  <p class="links">
    <a href="mailto:{EMAIL}">Email</a>
    <a href="{LINKEDIN}">LinkedIn</a>
    <a href="{prefix}{CV}">CV</a>
  </p>
</aside>"""


def cover(p):
    """Index cover: front matter `cover:` if set, else the first listed image that isn't a video."""
    if p.get("cover"):
        for img in p["images"]:
            if img["web"] == p["cover"]:
                return img
    for img in p["images"]:
        if not img["web"].lower().endswith(".mp4"):
            return img
    return p["images"][0]


def build_index(projects):
    tiles = []
    for i, p in enumerate(projects):
        tiles.append(f"""    <a class="tile" href="work/{p['slug']}.html">
      {media(p, cover(p), '', p['title'], lazy=i > 2)}
      <span class="cap"><span>{num(i)}&ensp;{esc(p['title'])}</span><span>{esc(p['date'])}</span></span>
    </a>""")
    body = f"""<div class="layout index">
{sidebar(projects)}
<main class="gallery">
  <div class="grid">
{chr(10).join(tiles)}
  </div>
</main>
</div>"""
    (ROOT / "index.html").write_text(page(NAME, body), encoding="utf-8")


def build_project(projects, i):
    p = projects[i]
    n = len(projects)
    prev_p, next_p = projects[i - 1], projects[(i + 1) % n]

    figs = []
    for j, img in enumerate(p["images"]):
        figs.append(f"""  <figure>
    {media(p, img, '../', img['caption'], lazy=j > 0)}
    <figcaption><span class="n">{num(j)}</span>{esc(img['caption'])}</figcaption>
  </figure>""")

    desc = f'\n  <p class="desc">{esc(p["description"])}</p>' if p["description"] else ""
    meta = f'\n  <p class="meta">{esc(p["meta"])}</p>' if p.get("meta") else ""
    link = (f'\n  <p><a class="ext" href="{esc(p["link"])}">{esc(p.get("link_label") or "Visit")} ↗</a></p>'
            if p.get("link") else "")
    body = f"""<div class="layout project">
{sidebar(projects, '../', active=p)}
<main class="gallery">
{chr(10).join(figs)}
</main>
<section class="info" aria-label="About this project">
  <p class="count">{num(i)} / {n:02d}</p>
  <h1>{esc(p['title'])}</h1>
  <p class="date">{esc(p['date'])}</p>{desc}{meta}{link}
  <nav class="pager" aria-label="More projects">
    <a href="{prev_p['slug']}.html">← {esc(prev_p['title'])}</a>
    <a href="{next_p['slug']}.html">{esc(next_p['title'])} →</a>
  </nav>
  <a class="all" href="../index.html">All work</a>
</section>
</div>"""
    OUT_WORK.mkdir(exist_ok=True)
    (OUT_WORK / f"{p['slug']}.html").write_text(
        page(f"{p['title']} — {NAME}", body, "../", p["description"] or INTRO), encoding="utf-8")


def main():
    projects = sorted((parse_project(md) for md in SRC.glob("*/project.md")),
                      key=lambda p: p["order"])
    for p in projects:
        print(f"{p['title']} ({p['dir'].name})")
        for img in p["images"]:
            make_web_copy(p["dir"], img)

    build_index(projects)
    for i in range(len(projects)):
        build_project(projects, i)

    # drop pages for projects that were removed
    live = {f"{p['slug']}.html" for p in projects}
    for old in OUT_WORK.glob("*.html"):
        if old.name not in live:
            old.unlink()
    print(f"Built index.html + {len(projects)} project pages.")


if __name__ == "__main__":
    main()
