// boids.js
(() => {
  const canvas = document.getElementById("boids");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let width = 0;
  let height = 0;

  const BOID_COUNT = 60;
  const BASE_SPEED = 1.08; // EDIT: 20% faster base speed
  const MAX_FORCE = 0.05;
  const NEIGHBOR_RADIUS = 500;
  const MIN_SEP = 40;
  const TURN_MIN_MS = 1000;
  const TURN_MAX_MS = 4000;
  const MAX_TURN_RATE = Math.PI / 3; // radians per second
  const MOUSE_RADIUS = 70;

  const groups = [];
  const mouse = { x: -9999, y: -9999, active: false };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    width = Math.floor(window.innerWidth);
    height = Math.floor(window.innerHeight);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function pickSpeedMult() {
    const roll = Math.random();
    if (roll < 0.3) return 1.1;
    if (roll < 0.5) return 0.9;
    return 1.0;
  }

  function init() {
    groups.length = 0;
    const baseHeading = 0; // to the right
    const groupDefs = [
      { cx: width * 0.2, cy: height * 0.6, count: BOID_COUNT },
      { cx: width * 0.55, cy: height * 0.35, count: Math.round(BOID_COUNT * 1.2) },
      { cx: width * 0.8, cy: height * 0.7, count: Math.round(BOID_COUNT * 0.6) },
    ];

    groupDefs.forEach((group) => {
      const groupBoids = [];
      for (let i = 0; i < group.count; i += 1) {
        const heading = baseHeading + rand(-0.2, 0.2);
        const speedMult = pickSpeedMult();
        const hue = 30 + rand(-30, 30); // EDIT: orange/coral/yellow range
        const lightness = 55 + rand(-12, 12);
        const diameter = 20 + rand(-5, 5);
        groupBoids.push({
          x: group.cx + rand(-40, 40),
          y: group.cy + rand(-40, 40),
          vx: Math.cos(heading) * BASE_SPEED * speedMult,
          vy: Math.sin(heading) * BASE_SPEED * speedMult,
          heading,
          targetHeading: heading,
          nextTurnAt: performance.now() + rand(TURN_MIN_MS, TURN_MAX_MS),
          speedMult,
          radius: diameter / 2,
          stroke: `hsla(${hue} 85% ${lightness}% / 0.8)`, // EDIT: 50% opacity
        });
      }
      groups.push(groupBoids);
    });
  }

  function wrapAngle(rad) {
    while (rad > Math.PI) rad -= Math.PI * 2;
    while (rad < -Math.PI) rad += Math.PI * 2;
    return rad;
  }

  function step(now) {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;

    for (let g = 0; g < groups.length; g += 1) {
      const groupBoids = groups[g];
      for (let i = 0; i < groupBoids.length; i += 1) {
        const b = groupBoids[i];
        let align = { x: 0, y: 0 };
        let coh = { x: 0, y: 0 };
        let sep = { x: 0, y: 0 };
        let count = 0;

        for (let j = 0; j < groupBoids.length; j += 1) {
          if (i === j) continue;
          const other = groupBoids[j];
          const dx = other.x - b.x;
          const dy = other.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < NEIGHBOR_RADIUS) {
            align.x += other.vx;
            align.y += other.vy;
            coh.x += other.x;
            coh.y += other.y;
            count += 1;
          }

          if (dist > 0 && dist < MIN_SEP) {
            const push = (MIN_SEP - dist) / MIN_SEP;
            sep.x -= (dx / dist) * push;
            sep.y -= (dy / dist) * push;
          }
        }

        if (count > 0) {
          align.x /= count;
          align.y /= count;
          coh.x = coh.x / count - b.x;
          coh.y = coh.y / count - b.y;
        }

        const accel = {
          x: align.x * 0.02 + coh.x * 0.001 + sep.x * 0.6,
          y: align.y * 0.02 + coh.y * 0.001 + sep.y * 0.6,
        };

        // mouse repulsion (strong, only within 70px)
        if (mouse.active) {
          const mx = b.x - mouse.x;
          const my = b.y - mouse.y;
          const md = Math.hypot(mx, my);
          if (md > 0 && md < MOUSE_RADIUS) {
            const strength = (MOUSE_RADIUS - md) / MOUSE_RADIUS;
            accel.x += (mx / md) * strength * 3.5;
            accel.y += (my / md) * strength * 3.5;
          }
        }

        const forceMag = Math.hypot(accel.x, accel.y);
        if (forceMag > MAX_FORCE) {
          accel.x = (accel.x / forceMag) * MAX_FORCE;
          accel.y = (accel.y / forceMag) * MAX_FORCE;
        }

        b.vx += accel.x;
        b.vy += accel.y;

        const speed = Math.hypot(b.vx, b.vy) || (BASE_SPEED * b.speedMult);
        const targetSpeed = BASE_SPEED * b.speedMult;
        const clampedSpeed = clamp(speed, targetSpeed * 0.7, targetSpeed * 1.3);
        b.heading = Math.atan2(b.vy, b.vx);

        if (now >= b.nextTurnAt) {
          b.targetHeading = b.heading + rand(-Math.PI / 6, Math.PI / 6);
          b.nextTurnAt = now + rand(TURN_MIN_MS, TURN_MAX_MS);
        }

        const diff = wrapAngle(b.targetHeading - b.heading);
        const maxStep = MAX_TURN_RATE * (1 / 60);
        b.heading += clamp(diff, -maxStep, maxStep);

        b.vx = Math.cos(b.heading) * clampedSpeed;
        b.vy = Math.sin(b.heading) * clampedSpeed;

        b.x += b.vx;
        b.y += b.vy;

        // wrap at edges
        if (b.x < 0) b.x += width;
        if (b.x > width) b.x -= width;
        if (b.y < 0) b.y += height;
        if (b.y > height) b.y -= height;

        ctx.strokeStyle = b.stroke;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    requestAnimationFrame(step);
  }

  window.addEventListener("resize", () => {
    resize();
    init();
  });

  window.addEventListener("mousemove", (e) => {
    mouse.active = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
    mouse.x = -9999;
    mouse.y = -9999;
  });

  resize();
  init();
  requestAnimationFrame(step);
})();
