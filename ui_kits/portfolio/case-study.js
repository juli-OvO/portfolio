// =========================================================
//  Project Page assembler — shared chrome + composable sections.
//  window.CS.build(work, { onBack, onNext })
//
//  A work is defined by work.sections: an ordered list of section
//  descriptors. Most are rendered by cs-sections.js (window.CSX);
//  the interactive ones (carousel, slides) live here.
// =========================================================
(function () {
const el = window.PK.el;

function wrapSvg(inner) {
  const span = el('span', { html: `<svg viewBox="0 0 22 22">${inner}</svg>` });
  return span.firstChild;
}
function chevron(dir) {
  const pts = dir === 'left' ? '14,4 6,11 14,18' : '8,4 16,11 8,18';
  return el('button', { class: 'cs-arrow', 'aria-label': dir },
    [ wrapSvg(`<polyline points="${pts}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) ]);
}

// ---------------- shared chrome ----------------
function chrome(work, { onBack }) {
  const back = el('button', { class: 'cs-back', 'aria-label': 'Back to portfolio', onclick: onBack },
    [ el('div', { class: 'arr' }) ]);
  const top = el('div', { class: 'cs-top' }, [
    el('div', { class: 'eyebrow-pill' }, [
      `${work.kind || 'Project'} `,
      el('span', { class: 'idx' }, `· ${work.index} / ${work.total}`)
    ])
  ]);
  return [back, top];
}

function footer(work, { onNext }) {
  return el('div', { class: 'cs-footer' }, [
    el('div', { class: 'next', onclick: onNext }, [
      el('span', { class: 'lbl' }, 'Next project'),
      `${work.next || 'Back to works'} →`
    ]),
    el('div', { class: 'credit-text' }, 'Concepted, designed, and coded by Julianne Jin.')
  ]);
}

// ---------------- interactive section · CAROUSEL ----------------
function sectionCarousel(s, work) {
  const items = s.items || [];
  let cur = 0;
  const scene = el('div', { class: 'cs-scene' });
  const cards = items.map(it => {
    const c = el('div', { class: 'cs-slide-card' }, [ el('img', { src: it.img, alt: it.caption || '' }) ]);
    scene.appendChild(c);
    return c;
  });
  const cap = el('div', { class: 'cs-caption' });
  function render() {
    cards.forEach((c, i) => {
      let pos = 'hidden';
      if (i === cur) pos = 'active';
      else if (i === (cur - 1 + items.length) % items.length) pos = 'prev';
      else if (i === (cur + 1) % items.length) pos = 'next';
      c.setAttribute('data-pos', pos);
    });
    const it = items[cur] || {};
    cap.innerHTML = '';
    cap.append(
      el('span', { class: 'n' }, String(cur + 1).padStart(2, '0')),
      el('span', { class: 'ttl' }, it.caption || ''),
      el('span', { class: 'yr' }, `${cur + 1} / ${items.length}`)
    );
  }
  const prev = chevron('left');  prev.onclick = () => { cur = (cur - 1 + items.length) % items.length; render(); };
  const next = chevron('right'); next.onclick = () => { cur = (cur + 1) % items.length; render(); };
  cards.forEach((c, i) => c.addEventListener('click', () => { cur = i; render(); }));
  render();
  return el('section', { class: 'cs-stage' }, [
    el('div', { class: 'cs-head' }, [
      el('span', { class: 'cs-eyebrow' }, `${work.kind} · ${work.year}`),
      el('h1', { class: 'cs-title' }, work.title),
    ]),
    el('div', { class: 'cs-carousel' }, [prev, scene, next]),
    cap
  ]);
}

// ---------------- interactive section · SLIDES ----------------
function sectionSlides(s, work) {
  const items = s.items || [];
  let cur = 0;
  const figs = items.map((it, i) =>
    el('figure', { class: 'cs-fig' + (i === 0 ? ' active' : '') }, [ el('img', { src: it.img, alt: it.caption || '' }) ]));
  const cap = el('div', { class: 'cs-caption' });
  function render(prevIdx) {
    figs.forEach((f, i) => {
      f.classList.remove('active', 'exit');
      if (i === cur) f.classList.add('active');
      else if (i === prevIdx) f.classList.add('exit');
    });
    const it = items[cur] || {};
    cap.innerHTML = '';
    cap.append(
      el('span', { class: 'n' }, String(cur + 1).padStart(2, '0')),
      el('span', { class: 'ttl' }, it.caption || ''),
      el('span', { class: 'yr' }, it.year || '')
    );
  }
  const prev = chevron('left');  prev.onclick = () => { const p = cur; cur = (cur - 1 + items.length) % items.length; render(p); };
  const next = chevron('right'); next.onclick = () => { const p = cur; cur = (cur + 1) % items.length; render(p); };
  render();
  return el('section', { class: 'cs-slidestage' }, [
    el('div', { class: 'cs-head' }, [
      el('span', { class: 'cs-eyebrow' }, `${work.kind} · ${work.year}`),
      el('h1', { class: 'cs-title' }, work.title),
    ]),
    el('div', { class: 'cs-figs' }, figs),
    el('div', { class: 'cs-cap-panel' }, [prev, cap, next]),
  ]);
}

const LOCAL = { carousel: sectionCarousel, slides: sectionSlides };

// ---------------- scroll reveal ----------------
function observeReveals(root) {
  requestAnimationFrame(() => root.classList.add('cs-ready'));
  const reveals = [...root.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(elm => elm.classList.add('in'));
    return;
  }
  const obs = new IntersectionObserver((ents) => {
    ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
  }, { root, threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  reveals.forEach(elm => obs.observe(elm));
  // Safety: if the observer never fires (e.g. a throttled/offscreen timeline),
  // reveal everything so no section is ever stuck invisible.
  setTimeout(() => reveals.forEach(elm => elm.classList.add('in')), 2500);
}

// ---------------- assembler ----------------
function build(work, hooks) {
  const root = el('div', { class: 'cs' });
  chrome(work, hooks).forEach(c => root.appendChild(c));
  (work.sections || []).forEach(s => {
    const node = LOCAL[s.type] ? LOCAL[s.type](s, work) : window.CSX.render(s, work);
    if (node) root.appendChild(node);
  });
  root.appendChild(footer(work, hooks));
  observeReveals(root);
  return root;
}

window.CS = { build };
})();