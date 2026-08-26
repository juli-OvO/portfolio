// Lightweight boids — extracted intent from assets/boids.js.
// 3 flocks of orange/coral/yellow agents, mouse-repulse.

(function() {
  const NUM = 60;
  const MOUSE_R = 70;
  const VIS = 80;
  const SEP = 24;
  const W_ALIGN = 0.05, W_COH = 0.005, W_SEP = 0.06, W_REP = 0.6;
  const MAXV = 2.6;

  const c = document.getElementById('boids');
  if (!c) return;
  const x = c.getContext('2d');
  let W, H;
  function resize() {
    const dpr = devicePixelRatio || 1;
    W = c.width = innerWidth * dpr;
    H = c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);

  const mouse = { x: -9999, y: -9999 };
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  const flocks = [0, 30, 60].map(huebase => {
    const arr = [];
    for (let i = 0; i < NUM; i++) {
      arr.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        r: 5 + Math.random() * 5,
        hue: huebase + Math.random() * 30 - 10
      });
    }
    return arr;
  });

  function step(b, flock) {
    let ax = 0, ay = 0, cx = 0, cy = 0, sx = 0, sy = 0, n = 0;
    for (const o of flock) {
      if (o === b) continue;
      const dx = o.x - b.x, dy = o.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d < VIS) {
        ax += o.vx; ay += o.vy;
        cx += o.x; cy += o.y;
        n++;
        if (d < SEP) { sx -= dx; sy -= dy; }
      }
    }
    if (n > 0) {
      ax = (ax / n - b.vx) * W_ALIGN;
      ay = (ay / n - b.vy) * W_ALIGN;
      cx = (cx / n - b.x) * W_COH;
      cy = (cy / n - b.y) * W_COH;
    }
    sx *= W_SEP; sy *= W_SEP;
    // mouse repulse
    const mdx = b.x - mouse.x, mdy = b.y - mouse.y, md = Math.hypot(mdx, mdy);
    if (md < MOUSE_R) { sx += (mdx / md) * W_REP * (MOUSE_R - md); sy += (mdy / md) * W_REP * (MOUSE_R - md); }
    b.vx += ax + cx + sx;
    b.vy += ay + cy + sy;
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > MAXV) { b.vx = b.vx / sp * MAXV; b.vy = b.vy / sp * MAXV; }
    b.x += b.vx; b.y += b.vy;
    if (b.x < -10) b.x = innerWidth + 10; if (b.x > innerWidth + 10) b.x = -10;
    if (b.y < -10) b.y = innerHeight + 10; if (b.y > innerHeight + 10) b.y = -10;
  }

  function loop() {
    x.clearRect(0, 0, innerWidth, innerHeight);
    x.lineWidth = 1.2;
    for (const flock of flocks) {
      for (const b of flock) {
        step(b, flock);
        x.strokeStyle = `hsla(${b.hue} 85% 55% / 0.85)`;
        x.beginPath();
        x.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        x.stroke();
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
