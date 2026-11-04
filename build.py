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
# join the image above:  Beside = same row,  Grid = two-column grid,  Toggle = stacked, switched by a button
JOIN_LINE = re.compile(r"^\s+(Beside|Grid|Toggle):\s+previous\s*$", re.I)
GROUP_LINE = re.compile(r"^###\s+(.+)$")


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

    # `### Heading` inside Images starts a section; plain text right under it is its description
    images, groups = [], []
    for line in sections.get("images", []):
        g = GROUP_LINE.match(line)
        if g:
            groups.append({"title": g.group(1).strip(), "text": []})
            continue
        im = IMAGE_LINE.match(line)
        if im:
            images.append({"web": im.group(1), "caption": im.group(2).strip(), "source": None,
                           "group": len(groups) - 1})
            continue
        if groups and line.strip() and not line[0].isspace() and \
                (not images or images[-1]["group"] != len(groups) - 1):
            groups[-1]["text"].append(line.strip())
            continue
        sm = SOURCE_LINE.match(line)
        if sm and images:
            images[-1]["source"] = sm.group(1)
        elif JOIN_LINE.match(line) and len(images) > 1:
            images[-1]["join"] = JOIN_LINE.match(line).group(1).lower()

    for key in ("title", "date", "slug"):
        if not meta.get(key):
            raise SystemExit(f"{md_path}: front matter needs '{key}:'")
    if not images:
        raise SystemExit(f"{md_path}: no images listed under '## Images'")

    return {**meta, "order": int(meta.get("order", 999)), "dir": md_path.parent,
            "description": description, "images": images,
            "groups": [{"title": g["title"], "text": " ".join(g["text"])} for g in groups]}


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
{TAG_SCRIPT}
</body>
</html>
"""


def num(i):
    return f"{i + 1:02d}"


def tag_span(p):
    return f'<span class="tag" aria-hidden="true">{esc(p["tags"])}</span>' if p.get("tags") else ""


def sidebar(projects, prefix="", active=None):
    """Left column: name, bio, numbered project list, contact links."""
    rows = []
    for i, p in enumerate(projects):
        cur = ' aria-current="page"' if p is active else ""
        rows.append(f'      <li><a href="{prefix}work/{p["slug"]}.html"{cur}>'
                    f'<span class="n">{num(i)}</span>'
                    f'<span class="t">{esc(p["title"])}</span>'
                    f'<span class="y">{esc(p["date"])}</span>{tag_span(p)}</a></li>')
    return f"""<aside class="side">
  <div class="id">
    <a class="name" href="{prefix}index.html">{NAME}</a>
    <p>{esc(BIO)}</p>
  </div>
  <nav aria-label="Projects">
    <a class="overview" href="{prefix}index.html"{'' if active else ' aria-current="page"'}>Overview</a>
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


# Every page: a hovered tile's or sidebar row's tag follows the pointer and stands in for the cursor.
# Tile tags sit inside the image; sidebar tags are fixed to the window so the sidebar can't clip them.
TAG_SCRIPT = """<script>
document.documentElement.classList.add("js");
const follow = (host, fixed) => {
  const tag = host.querySelector(".tag");
  if (!tag) return;
  host.addEventListener("pointermove", e => {
    const box = fixed ? { left: 0, top: 0 } : host.getBoundingClientRect();
    let x = e.clientX - box.left, y = e.clientY - box.top;
    // flip to the left of the pointer near the right edge of the window
    if (e.clientX + tag.offsetWidth > window.innerWidth - 12) x -= tag.offsetWidth;
    tag.style.transform = `translate(${x}px, ${y}px)`;
  });
};
document.querySelectorAll(".tile .pic").forEach(el => follow(el, false));
document.querySelectorAll(".list a").forEach(el => follow(el, true));
</script>"""


def build_index(projects):
    tiles = []
    for i, p in enumerate(projects):
        tag = tag_span(p)
        tiles.append(f"""    <a class="tile" href="work/{p['slug']}.html">
      <span class="pic">{media(p, cover(p), '', p['title'], lazy=i > 2)}{tag}</span>
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


# Project pages: clicking the switch (or the image) shows the next stacked layer.
TOGGLE_SCRIPT = """<script>
document.querySelectorAll(".toggle").forEach(fig => {
  const parts = [".stack > *", ".tcap", ".switch > span"].map(s => fig.querySelectorAll(s));
  let k = 0;
  const next = () => {
    k = (k + 1) % parts[0].length;
    parts.forEach(list => list.forEach((el, x) => el.classList.toggle("on", x === k)));
  };
  fig.querySelector(".switch").addEventListener("click", next);
  fig.querySelector(".stack").addEventListener("click", next);
});
</script>"""


def build_project(projects, i):
    p = projects[i]
    n = len(projects)
    prev_p, next_p = projects[i - 1], projects[(i + 1) % n]

    # group images into blocks: an image marked `Beside/Grid/Toggle: previous` joins the block above
    blocks = []
    for j, img in enumerate(p["images"]):
        join = img.get("join")
        if join and blocks and blocks[-1]["items"][-1][1]["group"] == img["group"]:
            blocks[-1]["kind"] = join
            blocks[-1]["items"].append((j, img))
        else:
            blocks.append({"kind": "single", "items": [(j, img)]})

    def ratio(img):
        size = image_size(p["dir"] / img["web"])
        return int(size[0]) / int(size[1]) if size else 1

    def fig(j, img, attrs="", pad="  "):
        return f"""{pad}<figure{attrs}>
{pad}  {media(p, img, '../', img['caption'], lazy=j > 0)}
{pad}  <figcaption><span class="n">{num(j)}</span>{esc(img['caption'])}</figcaption>
{pad}</figure>"""

    figs, group = [], -1
    for block in blocks:
        row, kind = block["items"], block["kind"]
        g = row[0][1]["group"]
        if g != group and g >= 0:
            # close the previous section, open this one
            if group >= 0:
                figs.append("  </section>")
            sec = p["groups"][g]
            text = f'\n    <p class="lede">{esc(sec["text"])}</p>' if sec["text"] else ""
            figs.append(f'  <section class="set">\n    <h2 class="label">{esc(sec["title"])}</h2>{text}')
            group = g
        ratios = [ratio(img) for _, img in row]
        if kind == "single":
            figs.append(fig(*row[0]))
        elif kind == "beside":
            # side by side at a shared height: each figure's share of the width follows its aspect ratio
            cells = [fig(j, img, f' style="flex: {r:.3f}"', "    ") for (j, img), r in zip(row, ratios)]
            figs.append(f'  <div class="row" style="--ar: {sum(ratios):.3f}; --n: {len(row)}">\n'
                        + "\n".join(cells) + "\n  </div>")
        elif kind == "grid":
            # two columns of equal cells, cropped to the images' average shape
            cells = [fig(j, img, "", "    ") for j, img in row]
            figs.append(f'  <div class="pairs" style="--cell: {sum(ratios) / len(ratios):.3f}">\n'
                        + "\n".join(cells) + "\n  </div>")
        else:
            # toggle: images stacked, a button cross-dissolves between them.
            # Button labels come from the caption text before ":" ("On: ..." -> "On").
            layers = "\n".join(f"      {media(p, img, '../', img['caption'], lazy=j > 0)}" for j, img in row)
            caps = "".join(f'<span class="tcap{" on" if x == 0 else ""}"><span class="n">{num(j)}</span>'
                           f'{esc(img["caption"])}</span>' for x, (j, img) in enumerate(row))
            labels = "".join(f'<span{" class=on" if x == 0 else ""}>'
                             f'{esc(img["caption"].split(":")[0] if ":" in img["caption"] else num(j))}</span>'
                             for x, (j, img) in enumerate(row))
            figs.append(f"""  <figure class="toggle">
    <div class="tbody">
      <div class="stack">
  {layers}
      </div>
      <button type="button" class="switch" aria-label="Switch view">{labels}</button>
    </div>
    <figcaption>{caps}</figcaption>
  </figure>""")
    if group >= 0:
        figs.append("  </section>")
    if any(b["kind"] == "toggle" for b in blocks):
        figs.append(TOGGLE_SCRIPT)

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
