// =========================================================
//  Composable case-study sections — window.CSX.render(section)
//  Each returns a DOM node. Sections are listed in work.sections
//  and assembled inside the shared chrome by case-study.js.
// =========================================================
(function () {
const el = window.PK.el;

// reveal wrapper: marks a node to fade-up when scrolled into view
function rv(node, delay) {
  node.classList.add('reveal');
  if (delay) node.style.transitionDelay = delay + 'ms';
  return node;
}

function label(text) { return text ? el('div', { class: 'cs-label' }, text) : null; }

// ---- hero · bg (full-bleed image behind title, with legibility veil) ----
function heroBg(s, work) {
  const hero = el('section', { class: 'cs-hero' }, [
    el('div', { class: 'cs-hero__veil' }),
    el('div', { class: 'cs-hero__inner' }, [
      rv(el('div', { class: 'cs-eyebrow' }, `${work.kind} · ${work.year}`)),
      rv(el('h1', { class: 'cs-title', html: `${work.title} <span class="ext">↗</span>` }), 80),
      rv(el('p', { class: 'cs-deck' }, s.deck || work.deck), 160),
    ]),
    el('div', { class: 'scroll-cue' }, '( scroll )'),
  ]);
  hero.style.setProperty('--cs-hero-bg', `url(${s.img || work.img})`);
  return hero;
}

// ---- hero · split (title + key art side by side) ----
function heroSplit(s, work) {
  return el('section', { class: 'cs-hero2' }, [
    el('div', { class: 'cs-hero2__copy' }, [
      rv(el('span', { class: 'cs-eyebrow' }, `${work.kind} · ${work.year}`)),
      rv(el('h1', { class: 'cs-title' }, work.title), 80),
      rv(el('p', { class: 'cs-deck' }, s.deck || work.deck), 160),
    ]),
    rv(el('div', { class: 'cs-hero2__media' }, [ el('img', { src: s.img || work.img, alt: work.title }) ]), 120),
  ]);
}

// ---- marquee (rolling tag banner) ----
function marquee(s) {
  const items = s.items || [];
  const run = () => el('div', { class: 'cs-marquee__item' }, items.join('  ✦  '));
  // duplicate the run so the -50% loop is seamless
  const track = el('div', { class: 'cs-marquee__track' }, [run(), run()]);
  return el('section', { class: 'cs-marquee' }, [track]);
}

// ---- concept statement ----
function concept(s) {
  const p = el('p', {});
  p.innerHTML = s.text; // allows <span class="hl"> accents
  return el('section', { class: 'cs-sec cs-concept' }, [
    rv(el('div', {}, [ label(s.label || 'Concept'), p ]))
  ]);
}

// ---- text + image ----
function textImage(s, work) {
  const body = el('div', { class: 'cs-ti__body' }, [
    label(s.label),
    s.heading ? el('h3', {}, s.heading) : null,
    ...(s.paras || []).map(t => el('p', {}, t)),
  ]);
  const media = el('div', { class: 'cs-ti__media' }, [
    el('img', { src: s.img, alt: s.cap || '' }),
    s.cap ? el('div', { class: 'cs-ti__cap' }, s.cap) : null,
  ]);
  return el('section', { class: 'cs-sec' }, [
    rv(el('div', { class: 'cs-ti' + (s.flip ? ' cs-ti--flip' : '') }, [body, media]))
  ]);
}

// ---- prose (labelled paragraphs) ----
function prose(s) {
  return el('section', { class: 'cs-sec' }, [
    rv(el('div', { class: 'cs-prose' }, [
      label(s.label),
      ...(s.paras || []).map(t => el('p', {}, t)),
    ]))
  ]);
}

// ---- breakdown grid (info at a glance) ----
function breakdown(s) {
  const cells = (s.cells || []).map(c => el('div', { class: 'cs-breakdown__cell' }, [
    el('div', { class: 'cs-breakdown__k' }, c.k),
    el('div', { class: 'cs-breakdown__v' }, c.v),
  ]));
  return el('section', { class: 'cs-sec' }, [
    label(s.label || 'At a glance'),
    rv(el('div', { class: 'cs-breakdown' }, cells)),
  ]);
}

// ---- numbered steps (how it was achieved) ----
function steps(s) {
  const rows = (s.items || []).map((it, i) =>
    rv(el('div', { class: 'cs-step' }, [
      el('div', { class: 'cs-step__n' }, String(i + 1).padStart(2, '0')),
      el('div', { class: 'cs-step__b' }, [
        el('h4', {}, it.title),
        el('p', {}, it.body),
      ]),
    ]), i * 60));
  return el('section', { class: 'cs-sec' }, [
    label(s.label || 'How it was achieved'),
    el('div', { class: 'cs-steps' }, rows),
  ]);
}

// ---- process grid (group of images) ----
function processGrid(s) {
  const figs = (s.items || []).map((it, i) =>
    rv(el('figure', {}, [
      el('img', { src: it.img, alt: it.cap || '' }),
      it.cap ? el('figcaption', {}, it.cap) : null,
    ]), (i % 4) * 70));
  return el('section', { class: 'cs-sec' }, [
    label(s.label || 'Process'),
    el('div', { class: 'cs-pgrid' }, figs),
  ]);
}

// ---- detail (one large image) ----
function detail(s) {
  return el('section', { class: 'cs-sec' }, [
    rv(el('div', { class: 'cs-detail' }, [
      el('img', { src: s.img, alt: s.cap || '' }),
      s.cap ? el('div', { class: 'cs-detail__cap' }, s.cap) : null,
    ]))
  ]);
}

// ---- hover terms (words reveal an image) ----
function hoverTerms(s) {
  const p = el('p', {});
  (s.parts || []).forEach(part => {
    if (typeof part === 'string') { p.appendChild(document.createTextNode(part)); }
    else {
      const term = el('span', { class: 'cs-term' }, [
        part.term,
        el('img', { class: 'cs-term__img', src: part.img, alt: part.term }),
      ]);
      p.appendChild(term);
    }
  });
  return el('section', { class: 'cs-sec cs-hover' }, [
    rv(el('div', {}, [ label(s.label || 'Approach'), p ]))
  ]);
}

// ---- references ----
function references(s) {
  const rows = (s.items || []).map((it, i) =>
    el('div', { class: 'cs-ref' }, [
      el('span', { class: 'cs-ref__n' }, String(i + 1).padStart(2, '0')),
      el('span', { class: 'cs-ref__t' }, it.title),
      el('span', { class: 'cs-ref__s' }, it.src || ''),
    ]));
  return el('section', { class: 'cs-sec' }, [
    label(s.label || 'References'),
    rv(el('div', { class: 'cs-refs' }, rows)),
  ]);
}

// ---- final display ----
function final(s) {
  return el('section', { class: 'cs-sec cs-final' }, [
    rv(el('div', {}, [
      label(s.label || 'Final'),
      el('img', { src: s.img, alt: s.cap || '' }),
      s.cap ? el('div', { class: 'cs-final__cap' }, s.cap) : null,
    ]))
  ]);
}

const RENDERERS = {
  heroBg, heroSplit, marquee, concept, textImage, prose, breakdown,
  steps, processGrid, detail, hoverTerms, references, final,
};

function render(section, work) {
  const fn = RENDERERS[section.type];
  return fn ? fn(section, work) : null;
}

window.CSX = { render, has: t => !!RENDERERS[t] };
})();