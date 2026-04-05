(function () {
  const loader = document.getElementById('page-loader');
  const canvas = document.getElementById('loader-canvas');
  if (!loader || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Defer setup to first rAF so viewport dimensions are guaranteed correct
  // (window.innerWidth can be 0 at script-parse time on link-click navigation)
  requestAnimationFrame(function init() {
    const dpr = window.devicePixelRatio || 1;
    const vw = window.innerWidth || document.documentElement.clientWidth || 800;
    const vh = window.innerHeight || document.documentElement.clientHeight || 600;
    canvas.width = vw * dpr;
    canvas.height = vh * dpr;

    const W = canvas.width;
    const H = canvas.height;
    const centerX = W / 2;
    const centerY = H / 2;
    const ringRadius = 165 * dpr;
    const slotCount = 10;
    const slotSize = 27 * dpr;
    const blobColor = '#FFB88C';

    let slots = [];
    let blobs = [];
    let rotation = 0;
    let phase = 'spinning';
    let allSettledTime = null;
    let startTime = performance.now();
    let pulseStart, fadeStart;

    for (let i = 0; i < slotCount; i++) {
      const angle = (i / slotCount) * Math.PI * 2;
      slots.push({ angle, filled: false });
    }

    for (let i = 0; i < slotCount; i++) {
      const edge = Math.floor(Math.random() * 4);
      let startX, startY;
      if (edge === 0) { startX = Math.random() * W; startY = -30 * dpr; }
      else if (edge === 1) { startX = W + 30 * dpr; startY = Math.random() * H; }
      else if (edge === 2) { startX = Math.random() * W; startY = H + 30 * dpr; }
      else { startX = -30 * dpr; startY = Math.random() * H; }
      blobs.push({ x: startX, y: startY, vx: 0, vy: 0, targetSlot: i, settled: false, active: false, delay: 5 + i * 9 });
    }

    function getSlotPosition(slotIndex) {
      const angle = slots[slotIndex].angle + rotation;
      return {
        x: centerX + Math.cos(angle) * ringRadius,
        y: centerY + Math.sin(angle) * ringRadius
      };
    }

    function updateBlob(blob, elapsed) {
      if (blob.settled) {
        const pos = getSlotPosition(blob.targetSlot);
        blob.x = pos.x;
        blob.y = pos.y;
        return;
      }
      if (!blob.active) {
        if (elapsed > blob.delay) blob.active = true;
        else return;
      }
      const target = getSlotPosition(blob.targetSlot);
      const dx = target.x - blob.x;
      const dy = target.y - blob.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 3) {
        blob.settled = true;
        slots[blob.targetSlot].filled = true;
        blob.x = target.x;
        blob.y = target.y;
        return;
      }
      const gravity = 11.25;
      blob.vx += (dx / dist) * gravity;
      blob.vy += (dy / dist) * gravity;
      blob.vx *= 0.85;
      blob.vy *= 0.85;
      blob.x += blob.vx;
      blob.y += blob.vy;
    }

    function draw(elapsed) {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255, 184, 140, 0.4)';
      ctx.lineWidth = 2 * dpr;
      for (let i = 0; i < slotCount; i++) {
        if (slots[i].filled) continue;
        const angle = slots[i].angle + rotation;
        const x = centerX + Math.cos(angle) * ringRadius;
        const y = centerY + Math.sin(angle) * ringRadius;
        ctx.beginPath();
        ctx.arc(x, y, slotSize, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = blobColor;
      for (let blob of blobs) {
        if (!blob.active) continue;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, slotSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.font = `700 ${18 * dpr}px system-ui, sans-serif`;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const dots = '.'.repeat(Math.floor((elapsed / 150) % 4));
      ctx.fillText('loading' + dots, centerX, centerY);
    }

    function animate(now) {
      const elapsed = now - startTime;

      if (phase === 'spinning') {
        rotation += 0.035;
        for (let blob of blobs) updateBlob(blob, elapsed);
        if (blobs.every(b => b.settled) && !allSettledTime) allSettledTime = now;
        if (allSettledTime && now - allSettledTime > 18) { phase = 'pulse'; pulseStart = now; }
        draw(elapsed);
      }

      if (phase === 'pulse') {
        rotation += 0.035;
        const progress = (now - pulseStart) / 500;
        const scale = 1 + Math.sin(progress * Math.PI) * 0.04;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
        draw(elapsed);
        ctx.restore();
        // Ripple: expands outward from ring, fades as it grows
        const rippleRadius = ringRadius + 55 * dpr * progress;
        const rippleAlpha = 0.45 * (1 - progress);
        ctx.beginPath();
        ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 184, 140, ${rippleAlpha})`;
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
        if (progress >= 1) { phase = 'fadeout'; fadeStart = now; }
      }

      if (phase === 'fadeout') {
        const progress = (now - fadeStart) / 33;
        if (progress >= 1) {
          loader.classList.add('fade-out');
          setTimeout(() => loader.remove(), 89);
          return;
        }
        ctx.globalAlpha = 1 - progress;
        draw(elapsed);
        ctx.globalAlpha = 1;
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  });
})();
