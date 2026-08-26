/* Illustration index + plate grid + lightbox.
   Index rows follow the label-page pattern: hover a title, its plate floats out by the cursor. */
(function () {
  const PLATES = [
    { t: 'Quiet Hours',      y: '2025', m: 'Procreate · digital',   img: 'assets/illustration-1-preview.jpg', w: 1600, h: 1118 },
    { t: 'Understory',       y: '2025', m: 'Procreate · digital',   img: 'assets/illus-2-web.jpg', w: 1600, h: 1118 },
    { t: 'Second Language',  y: '2024', m: 'Procreate · digital',   img: 'assets/illus-3-web.jpg', w: 1118, h: 1600 },
    { t: 'Low Tide',         y: '2024', m: 'Photoshop · digital',   img: 'assets/illus-4-web.jpg', w: 1130, h: 1600 },
    { t: 'Room With No Sun', y: '2024', m: 'Procreate · digital',   img: 'assets/illus-5-web.jpg', w: 1118, h: 1600 },
    { t: 'Carry',            y: '2023', m: 'Clip Studio · digital', img: 'assets/illus-6-web.jpg', w: 1130, h: 1600 },
  ];
  const n2 = i => String(i + 1).padStart(2, '0');
  const idx = document.getElementById('idx');
  const gal = document.getElementById('gal');
  const plate = document.getElementById('plate');
  const plateImg = plate.querySelector('img');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- index rows ----
  PLATES.forEach((p, i) => {
    const row = document.createElement('button');
    row.type = 'button'; row.className = 'row rv'; row.dataset.i = i;
    row.innerHTML = `<span class="n">[${n2(i)}]</span><span class="t">${p.t}</span><span class="m">${p.m}</span><span class="y">${p.y}</span>`;
    idx.appendChild(row);
  });

  // ---- plate grid ----
  PLATES.forEach((p, i) => {
    const f = document.createElement('figure');
    f.className = 'plateItem rv'; f.dataset.i = i;
    f.innerHTML = `<img src="${p.img}" alt="${p.t}" width="${p.w}" height="${p.h}"><figcaption><span>${n2(i)} · ${p.t}</span><span>${p.y}</span></figcaption>`;
    gal.appendChild(f);
  });

  // ---- cursor-following plate on index hover ----
  let px = 0, py = 0, tx = 0, ty = 0, raf = 0, live = false;
  function loop() {
    px += (tx - px) * 0.16; py += (ty - py) * 0.16;
    plate.style.transform = `translate3d(${px}px,${py}px,0) translate(-50%,-50%) rotate(-3deg)`;
    raf = live ? requestAnimationFrame(loop) : 0;
  }
  addEventListener('pointermove', e => { tx = e.clientX + 150; ty = e.clientY; }, { passive: true });
  idx.addEventListener('pointerover', e => {
    const row = e.target.closest('.row'); if (!row || reduce) return;
    plateImg.src = PLATES[+row.dataset.i].img;
    plateImg.alt = PLATES[+row.dataset.i].t;
    plate.classList.add('on');
    if (!live) { live = true; px = tx; py = ty; loop(); }
  });
  idx.addEventListener('pointerleave', () => { plate.classList.remove('on'); live = false; if (raf) cancelAnimationFrame(raf); });

  // ---- lightbox ----
  const lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg');
  const lbT = document.getElementById('lbT'), lbY = document.getElementById('lbY'), lbN = document.getElementById('lbN');
  let cur = 0;
  function show(i) {
    cur = (i + PLATES.length) % PLATES.length;
    const p = PLATES[cur];
    lbImg.src = p.img; lbImg.alt = p.t;
    lbT.textContent = p.t; lbY.textContent = p.y; lbN.textContent = n2(cur);
  }
  function open(i) { show(i); lb.classList.add('on'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; plate.classList.remove('on'); }
  function close() { lb.classList.remove('on'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  idx.addEventListener('click', e => { const r = e.target.closest('.row'); if (r) open(+r.dataset.i); });
  gal.addEventListener('click', e => { const f = e.target.closest('.plateItem'); if (f) open(+f.dataset.i); });
  document.getElementById('lbX').addEventListener('click', close);
  document.getElementById('lbP').addEventListener('click', () => show(cur - 1));
  document.getElementById('lbNx').addEventListener('click', () => show(cur + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });

  // ---- index / grid view toggle ----
  const tog = document.getElementById('viewToggle');
  const secIdx = document.getElementById('index'), secGal = document.getElementById('plates');
  let mode = 'both';
  tog.addEventListener('click', () => {
    mode = mode === 'both' ? 'grid' : mode === 'grid' ? 'list' : 'both';
    secIdx.style.display = mode === 'grid' ? 'none' : '';
    secGal.style.display = mode === 'list' ? 'none' : '';
    tog.textContent = mode === 'both' ? 'Grid view' : mode === 'grid' ? 'List view' : 'Both';
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
