/* Drawings — label-style carousel: one active sheet centred, neighbours ghosted off both edges */
(function () {
  const SHEETS = [
    { n:'01', t:'Long pose, seated',   m:'Graphite on newsprint', d:'Nov 12, 2024', f:'figure',
      img:'assets/drawing-class-1.jpeg', note:'Three-hour pose in one sitting. The weight sits in the hip and the rest follows from there.' },
    { n:'02', t:'Twenty-minute back',  m:'Graphite on newsprint', d:'Nov 12, 2024', f:'figure',
      img:'assets/drawing-class-2.jpeg', note:'Short pose from the same session. Enough time for structure, not for rendering.' },
    { n:'03', t:'Hands, repeated',     m:'Ink & brush pen',       d:'Mar 04, 2024', f:'study', img:'',
      note:'The same hand fourteen times, until the knuckle line stopped being a guess.' },
    { n:'04', t:'Drapery study',       m:'Graphite, 6B',          d:'Sep 21, 2023', f:'study', img:'',
      note:'Drawing folds as a lighting problem rather than a fabric one.' },
    { n:'05', t:'Head turnaround',     m:'Procreate',             d:'Jan 30, 2025', f:'digital', img:'',
      note:'Five angles of one head, built for a character sheet that never got made.' },
    { n:'06', t:'Commute pages',       m:'Sketchbook, ballpoint', d:'Apr 08, 2025', f:'sketchbook', img:'',
      note:'Drawn on the train, where nobody holds still.' },
    { n:'07', t:'Value block-in',      m:'Procreate',             d:'Jun 15, 2025', f:'digital', img:'',
      note:'Four values, no line — testing how far shape alone carries a figure.' },
    { n:'08', t:'Gesture, one minute', m:'Sketchbook, marker',    d:'Jul 02, 2025', f:'sketchbook', img:'',
      note:'Marker, so a wrong line stays in.' }
  ];

  const track = document.getElementById('track');
  const rail = document.querySelector('.rail');
  const cnt = document.getElementById('cnt');
  const info = document.getElementById('info');
  let filter = 'all', view = SHEETS.slice(), cur = 0;

  // build every card once; filtering only changes which ones are laid out
  const nodes = SHEETS.map((s, i) => {
    const el = document.createElement('article');
    el.className = 'item';
    const media = s.img
      ? '<img src="' + s.img + '" alt="' + s.t + '">'
      : '<image-slot id="draw-' + s.n + '" shape="rect" placeholder="Drop sheet ' + s.n + '"></image-slot>';
    el.innerHTML =
      '<div class="band"><div class="tab"><span class="sq"></span>' + s.t + '</div>' +
      '<div class="tools"><button type="button" data-a="shuffle" title="Shuffle">⤨</button>' +
      '<button type="button" data-a="prev" title="Previous">&laquo;</button>' +
      '<button type="button" data-a="next" title="Next">&raquo;</button></div></div>' +
      '<div class="frame">' + media +
      '<span class="cm a"></span><span class="cm b"></span><span class="cm c"></span><span class="cm d"></span></div>' +
      '<div class="meta"><div class="l"><span><span class="no">[' + s.n + ']</span> &nbsp;' + s.t + '</span><span>' + s.d + '</span></div>' +
      '<div class="r"><button type="button" data-a="info">Sheet info ↳</button><button type="button" data-a="open">View full ↳</button></div></div>';
    el.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b) {
        const a = b.dataset.a;
        if (a === 'next') step(1);
        else if (a === 'prev') step(-1);
        else if (a === 'shuffle') shuffle();
        else if (a === 'info' || a === 'open') openInfo();
        return;
      }
      if (e.target.closest('image-slot')) return;
      const at = view.indexOf(s);
      if (at > -1 && at !== cur) { cur = at; layout(); }
    });
    el._data = s;
    track.appendChild(el);
    return el;
  });

  function layout() {
    const gapPct = 108; // horizontal spacing between neighbouring sheets, % of sheet width
    const n = view.length;
    // the sheet is square: its width is whatever the middle grid row can be, so measure
    // the tab and meta bands and give every item that exact width — bands stay flush
    const probe = nodes[0];
    probe.style.display = '';
    const bandH = probe.querySelector('.band').offsetHeight;
    const metaH = probe.querySelector('.meta').offsetHeight;
    const avail = Math.max(140, track.clientHeight - bandH - metaH);
    // sheets are no longer square: width comes from the viewport, height is capped by
    // whatever the middle grid row can give, so tall and wide art both fit uncropped
    const w = Math.max(200, Math.min(innerWidth * 0.34, 560));
    document.documentElement.style.setProperty('--sheet', w + 'px');
    document.documentElement.style.setProperty('--artmax', avail + 'px');

    nodes.forEach(el => { el.style.display = 'none'; el.classList.remove('active'); });
    view.forEach((s, i) => {
      const el = nodes[SHEETS.indexOf(s)];
      // wrap the offset so ghosts always bleed off BOTH edges, at every index
      let d = i - cur;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      el.style.display = '';
      el.style.transform = 'translate3d(calc(-50% + ' + (d * gapPct) + '%),-50%,0) scale(' + (d === 0 ? 1 : 0.94) + ')';
      el.style.zIndex = String(10 - Math.abs(d));
      if (d === 0) el.classList.add('active');
    });
    cnt.textContent = (cur + 1) + ' / ' + view.length;
  }

  function step(d) {
    cur = (cur + d + view.length) % view.length;
    layout();
  }
  function shuffle() {
    cur = Math.floor(Math.random() * view.length);
    layout();
  }

  document.getElementById('next').addEventListener('click', () => step(1));
  document.getElementById('prev').addEventListener('click', () => step(-1));
  document.getElementById('shuffle').addEventListener('click', shuffle);

  document.getElementById('filters').addEventListener('click', e => {
    const b = e.target.closest('.fchip'); if (!b) return;
    filter = b.dataset.f;
    document.querySelectorAll('.fchip').forEach(c => c.setAttribute('aria-pressed', String(c === b)));
    view = filter === 'all' ? SHEETS.slice() : SHEETS.filter(s => s.f === filter);
    cur = 0; layout();
  });

  addEventListener('keydown', e => {
    if (info.classList.contains('on')) { if (e.key === 'Escape') info.classList.remove('on'); return; }
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });

  addEventListener('resize', () => layout());

  // wheel scrubbing, scoped to the rail so it can never fight page scroll
  let lock = 0;
  rail.addEventListener('wheel', e => {
    const now = Date.now(); if (now < lock) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12) return;
    lock = now + 420;
    step(d > 0 ? 1 : -1);
  }, { passive: true });

  function openInfo() {
    const s = view[cur];
    document.getElementById('infoT').textContent = s.t;
    document.getElementById('infoD').textContent = s.note;
    document.getElementById('infoN').textContent = 'JJ-D ' + s.n;
    document.getElementById('infoM').textContent = s.m;
    document.getElementById('infoY').textContent = s.d;
    document.getElementById('infoF').textContent = s.f;
    info.classList.add('on');
  }
  document.getElementById('infox').addEventListener('click', () => info.classList.remove('on'));
  info.addEventListener('click', e => { if (e.target === info) info.classList.remove('on'); });

  layout();
})();
