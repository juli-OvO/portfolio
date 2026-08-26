/* Miniature Boid Sequencer — flock + a harmonic line. Crossing the line fires a voice.
   Sound is opt-in (browsers require a gesture). Blueprint palette to match the page. */
(function () {
  const canvas = document.getElementById('flock');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const btn = document.getElementById('soundBtn');
  const readout = document.getElementById('flockRead');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1;
  const N = 46, boids = [];
  const mouse = { x: -9999, y: -9999 };
  let events = 0, audio = null, on = false, running = false;
  const SCALE = [0, 2, 4, 7, 9, 12, 14, 16]; // pentatonic-ish over two octaves

  function size() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    boids.length = 0;
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      boids.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: Math.cos(a) * 1.1, vy: Math.sin(a) * 1.1,
        side: 0, flash: 0, g: i % 3
      });
    }
  }

  // the harmonic line: a diagonal chord across the field
  function line() {
    const y1 = H * 0.72, y2 = H * 0.24;
    return { x1: W * 0.06, y1, x2: W * 0.94, y2 };
  }
  function sideOf(b, L) {
    return Math.sign((L.x2 - L.x1) * (b.y - L.y1) - (L.y2 - L.y1) * (b.x - L.x1)) || 1;
  }

  function ping(b) {
    events++;
    if (readout) readout.textContent = 'EVENTS ' + String(events).padStart(4, '0');
    if (!on || !audio) return;
    const t = audio.currentTime;
    const step = SCALE[Math.floor((1 - b.y / H) * SCALE.length) % SCALE.length] || 0;
    const freq = 174.61 * Math.pow(2, (step + b.g * 5) / 12);
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = b.g === 2 ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.075, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g).connect(audio.destination);
    o.start(t); o.stop(t + 0.55);
  }

  const HUES = ['hsl(212 78% 66%)', 'hsl(196 74% 62%)', 'hsl(18 86% 60%)'];

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    ctx.clearRect(0, 0, W, H);
    const L = line();

    // line
    ctx.save();
    ctx.strokeStyle = 'hsla(18,84%,54%,0.75)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(L.x1, L.y1); ctx.lineTo(L.x2, L.y2); ctx.stroke();
    ctx.setLineDash([3, 6]); ctx.strokeStyle = 'hsla(222,56%,44%,0.3)';
    ctx.beginPath(); ctx.moveTo(L.x1, L.y1 + 14); ctx.lineTo(L.x2, L.y2 + 14); ctx.stroke();
    ctx.restore();

    for (const b of boids) {
      let ax = 0, ay = 0, cx = 0, cy = 0, hx = 0, hy = 0, n = 0;
      for (const o of boids) {
        if (o === b) continue;
        const dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 > 15000) continue;
        n++; cx += o.x; cy += o.y; hx += o.vx; hy += o.vy;
        if (d2 < 900) { ax -= dx / (d2 + 1) * 26; ay -= dy / (d2 + 1) * 26; }
      }
      if (n) {
        ax += ((cx / n) - b.x) * 0.0011 + (hx / n - b.vx) * 0.045;
        ay += ((cy / n) - b.y) * 0.0011 + (hy / n - b.vy) * 0.045;
      }
      const mdx = mouse.x - b.x, mdy = mouse.y - b.y, md = Math.hypot(mdx, mdy);
      if (md < 130 && md > 0.1) { ax -= mdx / md * 0.42; ay -= mdy / md * 0.42; }

      b.vx += ax; b.vy += ay;
      const s = Math.hypot(b.vx, b.vy) || 1;
      const target = 1.25;
      b.vx = b.vx / s * target; b.vy = b.vy / s * target;
      b.x += b.vx; b.y += b.vy;
      if (b.x < 0) b.x += W; if (b.x > W) b.x -= W;
      if (b.y < 0) b.y += H; if (b.y > H) b.y -= H;

      const sd = sideOf(b, L);
      if (b.side && sd !== b.side) { b.flash = 1; ping(b); }
      b.side = sd;

      const ang = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y); ctx.rotate(ang);
      if (b.flash > 0.02) {
        ctx.beginPath(); ctx.arc(0, 0, 5 + b.flash * 16, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(18,84%,54%,${b.flash * 0.6})`; ctx.lineWidth = 1.2; ctx.stroke();
        b.flash *= 0.9;
      }
      ctx.beginPath(); ctx.moveTo(6.5, 0); ctx.lineTo(-4.5, 3.2); ctx.lineTo(-4.5, -3.2); ctx.closePath();
      ctx.fillStyle = HUES[b.g]; ctx.globalAlpha = 0.86; ctx.fill();
      ctx.restore();
    }
  }

  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

  if (btn) btn.addEventListener('click', () => {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    on = !on;
    btn.textContent = on ? '◼ Sound on' : '▶ Sound off';
    btn.classList.toggle('acc', on);
  });

  addEventListener('resize', () => { size(); });
  size(); seed();
  // visibility polled on rAF — IntersectionObserver callbacks are not guaranteed
  if (reduce) { running = true; frame(); running = false; }
  else {
    (function watch() {
      const r = canvas.getBoundingClientRect();
      const vis = r.bottom > 0 && r.top < (innerHeight || 800);
      if (vis && !running) { running = true; frame(); }
      else if (!vis) running = false;
      setTimeout(watch, 250);
    })();
  }
})();
