// Components — vanilla JS to keep the kit dep-free.
// Each "component" is a function that returns an HTMLElement.

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'style' && typeof v === 'object') {
      // custom properties (--foo) need setProperty; camelCase props use direct assignment.
      for (const [sk, sv] of Object.entries(v)) {
        if (sk.startsWith('--')) n.style.setProperty(sk, sv);
        else n.style[sk] = sv;
      }
    }
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'html') n.innerHTML = v;
    else n.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return n;
}

// ---------- Cursor ----------
function makeCursor() {
  const c = el('div', { class: 'cursor' });
  document.body.appendChild(c);
  let x = innerWidth/2, y = innerHeight/2, tx = x, ty = y;
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  function loop() {
    x += (tx - x) * 0.25; y += (ty - y) * 0.25;
    c.style.left = x + 'px'; c.style.top = y + 'px';
    requestAnimationFrame(loop);
  }
  loop();
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('a, button, .topic, .folder-tab, .cs-card, .btn-pill, .mode-toggle, .cs-back, .cs-sticky-link');
    c.classList.toggle('big', !!t);
  });
}

// ---------- Mode toggle ----------
function makeModeToggle() {
  const btn = el('button', {
    class: 'mode-toggle',
    'aria-label': 'Toggle day/night mode',
    onclick: () => {
      const cur = document.documentElement.getAttribute('data-mode');
      document.documentElement.setAttribute('data-mode', cur === 'night' ? 'day' : 'night');
    }
  }, [el('div', { class: 'dot' })]);
  return btn;
}

// ---------- Status bar ----------
function makeStatusBar() {
  const time = el('span');
  const vp = el('span');
  const bar = el('div', { class: 'status-bar' }, [time, vp]);
  function tick() {
    const d = new Date();
    const dt = d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const tm = d.toLocaleTimeString('en-US', { hour12: true });
    time.textContent = `[ ${dt}  ${tm} ]`;
    vp.textContent = `[ ${innerWidth} × ${innerHeight} ]`;
  }
  setInterval(tick, 1000); tick();
  return bar;
}

// ---------- Site credit ----------
function makeCredit() {
  return el('div', { class: 'credit' },
    'This website was concepted, designed, and coded by Julianne Jin.');
}

// ---------- Pill button ----------
function pillBtn(label, onclick) {
  return el('button', { class: 'btn-pill', onclick }, label);
}

// ---------- Folder ----------
// Trapezoid-tab SVG + label, over a fixed-size colored body.
// Staggering is automatic: pass `index` + `count` and the tab is distributed
// evenly across the width — add/remove folders and they re-space themselves.
function makeFolder({ tone, label, body, index = 0, count = 1, flushRight = false, blank = false }) {
  const W = 120;                        // uniform tab width (viewBox units)
  const m = 6;                          // edge margin
  const span = count > 1 ? (400 - W - m * 2) / (count - 1) : 0;
  const S = Math.round(m + index * span);            // tab start x
  const a = 16;                         // slant run
  // flushRight: tab has its usual left slant but its top runs flat to the right
  // edge and drops straight down the wall (no transparent corner notch) — used
  // for the blank blocker tab so it seals the right side of the fan.
  const poly = flushRight
    ? `${S},50 ${S + a},3 400,3 400,50`
    : `${S},50 ${S + a},3 ${S + W - a},3 ${S + W},50`;
  const cx = ((S + W / 2) / 400 * 100).toFixed(1) + '%';  // label centre %
  const tabSvg = `
    <svg viewBox="0 0 400 50" preserveAspectRatio="none" aria-hidden="true">
      <polygon class="tab-fill" points="${poly}"/>
      <polyline class="tab-stroke" points="0,50 ${poly} 400,50"/>
    </svg>`;
  const tab = el('div', { class: 'folder-tab' }, [
    el('div', { html: tabSvg }),
    el('div', { class: 'tab-label', style: { '--tab-cx': cx } }, label),
  ]);
  const inner = el('div', { class: 'folder-body-inner' }, body);
  const bod = el('div', { class: 'folder-body' }, [inner]);
  const f = el('div', { class: 'folder' + (blank ? ' folder--blank' : ''), 'data-tone': tone }, [tab, bod]);
  // The blank blocker is decorative only — pointer-events:none (set in CSS) keeps
  // it from opening or triggering the stack, so we don't wire a click handler.
  if (!blank) tab.addEventListener('click', () => {
    const wasOpen = f.classList.contains('open');
    document.querySelectorAll('.folder').forEach(x => x.classList.remove('open'));
    if (!wasOpen) f.classList.add('open');
  });
  return f;
}

// ---------- Topic item ----------
function topicItem({ title, year, onhover, onclick }) {
  const t = el('a', { class: 'topic', onclick }, [
    title,
    el('span', { class: 'meta-yr' }, year)
  ]);
  if (onhover) t.addEventListener('mouseenter', onhover);
  return t;
}

// ---------- CV section ----------
function cvSection(title, lines) {
  return el('div', { class: 'cv-section' }, [
    el('h3', {}, title),
    ...lines.map(l => {
      const cls = ['cv-line'];
      if (l.title) cls.push('title');
      if (l.muted) cls.push('muted');
      if (l.bullet) cls.push('bullet');
      return el('div', { class: cls.join(' ') }, l.text);
    })
  ]);
}

window.PK = { el, makeCursor, makeModeToggle, makeStatusBar, makeCredit,
              pillBtn, makeFolder, topicItem, cvSection };
