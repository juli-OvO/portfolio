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
ABOUT_IMAGE = re.compile(r"^Image (left|right):\s*(.+?)(?:\s+[—-]\s+(.+))?$", re.I)


def about_image(folder, line):
    """`Image left: a.png, b.png — caption` inside ## About -> files with web copies.
    PNGs stay PNG (keeps logo transparency); everything else becomes JPG."""
    m = ABOUT_IMAGE.match(line.strip())
    if not m:
        return None
    files = []
    for name in (f.strip().strip("`") for f in m.group(2).split(",")):
        src = Path(name)
        ext = ".png" if src.suffix.lower() == ".png" else ".jpg"
        files.append({"web": f"web/{src.stem}{ext}", "source": name, "caption": "", "alt": src.stem})
    return {"side": m.group(1).lower(), "files": files, "caption": (m.group(3) or "").strip()}


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
    soon = meta.get("status", "").strip().lower() in ("coming soon", "coming-soon", "soon")
    if not images and not soon:
        raise SystemExit(f"{md_path}: no images listed under '## Images' "
                         f"(or add 'status: coming soon')")

    about_imgs = [a for a in (about_image(md_path.parent, l) for l in sections.get("about", [])) if a]
    return {**meta, "soon": soon, "about": sections.get("about", []), "after": sections.get("after", []),
            "about_images": [f for a in about_imgs for f in a["files"]], "order": float(meta.get("order", 999)), "dir": md_path.parent,
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
    elif web.suffix.lower() == ".png":
        subprocess.run(["sips", "-s", "format", "png", "-Z", "800", str(src), "--out", str(web)],
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
    if not (w and h):
        return None
    # phone photos are often stored sideways with an EXIF rotation flag; browsers apply it, so swap
    if exif_orientation(path) in (5, 6, 7, 8):
        return (h.group(1), w.group(1))
    return (w.group(1), h.group(1))


def exif_orientation(path):
    """EXIF Orientation tag (1-8) of a JPEG, or 1 if it has none."""
    import struct
    data = path.read_bytes()[:131072]
    if data[:2] != b"\xff\xd8":
        return 1
    i = 2
    while i + 4 <= len(data) and data[i] == 0xFF:
        marker, size = data[i + 1], struct.unpack(">H", data[i + 2:i + 4])[0]
        if marker == 0xE1 and data[i + 4:i + 10] == b"Exif\0\0":
            t = i + 10
            end = "<" if data[t:t + 2] == b"II" else ">"
            ifd = t + struct.unpack(end + "I", data[t + 4:t + 8])[0]
            for k in range(struct.unpack(end + "H", data[ifd:ifd + 2])[0]):
                e = ifd + 2 + 12 * k
                if struct.unpack(end + "H", data[e:e + 2])[0] == 0x0112:
                    return struct.unpack(end + "H", data[e + 8:e + 10])[0]
            return 1
        if marker == 0xDA:
            break
        i += 2 + size
    return 1


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


def css_version():
    """Short hash of style.css. It goes on the stylesheet link so browsers (and GitHub Pages'
    10-minute cache) fetch the new stylesheet as soon as it changes."""
    import hashlib
    return hashlib.sha1((ROOT / "style.css").read_bytes()).hexdigest()[:8]


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
<link rel="stylesheet" href="{prefix}style.css?v={css_version()}">
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
    """Hover tag. Coming-soon projects say so on the first row, tags start on the next."""
    soon = '<span class="soon">Coming soon</span>' if p.get("soon") else ""
    tags = esc(p["tags"]) if p.get("tags") else ""
    return f'<span class="tag" aria-hidden="true">{soon}{tags}</span>' if soon or tags else ""


def thumb(p, prefix="", lazy=True):
    """A project's cover image, or a 'Coming soon' block when it has no images yet."""
    img = cover(p)
    if img is None:
        return '<span class="soon-box"><span>Coming soon</span></span>'
    html_ = media(p, img, prefix, p["title"] if prefix == "" else "", lazy=lazy)
    # `cover_position: top` (or any CSS object-position) picks which part of a cropped cover shows
    if p.get("cover_position") and html_.startswith("<img "):
        html_ = html_.replace("<img ", f'<img style="object-position: {esc(p["cover_position"])}" ', 1)
    return html_


def sidebar(projects, prefix="", active=None, here=""):
    """Left column: name, bio, page links, numbered project list, contact links.
    `here` marks a top-level page as current: "index" or "wip"."""
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
    <div class="pages">
      <a class="overview" href="{prefix}index.html"{' aria-current="page"' if here == "index" else ''}>Overview</a>
      <a class="overview" href="{prefix}{WIP_PAGE}"{' aria-current="page"' if here == "wip" else ''}>Works in Progress</a>
    </div>
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


def tag_list(p):
    return [t.strip() for t in p.get("tags", "").split("·") if t.strip()]


GENERIC = {"design", "development", "and", "research", "collaboration"}


def related(projects, p, count=3):
    """`related:` slugs in front matter if set; otherwise the projects sharing the most tags
    (a whole shared tag counts 3, a shared tag word like "game" counts 1), nearest in order first."""
    by_slug = {q["slug"]: q for q in projects}
    if p.get("related"):
        picks = [by_slug[s.strip()] for s in p["related"].split(",") if s.strip() in by_slug]
        return picks[:count]
    mine = {t.lower() for t in tag_list(p)}
    words = {w for t in mine for w in t.split()} - GENERIC
    i = projects.index(p)

    def score(q):
        theirs = {t.lower() for t in tag_list(q)}
        shared_words = {w for t in theirs for w in t.split()} & words
        return (3 * len(mine & theirs) + len(shared_words), -abs(projects.index(q) - i))

    others = sorted((q for q in projects if q is not p), key=score, reverse=True)
    return others[:count]


def cover(p):
    """Index cover: front matter `cover:` if set, else the first listed image that isn't a video.
    None for a project with no images yet."""
    if not p["images"]:
        return None
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


def build_index(projects, columns=3):
    # Staggered columns, filled left to right: project 1, 2, 3 start the three columns, 4 goes under 1, ...
    # Each tile also carries its place in the list, so on a phone the columns fold back into one in order.
    cols = [[] for _ in range(columns)]
    for i, p in enumerate(projects):
        tag = tag_span(p)
        cols[i % columns].append(f"""      <a class="tile" href="work/{p['slug']}.html" style="order: {i}">
        <span class="pic">{thumb(p, lazy=i > 2)}{tag}</span>
        <span class="cap"><span>{num(i)}&ensp;{esc(p['title'])}</span><span>{esc(p['date'])}</span></span>
      </a>""")
    grid = "\n".join('    <div class="col">\n' + "\n".join(c) + "\n    </div>" for c in cols)
    body = f"""<div class="layout index">
{sidebar(projects, here="index")}
<main class="gallery">
  <div class="grid">
{grid}
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


WIP_PAGE = "in-progress.html"


def build_wip(projects):
    """Most recent works in progress. Empty for now: add content inside <main>."""
    body = f"""<div class="layout index">
{sidebar(projects, here="wip")}
<main class="gallery">
  <h1 class="label">Most recent works in progress</h1>
</main>
</div>"""
    (ROOT / WIP_PAGE).write_text(page(f"Works in Progress — {NAME}", body), encoding="utf-8")


def about_html(p, lines, cls="about"):
    """`## About` (above the images) and `## After` (below them) in project.md:
    `### Heading` starts a block, `- ` lines are bullets, other lines are paragraphs (a blank line
    ends one). A paragraph with arrows (→) is set as a one-line route; one starting `Note:` is set
    larger, as a closing line. Paragraphs before any heading get a block with no heading."""
    blocks, para = [], []

    def flush():
        if para:
            if not blocks:
                blocks.append({"title": None, "body": [], "aside": None})
            text = " ".join(para)
            kind = "note" if text.startswith("Note:") else "route" if "→" in text else "p"
            blocks[-1]["body"].append((kind, text[5:].strip() if kind == "note" else text))
        para.clear()

    for line in lines:
        h = GROUP_LINE.match(line)
        if h:
            flush()
            blocks.append({"title": h.group(1).strip(), "body": [], "aside": None})
        elif ABOUT_IMAGE.match(line.strip()) and blocks:
            flush()
            blocks[-1]["aside"] = about_image(p["dir"], line)
        elif line.strip().startswith("- ") and blocks:
            flush()
            body = blocks[-1]["body"]
            if not body or body[-1][0] != "ul":
                body.append(("ul", []))
            body[-1][1].append(line.strip()[2:])
        elif line.strip():
            para.append(line.strip())
        else:
            flush()
    flush()

    out = []
    for b in blocks:
        parts = []
        for kind, val in b["body"]:
            if kind == "p":
                parts.append(f"      <p>{esc(val)}</p>")
            elif kind == "route":
                parts.append(f'      <p class="route">{esc(val)}</p>')
            elif kind == "note":
                parts.append(f'      <p class="closing">{esc(val)}</p>')
            else:
                parts.append("      <ul>" + "".join(f"<li>{esc(v)}</li>" for v in val) + "</ul>")
        head = f'      <h2 class="label">{esc(b["title"])}</h2>\n' if b["title"] else ""
        text = head + "\n".join(parts)
        a = b["aside"]
        if not a:
            out.append(f'    <div class="block">\n{text}\n    </div>')
            continue
        imgs = "".join(media(p, f, "../", f["alt"]) for f in a["files"])
        cap = f'<figcaption>{esc(a["caption"])}</figcaption>' if a["caption"] else ""
        kind = " logos" if len(a["files"]) > 1 else ""
        out.append(f'    <div class="block aside-{a["side"]}">\n'
                   f'      <figure class="aside{kind}"><div class="imgs">{imgs}</div>{cap}</figure>\n'
                   f'      <div class="text">\n{text}\n      </div>\n    </div>')
    return f'  <section class="{cls}">\n' + "\n".join(out) + "\n  </section>" if out else ""


def carousel_html(p):
    """`layout: carousel`: one main image at a time, prev/next arrows, thumbnails underneath.
    Without JavaScript every image simply shows in a column."""
    imgs = p["images"]
    slides = "\n".join(f'      <div class="slide{" on" if j == 0 else ""}">'
                       f'{media(p, img, "../", img["caption"], lazy=j > 0)}</div>'
                       for j, img in enumerate(imgs))
    caps = "".join(f'<span class="ccap{" on" if j == 0 else ""}">{esc(img["caption"])}</span>'
                   for j, img in enumerate(imgs))
    thumbs = "\n".join(f'      <button type="button" class="thumb{" on" if j == 0 else ""}" '
                        f'aria-label="Show image {j + 1}"{" aria-current=\"true\"" if j == 0 else ""}>'
                        f'{media(p, img, "../", "", lazy=True)}</button>'
                        for j, img in enumerate(imgs))
    return f"""  <figure class="carousel" aria-roledescription="carousel" aria-label="{esc(p['title'])}">
    <div class="stage">
      <button type="button" class="cnav prev" aria-label="Previous image">←</button>
{slides}
      <button type="button" class="cnav next" aria-label="Next image">→</button>
    </div>
    <figcaption><span class="count"><span class="at">01</span> / {len(imgs):02d}</span>{caps}</figcaption>
    <div class="thumbs">
{thumbs}
    </div>
  </figure>
{CAROUSEL_SCRIPT}"""


CAROUSEL_SCRIPT = """<script>
document.querySelectorAll(".carousel").forEach(c => {
  const slides = c.querySelectorAll(".slide"), caps = c.querySelectorAll(".ccap"),
        thumbs = c.querySelectorAll(".thumb"), at = c.querySelector(".at");
  let k = 0;
  const show = i => {
    k = (i + slides.length) % slides.length;
    [slides, caps, thumbs].forEach(list => list.forEach((el, x) => el.classList.toggle("on", x === k)));
    thumbs.forEach((t, x) => x === k ? t.setAttribute("aria-current", "true") : t.removeAttribute("aria-current"));
    thumbs[k].scrollIntoView({ block: "nearest", inline: "nearest" });
    at.textContent = String(k + 1).padStart(2, "0");
  };
  c.querySelector(".prev").addEventListener("click", () => show(k - 1));
  c.querySelector(".next").addEventListener("click", () => show(k + 1));
  thumbs.forEach((t, x) => t.addEventListener("click", () => show(x)));
  document.addEventListener("keydown", e => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "ArrowLeft") show(k - 1);
    if (e.key === "ArrowRight") show(k + 1);
  });
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
    if p["about"]:
        figs.append(about_html(p, p["about"]))
    if p.get("layout") == "carousel":
        figs.append(carousel_html(p))
        blocks = []
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
    if p["soon"] and not p["images"]:
        figs.append('  <div class="soon-box big"><span>Coming soon</span></div>')
    if p["after"]:
        figs.append(about_html(p, p["after"], "about after"))
    if any(b["kind"] == "toggle" for b in blocks):
        figs.append(TOGGLE_SCRIPT)

    soon_note = (f'\n  <p class="soon-note">{"In progress · Coming soon" if p["images"] else "Coming soon"}</p>'
                 if p["soon"] else "")
    facts = "".join(f"<dt>{label}</dt><dd>{esc(p[key])}</dd>"
                    for key, label in (("role", "Role"), ("team", "Team")) if p.get(key))
    facts = f'\n  <dl class="facts">{facts}</dl>' if facts else ""
    tags = tag_list(p)
    chips = ("\n  <ul class=\"tags\" aria-label=\"Tags\">"
             + "".join(f"<li>{esc(t)}</li>" for t in tags) + "</ul>") if tags else ""
    desc = f'\n  <p class="desc">{esc(p["description"])}</p>' if p["description"] else ""
    rel = "".join(f"""
      <li><a href="{r['slug']}.html">
        <span class="th">{thumb(r, '../')}</span>
        <span class="meta-row"><span class="rt">{esc(r['title'])}</span><span class="y">{esc(r['date'])}</span></span>
      </a></li>""" for r in related(projects, p))
    also = f"""
  <section class="also">
    <h2 class="label">You might also like</h2>
    <ul>{rel}
    </ul>
  </section>""" if rel else ""
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
  <p class="date">{esc(p['date'])}</p>{soon_note}{chips}{desc}{facts}{link}{also}
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
        for img in p["images"] + p["about_images"]:
            make_web_copy(p["dir"], img)

    build_index(projects)
    build_wip(projects)
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
