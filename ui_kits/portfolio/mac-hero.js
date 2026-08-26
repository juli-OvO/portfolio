/* Heads Up hero — three.js MacBook that tumbles through three scroll phases.
   Frosted panels are in the page DOM above the canvas; this module owns the model,
   the scroll-driven pose, and the shrink-out on release.

   Animation is strictly opt-in: if frames aren't delivered or WebGL is missing,
   the page falls back to a static stacked layout (see .no3d in the page CSS).

   three.js is fetched at runtime via dynamic import from a URL built at call time,
   so the file carries no static package dependency. */
const THREE_URL = 'https://unpkg.com/three@' + '0.160.0' + '/build/three.module.js';

const stage = document.getElementById('macStage');
const scroller = document.getElementById('macScroll');
if (stage && scroller) init();

function fail() { document.documentElement.classList.add('no3d'); }

async function init() {
  // Gate on reduced-motion only. Frames may never arrive (a hidden/backgrounded tab
  // fires no rAF at all), so this waits but never blocks: it resolves either way and
  // proceeds to build the scene. The render loop picks up frames when the tab is shown.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return fail();
  if (document.hidden) {
    await new Promise(res => {
      const done = () => { document.removeEventListener('visibilitychange', done); res(); };
      document.addEventListener('visibilitychange', done);
      setTimeout(done, 3000);
    });
  }
  await new Promise(res => {
    let settled = false;
    const settle = () => { if (!settled) { settled = true; res(); } };
    setTimeout(settle, 3000);
    requestAnimationFrame(() => requestAnimationFrame(settle));
  });
  if (!window.gsap) {
    // GSAP may still be parsing; wait for it briefly rather than bailing outright
    await new Promise(res => {
      const t0 = performance.now();
      (function poll() {
        if (window.gsap || performance.now() - t0 > 4000) return res();
        setTimeout(poll, 60);
      })();
    });
  }
  if (!window.gsap) return fail();

  let THREE;
  try { THREE = await import(/* @vite-ignore */ THREE_URL); }
  catch (e) { return fail(); }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) { return fail(); }
  document.documentElement.classList.remove('no3d');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.35, 8.4);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  stage.appendChild(renderer.domElement);

  // ---- lighting: bright paper-room, soft ----
  scene.add(new THREE.HemisphereLight(0xfff6ec, 0xd6cdbe, 1.05));
  const key = new THREE.DirectionalLight(0xffeddb, 2.05);
  key.position.set(3.4, 5, 4.2); scene.add(key);
  const fill = new THREE.DirectionalLight(0xd6e4ff, 1.32);
  fill.position.set(-4.2, 1.4, 2.6); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfffaf2, 1.62);
  rim.position.set(-1.2, 2.4, -5); scene.add(rim);

  // ---- screen texture: real site capture, with the drawn placeholder as fallback ----
  function screenTexture() {
    const c = document.createElement('canvas');
    c.width = 1600; c.height = 1000;
    const x = c.getContext('2d');
    x.fillStyle = '#f7f4ee'; x.fillRect(0, 0, 1600, 1000);
    x.strokeStyle = 'rgba(60,96,180,.16)'; x.lineWidth = 2;
    for (let i = 0; i < 1600; i += 64) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1000); x.stroke(); }
    for (let i = 0; i < 1000; i += 64) { x.beginPath(); x.moveTo(0, i); x.lineTo(1600, i); x.stroke(); }
    // faux page blocks
    x.fillStyle = '#2b4fa8'; x.fillRect(0, 0, 1600, 96);
    x.fillStyle = 'rgba(255,255,255,.9)'; x.fillRect(72, 40, 210, 18);
    [1050, 1220, 1390].forEach(px => x.fillRect(px, 42, 118, 14));
    x.fillStyle = '#2a2018'; x.font = '700 104px ui-monospace, monospace';
    x.fillText('Heads Up', 90, 300);
    x.font = '700 104px ui-monospace, monospace'; x.fillStyle = '#e2622a';
    x.fillText('prototype', 90, 416);
    x.fillStyle = 'rgba(42,32,24,.45)'; x.font = '38px ui-monospace, monospace';
    x.fillText('Coded HTML / CSS / JS build', 92, 492);
    x.font = '700 32px ui-monospace, monospace';
    const btnLbl = 'Explore programs', btnTw = x.measureText(btnLbl).width;
    x.fillStyle = '#e2622a'; x.fillRect(90, 546, btnTw + 64, 76);
    x.fillStyle = '#fff';
    x.fillText(btnLbl, 122, 594);
    [0, 1, 2].forEach(i => {
      x.fillStyle = 'rgba(42,32,24,.09)';
      x.fillRect(90 + i * 480, 700, 420, 240);
      x.fillStyle = 'rgba(42,32,24,.3)'; x.font = '700 28px ui-monospace, monospace';
      x.fillText('Program 0' + (i + 1), 120 + i * 480, 760);
    });
    x.strokeStyle = 'rgba(226,98,42,.9)'; x.setLineDash([14, 10]); x.lineWidth = 5;
    x.strokeRect(14, 14, 1572, 972);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  // ---- rounded-box helper (thin bevel reads as machined aluminium) ----
  function slab(w, h, d, r = 0.06) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: 0.022, bevelSize: 0.022, bevelSegments: 4, curveSegments: 14 });
    g.center();
    return g;
  }

  // rounded-rect face, so the bezel corners follow the lid instead of squaring off
  function roundedFace(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return new THREE.ShapeGeometry(s, 14);
  }

  // faint corner glint for the aluminium lid — kept off the display, whose artwork is already near-white
  function glintTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 190, 190);
    g.addColorStop(0, 'rgba(255,255,255,.20)');
    g.addColorStop(.55, 'rgba(255,255,255,.03)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  const alu = new THREE.MeshStandardMaterial({ color: 0xdcdce0, metalness: 0.82, roughness: 0.29 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, metalness: 0.5, roughness: 0.55 });

  const mac = new THREE.Group();

  // base
  const base = new THREE.Mesh(slab(3.3, 2.28, 0.13, 0.1), alu);
  base.rotation.x = -Math.PI / 2;
  base.name = 'Base';
  mac.add(base);
  // keyboard well + trackpad
  const well = new THREE.Mesh(new THREE.PlaneGeometry(2.86, 1.06), dark);
  well.rotation.x = -Math.PI / 2; well.position.set(0, 0.092, -0.36);
  mac.add(well);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 0.76), new THREE.MeshStandardMaterial({ color: 0xc8c8cc, metalness: 0.4, roughness: 0.5 }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.094, 0.62);
  mac.add(pad);

  // lid, hinged at the back edge
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.06, -1.14);
  const lid = new THREE.Mesh(slab(3.3, 2.24, 0.075, 0.1), alu);
  lid.position.set(0, 1.12, -0.04);
  lid.name = 'Lid';
  lidPivot.add(lid);
  // the lid's bevel adds ~0.022 of depth per side, so the face stack sits at z >= 0.024 to clear it
  const bezel = new THREE.Mesh(roundedFace(3.16, 2.1, 0.075), dark);
  bezel.position.set(0, 1.12, 0.024);
  lidPivot.add(bezel);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture() });
  // the capture is a full tall page; the display shows a window onto it that pans down
  // as the scroll advances, so each scene lands on a different part of the site
  let scanTex = null, scanSpan = 0;
  new THREE.TextureLoader().load('assets/hu-style.png', tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const target = 2.98 / 1.9, src = tex.image.width / tex.image.height;
    if (src > target) {
      // wider than the display: crop the sides, no vertical travel
      tex.repeat.set(target / src, 1); tex.offset.x = (1 - target / src) / 2;
    } else {
      // taller than the display: full width, and a window that can travel vertically
      const h = src / target;
      tex.repeat.set(1, h); tex.offset.x = 0;
      scanSpan = 1 - h; scanTex = tex;
      tex.offset.y = scanSpan; // start at the top of the page
    }
    screenMat.map = tex; screenMat.needsUpdate = true;
  });
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.98, 1.9),
    screenMat
  );
  screen.position.set(0, 1.14, 0.030);
  screen.name = 'Screen';
  lidPivot.add(screen);
  // glint sits on the bezel frame, not over the artwork
  const glint = new THREE.Mesh(
    roundedFace(3.16, 2.1, 0.075),
    new THREE.MeshBasicMaterial({ map: glintTexture(), transparent: true, depthWrite: false })
  );
  glint.position.set(0, 1.12, 0.027);
  glint.name = 'BezelGlint';
  lidPivot.add(glint);
  lidPivot.rotation.x = -0.42; // open
  mac.add(lidPivot);

  mac.position.y = -0.4;
  scene.add(mac);

  // ---- pose state, driven by a scrubbed timeline ----
  // ry sweeps in ONE direction from scene 1 onward: -0.62 → +0.52 → 2π (face-on),
  // then continues past 2π to land the docked icon on scene 2's exact angle.
  const POSE = {
    // load: face-on, filling the frame
    // load: pushed right up to the screen — the machine's edges leave frame
    intro: { rx: 0, ry: 0, rz: 0, s: 2.4, y: -2.52, slot: 0, lid: -0.10, drift: 1, fitV: 0, scan: 0 },
    // 01 overview — panel sits left, machine takes the free zone to its right
    p1:    { rx: 0.34, ry: -0.62, rz: 0.10, s: 1.00, y: -0.40, slot: 1, lid: -0.42, drift: 1, fitV: 0, scan: 0 },
    // 02 role — panel sits right, machine takes the free zone to its left
    p2:    { rx: 0.10, ry: 0.52, rz: -0.16, s: 0.96, y: -0.30, slot: -1, lid: -0.30, drift: 1, fitV: 0, scan: 0.5 },
    // 03 tools — face-on and centered, wedged between the fixed nav and the tools panel.
    // drift:0 because clearance on both edges is smaller than the idle sine's amplitude.
    p3:    { rx: 0.05, ry: Math.PI * 2, rz: 0, s: 1.06, y: 0.16, slot: 0, lid: -0.34, drift: 0, fitV: 1, scan: 1 },
    // dock — icon in the bottom-left corner, turned to face INTO the page.
    // ry keeps sweeping the same direction (past 2π) and lands on scene 2's inward angle.
    dock:  { rx: 0.12, ry: Math.PI * 2 + 0.52, rz: -0.10, s: 0.34, y: 0, slot: 0, lid: -0.36, drift: 0, fitV: 0, scan: 1 }
  };
  // every key every pose can touch has to exist here from the start: GSAP refuses to
  // tween a property that isn't on the target yet ("Invalid property"), which used to
  // leave fitV unwritten and poison the spring below
  const pose = { ...POSE.intro, fitV: 0, dock: 0 };
  // What actually gets rendered. GSAP writes the scroll-exact `pose`; a critically-
  // under-damped spring chases it every frame, so wheel steps arrive as one continuous
  // motion with a little overshoot instead of a stair of discrete jumps.
  const shown = { ...pose };
  const vel = {};
  // omega = speed, zeta < 1 = overshoot. Rotation and travel get the bounce; scale,
  // dock and the fit blends stay critically damped so nothing pops past its frame.
  const SPRING = {
    rx: [13, 0.58], ry: [12, 0.55], rz: [13, 0.6], y: [12, 0.56],
    slot: [11, 0.6], lid: [14, 0.62],
    s: [15, 1], dock: [16, 1], fitV: [16, 1], drift: [10, 1], scan: [9, 1]
  };
  function settle(dt) {
    for (const k in pose) {
      const target = pose[k];
      if (typeof target !== 'number') { shown[k] = target; continue; }
      const [w, z] = SPRING[k] || [16, 1];
      const v = vel[k] || 0;
      // must be a number, not just non-nullish — a stray string here concatenates
      // instead of adding and permanently NaNs the pose
      const x = typeof shown[k] === 'number' && isFinite(shown[k]) ? shown[k] : target;
      // semi-implicit damped-spring integration — stable at any frame rate
      const a = w * w * (target - x) - 2 * z * w * v;
      const nv = v + a * dt;
      vel[k] = nv;
      shown[k] = x + nv * dt;
    }
  }

  // Main pose timeline — ends before the pin releases, so the dock can run on its own
  // trigger and overlap the covering content.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scroller, start: 'top top', end: 'bottom bottom', scrub: 0.35,
      onUpdate: s => {
        stage.classList.toggle('past', s.progress > 0.12);
        document.documentElement.classList.toggle('macpast', s.progress > 0.12);
      }
    }
  });
  tl.to(pose, { duration: 0.4 })                                        // hold the front view
    .to(pose, { ...POSE.p1, duration: 1.1, ease: 'expo.inOut' })        // zoom out into scene 1
    .to(pose, { duration: 0.55 })
    .to(pose, { ...POSE.p2, duration: 1.1, ease: 'power3.inOut' })      // scene 1 → 2
    .to(pose, { duration: 0.55 })
    .to(pose, { ...POSE.p3, duration: 1.5, ease: 'power3.inOut' })      // all the way around, face middle
    .to(pose, { duration: 0.9 });                                       // hold while panel 3 rises

  // Dock — its own trigger, keyed to the COVERING content rather than the pin, so the
  // icon conversion and the cover happen on the same scroll beat.
  const postmac = document.querySelector('.postmac');
  if (postmac) {
    // fromTo with immediateRender:false — an ordinary .to() captures its start values
    // during ScrollTrigger's refresh (scroll at 0, pose still at intro), which snapped
    // the machine back to full screen and added a spurious extra revolution.
    gsap.fromTo(pose, { ...POSE.p3, dock: 0 }, {
      ...POSE.dock, dock: 1, ease: 'power2.inOut', immediateRender: false,
      scrollTrigger: {
        trigger: postmac, start: 'top bottom', end: 'top top+=42%', scrub: 0.7,
        // onUpdate stops firing once the scroll passes `end`, so the terminal state is
        // set by onLeave/onEnterBack as well — otherwise .clip never lands and the
        // full-viewport canvas keeps sitting above the page content.
        onUpdate: s => {
          stage.classList.toggle('dock', s.progress > 0.02);
          stage.classList.toggle('clip', s.progress > 0.9);
        },
        onLeave: () => stage.classList.add('dock', 'clip'),
        onEnterBack: () => stage.classList.remove('clip'),
        onLeaveBack: () => stage.classList.remove('dock', 'clip')
      }
    });
  }

  // ---- panel tempo: cues live ON the master timeline, so glass and machine share
  // one playhead. (Separate scrubbed fromTo triggers fight ScrollTrigger.refresh()
  // re-applying the from-state and never render their end values.) ----
  const cue = {
    0: { in: [0.4, 1.1], out: [2.05, 0.55] },   // 01 rides scene 1, leaves as it turns
    1: { in: [2.2, 0.85], out: [3.6, 0.7] },    // 02 rides scene 2
    2: { in: [4.6, 0.9], out: null }            // 03 rises from below and STAYS
  };
  document.querySelectorAll('.gpanel').forEach(p => {
    const c = cue[p.dataset.phase];
    if (!c) return;
    const rise = p.dataset.phase === '2';
    tl.fromTo(p,
      { autoAlpha: 0, y: rise ? 120 : 46 },
      { autoAlpha: 1, y: 0, duration: c.in[1], ease: 'power3.out' }, c.in[0]);
    if (c.out) tl.to(p, { autoAlpha: 0, y: -40, duration: c.out[1], ease: 'power2.in' }, c.out[0]);
  });

  // ---- responsive slot geometry -------------------------------------------------
  // Absolute world offsets don't survive a viewport change: the same number lands
  // beside the panel on one screen and half a screen away on another. Instead each
  // side's target is measured from the REAL panel rects, so the machine always sits
  // centred in whatever gap the copy leaves it, at whatever size that gap allows.
  // Real extents, measured once from the built object rather than guessed — the
  // projected width changes with ry, so a constant would under-report at some poses.
  const MAC_BOX = new THREE.Box3().setFromObject(mac);
  const MAC_W = Math.max(MAC_BOX.max.x - MAC_BOX.min.x, 0.1);
  const MAC_H = Math.max(MAC_BOX.max.y - MAC_BOX.min.y, 0.1);
  // the model's mass sits above its origin, so centring the origin in a band
  // leaves the machine riding high — this is the correction, in model units
  const MAC_CY = (MAC_BOX.max.y + MAC_BOX.min.y) / 2;
  const slots = { left: 0, right: 0, sLeft: 1, sRight: 1, midY: 0, sMid: 1 };

  function measureSlots() {
    const W = innerWidth || 1;
    const hh = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
    const hw = hh * camera.aspect;
    const pxToWorld = (2 * hw) / W;
    const r0 = document.querySelector('.gpanel.p0')?.getBoundingClientRect();
    const r1 = document.querySelector('.gpanel.p1')?.getBoundingClientRect();
    const pad = 18;
    // free zone LEFT of the right-anchored panel (used by scene 02)
    const leftEnd = r1 ? r1.left - pad : W * 0.5;
    slots.left = ((leftEnd / 2) - W / 2) * pxToWorld;
    slots.sLeft = Math.max(0.42, Math.min(1, (leftEnd * pxToWorld * 0.92) / MAC_W));
    // free zone RIGHT of the left-anchored panel (used by scene 01)
    const rightStart = r0 ? r0.right + pad : W * 0.5;
    slots.right = (((rightStart + W) / 2) - W / 2) * pxToWorld;
    slots.sRight = Math.max(0.42, Math.min(1, ((W - rightStart) * pxToWorld * 0.92) / MAC_W));
    // free vertical band for scene 03: below the fixed nav, above the tools panel.
    // .chrome's height is a px constant, so this has to be measured, not assumed.
    const H = innerHeight || 1;
    const nav = document.querySelector('.chrome')?.getBoundingClientRect();
    const r2 = document.querySelector('.gpanel.p2')?.getBoundingClientRect();
    const bandTop = (nav ? nav.bottom : 0) + pad;
    const bandBot = (r2 ? r2.top : H) - pad;
    const bandH = Math.max(bandBot - bandTop, 40);
    // world y is +up from viewport centre, so invert the px midpoint
    slots.midY = (H / 2 - (bandTop + bandBot) / 2) * pxToWorld;
    slots.sMid = Math.max(0.42, Math.min(1.25, (bandH * pxToWorld * 0.94) / MAC_H));
  }

  function resize() {
    const r = stage.getBoundingClientRect();
    if (!r.width) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.fov = r.width < 760 ? 46 : 34;
    camera.updateProjectionMatrix();
    measureSlots();
  }
  addEventListener('resize', resize);
  resize();

  let t0 = performance.now(), tPrev = t0;
  (function loop(t) {
    requestAnimationFrame(loop);
    const drift = (t - t0) / 1000;
    settle(Math.min((t - tPrev) / 1000, 1 / 30)); // clamp: a tab-switch stall must not explode the spring
    tPrev = t;
    const calm = (shown.drift ?? 1) * (1 - shown.dock); // held/docked poses hold still
    // corner target recomputed every frame so docking survives a resize
    const hh = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
    const hw = hh * camera.aspect;
    const dockX = -(hw - 1.15), dockY = -(hh - 0.78);

    mac.rotation.set(
      shown.rx + Math.sin(drift * 0.5) * 0.022 * calm,
      shown.ry + Math.sin(drift * 0.34) * 0.03 * calm,
      shown.rz
    );
    // slot -1 → left gap, 0 → centre, +1 → right gap; both measured from live panel rects
    const slot = shown.slot ?? 0;
    const mag = Math.min(Math.abs(slot), 1);
    const slotX = slot < 0 ? slots.left * -slot : slots.right * slot;
    // horizontal fit for the side poses
    const sideFit = Math.min(shown.s, shown.s * (slot < 0 ? slots.sLeft : slots.sRight));
    // vertical fit for the centred pose — sits in the measured band, sized to it
    const v = shown.fitV ?? 0;
    const fitS = shown.s * (1 - mag) + sideFit * mag;
    const fit = fitS * (1 - v) + Math.min(fitS, slots.sMid) * v;
    const posY = shown.y * (1 - v) + (slots.midY - MAC_CY * fit) * v;

    mac.position.x = slotX * (1 - shown.dock) + dockX * shown.dock;
    mac.position.y = (posY + Math.sin(drift * 0.62) * 0.05 * calm) * (1 - shown.dock) + dockY * shown.dock;
    mac.scale.setScalar(Math.max(0.01, fit * (1 - shown.dock) + shown.s * shown.dock));
    lidPivot.rotation.x = shown.lid;
    // pan the page capture: scan 0 = top of the site, 1 = bottom
    if (scanTex) scanTex.offset.y = scanSpan * (1 - Math.max(0, Math.min(1, shown.scan ?? 0)));
    renderer.render(scene, camera);
  })(t0);

  document.documentElement.classList.add('has3d');
  ScrollTrigger.refresh();
}
