/* @ds-bundle: {"format":4,"namespace":"PortfolioDesignSystem_77641a","components":[],"sourceHashes":{"assets/boids.js":"b55abef0a215","ui_kits/portfolio/app.js":"0e8b3881d550","ui_kits/portfolio/boid-mini.js":"ebbf3ed233fb","ui_kits/portfolio/boids-runtime.js":"97dd35339865","ui_kits/portfolio/braindump-schema.js":"46ce55794ba1","ui_kits/portfolio/braindump.js":"05dc8249555d","ui_kits/portfolio/case-page.js":"b79c0a1dbe00","ui_kits/portfolio/case-study.js":"813556e32406","ui_kits/portfolio/components.js":"fe3197c07638","ui_kits/portfolio/content-editor.js":"0af014d54428","ui_kits/portfolio/content-schema.js":"d78b727d1ae5","ui_kits/portfolio/cs-sections.js":"76d1aa77e618","ui_kits/portfolio/drawings.js":"82aac70d85ea","ui_kits/portfolio/folder-desk-ui.js":"996386c3e934","ui_kits/portfolio/illus-gallery.js":"1d3a0e809f0c","ui_kits/portfolio/image-slot.js":"fff26d081c8d","ui_kits/portfolio/mac-hero.js":"07c12291f310","ui_kits/portfolio/page-swipe.js":"4fa72c3250ee","ui_kits/portfolio/transitions.js":"dd1438167834"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PortfolioDesignSystem_77641a = window.PortfolioDesignSystem_77641a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/boids.js
try { (() => {
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
  const mouse = {
    x: -9999,
    y: -9999,
    active: false
  };
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
    const groupDefs = [{
      cx: width * 0.2,
      cy: height * 0.6,
      count: BOID_COUNT
    }, {
      cx: width * 0.55,
      cy: height * 0.35,
      count: Math.round(BOID_COUNT * 1.2)
    }, {
      cx: width * 0.8,
      cy: height * 0.7,
      count: Math.round(BOID_COUNT * 0.6)
    }];
    groupDefs.forEach(group => {
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
          stroke: `hsla(${hue} 85% ${lightness}% / 0.8)` // EDIT: 50% opacity
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
        let align = {
          x: 0,
          y: 0
        };
        let coh = {
          x: 0,
          y: 0
        };
        let sep = {
          x: 0,
          y: 0
        };
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
            sep.x -= dx / dist * push;
            sep.y -= dy / dist * push;
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
          y: align.y * 0.02 + coh.y * 0.001 + sep.y * 0.6
        };

        // mouse repulsion (strong, only within 70px)
        if (mouse.active) {
          const mx = b.x - mouse.x;
          const my = b.y - mouse.y;
          const md = Math.hypot(mx, my);
          if (md > 0 && md < MOUSE_RADIUS) {
            const strength = (MOUSE_RADIUS - md) / MOUSE_RADIUS;
            accel.x += mx / md * strength * 3.5;
            accel.y += my / md * strength * 3.5;
          }
        }
        const forceMag = Math.hypot(accel.x, accel.y);
        if (forceMag > MAX_FORCE) {
          accel.x = accel.x / forceMag * MAX_FORCE;
          accel.y = accel.y / forceMag * MAX_FORCE;
        }
        b.vx += accel.x;
        b.vy += accel.y;
        const speed = Math.hypot(b.vx, b.vy) || BASE_SPEED * b.speedMult;
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
  window.addEventListener("mousemove", e => {
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/boids.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/app.js
try { (() => {
// App — wires up the click-thru prototype.
(function () {
  const {
    el: makeEl,
    makeCursor,
    makeModeToggle,
    makeStatusBar,
    makeCredit,
    pillBtn,
    makeFolder,
    topicItem,
    cvSection
  } = window.PK;
  const el = makeEl;

  // ---------- Data ----------
  // Each work lists `sections` — an ordered composition of section blocks.
  // Three deliberately different combos demonstrate the range:
  //   • Music Boids  — editorial deep-dive (hero-bg + marquee + concept + breakdown
  //                     + prose + text/image + steps + hover-terms + grid + detail + refs + final)
  //   • Orbit        — narrative/visual (split hero + concept + text/image + grid + refs + final)
  //   • Illustration — gallery-forward (carousel + marquee + concept + final)
  // NOTE: images are demo placeholders mapped to invented sections to show the
  // layouts; the production site keeps its own image→section mapping.
  const WORKS = [{
    id: 'music-boids',
    title: 'Music Boids',
    year: '2025',
    kind: 'Computational',
    img: 'assets/boid.png',
    deck: 'A flocking-system instrument that maps spatial behaviour to generative sound.',
    sections: [{
      type: 'heroBg',
      img: 'assets/boid.png',
      deck: 'A flocking-system instrument that maps spatial behaviour to generative sound.'
    }, {
      type: 'marquee',
      items: ['Generative Audio', 'Flocking', 'WebAudio', 'Spatial Mapping', 'Emergence', 'Real-time']
    }, {
      type: 'concept',
      label: 'Concept',
      text: 'A flock that <span class="hl">hears itself.</span> The score isn’t written — it emerges from how the agents move.'
    }, {
      type: 'breakdown',
      label: 'At a glance',
      cells: [{
        k: 'Role',
        v: 'Solo author'
      }, {
        k: 'Year',
        v: '2025'
      }, {
        k: 'Tools',
        v: 'JS · WebAudio · Canvas'
      }, {
        k: 'Type',
        v: 'Generative instrument'
      }, {
        k: 'Context',
        v: 'RISD · self-directed'
      }]
    }, {
      type: 'prose',
      label: 'Purpose',
      paras: ['I wanted an instrument with no keys — something you conduct rather than play. The question was whether a system built only from simple local rules could feel expressive rather than random.', 'Flocking was the obvious substrate: legible, alive, and already full of the near-misses and sudden agreements that make music feel intentional.']
    }, {
      type: 'textImage',
      label: 'Goal',
      heading: 'Make movement audible',
      paras: ['Every audible event had to trace back to something you could see on screen, so the sound never felt arbitrary.', 'The mapping is deliberately thin — proximity, heading, and threshold-crossings — so the ear can learn the rules by watching.'],
      img: 'assets/illustration-2.png',
      cap: 'Voice-mapping sketch'
    }, {
      type: 'steps',
      label: 'How it was achieved',
      items: [{
        title: 'Sense',
        body: 'Each agent measures separation, alignment, and distance to the cursor every frame.'
      }, {
        title: 'Map',
        body: 'Threshold-crossings become events; position maps to pitch, velocity to dynamics.'
      }, {
        title: 'Voice',
        body: 'A small synth voice is triggered live — no samples, everything generated in the browser.'
      }]
    }, {
      type: 'hoverTerms',
      label: 'Approach',
      parts: ['Each ', {
        term: 'agent',
        img: 'assets/boid.png'
      }, ' fires a ', {
        term: 'voice',
        img: 'assets/illustration-3.png'
      }, ' as it crosses a threshold — separation, alignment, or distance to the cursor.']
    }, {
      type: 'processGrid',
      label: 'Process',
      items: [{
        img: 'assets/blender-prison.png',
        cap: 'Spatial test'
      }, {
        img: 'assets/illustration-2.png',
        cap: 'Voice map'
      }, {
        img: 'assets/illustration-3.png',
        cap: 'Event router'
      }, {
        img: 'assets/boid.png',
        cap: 'Flock field'
      }]
    }, {
      type: 'detail',
      img: 'assets/boid.png',
      cap: 'Live flock — three groups, orange / coral / yellow'
    }, {
      type: 'references',
      label: 'References',
      items: [{
        title: 'Boids — Craig Reynolds',
        src: 'SIGGRAPH 1987'
      }, {
        title: 'Formalized Music — Iannis Xenakis',
        src: '1971'
      }, {
        title: 'Brian Eno — generative music',
        src: 'talk, 1996'
      }]
    }, {
      type: 'final',
      label: 'Final',
      img: 'assets/boid.png',
      cap: 'Music Boids — live build'
    }]
  }, {
    id: 'orbit-of-desire',
    title: 'Orbit of Desire',
    year: '2025',
    kind: 'Game Design',
    img: 'assets/orbit-title.png',
    deck: 'A sci-fi romance visual novel set aboard an intergalactic botany research station.',
    sections: [{
      type: 'heroSplit',
      img: 'assets/orbit-title.png',
      deck: 'A sci-fi romance visual novel set aboard an intergalactic botany research station.'
    }, {
      type: 'concept',
      label: 'Concept',
      text: 'Tend the garden, tend the <span class="hl">relationship.</span> Light, heat, and humidity drive both the plants and the people.'
    }, {
      type: 'textImage',
      label: 'Premise',
      heading: 'Botany as romance',
      flip: true,
      paras: ['Players manage plant-growth systems while navigating branching dialogue, affection meters, and multiple endings.', 'Environmental variables quietly influence both plant mechanics and character relationships, so play and story share one set of rules.'],
      img: 'assets/orbit-uba-lab.png',
      cap: 'Uba — lab scene'
    }, {
      type: 'textImage',
      label: 'My role',
      heading: 'Character designer & illustrator',
      paras: ['I designed Uba’s full visual identity — pose variations, emotional states, silhouette clarity — and refined her arc with the writers.', 'The aim was to keep her unsettling edge without flattening her into a caricature.'],
      img: 'assets/orbit-title.png',
      cap: 'Title scene'
    }, {
      type: 'processGrid',
      label: 'Character process',
      items: [{
        img: 'assets/orbit-uba-lab.png',
        cap: 'Uba — final'
      }, {
        img: 'assets/illustration-2.png',
        cap: 'Expression sheet'
      }, {
        img: 'assets/illustration-3.png',
        cap: 'Silhouette study'
      }]
    }, {
      type: 'references',
      label: 'References',
      items: [{
        title: 'Visual-novel pacing',
        src: 'study'
      }, {
        title: 'Botanical illustration',
        src: 'archive'
      }]
    }, {
      type: 'final',
      label: 'Final',
      img: 'assets/orbit-title.png',
      cap: 'Orbit of Desire — title'
    }]
  }, {
    id: 'illustration',
    title: 'Illustration',
    year: '2024',
    kind: 'Fine Art',
    img: 'assets/illustration-1-preview.jpg',
    deck: 'Painterly digital illustration — narrative, character, mood.',
    sections: [{
      type: 'carousel',
      items: [{
        img: 'assets/illustration-1-preview.jpg',
        caption: 'study i'
      }, {
        img: 'assets/illustration-2.png',
        caption: 'study ii'
      }, {
        img: 'assets/illustration-3.png',
        caption: 'study iii'
      }, {
        img: 'assets/orbit-uba-lab.png',
        caption: 'character'
      }]
    }, {
      type: 'marquee',
      items: ['Procreate', 'Narrative', 'Character', 'Mood', 'Colour']
    }, {
      type: 'concept',
      label: 'Statement',
      text: 'Painting as <span class="hl">narrative shorthand</span> — a single frame that implies the whole story around it.'
    }, {
      type: 'final',
      label: 'Selected',
      img: 'assets/illustration-1-preview.jpg',
      cap: 'Selected illustration'
    }]
  }, {
    id: 'drawing',
    title: 'Drawing',
    year: '2025',
    kind: 'Fine Art',
    img: 'assets/drawing-class-1.jpeg',
    deck: 'Observational charcoal and graphite, RISD foundation studio.',
    sections: [{
      type: 'slides',
      items: [{
        img: 'assets/drawing-class-1.jpeg',
        caption: 'untitled (in-class drawing)',
        year: '2025'
      }, {
        img: 'assets/drawing-class-2.jpeg',
        caption: 'untitled (in-class drawing)',
        year: '2025'
      }]
    }, {
      type: 'concept',
      label: 'Statement',
      text: 'Observational charcoal — <span class="hl">light before line.</span>'
    }]
  }, {
    id: 'blender',
    title: 'Blender / 3D',
    year: '2024',
    kind: 'Computational',
    img: 'assets/blender-scene5.png',
    deck: 'Procedurally lit interior scenes built in Blender.',
    sections: [{
      type: 'carousel',
      items: [{
        img: 'assets/blender-scene5.png',
        caption: 'scene v'
      }, {
        img: 'assets/blender-prison.png',
        caption: 'interior study'
      }]
    }, {
      type: 'breakdown',
      label: 'At a glance',
      cells: [{
        k: 'Role',
        v: 'Solo'
      }, {
        k: 'Year',
        v: '2024'
      }, {
        k: 'Tools',
        v: 'Blender · Cycles'
      }, {
        k: 'Focus',
        v: 'Procedural lighting'
      }]
    }, {
      type: 'final',
      label: 'Final',
      img: 'assets/blender-scene5.png',
      cap: 'Scene V'
    }]
  }, {
    id: 'hellorsell',
    title: 'Hell or Sell',
    year: '2024',
    kind: 'Game Design',
    img: 'assets/hellorsell.png',
    deck: 'A satirical UI mockup for a make-believe fintech.',
    sections: [{
      type: 'heroBg',
      img: 'assets/hellorsell.png',
      deck: 'A satirical UI mockup for a make-believe fintech.'
    }, {
      type: 'steps',
      label: 'How it was made',
      items: [{
        title: 'Concept',
        body: 'A deliberately over-eager trading app — UI as satire.'
      }, {
        title: 'Type & motion',
        body: 'Loud type and pushy motion that keep selling even when you say no.'
      }]
    }, {
      type: 'final',
      label: 'Final',
      img: 'assets/hellorsell.png',
      cap: 'Hell or Sell — UI'
    }]
  }];
  // derive index/total/next
  WORKS.forEach((w, i) => {
    w.index = String(i + 1).padStart(2, '0');
    w.total = String(WORKS.length).padStart(2, '0');
    w.next = WORKS[(i + 1) % WORKS.length].title;
  });

  // ---------- Build app shell ----------
  function buildHomepage(onPick, onResume) {
    const root = el('div', {
      class: 'landing'
    });

    // Left: nav strip
    const previewCard = el('div', {
      class: 'preview-card',
      id: 'preview-card'
    });
    const previewPanel = el('div', {
      class: 'preview-panel'
    }, [previewCard, el('div', {
      class: 'preview-empty',
      id: 'preview-empty'
    }, 'Hover a work →')]);

    // ----- discipline folders: group works by kind -----
    const DISCIPLINES = [{
      tone: 'code',
      label: 'CODE',
      kind: 'Computational',
      heading: 'Computational'
    }, {
      tone: 'games',
      label: 'GAMES',
      kind: 'Game Design',
      heading: 'Game Design'
    }, {
      tone: 'art',
      label: 'ART',
      kind: 'Fine Art',
      heading: 'Fine Art'
    }];
    function disciplineBody(d) {
      const list = el('div', {
        class: 'works-list',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }
      });
      list.appendChild(el('div', {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.06em',
          opacity: '0.6',
          marginBottom: '2px'
        }
      }, d.heading));
      WORKS.filter(w => w.kind === d.kind).forEach(w => {
        list.appendChild(topicItem({
          title: w.title,
          year: w.year,
          onhover: () => showPreview(w),
          onclick: () => onPick(w)
        }));
      });
      return list;
    }

    // ----- INFO folder: bio + key credential + résumé link (fits fixed body) -----
    const infoBody = el('div', {
      class: 'cv-block',
      style: {
        gap: '14px'
      }
    }, [el('p', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        lineHeight: '1.6',
        margin: '0'
      }
    }, 'Visual artist & designer at RISD (Art & Computation) — building systems where logic meets imagination.'), cvSection('EDUCATION', [{
      text: 'RISD — BFA Art & Computation, 2024–28',
      title: true
    }]), el('a', {
      class: 'underline-link',
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        width: 'fit-content'
      },
      onclick: () => onResume && onResume()
    }, 'Full résumé →')]);
    const folderDefs = [...DISCIPLINES.map(d => ({
      tone: d.tone,
      label: d.label,
      body: [disciplineBody(d)]
    })), {
      tone: 'info',
      label: 'INFO',
      body: [infoBody]
    },
    // decorative blank blocker: seals the right side of the fan past INFO
    {
      tone: 'info',
      label: '',
      body: [],
      blank: true
    }];
    const folders = folderDefs.map((f, i) => makeFolder({
      tone: f.tone,
      label: f.label,
      body: f.body,
      index: i,
      count: folderDefs.length,
      flushRight: f.blank,
      blank: f.blank
    }));
    // open the fifth (blank) folder by default
    const fifth = folders[folders.length - 1];
    if (fifth) fifth.classList.add('open');
    const navStrip = el('div', {
      class: 'nav-strip'
    }, [el('div', {
      class: 'brand-name'
    }, 'Julianne Jin'), el('div', {
      class: 'brand-sub'
    }, 'Visual Artist · Designer · RISD'), el('div', {
      class: 'contact-row'
    }, [pillBtn('Email', () => alert('mailto:julianne@risd.edu')), pillBtn('LinkedIn', () => alert('linkedin.com/in/julianne-jin'))]), el('div', {
      class: 'folders',
      style: {
        '--n': String(folders.length)
      }
    }, folders)]);
    root.append(navStrip, previewPanel);
    return root;
  }
  function showPreview(w) {
    const card = document.getElementById('preview-card');
    const empty = document.getElementById('preview-empty');
    if (!card) return;
    empty.style.display = 'none';
    card.innerHTML = '';
    card.appendChild(el('img', {
      src: w.img,
      alt: w.title
    }));
    card.appendChild(el('div', {
      class: 'preview-cap'
    }, [el('div', {
      class: 'ttl'
    }, w.title), el('div', {
      class: 'yr'
    }, w.year)]));
    card.classList.add('show');
  }

  // ---------- Case study (delegates to the Project Page system) ----------
  function buildCaseStudy(w, onBack) {
    return window.CS.build(w, {
      onBack,
      onNext: () => {
        const i = WORKS.findIndex(x => x.id === w.id);
        const nx = WORKS[(i + 1) % WORKS.length];
        window.PX.wipe(() => {
          const root = document.querySelector('.screen-root');
          const fresh = buildCaseStudy(nx, onBack);
          fresh.classList.add('screen-root');
          if (root) root.replaceWith(fresh);
          window.scrollTo(0, 0);
        });
      }
    });
  }

  // ---------- 404 ----------
  function build404(onHome) {
    return el('div', {
      style: {
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--folder-bio)',
        zIndex: 'var(--z-panel)',
        cursor: 'none'
      }
    }, [el('div', {
      style: {
        textAlign: 'center',
        padding: '40px'
      }
    }, [el('div', {
      style: {
        fontFamily: 'var(--font-serif)',
        fontStyle: 'italic',
        fontSize: 'clamp(96px, 18vw, 220px)',
        lineHeight: '0.9',
        color: 'var(--ink)'
      }
    }, '404'), el('div', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--fg-2)',
        marginTop: '20px'
      }
    }, 'This boid flew off-screen.'), el('div', {
      style: {
        marginTop: '32px'
      }
    }, [Object.assign(pillBtn('Back home', onHome), {})])])]);
  }

  // ---------- Resume ----------
  function buildResume(onBack) {
    return el('div', {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'var(--paper)',
        overflowY: 'auto',
        cursor: 'none',
        zIndex: 'var(--z-panel)'
      }
    }, [el('button', {
      class: 'cs-back',
      onclick: onBack
    }, [el('div', {
      class: 'arr'
    })]), el('div', {
      style: {
        maxWidth: '780px',
        margin: '80px auto',
        padding: '0 32px',
        fontFamily: 'var(--font-mono)'
      }
    }, [el('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottom: '2px solid var(--fg-1)',
        paddingBottom: '12px',
        marginBottom: '28px'
      }
    }, [el('div', {}, [el('div', {
      style: {
        fontSize: '40px',
        fontWeight: 400
      }
    }, 'Julianne Jin'), el('div', {
      style: {
        fontSize: '12px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--fg-2)',
        marginTop: '4px'
      }
    }, 'Visual Artist · Designer')]), el('div', {
      style: {
        fontSize: '12px',
        textAlign: 'right',
        color: 'var(--fg-2)'
      }
    }, [el('div', {}, 'julianne@risd.edu'), el('div', {}, 'linkedin.com/in/julianne-jin')])]), makeResSection('EDUCATION', [['Rhode Island School of Design', '2024 – 2028', 'BFA, Art and Computation. Nature Culture Sustainability Studies concentration.']]), makeResSection('SELECTED PROJECTS', [['Music Boids', '2025', 'Generative flocking instrument; spatial-to-sound event mapping. Vanilla JS + WebAudio.'], ['Orbit of Desire', '2025', 'Two-player gravity game. Unity / C#. Soft-body physics, narrative by interaction.'], ['Hell or Sell', '2024', 'Satirical fintech mockup. Concept, type, motion.']]), makeResSection('SKILLS', [['Code', '', 'JavaScript · Three.js · p5.js · WebGL · C#'], ['Design', '', 'Figma · Procreate · Blender · Unity · Audition'], ['Practice', '', 'Generative systems · Interaction design · Sound · Drawing']]), makeResSection('EXHIBITIONS', [['RISD Open Studios', '2025', 'Spring Showcase, Sol Koffler Gallery.']]), el('div', {
      class: 'credit',
      style: {
        position: 'static',
        marginTop: '48px',
        display: 'inline-block'
      }
    }, '— Updated April 2026 —')])]);
  }
  function makeResSection(title, rows) {
    return el('section', {
      style: {
        marginBottom: '32px'
      }
    }, [el('h3', {
      style: {
        fontSize: '13px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--orange)',
        fontWeight: 800,
        marginBottom: '14px'
      }
    }, title), ...rows.map(([t, when, desc]) => el('div', {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '4px 16px',
        marginBottom: '14px',
        fontSize: '13px'
      }
    }, [el('div', {
      style: {
        fontWeight: 700
      }
    }, t), el('div', {
      style: {
        color: 'var(--fg-2)',
        fontSize: '12px'
      }
    }, when), el('div', {
      style: {
        gridColumn: '1 / -1',
        color: 'var(--fg-2)',
        lineHeight: 1.6
      }
    }, desc)]))]);
  }

  // ---------- Boot ----------
  function boot() {
    makeCursor();
    document.body.appendChild(makeStatusBar());
    document.body.appendChild(makeModeToggle());
    document.body.appendChild(makeCredit());

    // Fixed bottom-left mini nav (kit-only — lets you jump between screens)
    const screenNav = el('div', {
      style: {
        position: 'fixed',
        bottom: '14px',
        left: '14px',
        zIndex: 'var(--z-fixed)',
        display: 'flex',
        gap: '8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    });
    document.body.appendChild(screenNav);
    function mount(name, ...args) {
      document.querySelectorAll('.screen-root').forEach(x => x.remove());
      let r;
      if (name === 'home') r = buildHomepage(w => go('case', w), () => go('resume'));
      if (name === 'case') r = buildCaseStudy(args[0] || WORKS[0], () => go('home'));
      if (name === 'resume') r = buildResume(() => go('home'));
      if (name === '404') r = build404(() => go('home'));
      r.classList.add('screen-root');
      document.body.appendChild(r);
      // status readout belongs to the landing only — hide elsewhere so it
      // doesn't collide with the back button.
      const sb = document.querySelector('.status-bar');
      if (sb) sb.style.display = name === 'home' ? 'flex' : 'none';
      window.scrollTo(0, 0);
    }

    // navigate with a wipe transition between screens
    function go(name, ...args) {
      window.PX.wipe(() => mount(name, ...args));
    }
    ['home', 'case', 'resume', '404'].forEach(name => {
      const b = el('button', {
        class: 'btn-pill',
        style: {
          fontSize: '10px',
          padding: '2px 10px'
        },
        onclick: () => go(name)
      }, name);
      screenNav.appendChild(b);
    });

    // first load: intro panel lifts to reveal the homepage
    window.PX.intro(() => mount('home'));
  }
  addEventListener('DOMContentLoaded', boot);
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/app.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/boid-mini.js
try { (() => {
/* Miniature Boid Sequencer — flock + a harmonic line. Crossing the line fires a voice.
   Sound is opt-in (browsers require a gesture). Blueprint palette to match the page. */
(function () {
  const canvas = document.getElementById('flock');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const btn = document.getElementById('soundBtn');
  const readout = document.getElementById('flockRead');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0,
    H = 0,
    dpr = 1;
  const N = 46,
    boids = [];
  const mouse = {
    x: -9999,
    y: -9999
  };
  let events = 0,
    audio = null,
    on = false,
    running = false;
  const SCALE = [0, 2, 4, 7, 9, 12, 14, 16]; // pentatonic-ish over two octaves

  function size() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function seed() {
    boids.length = 0;
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      boids.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.cos(a) * 1.1,
        vy: Math.sin(a) * 1.1,
        side: 0,
        flash: 0,
        g: i % 3
      });
    }
  }

  // the harmonic line: a diagonal chord across the field
  function line() {
    const y1 = H * 0.72,
      y2 = H * 0.24;
    return {
      x1: W * 0.06,
      y1,
      x2: W * 0.94,
      y2
    };
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
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.type = b.g === 2 ? 'triangle' : 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.075, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + 0.55);
  }
  const HUES = ['hsl(212 78% 66%)', 'hsl(196 74% 62%)', 'hsl(18 86% 60%)'];
  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    ctx.clearRect(0, 0, W, H);
    const L = line();

    // line
    ctx.save();
    ctx.strokeStyle = 'hsla(18,84%,54%,0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(L.x1, L.y1);
    ctx.lineTo(L.x2, L.y2);
    ctx.stroke();
    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = 'hsla(222,56%,44%,0.3)';
    ctx.beginPath();
    ctx.moveTo(L.x1, L.y1 + 14);
    ctx.lineTo(L.x2, L.y2 + 14);
    ctx.stroke();
    ctx.restore();
    for (const b of boids) {
      let ax = 0,
        ay = 0,
        cx = 0,
        cy = 0,
        hx = 0,
        hy = 0,
        n = 0;
      for (const o of boids) {
        if (o === b) continue;
        const dx = o.x - b.x,
          dy = o.y - b.y,
          d2 = dx * dx + dy * dy;
        if (d2 > 15000) continue;
        n++;
        cx += o.x;
        cy += o.y;
        hx += o.vx;
        hy += o.vy;
        if (d2 < 900) {
          ax -= dx / (d2 + 1) * 26;
          ay -= dy / (d2 + 1) * 26;
        }
      }
      if (n) {
        ax += (cx / n - b.x) * 0.0011 + (hx / n - b.vx) * 0.045;
        ay += (cy / n - b.y) * 0.0011 + (hy / n - b.vy) * 0.045;
      }
      const mdx = mouse.x - b.x,
        mdy = mouse.y - b.y,
        md = Math.hypot(mdx, mdy);
      if (md < 130 && md > 0.1) {
        ax -= mdx / md * 0.42;
        ay -= mdy / md * 0.42;
      }
      b.vx += ax;
      b.vy += ay;
      const s = Math.hypot(b.vx, b.vy) || 1;
      const target = 1.25;
      b.vx = b.vx / s * target;
      b.vy = b.vy / s * target;
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 0) b.x += W;
      if (b.x > W) b.x -= W;
      if (b.y < 0) b.y += H;
      if (b.y > H) b.y -= H;
      const sd = sideOf(b, L);
      if (b.side && sd !== b.side) {
        b.flash = 1;
        ping(b);
      }
      b.side = sd;
      const ang = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(ang);
      if (b.flash > 0.02) {
        ctx.beginPath();
        ctx.arc(0, 0, 5 + b.flash * 16, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(18,84%,54%,${b.flash * 0.6})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        b.flash *= 0.9;
      }
      ctx.beginPath();
      ctx.moveTo(6.5, 0);
      ctx.lineTo(-4.5, 3.2);
      ctx.lineTo(-4.5, -3.2);
      ctx.closePath();
      ctx.fillStyle = HUES[b.g];
      ctx.globalAlpha = 0.86;
      ctx.fill();
      ctx.restore();
    }
  }
  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('pointerleave', () => {
    mouse.x = mouse.y = -9999;
  });
  if (btn) btn.addEventListener('click', () => {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    on = !on;
    btn.textContent = on ? '◼ Sound on' : '▶ Sound off';
    btn.classList.toggle('acc', on);
  });
  addEventListener('resize', () => {
    size();
  });
  size();
  seed();
  // visibility polled on rAF — IntersectionObserver callbacks are not guaranteed
  if (reduce) {
    running = true;
    frame();
    running = false;
  } else {
    (function watch() {
      const r = canvas.getBoundingClientRect();
      const vis = r.bottom > 0 && r.top < (innerHeight || 800);
      if (vis && !running) {
        running = true;
        frame();
      } else if (!vis) running = false;
      setTimeout(watch, 250);
    })();
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/boid-mini.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/boids-runtime.js
try { (() => {
// Lightweight boids — extracted intent from assets/boids.js.
// 3 flocks of orange/coral/yellow agents, mouse-repulse.

(function () {
  const NUM = 60;
  const MOUSE_R = 70;
  const VIS = 80;
  const SEP = 24;
  const W_ALIGN = 0.05,
    W_COH = 0.005,
    W_SEP = 0.06,
    W_REP = 0.6;
  const MAXV = 2.6;
  const c = document.getElementById('boids');
  if (!c) return;
  const x = c.getContext('2d');
  let W, H;
  function resize() {
    const dpr = devicePixelRatio || 1;
    W = c.width = innerWidth * dpr;
    H = c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px';
    c.style.height = innerHeight + 'px';
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  addEventListener('resize', resize);
  const mouse = {
    x: -9999,
    y: -9999
  };
  addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
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
    let ax = 0,
      ay = 0,
      cx = 0,
      cy = 0,
      sx = 0,
      sy = 0,
      n = 0;
    for (const o of flock) {
      if (o === b) continue;
      const dx = o.x - b.x,
        dy = o.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d < VIS) {
        ax += o.vx;
        ay += o.vy;
        cx += o.x;
        cy += o.y;
        n++;
        if (d < SEP) {
          sx -= dx;
          sy -= dy;
        }
      }
    }
    if (n > 0) {
      ax = (ax / n - b.vx) * W_ALIGN;
      ay = (ay / n - b.vy) * W_ALIGN;
      cx = (cx / n - b.x) * W_COH;
      cy = (cy / n - b.y) * W_COH;
    }
    sx *= W_SEP;
    sy *= W_SEP;
    // mouse repulse
    const mdx = b.x - mouse.x,
      mdy = b.y - mouse.y,
      md = Math.hypot(mdx, mdy);
    if (md < MOUSE_R) {
      sx += mdx / md * W_REP * (MOUSE_R - md);
      sy += mdy / md * W_REP * (MOUSE_R - md);
    }
    b.vx += ax + cx + sx;
    b.vy += ay + cy + sy;
    const sp = Math.hypot(b.vx, b.vy);
    if (sp > MAXV) {
      b.vx = b.vx / sp * MAXV;
      b.vy = b.vy / sp * MAXV;
    }
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < -10) b.x = innerWidth + 10;
    if (b.x > innerWidth + 10) b.x = -10;
    if (b.y < -10) b.y = innerHeight + 10;
    if (b.y > innerHeight + 10) b.y = -10;
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/boids-runtime.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/braindump-schema.js
try { (() => {
/* Braindump prompts. Two layers per project:
   scan  = what a recruiter/HR reader takes in 10 seconds (short, factual)
   depth = what a designer reads for judgment (long, messy, unedited)
   tag: 'hr' | 'des' | 'both'    type: text | long | list | img */
window.BRAINDUMP_SCHEMA = {
  projects: [{
    id: 'hellorsell',
    title: 'Hell or Sell',
    meta: '2026 · Code · no page built yet'
  }, {
    id: 'headsup',
    title: 'Heads Up Website Redesign',
    meta: '2026 · Code'
  }, {
    id: 'orbit',
    title: 'Orbit of Desire',
    meta: '2025 · Game design'
  }, {
    id: 'boids',
    title: 'Boid Sequencer',
    meta: '2025 · Computational'
  }, {
    id: 'magnetoreception',
    title: 'Magnetoreception',
    meta: '2026 · Physical computation · wearable wing'
  }, {
    id: 'window',
    title: 'Prosthetic Window',
    meta: '2026 · Physical computation · responsive bioplastic window'
  }, {
    id: 'illustration',
    title: 'Illustration',
    meta: '2023–26 · Fine art'
  }, {
    id: 'drawings',
    title: 'Drawings',
    meta: '2023–26 · Fine art'
  }],
  /* asked of every project */
  blocks: [{
    id: 'scan',
    title: 'Scan layer',
    note: 'A recruiter reads only this. Short, factual, no craft required — I will turn it into the case-page header.',
    fields: [{
      id: 'oneline',
      tag: 'hr',
      type: 'text',
      label: 'In one sentence, what is it?',
      hint: 'Plain language. No adjectives you would not say out loud.'
    }, {
      id: 'role',
      tag: 'hr',
      type: 'text',
      label: 'What was your role?',
      hint: 'Be specific about what YOU did vs the team'
    }, {
      id: 'team',
      tag: 'hr',
      type: 'text',
      label: 'Who else was involved?',
      hint: 'Team size, your collaborators, who you reported to'
    }, {
      id: 'when',
      tag: 'hr',
      type: 'text',
      label: 'When, and for how long?'
    }, {
      id: 'context',
      tag: 'hr',
      type: 'text',
      label: 'Class, client, job, or self-directed?'
    }, {
      id: 'tools',
      tag: 'hr',
      type: 'list',
      label: 'Tools and skills used'
    }, {
      id: 'outcome',
      tag: 'hr',
      type: 'long',
      label: 'What came of it?',
      hint: 'Shipped? Used by whom? Numbers if you have them, honest "nothing yet" if not.'
    }]
  }, {
    id: 'story',
    title: 'Depth layer — the story',
    note: 'Dump. Grammar does not matter, order does not matter, length does not matter. This is where the actual case study comes from.',
    fields: [{
      id: 'problem',
      tag: 'des',
      type: 'long',
      label: 'What was actually wrong, or what pulled you in?',
      hint: 'The real reason it existed. Not the brief as written — the situation.'
    }, {
      id: 'process',
      tag: 'des',
      type: 'long',
      label: 'Walk me through what you did, in order',
      hint: 'Include the parts that went nowhere. Dead ends are the most interesting part of a portfolio.'
    }, {
      id: 'decisions',
      tag: 'des',
      type: 'long',
      label: 'What did you decide, and why?',
      hint: 'The single most-read part of a case page. Each choice: what the options were, what you picked, what it cost.'
    }, {
      id: 'changed',
      tag: 'des',
      type: 'long',
      label: 'What broke, or changed your mind?',
      hint: 'Feedback that stung, a test that failed, a constraint you found late'
    }, {
      id: 'craft',
      tag: 'des',
      type: 'long',
      label: 'The craft — what are you proud of at close range?',
      hint: 'A detail, a piece of code, a typographic call, an interaction nobody notices'
    }, {
      id: 'redo',
      tag: 'des',
      type: 'long',
      label: 'What would you redo?'
    }]
  }, {
    id: 'show',
    title: 'What to show',
    note: 'Point me at the artifacts. Drop what you have; note what you would need to remake.',
    fields: [{
      id: 'hero',
      tag: 'both',
      type: 'img',
      label: 'The one image that carries the project'
    }, {
      id: 'a1',
      tag: 'des',
      type: 'img',
      label: 'Process artifact 1'
    }, {
      id: 'a2',
      tag: 'des',
      type: 'img',
      label: 'Process artifact 2'
    }, {
      id: 'a3',
      tag: 'des',
      type: 'img',
      label: 'Process artifact 3'
    }, {
      id: 'missing',
      tag: 'des',
      type: 'list',
      label: 'Things worth showing that do not exist yet',
      hint: 'Diagrams, before/afters, a screen recording — I can build these'
    }, {
      id: 'links',
      tag: 'both',
      type: 'list',
      label: 'Links',
      hint: 'Live site, repo, video, Figma, writeup'
    }]
  }, {
    id: 'loose',
    title: 'Loose ends',
    note: null,
    fields: [{
      id: 'notes',
      tag: 'both',
      type: 'long',
      label: 'Anything else in your head about this project',
      hint: 'Half-thoughts welcome'
    }, {
      id: 'worry',
      tag: 'both',
      type: 'text',
      label: 'What are you unsure about showing?'
    }]
  }],
  /* asked once */
  about: [{
    id: 'aim',
    title: 'What this portfolio is for',
    note: 'Sets the whole tone. Answer honestly — it changes how I structure every page.',
    fields: [{
      id: 'target',
      tag: 'hr',
      type: 'long',
      label: 'Who are you sending this to, specifically?',
      hint: 'Company types, roles, named places if you know them'
    }, {
      id: 'jobs',
      tag: 'hr',
      type: 'list',
      label: 'What titles are you applying for?'
    }, {
      id: 'read',
      tag: 'hr',
      type: 'text',
      label: 'If they remember one thing about you, what should it be?'
    }, {
      id: 'strong',
      tag: 'both',
      type: 'long',
      label: 'Which project is your strongest, and why?'
    }, {
      id: 'weak',
      tag: 'both',
      type: 'text',
      label: 'Which one are you least sure belongs?'
    }, {
      id: 'order',
      tag: 'hr',
      type: 'list',
      label: 'Ideal order on the index',
      hint: 'Best first. Reviewers rarely reach number four.'
    }]
  }, {
    id: 'you',
    title: 'You',
    note: null,
    fields: [{
      id: 'bio',
      tag: 'both',
      type: 'long',
      label: 'Who you are, in your own words',
      hint: 'Unedited. I will write the polished version from it.'
    }, {
      id: 'thread',
      tag: 'des',
      type: 'long',
      label: 'What connects your work?',
      hint: 'Fine art, code, and game design in one portfolio — what is the through-line?'
    }, {
      id: 'edu',
      tag: 'hr',
      type: 'list',
      label: 'Education',
      hint: 'School — degree — years'
    }, {
      id: 'exp',
      tag: 'hr',
      type: 'list',
      label: 'Experience',
      hint: 'Org — role — years'
    }, {
      id: 'skills',
      tag: 'hr',
      type: 'list',
      label: 'Skills'
    }, {
      id: 'extra',
      tag: 'hr',
      type: 'list',
      label: 'Awards, exhibitions, publications'
    }, {
      id: 'portrait',
      tag: 'both',
      type: 'img',
      label: 'Portrait'
    }]
  }, {
    id: 'ask',
    title: 'Questions for me',
    note: null,
    fields: [{
      id: 'q',
      tag: 'both',
      type: 'long',
      label: 'What do you want my opinion on?'
    }]
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/braindump-schema.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/braindump.js
try { (() => {
(() => {
  const KEY = 'jj-portfolio-braindump-v1';
  const S = window.BRAINDUMP_SCHEMA;
  let data = {};
  try {
    data = JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch (e) {
    data = {};
  }
  const get = k => data[k];
  const set = (k, v) => {
    if (v === '' || v == null || Array.isArray(v) && !v.length) delete data[k];else data[k] = v;
    save();
  };
  let t;
  function save() {
    clearTimeout(t);
    t = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(data));
      } catch (e) {
        toast('Storage full — export now');
      }
      stats();
    }, 250);
  }
  function toast(m) {
    const e = document.getElementById('toast');
    e.textContent = m;
    e.classList.add('on');
    setTimeout(() => e.classList.remove('on'), 2200);
  }

  /* groups: one per project + the about groups */
  const groups = [];
  S.projects.forEach(p => groups.push({
    id: p.id,
    title: p.title,
    meta: p.meta,
    blocks: S.blocks
  }));
  groups.push({
    id: 'about',
    title: 'You & the portfolio',
    meta: 'asked once',
    blocks: S.about
  });
  const all = [];
  groups.forEach(g => g.blocks.forEach(b => b.fields.forEach(f => all.push({
    g,
    b,
    f,
    k: `${g.id}.${b.id}.${f.id}`
  }))));
  function filled(k) {
    const v = get(k);
    if (!v) return false;
    if (Array.isArray(v)) return v.some(x => (x || '').trim());
    if (typeof v === 'object') return !!(v.name || v.note);
    return !!String(v).trim();
  }
  function stats() {
    document.getElementById('stat').textContent = `${all.filter(x => filled(x.k)).length} / ${all.length} answered`;
    groups.forEach(g => {
      const fs = all.filter(x => x.g === g),
        c = fs.filter(x => filled(x.k)).length;
      const a = document.querySelector(`[data-rail="${g.id}"]`);
      if (a) {
        a.querySelector('.c').textContent = `${c}/${fs.length}`;
        a.classList.toggle('done', c === fs.length);
      }
    });
  }
  function autosize(el) {
    el.style.height = 'auto';
    el.style.height = Math.max(74, el.scrollHeight + 2) + 'px';
  }
  function words(s) {
    return (s || '').trim() ? s.trim().split(/\s+/).length : 0;
  }
  function buildLong(f, k) {
    const wrap = document.createElement('div');
    const el = document.createElement('textarea');
    el.value = get(k) || '';
    el.placeholder = 'Type anything…';
    const wc = document.createElement('div');
    wc.className = 'wc';
    const paint = () => wc.textContent = words(el.value) ? words(el.value) + ' words' : '';
    el.addEventListener('input', () => {
      set(k, el.value);
      autosize(el);
      paint();
    });
    wrap.append(el, wc);
    paint();
    requestAnimationFrame(() => autosize(el));
    return wrap;
  }
  function buildText(f, k) {
    const el = document.createElement('input');
    el.type = 'text';
    el.value = get(k) || '';
    el.placeholder = '—';
    el.addEventListener('input', () => set(k, el.value));
    return el;
  }
  function buildList(f, k) {
    const wrap = document.createElement('div');
    wrap.className = 'list';
    let vals = get(k) || [''];
    const commit = () => set(k, vals);
    function render() {
      wrap.innerHTML = '';
      vals.forEach((v, i) => {
        const row = document.createElement('div');
        row.className = 'item';
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = v;
        inp.placeholder = f.hint || '—';
        inp.addEventListener('input', () => {
          vals[i] = inp.value;
          commit();
        });
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            vals.splice(i + 1, 0, '');
            commit();
            render();
            wrap.querySelectorAll('input')[i + 1].focus();
          }
        });
        const del = document.createElement('button');
        del.className = 'del';
        del.type = 'button';
        del.textContent = '×';
        del.addEventListener('click', () => {
          vals.splice(i, 1);
          if (!vals.length) vals = [''];
          commit();
          render();
        });
        row.append(inp, del);
        wrap.append(row);
      });
      const add = document.createElement('button');
      add.className = 'btn ghost add';
      add.type = 'button';
      add.textContent = '+ Add row';
      add.addEventListener('click', () => {
        vals.push('');
        commit();
        render();
        const is = wrap.querySelectorAll('input');
        is[is.length - 1].focus();
      });
      wrap.append(add);
    }
    render();
    return wrap;
  }
  function buildImg(f, k) {
    const wrap = document.createElement('div');
    wrap.className = 'slot';
    wrap.innerHTML = `<div class="drop"><div class="thumb">Drop image</div><div class="meta"><b>No file</b>Drag an image in, or click to choose.</div></div>
    <input type="text" placeholder="What this shows / why it matters">
    <button class="x" type="button">Clear</button>`;
    const thumb = wrap.querySelector('.thumb'),
      meta = wrap.querySelector('.meta'),
      cap = wrap.querySelector('input[type=text]');
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.hidden = true;
    wrap.append(inp);
    const cur = () => get(k) || {};
    function paint() {
      const v = cur();
      wrap.classList.toggle('has', !!(v.name || v.note));
      if (v.thumb) {
        thumb.style.backgroundImage = `url(${v.thumb})`;
        thumb.textContent = '';
      } else {
        thumb.style.backgroundImage = '';
        thumb.textContent = 'Drop image';
      }
      meta.innerHTML = '<b></b>';
      meta.querySelector('b').textContent = v.name || 'No file';
      meta.append(v.name ? v.w ? `${v.w} × ${v.h} px` : '' : 'Drag an image in, or click to choose.');
      cap.value = v.note || '';
    }
    const store = p => {
      set(k, Object.assign({}, cur(), p));
      paint();
    };
    async function take(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file),
        img = new Image();
      await new Promise(r => {
        img.onload = r;
        img.onerror = r;
        img.src = url;
      });
      const c = document.createElement('canvas');
      const sc = Math.min(1, 300 / Math.max(img.width || 1, img.height || 1));
      c.width = Math.max(1, Math.round((img.width || 300) * sc));
      c.height = Math.max(1, Math.round((img.height || 200) * sc));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      store({
        name: file.name,
        w: img.width,
        h: img.height,
        thumb: c.toDataURL('image/jpeg', .6)
      });
    }
    wrap.querySelector('.drop').addEventListener('click', () => inp.click());
    inp.addEventListener('change', () => take(inp.files[0]));
    ['dragenter', 'dragover'].forEach(e => wrap.addEventListener(e, ev => {
      ev.preventDefault();
      wrap.classList.add('over');
    }));
    ['dragleave', 'drop'].forEach(e => wrap.addEventListener(e, ev => {
      ev.preventDefault();
      wrap.classList.remove('over');
    }));
    wrap.addEventListener('drop', e => take(e.dataTransfer.files[0]));
    cap.addEventListener('input', () => store({
      note: cap.value
    }));
    wrap.querySelector('.x').addEventListener('click', () => {
      set(k, null);
      paint();
    });
    paint();
    return wrap;
  }

  /* render */
  const rail = document.getElementById('rail'),
    body = document.getElementById('body');
  const h1 = document.createElement('h4');
  h1.textContent = 'Projects';
  rail.append(h1);
  groups.forEach((g, i) => {
    if (g.id === 'about') {
      const h = document.createElement('h4');
      h.textContent = 'Once';
      rail.append(h);
    }
    const a = document.createElement('a');
    a.href = '#' + g.id;
    a.dataset.rail = g.id;
    a.innerHTML = `<span></span><span class="c"></span>`;
    a.firstChild.textContent = g.title;
    rail.append(a);
    const sec = document.createElement('section');
    sec.className = 'proj';
    sec.id = g.id;
    const head = document.createElement('div');
    head.className = 'phead';
    head.innerHTML = `<h2></h2><span class="m"></span>`;
    head.querySelector('h2').textContent = g.title;
    head.querySelector('.m').textContent = g.meta || '';
    sec.append(head);
    g.blocks.forEach(b => {
      const blk = document.createElement('div');
      blk.className = 'blk';
      const bh = document.createElement('div');
      bh.className = 'bh';
      bh.innerHTML = '<b></b>';
      bh.querySelector('b').textContent = b.title;
      blk.append(bh);
      if (b.note) {
        const n = document.createElement('p');
        n.className = 'bnote';
        n.textContent = b.note;
        blk.append(n);
      }
      b.fields.forEach(f => {
        const k = `${g.id}.${b.id}.${f.id}`;
        const q = document.createElement('div');
        q.className = 'q';
        q.dataset.tag = f.tag;
        const qh = document.createElement('div');
        qh.className = 'qh';
        qh.innerHTML = `<span class="l"></span><span class="tag ${f.tag}"></span><span class="id"></span>`;
        qh.querySelector('.l').textContent = f.label;
        qh.querySelector('.tag').textContent = f.tag === 'hr' ? 'Recruiter' : f.tag === 'des' ? 'Designer' : 'Both';
        qh.querySelector('.id').textContent = k;
        q.append(qh);
        if (f.hint) {
          const h = document.createElement('p');
          h.className = 'hint';
          h.textContent = f.hint;
          q.append(h);
        }
        q.append(f.type === 'img' ? buildImg(f, k) : f.type === 'list' ? buildList(f, k) : f.type === 'long' ? buildLong(f, k) : buildText(f, k));
        blk.append(q);
      });
      sec.append(blk);
    });
    body.append(sec);
  });
  stats();

  /* filter */
  const filt = document.getElementById('filt');
  filt.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    [...filt.children].forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.f;
    document.querySelectorAll('.q').forEach(q => q.classList.toggle('hide', f !== 'all' && q.dataset.tag !== f && q.dataset.tag !== 'both'));
    document.querySelectorAll('.blk').forEach(blk => {
      const any = [...blk.querySelectorAll('.q')].some(q => !q.classList.contains('hide'));
      blk.style.display = any ? '' : 'none';
    });
  });

  /* export */
  function dl(name, text, mime) {
    const b = new Blob([text], {
        type: mime
      }),
      a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function clean() {
    const out = {
      _meta: {
        doc: 'braindump',
        site: 'Julianne Jin portfolio',
        exported: new Date().toISOString(),
        schema: 'v1'
      },
      groups: {}
    };
    groups.forEach(g => {
      const gg = {};
      g.blocks.forEach(b => {
        const bb = {};
        b.fields.forEach(f => {
          const v = get(`${g.id}.${b.id}.${f.id}`);
          if (!v) return;
          if (typeof v === 'object' && !Array.isArray(v)) {
            const {
              thumb,
              ...r
            } = v;
            if (r.name || r.note) bb[f.id] = r;
          } else if (Array.isArray(v)) {
            const a = v.filter(x => (x || '').trim());
            if (a.length) bb[f.id] = a;
          } else if (String(v).trim()) bb[f.id] = v;
        });
        if (Object.keys(bb).length) gg[b.id] = bb;
      });
      if (Object.keys(gg).length) out.groups[g.id] = {
        title: g.title,
        blocks: gg
      };
    });
    return out;
  }
  function md() {
    const L = ['# Portfolio braindump', '', `Exported ${new Date().toLocaleString()}`, ''];
    groups.forEach(g => {
      const parts = [];
      g.blocks.forEach(b => {
        const rows = [];
        b.fields.forEach(f => {
          const k = `${g.id}.${b.id}.${f.id}`,
            v = get(k);
          if (!filled(k)) return;
          const tag = f.tag === 'hr' ? '[recruiter]' : f.tag === 'des' ? '[designer]' : '[both]';
          if (f.type === 'img') rows.push(`**${f.label}** ${tag} → \`${v.name || '(no file)'}\`${v.note ? ' — ' + v.note : ''}`);else if (Array.isArray(v)) rows.push(`**${f.label}** ${tag}\n` + v.filter(x => (x || '').trim()).map(x => `- ${x}`).join('\n'));else rows.push(`**${f.label}** ${tag}\n\n${v}`);
        });
        if (rows.length) parts.push(`### ${b.title}\n\n${rows.join('\n\n')}`);
      });
      if (parts.length) L.push(`## ${g.title}${g.meta ? '  \n_' + g.meta + '_' : ''}`, '', parts.join('\n\n'), '');
    });
    const imgs = all.filter(x => x.f.type === 'img' && filled(x.k)).map(x => `- ${get(x.k).name} → ${x.g.title} / ${x.f.label}`);
    if (imgs.length) L.push('## Images referenced', '', ...imgs, '');
    return L.join('\n');
  }
  document.getElementById('btnJson').addEventListener('click', () => {
    dl('portfolio-braindump.json', JSON.stringify(clean(), null, 2), 'application/json');
    toast('Dump exported');
  });
  document.getElementById('btnMd').addEventListener('click', () => {
    dl('portfolio-braindump.md', md(), 'text/markdown');
    toast('Brief exported');
  });
  const fileIn = document.getElementById('fileIn');
  document.getElementById('btnImport').addEventListener('click', () => fileIn.click());
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files[0];
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      Object.entries(j.groups || {}).forEach(([gid, g]) => Object.entries(g.blocks || {}).forEach(([bid, b]) => Object.entries(b).forEach(([fid, v]) => {
        data[`${gid}.${bid}.${fid}`] = v;
      })));
      localStorage.setItem(KEY, JSON.stringify(data));
      location.reload();
    } catch (e) {
      toast('Could not read that file');
    }
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/braindump.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/case-page.js
try { (() => {
/* Shared case-page motion.
   Animation is strictly opt-in: nothing is hidden until we have PROVEN that
   animation frames are delivered. In a frameless context the page just renders
   statically — legibility never depends on a transition completing.
   GSAP is enhancement only: char/word splits, parallax, marquee, progress bar. */
document.documentElement.classList.add('js');
const CasePage = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let resolveFrames;
  // Two rAFs inside 300ms = frames are real. Otherwise: static page, no animation.
  const framesOK = new Promise(res => {
    resolveFrames = res;
  });
  if (reduce) resolveFrames(false);else {
    let done = false;
    const settle = v => {
      if (!done) {
        done = true;
        resolveFrames(v);
      }
    };
    setTimeout(() => settle(false), 300);
    requestAnimationFrame(() => requestAnimationFrame(() => settle(true)));
  }
  return {
    reduce,
    framesOK
  };
})();
CasePage.framesOK.then(ok => {
  if (!ok) return; // static render — .rv stays visible, nothing else to do
  document.documentElement.classList.add('anim');
  const show = el => {
    const d = parseFloat(el.dataset.d || 0);
    el.classList.add('seen');
    if (d) setTimeout(() => el.classList.add('in'), d * 1000);else el.classList.add('in');
  };
  function checkAll() {
    const nodes = document.querySelectorAll('.rv:not(.seen)');
    if (!nodes.length) return true;
    const vh = innerHeight || document.documentElement.clientHeight;
    nodes.forEach(n => {
      if (n.getBoundingClientRect().top < vh * 0.94) show(n);
    });
    return !document.querySelectorAll('.rv:not(.seen)').length;
  }
  checkAll();
  const beat = setInterval(() => {
    if (checkAll()) clearInterval(beat);
  }, 150);
  addEventListener('scroll', checkAll, {
    passive: true
  });
  addEventListener('resize', checkAll, {
    passive: true
  });
  addEventListener('load', checkAll);
});
window.addEventListener('load', async () => {
  const ok = await CasePage.framesOK;
  if (!window.gsap || !ok) return; // no splits, no parallax — text stays as authored
  gsap.registerPlugin(ScrollTrigger);
  const prog = document.querySelector('.prog');
  if (prog) gsap.to(prog, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      scrub: .25,
      start: 0,
      end: 'max'
    }
  });

  // hero title — characters, grouped into non-breaking words
  document.querySelectorAll('[data-split="chars"]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((word, wi) => {
      const wrap = document.createElement('span');
      wrap.style.display = 'inline-block';
      wrap.style.whiteSpace = 'nowrap';
      [...word].forEach(c => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        wrap.appendChild(s);
      });
      el.appendChild(wrap);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    gsap.from(el.querySelectorAll('.ch'), {
      yPercent: 118,
      opacity: 0,
      duration: 1.05,
      ease: 'expo.out',
      stagger: .028,
      delay: .12
    });
  });

  // pull quotes — words
  document.querySelectorAll('[data-split="words"]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    const tw = gsap.fromTo(el.querySelectorAll('.w'), {
      yPercent: 90,
      opacity: 0
    }, {
      yPercent: 0,
      opacity: 1,
      duration: .9,
      ease: 'expo.out',
      stagger: .035,
      paused: true
    });
    (function watch() {
      if (el.getBoundingClientRect().top < innerHeight * 0.94) {
        tw.play();
        return;
      }
      setTimeout(watch, 150);
    })();
  });
  gsap.utils.toArray('[data-par]').forEach(el => {
    gsap.fromTo(el, {
      yPercent: -(+el.dataset.par || 6)
    }, {
      yPercent: +el.dataset.par || 6,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('figure, .parwrap') || el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
  document.querySelectorAll('.mq').forEach(mq => {
    const track = mq.querySelector('.track');
    if (!track) return;
    const half = track.scrollWidth / 2 || 1;
    let x = 0,
      dir = -1;
    gsap.ticker.add(() => {
      x += dir * 1.1;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      gsap.set(track, {
        x
      });
    });
    ScrollTrigger.create({
      onUpdate: s => {
        dir = s.direction === 1 ? -1 : 1;
      }
    });
  });
  document.querySelectorAll('.toc a').forEach(a => {
    const id = a.getAttribute('href');
    const target = id && id.startsWith('#') && document.querySelector(id);
    if (!target) return;
    a.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + scrollY - 88,
        behavior: 'smooth'
      });
    });
    ScrollTrigger.create({
      trigger: target,
      start: 'top 42%',
      end: 'bottom 42%',
      onToggle: s => a.classList.toggle('on', s.isActive)
    });
  });
  ScrollTrigger.refresh();
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/case-page.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/case-study.js
try { (() => {
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
    const span = el('span', {
      html: `<svg viewBox="0 0 22 22">${inner}</svg>`
    });
    return span.firstChild;
  }
  function chevron(dir) {
    const pts = dir === 'left' ? '14,4 6,11 14,18' : '8,4 16,11 8,18';
    return el('button', {
      class: 'cs-arrow',
      'aria-label': dir
    }, [wrapSvg(`<polyline points="${pts}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`)]);
  }

  // ---------------- shared chrome ----------------
  function chrome(work, {
    onBack
  }) {
    const back = el('button', {
      class: 'cs-back',
      'aria-label': 'Back to portfolio',
      onclick: onBack
    }, [el('div', {
      class: 'arr'
    })]);
    const top = el('div', {
      class: 'cs-top'
    }, [el('div', {
      class: 'eyebrow-pill'
    }, [`${work.kind || 'Project'} `, el('span', {
      class: 'idx'
    }, `· ${work.index} / ${work.total}`)])]);
    return [back, top];
  }
  function footer(work, {
    onNext
  }) {
    return el('div', {
      class: 'cs-footer'
    }, [el('div', {
      class: 'next',
      onclick: onNext
    }, [el('span', {
      class: 'lbl'
    }, 'Next project'), `${work.next || 'Back to works'} →`]), el('div', {
      class: 'credit-text'
    }, 'Concepted, designed, and coded by Julianne Jin.')]);
  }

  // ---------------- interactive section · CAROUSEL ----------------
  function sectionCarousel(s, work) {
    const items = s.items || [];
    let cur = 0;
    const scene = el('div', {
      class: 'cs-scene'
    });
    const cards = items.map(it => {
      const c = el('div', {
        class: 'cs-slide-card'
      }, [el('img', {
        src: it.img,
        alt: it.caption || ''
      })]);
      scene.appendChild(c);
      return c;
    });
    const cap = el('div', {
      class: 'cs-caption'
    });
    function render() {
      cards.forEach((c, i) => {
        let pos = 'hidden';
        if (i === cur) pos = 'active';else if (i === (cur - 1 + items.length) % items.length) pos = 'prev';else if (i === (cur + 1) % items.length) pos = 'next';
        c.setAttribute('data-pos', pos);
      });
      const it = items[cur] || {};
      cap.innerHTML = '';
      cap.append(el('span', {
        class: 'n'
      }, String(cur + 1).padStart(2, '0')), el('span', {
        class: 'ttl'
      }, it.caption || ''), el('span', {
        class: 'yr'
      }, `${cur + 1} / ${items.length}`));
    }
    const prev = chevron('left');
    prev.onclick = () => {
      cur = (cur - 1 + items.length) % items.length;
      render();
    };
    const next = chevron('right');
    next.onclick = () => {
      cur = (cur + 1) % items.length;
      render();
    };
    cards.forEach((c, i) => c.addEventListener('click', () => {
      cur = i;
      render();
    }));
    render();
    return el('section', {
      class: 'cs-stage'
    }, [el('div', {
      class: 'cs-head'
    }, [el('span', {
      class: 'cs-eyebrow'
    }, `${work.kind} · ${work.year}`), el('h1', {
      class: 'cs-title'
    }, work.title)]), el('div', {
      class: 'cs-carousel'
    }, [prev, scene, next]), cap]);
  }

  // ---------------- interactive section · SLIDES ----------------
  function sectionSlides(s, work) {
    const items = s.items || [];
    let cur = 0;
    const figs = items.map((it, i) => el('figure', {
      class: 'cs-fig' + (i === 0 ? ' active' : '')
    }, [el('img', {
      src: it.img,
      alt: it.caption || ''
    })]));
    const cap = el('div', {
      class: 'cs-caption'
    });
    function render(prevIdx) {
      figs.forEach((f, i) => {
        f.classList.remove('active', 'exit');
        if (i === cur) f.classList.add('active');else if (i === prevIdx) f.classList.add('exit');
      });
      const it = items[cur] || {};
      cap.innerHTML = '';
      cap.append(el('span', {
        class: 'n'
      }, String(cur + 1).padStart(2, '0')), el('span', {
        class: 'ttl'
      }, it.caption || ''), el('span', {
        class: 'yr'
      }, it.year || ''));
    }
    const prev = chevron('left');
    prev.onclick = () => {
      const p = cur;
      cur = (cur - 1 + items.length) % items.length;
      render(p);
    };
    const next = chevron('right');
    next.onclick = () => {
      const p = cur;
      cur = (cur + 1) % items.length;
      render(p);
    };
    render();
    return el('section', {
      class: 'cs-slidestage'
    }, [el('div', {
      class: 'cs-head'
    }, [el('span', {
      class: 'cs-eyebrow'
    }, `${work.kind} · ${work.year}`), el('h1', {
      class: 'cs-title'
    }, work.title)]), el('div', {
      class: 'cs-figs'
    }, figs), el('div', {
      class: 'cs-cap-panel'
    }, [prev, cap, next])]);
  }
  const LOCAL = {
    carousel: sectionCarousel,
    slides: sectionSlides
  };

  // ---------------- scroll reveal ----------------
  function observeReveals(root) {
    requestAnimationFrame(() => root.classList.add('cs-ready'));
    const reveals = [...root.querySelectorAll('.reveal')];
    if (!('IntersectionObserver' in window)) {
      reveals.forEach(elm => elm.classList.add('in'));
      return;
    }
    const obs = new IntersectionObserver(ents => {
      ents.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, {
      root,
      threshold: 0.12,
      rootMargin: '0px 0px -6% 0px'
    });
    reveals.forEach(elm => obs.observe(elm));
    // Safety: if the observer never fires (e.g. a throttled/offscreen timeline),
    // reveal everything so no section is ever stuck invisible.
    setTimeout(() => reveals.forEach(elm => elm.classList.add('in')), 2500);
  }

  // ---------------- assembler ----------------
  function build(work, hooks) {
    const root = el('div', {
      class: 'cs'
    });
    chrome(work, hooks).forEach(c => root.appendChild(c));
    (work.sections || []).forEach(s => {
      const node = LOCAL[s.type] ? LOCAL[s.type](s, work) : window.CSX.render(s, work);
      if (node) root.appendChild(node);
    });
    root.appendChild(footer(work, hooks));
    observeReveals(root);
    return root;
  }
  window.CS = {
    build
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/case-study.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/components.js
try { (() => {
// Components — vanilla JS to keep the kit dep-free.
// Each "component" is a function that returns an HTMLElement.

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;else if (k === 'style' && typeof v === 'object') {
      // custom properties (--foo) need setProperty; camelCase props use direct assignment.
      for (const [sk, sv] of Object.entries(v)) {
        if (sk.startsWith('--')) n.style.setProperty(sk, sv);else n.style[sk] = sv;
      }
    } else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);else if (k === 'html') n.innerHTML = v;else n.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return n;
}

// ---------- Cursor ----------
function makeCursor() {
  const c = el('div', {
    class: 'cursor'
  });
  document.body.appendChild(c);
  let x = innerWidth / 2,
    y = innerHeight / 2,
    tx = x,
    ty = y;
  addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
  });
  function loop() {
    x += (tx - x) * 0.25;
    y += (ty - y) * 0.25;
    c.style.left = x + 'px';
    c.style.top = y + 'px';
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
  }, [el('div', {
    class: 'dot'
  })]);
  return btn;
}

// ---------- Status bar ----------
function makeStatusBar() {
  const time = el('span');
  const vp = el('span');
  const bar = el('div', {
    class: 'status-bar'
  }, [time, vp]);
  function tick() {
    const d = new Date();
    const dt = d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const tm = d.toLocaleTimeString('en-US', {
      hour12: true
    });
    time.textContent = `[ ${dt}  ${tm} ]`;
    vp.textContent = `[ ${innerWidth} × ${innerHeight} ]`;
  }
  setInterval(tick, 1000);
  tick();
  return bar;
}

// ---------- Site credit ----------
function makeCredit() {
  return el('div', {
    class: 'credit'
  }, 'This website was concepted, designed, and coded by Julianne Jin.');
}

// ---------- Pill button ----------
function pillBtn(label, onclick) {
  return el('button', {
    class: 'btn-pill',
    onclick
  }, label);
}

// ---------- Folder ----------
// Trapezoid-tab SVG + label, over a fixed-size colored body.
// Staggering is automatic: pass `index` + `count` and the tab is distributed
// evenly across the width — add/remove folders and they re-space themselves.
function makeFolder({
  tone,
  label,
  body,
  index = 0,
  count = 1,
  flushRight = false,
  blank = false
}) {
  const W = 120; // uniform tab width (viewBox units)
  const m = 6; // edge margin
  const span = count > 1 ? (400 - W - m * 2) / (count - 1) : 0;
  const S = Math.round(m + index * span); // tab start x
  const a = 16; // slant run
  // flushRight: tab has its usual left slant but its top runs flat to the right
  // edge and drops straight down the wall (no transparent corner notch) — used
  // for the blank blocker tab so it seals the right side of the fan.
  const poly = flushRight ? `${S},50 ${S + a},3 400,3 400,50` : `${S},50 ${S + a},3 ${S + W - a},3 ${S + W},50`;
  const cx = ((S + W / 2) / 400 * 100).toFixed(1) + '%'; // label centre %
  const tabSvg = `
    <svg viewBox="0 0 400 50" preserveAspectRatio="none" aria-hidden="true">
      <polygon class="tab-fill" points="${poly}"/>
      <polyline class="tab-stroke" points="0,50 ${poly} 400,50"/>
    </svg>`;
  const tab = el('div', {
    class: 'folder-tab'
  }, [el('div', {
    html: tabSvg
  }), el('div', {
    class: 'tab-label',
    style: {
      '--tab-cx': cx
    }
  }, label)]);
  const inner = el('div', {
    class: 'folder-body-inner'
  }, body);
  const bod = el('div', {
    class: 'folder-body'
  }, [inner]);
  const f = el('div', {
    class: 'folder' + (blank ? ' folder--blank' : ''),
    'data-tone': tone
  }, [tab, bod]);
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
function topicItem({
  title,
  year,
  onhover,
  onclick
}) {
  const t = el('a', {
    class: 'topic',
    onclick
  }, [title, el('span', {
    class: 'meta-yr'
  }, year)]);
  if (onhover) t.addEventListener('mouseenter', onhover);
  return t;
}

// ---------- CV section ----------
function cvSection(title, lines) {
  return el('div', {
    class: 'cv-section'
  }, [el('h3', {}, title), ...lines.map(l => {
    const cls = ['cv-line'];
    if (l.title) cls.push('title');
    if (l.muted) cls.push('muted');
    if (l.bullet) cls.push('bullet');
    return el('div', {
      class: cls.join(' ')
    }, l.text);
  })]);
}
window.PK = {
  el,
  makeCursor,
  makeModeToggle,
  makeStatusBar,
  makeCredit,
  pillBtn,
  makeFolder,
  topicItem,
  cvSection
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/components.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/content-editor.js
try { (() => {
(() => {
  const KEY = 'jj-portfolio-content-v1';
  const S = window.PORTFOLIO_SCHEMA;
  let data = {};
  try {
    data = JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch (e) {
    data = {};
  }
  const path = (p, s, f) => `${p}.${s}.${f}`;
  const get = k => data[k];
  const set = (k, v) => {
    if (v === '' || v == null || Array.isArray(v) && !v.length) delete data[k];else data[k] = v;
    save();
  };
  let saveT;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(data));
      } catch (e) {
        toast('Storage full — export now');
      }
      stats();
    }, 250);
  }
  function toast(m) {
    const t = document.getElementById('toast');
    t.textContent = m;
    t.classList.add('on');
    setTimeout(() => t.classList.remove('on'), 2200);
  }

  /* ---------- counts ---------- */
  const allFields = [];
  S.forEach(p => p.sections.forEach(s => s.fields.forEach(f => allFields.push({
    p,
    s,
    f,
    k: path(p.id, s.id, f.id)
  }))));
  function filled(k) {
    const v = get(k);
    if (!v) return false;
    if (Array.isArray(v)) return v.some(x => (x || '').trim());
    if (typeof v === 'object') return !!(v.name || v.note);
    return !!String(v).trim();
  }
  function stats() {
    const n = allFields.filter(x => filled(x.k)).length;
    document.getElementById('stat').textContent = `${n} / ${allFields.length} filled`;
    S.forEach(p => {
      const fs = allFields.filter(x => x.p === p);
      const c = fs.filter(x => filled(x.k)).length;
      const a = document.querySelector(`[data-rail="${p.id}"]`);
      if (a) {
        a.querySelector('.c').textContent = `${c}/${fs.length}`;
        a.classList.toggle('done', c === fs.length);
      }
    });
  }

  /* ---------- field builders ---------- */
  function labelEl(f, k) {
    const d = document.createElement('div');
    d.className = 'lab';
    d.innerHTML = `<span class="k"></span><span class="id"></span>${f.hint ? '<span class="hint"></span>' : ''}`;
    d.querySelector('.k').textContent = f.label;
    d.querySelector('.id').textContent = k;
    if (f.hint) d.querySelector('.hint').textContent = f.hint;
    return d;
  }
  function buildText(f, k, long) {
    const el = document.createElement(long ? 'textarea' : 'input');
    if (!long) el.type = 'text';else el.rows = f.id === 'body' || f.id.includes('body') ? 5 : 3;
    el.value = get(k) || '';
    el.placeholder = long ? 'Write the copy…' : '—';
    el.addEventListener('input', () => {
      set(k, el.value);
      autosize(el, long);
    });
    if (long) requestAnimationFrame(() => autosize(el, true));
    return el;
  }
  function autosize(el, long) {
    if (!long) return;
    el.style.height = 'auto';
    el.style.height = Math.max(60, el.scrollHeight + 2) + 'px';
  }
  function buildList(f, k) {
    const wrap = document.createElement('div');
    wrap.className = 'list';
    let vals = get(k) || (f.seed ? f.seed.slice() : ['']);
    const commit = () => set(k, vals.filter(v => true));
    function render() {
      wrap.innerHTML = '';
      vals.forEach((v, i) => {
        const row = document.createElement('div');
        row.className = 'item';
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = v;
        inp.placeholder = f.hint || '—';
        inp.addEventListener('input', () => {
          vals[i] = inp.value;
          commit();
        });
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            vals.splice(i + 1, 0, '');
            commit();
            render();
            wrap.querySelectorAll('input')[i + 1].focus();
          }
        });
        const del = document.createElement('button');
        del.className = 'del';
        del.type = 'button';
        del.textContent = '×';
        del.addEventListener('click', () => {
          vals.splice(i, 1);
          if (!vals.length) vals = [''];
          commit();
          render();
        });
        row.append(inp, del);
        wrap.append(row);
      });
      const add = document.createElement('button');
      add.className = 'btn ghost add';
      add.type = 'button';
      add.textContent = '+ Add row';
      add.addEventListener('click', () => {
        vals.push('');
        commit();
        render();
        const is = wrap.querySelectorAll('input');
        is[is.length - 1].focus();
      });
      wrap.append(add);
    }
    render();
    return wrap;
  }
  function buildImg(f, k) {
    const wrap = document.createElement('div');
    wrap.className = 'slot';
    const cur = () => get(k) || {};
    wrap.innerHTML = `<div class="drop"><div class="thumb">Drop image</div><div class="meta"><b>No file</b>Drag an image in, or click to choose.</div></div>
    <div class="row"><input type="text" placeholder="Caption / what this shows"></div>
    <div class="row"><button class="x" type="button">Clear</button></div>`;
    const drop = wrap.querySelector('.drop'),
      thumb = wrap.querySelector('.thumb'),
      meta = wrap.querySelector('.meta');
    const cap = wrap.querySelector('input');
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.hidden = true;
    wrap.append(inp);
    function paint() {
      const v = cur();
      wrap.classList.toggle('has', !!(v.name || v.note));
      if (v.thumb) {
        thumb.style.backgroundImage = `url(${v.thumb})`;
        thumb.textContent = '';
      } else {
        thumb.style.backgroundImage = '';
        thumb.textContent = 'Drop image';
      }
      meta.innerHTML = '<b></b>';
      meta.querySelector('b').textContent = v.name || 'No file';
      meta.append(v.name ? v.w ? `${v.w} × ${v.h} px` : '' : 'Drag an image in, or click to choose.');
      cap.value = v.note || '';
    }
    function store(patch) {
      const v = Object.assign({}, cur(), patch);
      set(k, v);
      paint();
    }
    async function take(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise(r => {
        img.onload = r;
        img.onerror = r;
        img.src = url;
      });
      const c = document.createElement('canvas');
      const sc = Math.min(1, 300 / Math.max(img.width || 1, img.height || 1));
      c.width = Math.max(1, Math.round((img.width || 300) * sc));
      c.height = Math.max(1, Math.round((img.height || 200) * sc));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      store({
        name: file.name,
        w: img.width,
        h: img.height,
        thumb: c.toDataURL('image/jpeg', .6)
      });
    }
    drop.addEventListener('click', () => inp.click());
    inp.addEventListener('change', () => take(inp.files[0]));
    ['dragenter', 'dragover'].forEach(ev => wrap.addEventListener(ev, e => {
      e.preventDefault();
      wrap.classList.add('over');
    }));
    ['dragleave', 'drop'].forEach(ev => wrap.addEventListener(ev, e => {
      e.preventDefault();
      wrap.classList.remove('over');
    }));
    wrap.addEventListener('drop', e => take(e.dataTransfer.files[0]));
    cap.addEventListener('input', () => store({
      note: cap.value
    }));
    wrap.querySelector('.x').addEventListener('click', () => {
      set(k, null);
      paint();
    });
    paint();
    return wrap;
  }

  /* ---------- render ---------- */
  const rail = document.getElementById('rail'),
    pages = document.getElementById('pages');
  S.forEach((p, pi) => {
    const a = document.createElement('a');
    a.href = '#' + p.id;
    a.dataset.rail = p.id;
    a.innerHTML = `<span class="n">${String(pi + 1).padStart(2, '0')}</span><span>${p.title}</span><span class="c"></span>`;
    rail.append(a);
    const sec = document.createElement('section');
    sec.className = 'page';
    sec.id = p.id;
    const head = document.createElement('div');
    head.className = 'phead';
    head.innerHTML = `<span class="n">${String(pi + 1).padStart(2, '0')}</span><h2></h2><span class="file"></span>`;
    head.querySelector('h2').textContent = p.title;
    head.querySelector('.file').textContent = p.file;
    sec.append(head);
    if (p.note) {
      const n = document.createElement('p');
      n.className = 'pnote';
      n.textContent = p.note;
      sec.append(n);
    }
    p.sections.forEach(s => {
      const sb = document.createElement('div');
      sb.className = 'sec';
      const sh = document.createElement('div');
      sh.className = 'sh';
      sh.innerHTML = '<b></b><span></span>';
      sh.querySelector('b').textContent = s.title;
      sh.querySelector('span').textContent = s.id;
      sb.append(sh);
      s.fields.forEach(f => {
        const k = path(p.id, s.id, f.id);
        const row = document.createElement('div');
        row.className = 'f';
        row.append(labelEl(f, k));
        const ctrl = f.type === 'img' ? buildImg(f, k) : f.type === 'list' ? buildList(f, k) : buildText(f, k, f.type === 'long');
        const cell = document.createElement('div');
        cell.append(ctrl);
        row.append(cell);
        sb.append(row);
      });
      sec.append(sb);
    });
    pages.append(sec);
  });
  stats();

  /* ---------- export ---------- */
  function dl(name, text, mime) {
    const b = new Blob([text], {
      type: mime
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function clean() {
    const out = {
      _meta: {
        site: 'Julianne Jin portfolio',
        exported: new Date().toISOString(),
        schema: 'v1'
      },
      pages: {}
    };
    S.forEach(p => {
      const pg = {};
      p.sections.forEach(s => {
        const sn = {};
        s.fields.forEach(f => {
          const v = get(path(p.id, s.id, f.id));
          if (!v) return;
          if (typeof v === 'object' && !Array.isArray(v)) {
            const {
              thumb,
              ...rest
            } = v;
            if (rest.name || rest.note) sn[f.id] = rest;
          } else if (Array.isArray(v)) {
            const a = v.filter(x => (x || '').trim());
            if (a.length) sn[f.id] = a;
          } else if (String(v).trim()) sn[f.id] = v;
        });
        if (Object.keys(sn).length) pg[s.id] = sn;
      });
      if (Object.keys(pg).length) out.pages[p.id] = {
        title: p.title,
        file: p.file,
        sections: pg
      };
    });
    return out;
  }
  function md() {
    const L = ['# Portfolio content', '', `Exported ${new Date().toLocaleString()}`, ''];
    S.forEach(p => {
      const rows = [];
      p.sections.forEach(s => {
        const fr = [];
        s.fields.forEach(f => {
          const k = path(p.id, s.id, f.id),
            v = get(k);
          if (!filled(k)) return;
          if (f.type === 'img') fr.push(`- **${f.label}** → \`${v.name || '(no file)'}\`${v.note ? ' — ' + v.note : ''}`);else if (Array.isArray(v)) fr.push(`- **${f.label}**\n` + v.filter(x => (x || '').trim()).map(x => `  - ${x}`).join('\n'));else fr.push(`- **${f.label}** — ${String(v).replace(/\n+/g, '\n    ')}`);
        });
        if (fr.length) rows.push(`### ${s.title}\n${fr.join('\n')}`);
      });
      if (rows.length) L.push(`## ${p.title}  \n_${p.file}_`, '', rows.join('\n\n'), '');
    });
    const imgs = allFields.filter(x => x.f.type === 'img' && filled(x.k)).map(x => `- ${get(x.k).name} → ${x.p.title} / ${x.s.title} / ${x.f.label}`);
    if (imgs.length) L.push('## Images to send', '', ...imgs, '');
    return L.join('\n');
  }
  document.getElementById('btnJson').addEventListener('click', () => {
    dl('portfolio-content.json', JSON.stringify(clean(), null, 2), 'application/json');
    toast('JSON exported');
  });
  document.getElementById('btnMd').addEventListener('click', () => {
    dl('portfolio-content.md', md(), 'text/markdown');
    toast('Brief exported');
  });
  const fileIn = document.getElementById('fileIn');
  document.getElementById('btnImport').addEventListener('click', () => fileIn.click());
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files[0];
    if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      const src = j.pages || {};
      Object.entries(src).forEach(([pid, pg]) => Object.entries(pg.sections || {}).forEach(([sid, sn]) => Object.entries(sn).forEach(([fid, v]) => {
        data[path(pid, sid, fid)] = v;
      })));
      localStorage.setItem(KEY, JSON.stringify(data));
      location.reload();
    } catch (e) {
      toast('Could not read that file');
    }
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/content-editor.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/content-schema.js
try { (() => {
/* Structure of the live site. Each page → sections → fields.
   type: text | long | list | img       id must stay stable (it maps to the real markup). */
window.PORTFOLIO_SCHEMA = [{
  id: 'global',
  title: 'Global / shared',
  file: 'all pages',
  note: 'Appears on every page — chrome, footer, contact links.',
  sections: [{
    id: 'identity',
    title: 'Identity',
    fields: [{
      id: 'name',
      type: 'text',
      label: 'Your name',
      hint: 'Footer + browser title'
    }, {
      id: 'role',
      type: 'text',
      label: 'Role line',
      hint: 'e.g. Designer & developer, Providence RI'
    }, {
      id: 'email',
      type: 'text',
      label: 'Email'
    }, {
      id: 'linkedin',
      type: 'text',
      label: 'LinkedIn URL'
    }, {
      id: 'links',
      type: 'list',
      label: 'Other links',
      hint: 'Label — URL, one per row'
    }]
  }, {
    id: 'footer',
    title: 'Footer',
    fields: [{
      id: 'cta',
      type: 'text',
      label: 'Closing question',
      hint: 'Currently "Interested in working together?"'
    }, {
      id: 'copyright',
      type: 'text',
      label: 'Copyright line'
    }]
  }]
}, {
  id: 'index',
  title: 'Index — the desk',
  file: 'Folder Model v5.html',
  note: 'The landing page: desk scene with the folder, project list, and the Bio / Contact sheets that wipe in.',
  sections: [{
    id: 'hero',
    title: 'Header',
    fields: [{
      id: 'name',
      type: 'text',
      label: 'Name / wordmark'
    }, {
      id: 'tagline',
      type: 'long',
      label: 'Tagline',
      hint: 'One or two lines under the name'
    }, {
      id: 'nav',
      type: 'list',
      label: 'Nav labels',
      hint: 'Currently Index · Bio · Contact'
    }]
  }, {
    id: 'projects',
    title: 'Project list',
    fields: [{
      id: 'rows',
      type: 'list',
      label: 'Rows, in order',
      hint: 'Title — Year — Category — page file. One per row.',
      seed: ['Hell or Sell — 2026 — Code — (page not built yet)', 'Heads Up Website Redesign — 2026 — Code — Case - Heads Up.html', 'Orbit of Desire — 2025 — Game design — Case - Orbit of Desire.html', 'Boid Sequencer — 2025 — Computational — Case - Music Boids.html', 'Illustration — 2023–26 — Fine art — Case - Illustration.html', 'Drawings — 2023–26 — Fine art — Case - Drawings.html']
    }, {
      id: 'blurbs',
      type: 'list',
      label: 'One-line blurbs',
      hint: 'Optional short description per project, same order as above'
    }]
  }, {
    id: 'desk',
    title: 'Desk objects',
    fields: [{
      id: 'objects',
      type: 'list',
      label: 'What sits on the desk',
      hint: 'Currently: organizer with 3 books (Novecento, The Iliad, Do Androids Dream of Electric Sheep), volleyball, notepad',
      seed: ['Book — Novecento', 'Book — The Iliad', 'Book — Do Androids Dream of Electric Sheep', 'Volleyball', 'Notepad']
    }, {
      id: 'notepad',
      type: 'long',
      label: 'Notepad text',
      hint: 'The handwritten note on the desk'
    }]
  }, {
    id: 'bio',
    title: 'Bio sheet',
    fields: [{
      id: 'headline',
      type: 'text',
      label: 'Headline'
    }, {
      id: 'body',
      type: 'long',
      label: 'Bio copy',
      hint: '2–4 short paragraphs; blank line between them'
    }, {
      id: 'portrait',
      type: 'img',
      label: 'Portrait'
    }, {
      id: 'education',
      type: 'list',
      label: 'Education',
      hint: 'School — degree — years'
    }, {
      id: 'experience',
      type: 'list',
      label: 'Experience',
      hint: 'Org — role — years'
    }, {
      id: 'skills',
      type: 'list',
      label: 'Skills'
    }, {
      id: 'exhibitions',
      type: 'list',
      label: 'Exhibitions / awards'
    }]
  }, {
    id: 'contact',
    title: 'Contact sheet',
    fields: [{
      id: 'headline',
      type: 'text',
      label: 'Headline'
    }, {
      id: 'body',
      type: 'long',
      label: 'Copy'
    }]
  }]
}, {
  id: 'headsup',
  title: 'Case — Heads Up Website Redesign',
  file: 'Case - Heads Up.html',
  note: '3D MacBook intro with three frosted panels, then three sections: Overview, Design direction, Prototype & tooling.',
  sections: [{
    id: 'intro',
    title: 'Intro panels (over the 3D Mac)',
    fields: [{
      id: 'p1_title',
      type: 'text',
      label: '01 Overview — title'
    }, {
      id: 'p1_body',
      type: 'long',
      label: '01 Overview — copy'
    }, {
      id: 'p2_title',
      type: 'text',
      label: '02 Role — title'
    }, {
      id: 'p2_body',
      type: 'long',
      label: '02 Role — copy'
    }, {
      id: 'p3_tools',
      type: 'list',
      label: '03 Tools — chips',
      seed: ['Figma', 'Claude / AI-assisted coding', 'HTML', 'CSS', 'JavaScript', 'Lucidchart', 'Webflow']
    }]
  }, {
    id: 'rail',
    title: 'Side rail',
    fields: [{
      id: 'outcome',
      type: 'list',
      label: 'Outcome bullets'
    }]
  }, {
    id: 'overview',
    title: '01 — Overview',
    fields: [{
      id: 'h',
      type: 'text',
      label: 'Heading'
    }, {
      id: 'body',
      type: 'long',
      label: 'Copy'
    }, {
      id: 'stats',
      type: 'list',
      label: 'Scale numbers',
      hint: 'Number — label',
      seed: ['120+ — Chapters', '38 — States', '10k+ — Students reached']
    }, {
      id: 'statnote',
      type: 'text',
      label: 'Footnote under numbers'
    }, {
      id: 'wins',
      type: 'list',
      label: 'Four outcome cells'
    }]
  }, {
    id: 'direction',
    title: '02 — Design direction',
    fields: [{
      id: 'take',
      type: 'text',
      label: 'Pull-quote / takeaway'
    }, {
      id: 'body',
      type: 'long',
      label: 'Copy'
    }, {
      id: 'img_before',
      type: 'img',
      label: 'Image — the previous website'
    }, {
      id: 'h_prog',
      type: 'text',
      label: 'Progression heading'
    }, {
      id: 'prog_body',
      type: 'long',
      label: 'Progression copy'
    }, {
      id: 'img_p1',
      type: 'img',
      label: 'Image — initial direction'
    }, {
      id: 'img_p2',
      type: 'img',
      label: 'Image — team feedback artifact'
    }, {
      id: 'img_p3',
      type: 'img',
      label: 'Image — refined / selected direction'
    }, {
      id: 'det',
      type: 'long',
      label: '“What changed between rounds” — expandable copy'
    }]
  }, {
    id: 'build',
    title: '03 — Prototype & tooling',
    fields: [{
      id: 'take',
      type: 'text',
      label: 'Pull-quote / takeaway'
    }, {
      id: 'body',
      type: 'long',
      label: 'Copy'
    }, {
      id: 'img_proto',
      type: 'img',
      label: 'Image / video still — coded prototype'
    }, {
      id: 'h_tool',
      type: 'text',
      label: 'Tool section heading'
    }, {
      id: 'tool_body',
      type: 'long',
      label: 'Tool copy'
    }, {
      id: 'tool_props',
      type: 'list',
      label: 'Tool readout labels',
      seed: ['Element — Type and tag', 'Classes — Applied selectors', 'Context — Parent / layout', 'Size — Width & height behavior', 'Spacing — Margins and padding', 'Type — Typography values', 'Inherited — Cascaded properties', 'Sizing — Fixed, fill, or hug']
    }, {
      id: 'img_t1',
      type: 'img',
      label: 'Image — helper running on the site'
    }, {
      id: 'img_t2',
      type: 'img',
      label: 'Image — zoomed helper interface'
    }, {
      id: 'img_t3',
      type: 'img',
      label: 'Image — element → Webflow settings'
    }, {
      id: 'det',
      type: 'long',
      label: '“Implementation notes” — expandable copy'
    }, {
      id: 'closer',
      type: 'text',
      label: 'Closing line'
    }]
  }]
}, {
  id: 'boids',
  title: 'Case — Boid Sequencer',
  file: 'Case - Music Boids.html',
  note: 'Live boids instrument. Five sections: Concept, At a glance, How it works, Under the hood, References.',
  sections: [{
    id: 'hero',
    title: 'Hero',
    fields: [{
      id: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      hint: 'Currently: Computational · 2025 · Solo'
    }, {
      id: 'title',
      type: 'text',
      label: 'Title'
    }, {
      id: 'deck',
      type: 'long',
      label: 'Deck / subtitle'
    }]
  }, {
    id: 'concept',
    title: '01 — Concept',
    fields: [{
      id: 'body',
      type: 'long',
      label: 'Copy'
    }, {
      id: 'img',
      type: 'img',
      label: 'Image (optional)'
    }]
  }, {
    id: 'glance',
    title: '02 — At a glance',
    fields: [{
      id: 'facts',
      type: 'list',
      label: 'Fact rows',
      hint: 'Label — value'
    }]
  }, {
    id: 'works',
    title: '03 — How it works',
    fields: [{
      id: 'h',
      type: 'text',
      label: 'Heading',
      hint: 'Currently "Four panels, one instrument."'
    }, {
      id: 'panels',
      type: 'list',
      label: 'Four panels',
      hint: 'Name — description',
      seed: ['Harmonic Line — ', 'Orbiters — ', 'Instruments — ', 'Tempo & Motion — ']
    }]
  }, {
    id: 'hood',
    title: '04 — Under the hood',
    fields: [{
      id: 'steps',
      type: 'list',
      label: 'Four steps',
      hint: 'Name — description',
      seed: ['Sense — ', 'Cross — ', 'Voice — ', 'Draw — ']
    }]
  }, {
    id: 'refs',
    title: '05 — References',
    fields: [{
      id: 'items',
      type: 'list',
      label: 'References',
      hint: 'Title — author/source — URL'
    }]
  }]
}, {
  id: 'orbit',
  title: 'Case — Orbit of Desire',
  file: 'Case - Orbit of Desire.html',
  note: 'Five horizontal slides: title, Premise, In the scene, Drafts, Final scene.',
  sections: [{
    id: 's1',
    title: 'Slide 01 — Title',
    fields: [{
      id: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      hint: 'Currently: Game design · 2025 · Brown–RISD Game Dev'
    }, {
      id: 'title',
      type: 'text',
      label: 'Title'
    }, {
      id: 'deck',
      type: 'long',
      label: 'Deck'
    }]
  }, {
    id: 's2',
    title: 'Slide 02 — Premise',
    fields: [{
      id: 'body',
      type: 'long',
      label: 'Copy'
    }, {
      id: 'img',
      type: 'img',
      label: 'Image'
    }]
  }, {
    id: 's3',
    title: 'Slide 03 — In the scene',
    fields: [{
      id: 'body',
      type: 'long',
      label: 'Copy'
    }, {
      id: 'img',
      type: 'img',
      label: 'Image'
    }]
  }, {
    id: 's4',
    title: 'Slide 04 — Drafts',
    fields: [{
      id: 'body',
      type: 'long',
      label: 'Copy'
    }, {
      id: 'img1',
      type: 'img',
      label: 'Draft 1'
    }, {
      id: 'img2',
      type: 'img',
      label: 'Draft 2'
    }, {
      id: 'img3',
      type: 'img',
      label: 'Draft 3'
    }]
  }, {
    id: 's5',
    title: 'Slide 05 — Final scene',
    fields: [{
      id: 'body',
      type: 'long',
      label: 'Copy'
    }, {
      id: 'img',
      type: 'img',
      label: 'Final artwork'
    }]
  }]
}, {
  id: 'illustration',
  title: 'Case — Illustration',
  file: 'Case - Illustration.html',
  note: 'Six plates with an index, the plate gallery, and a statement.',
  sections: [{
    id: 'hero',
    title: 'Hero',
    fields: [{
      id: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      hint: 'Currently: Fine Art · 2023 — 2025 · Six plates'
    }, {
      id: 'title',
      type: 'text',
      label: 'Title'
    }, {
      id: 'deck',
      type: 'long',
      label: 'Deck'
    }]
  }, {
    id: 'plates',
    title: 'Plates',
    fields: [{
      id: 'p1',
      type: 'img',
      label: 'Plate 01'
    }, {
      id: 'c1',
      type: 'text',
      label: 'Plate 01 — title, medium, year'
    }, {
      id: 'p2',
      type: 'img',
      label: 'Plate 02'
    }, {
      id: 'c2',
      type: 'text',
      label: 'Plate 02 — title, medium, year'
    }, {
      id: 'p3',
      type: 'img',
      label: 'Plate 03'
    }, {
      id: 'c3',
      type: 'text',
      label: 'Plate 03 — title, medium, year'
    }, {
      id: 'p4',
      type: 'img',
      label: 'Plate 04'
    }, {
      id: 'c4',
      type: 'text',
      label: 'Plate 04 — title, medium, year'
    }, {
      id: 'p5',
      type: 'img',
      label: 'Plate 05'
    }, {
      id: 'c5',
      type: 'text',
      label: 'Plate 05 — title, medium, year'
    }, {
      id: 'p6',
      type: 'img',
      label: 'Plate 06'
    }, {
      id: 'c6',
      type: 'text',
      label: 'Plate 06 — title, medium, year'
    }]
  }, {
    id: 'statement',
    title: '03 — Statement',
    fields: [{
      id: 'body',
      type: 'long',
      label: 'Artist statement'
    }]
  }]
}, {
  id: 'drawings',
  title: 'Case — Drawings',
  file: 'Case - Drawings.html',
  note: 'Browsable drawing frame with crop marks; each drawing shows at its true aspect ratio. Add as many rows as you have drawings.',
  sections: [{
    id: 'hero',
    title: 'Hero',
    fields: [{
      id: 'title',
      type: 'text',
      label: 'Title'
    }, {
      id: 'deck',
      type: 'long',
      label: 'Deck'
    }]
  }, {
    id: 'works',
    title: 'Drawings',
    fields: [{
      id: 'd1',
      type: 'img',
      label: 'Drawing 01'
    }, {
      id: 'm1',
      type: 'text',
      label: '01 — title, medium, size, year'
    }, {
      id: 'd2',
      type: 'img',
      label: 'Drawing 02'
    }, {
      id: 'm2',
      type: 'text',
      label: '02 — title, medium, size, year'
    }, {
      id: 'd3',
      type: 'img',
      label: 'Drawing 03'
    }, {
      id: 'm3',
      type: 'text',
      label: '03 — title, medium, size, year'
    }, {
      id: 'd4',
      type: 'img',
      label: 'Drawing 04'
    }, {
      id: 'm4',
      type: 'text',
      label: '04 — title, medium, size, year'
    }, {
      id: 'd5',
      type: 'img',
      label: 'Drawing 05'
    }, {
      id: 'm5',
      type: 'text',
      label: '05 — title, medium, size, year'
    }, {
      id: 'd6',
      type: 'img',
      label: 'Drawing 06'
    }, {
      id: 'm6',
      type: 'text',
      label: '06 — title, medium, size, year'
    }, {
      id: 'more',
      type: 'list',
      label: 'Additional drawings',
      hint: 'Filename — title, medium, size, year'
    }]
  }]
}, {
  id: 'magnetoreception',
  title: 'Case — Magnetoreception',
  file: 'Case - Magnetoreception.html',
  note: 'Wearable wing. Six sections: Concept, At a glance, How it behaves, How it\'s built, What got cut, Where it started. Copy is written from your concept statement — these fields are the gaps it could not answer.',
  sections: [{
    id: 'facts',
    title: 'Missing facts',
    fields: [{
      id: 'when',
      type: 'text',
      label: 'Semester / dates',
      hint: 'Page currently says 2026'
    }, {
      id: 'course',
      type: 'text',
      label: 'Course name and instructor'
    }, {
      id: 'birds',
      type: 'list',
      label: 'The five bird species',
      hint: 'And their migration headings if you mapped specific ones'
    }, {
      id: 'display',
      type: 'text',
      label: 'What is the display, exactly?',
      hint: 'LCD, OLED, 7-segment?'
    }, {
      id: 'board',
      type: 'text',
      label: 'Which microcontroller?'
    }, {
      id: 'response',
      type: 'long',
      label: 'How did people react when they wore it?',
      hint: 'Critique, demo, anything said out loud'
    }]
  }, {
    id: 'images',
    title: 'Images',
    fields: [{
      id: 'hero',
      type: 'img',
      label: 'The finished wearable, worn'
    }, {
      id: 'aligned',
      type: 'img',
      label: 'Wing wide — aligned'
    }, {
      id: 'off',
      type: 'img',
      label: 'Wing narrow — off course'
    }, {
      id: 'circuit',
      type: 'img',
      label: 'Soldered circuit board'
    }, {
      id: 'cuff',
      type: 'img',
      label: 'Printed cuff, five panels'
    }, {
      id: 'feather',
      type: 'img',
      label: 'Wire and foil feather detail'
    }, {
      id: 'ref',
      type: 'img',
      label: 'Reference board'
    }, {
      id: 'video',
      type: 'text',
      label: 'Video of it moving?',
      hint: 'If you have a clip, say where — a moving wing is worth more than any still'
    }]
  }]
}, {
  id: 'window',
  title: 'Case — Prosthetic Window',
  file: 'Case - Prosthetic Window.html',
  note: 'Responsive bioplastic window. Six sections: Concept, At a glance, How it responds, Three systems, Making the surface, Drafts.',
  sections: [{
    id: 'facts',
    title: 'Missing facts',
    fields: [{
      id: 'when',
      type: 'text',
      label: 'Semester / dates'
    }, {
      id: 'course',
      type: 'text',
      label: 'Course name and instructor'
    }, {
      id: 'size',
      type: 'text',
      label: 'Finished dimensions',
      hint: 'How big is the window?'
    }, {
      id: 'board',
      type: 'text',
      label: 'Which Arduino board and LED type?'
    }, {
      id: 'batches',
      type: 'text',
      label: 'How many bioplastic batches did it take?'
    }, {
      id: 'shown',
      type: 'text',
      label: 'Was it exhibited or installed anywhere?'
    }, {
      id: 'response',
      type: 'long',
      label: 'How did people react to it in the room?'
    }]
  }, {
    id: 'images',
    title: 'Images',
    fields: [{
      id: 'hero',
      type: 'img',
      label: 'Installed and lit, straight on'
    }, {
      id: 'cold',
      type: 'img',
      label: 'Cold state — nobody near'
    }, {
      id: 'warm',
      type: 'img',
      label: 'Warm state — viewer at the surface'
    }, {
      id: 'circuit',
      type: 'img',
      label: 'Arduino circuit and sensors'
    }, {
      id: 'leds',
      type: 'img',
      label: 'LED array on reflective fabric'
    }, {
      id: 'membrane',
      type: 'img',
      label: 'Membrane backlit'
    }, {
      id: 'bio',
      type: 'img',
      label: 'Bioplastic experiments'
    }, {
      id: 'assembly',
      type: 'img',
      label: 'Trimming and assembling'
    }, {
      id: 'draft1',
      type: 'img',
      label: 'Draft 01'
    }, {
      id: 'draft2',
      type: 'img',
      label: 'Draft 02'
    }]
  }]
}, {
  id: 'hellorsell',
  title: 'Case — Hell or Sell (not built yet)',
  file: '— to be created',
  note: 'Newest project, listed on the index but with no page yet. Fill this in and I will build the page from it.',
  sections: [{
    id: 'hero',
    title: 'Hero',
    fields: [{
      id: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      hint: 'Category · year · context'
    }, {
      id: 'title',
      type: 'text',
      label: 'Title'
    }, {
      id: 'deck',
      type: 'long',
      label: 'Deck — what it is in two sentences'
    }, {
      id: 'role',
      type: 'text',
      label: 'Your role'
    }, {
      id: 'tools',
      type: 'list',
      label: 'Tools'
    }]
  }, {
    id: 'body',
    title: 'Body',
    fields: [{
      id: 'problem',
      type: 'long',
      label: 'The problem / brief'
    }, {
      id: 'process',
      type: 'long',
      label: 'Process'
    }, {
      id: 'outcome',
      type: 'long',
      label: 'Outcome'
    }, {
      id: 'img1',
      type: 'img',
      label: 'Hero image'
    }, {
      id: 'img2',
      type: 'img',
      label: 'Process image'
    }, {
      id: 'img3',
      type: 'img',
      label: 'Final image'
    }, {
      id: 'shape',
      type: 'long',
      label: 'How should this page feel?',
      hint: 'Anything about structure, motion, or reference pages you want me to follow'
    }]
  }]
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/content-schema.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/cs-sections.js
try { (() => {
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
  function label(text) {
    return text ? el('div', {
      class: 'cs-label'
    }, text) : null;
  }

  // ---- hero · bg (full-bleed image behind title, with legibility veil) ----
  function heroBg(s, work) {
    const hero = el('section', {
      class: 'cs-hero'
    }, [el('div', {
      class: 'cs-hero__veil'
    }), el('div', {
      class: 'cs-hero__inner'
    }, [rv(el('div', {
      class: 'cs-eyebrow'
    }, `${work.kind} · ${work.year}`)), rv(el('h1', {
      class: 'cs-title',
      html: `${work.title} <span class="ext">↗</span>`
    }), 80), rv(el('p', {
      class: 'cs-deck'
    }, s.deck || work.deck), 160)]), el('div', {
      class: 'scroll-cue'
    }, '( scroll )')]);
    hero.style.setProperty('--cs-hero-bg', `url(${s.img || work.img})`);
    return hero;
  }

  // ---- hero · split (title + key art side by side) ----
  function heroSplit(s, work) {
    return el('section', {
      class: 'cs-hero2'
    }, [el('div', {
      class: 'cs-hero2__copy'
    }, [rv(el('span', {
      class: 'cs-eyebrow'
    }, `${work.kind} · ${work.year}`)), rv(el('h1', {
      class: 'cs-title'
    }, work.title), 80), rv(el('p', {
      class: 'cs-deck'
    }, s.deck || work.deck), 160)]), rv(el('div', {
      class: 'cs-hero2__media'
    }, [el('img', {
      src: s.img || work.img,
      alt: work.title
    })]), 120)]);
  }

  // ---- marquee (rolling tag banner) ----
  function marquee(s) {
    const items = s.items || [];
    const run = () => el('div', {
      class: 'cs-marquee__item'
    }, items.join('  ✦  '));
    // duplicate the run so the -50% loop is seamless
    const track = el('div', {
      class: 'cs-marquee__track'
    }, [run(), run()]);
    return el('section', {
      class: 'cs-marquee'
    }, [track]);
  }

  // ---- concept statement ----
  function concept(s) {
    const p = el('p', {});
    p.innerHTML = s.text; // allows <span class="hl"> accents
    return el('section', {
      class: 'cs-sec cs-concept'
    }, [rv(el('div', {}, [label(s.label || 'Concept'), p]))]);
  }

  // ---- text + image ----
  function textImage(s, work) {
    const body = el('div', {
      class: 'cs-ti__body'
    }, [label(s.label), s.heading ? el('h3', {}, s.heading) : null, ...(s.paras || []).map(t => el('p', {}, t))]);
    const media = el('div', {
      class: 'cs-ti__media'
    }, [el('img', {
      src: s.img,
      alt: s.cap || ''
    }), s.cap ? el('div', {
      class: 'cs-ti__cap'
    }, s.cap) : null]);
    return el('section', {
      class: 'cs-sec'
    }, [rv(el('div', {
      class: 'cs-ti' + (s.flip ? ' cs-ti--flip' : '')
    }, [body, media]))]);
  }

  // ---- prose (labelled paragraphs) ----
  function prose(s) {
    return el('section', {
      class: 'cs-sec'
    }, [rv(el('div', {
      class: 'cs-prose'
    }, [label(s.label), ...(s.paras || []).map(t => el('p', {}, t))]))]);
  }

  // ---- breakdown grid (info at a glance) ----
  function breakdown(s) {
    const cells = (s.cells || []).map(c => el('div', {
      class: 'cs-breakdown__cell'
    }, [el('div', {
      class: 'cs-breakdown__k'
    }, c.k), el('div', {
      class: 'cs-breakdown__v'
    }, c.v)]));
    return el('section', {
      class: 'cs-sec'
    }, [label(s.label || 'At a glance'), rv(el('div', {
      class: 'cs-breakdown'
    }, cells))]);
  }

  // ---- numbered steps (how it was achieved) ----
  function steps(s) {
    const rows = (s.items || []).map((it, i) => rv(el('div', {
      class: 'cs-step'
    }, [el('div', {
      class: 'cs-step__n'
    }, String(i + 1).padStart(2, '0')), el('div', {
      class: 'cs-step__b'
    }, [el('h4', {}, it.title), el('p', {}, it.body)])]), i * 60));
    return el('section', {
      class: 'cs-sec'
    }, [label(s.label || 'How it was achieved'), el('div', {
      class: 'cs-steps'
    }, rows)]);
  }

  // ---- process grid (group of images) ----
  function processGrid(s) {
    const figs = (s.items || []).map((it, i) => rv(el('figure', {}, [el('img', {
      src: it.img,
      alt: it.cap || ''
    }), it.cap ? el('figcaption', {}, it.cap) : null]), i % 4 * 70));
    return el('section', {
      class: 'cs-sec'
    }, [label(s.label || 'Process'), el('div', {
      class: 'cs-pgrid'
    }, figs)]);
  }

  // ---- detail (one large image) ----
  function detail(s) {
    return el('section', {
      class: 'cs-sec'
    }, [rv(el('div', {
      class: 'cs-detail'
    }, [el('img', {
      src: s.img,
      alt: s.cap || ''
    }), s.cap ? el('div', {
      class: 'cs-detail__cap'
    }, s.cap) : null]))]);
  }

  // ---- hover terms (words reveal an image) ----
  function hoverTerms(s) {
    const p = el('p', {});
    (s.parts || []).forEach(part => {
      if (typeof part === 'string') {
        p.appendChild(document.createTextNode(part));
      } else {
        const term = el('span', {
          class: 'cs-term'
        }, [part.term, el('img', {
          class: 'cs-term__img',
          src: part.img,
          alt: part.term
        })]);
        p.appendChild(term);
      }
    });
    return el('section', {
      class: 'cs-sec cs-hover'
    }, [rv(el('div', {}, [label(s.label || 'Approach'), p]))]);
  }

  // ---- references ----
  function references(s) {
    const rows = (s.items || []).map((it, i) => el('div', {
      class: 'cs-ref'
    }, [el('span', {
      class: 'cs-ref__n'
    }, String(i + 1).padStart(2, '0')), el('span', {
      class: 'cs-ref__t'
    }, it.title), el('span', {
      class: 'cs-ref__s'
    }, it.src || '')]));
    return el('section', {
      class: 'cs-sec'
    }, [label(s.label || 'References'), rv(el('div', {
      class: 'cs-refs'
    }, rows))]);
  }

  // ---- final display ----
  function final(s) {
    return el('section', {
      class: 'cs-sec cs-final'
    }, [rv(el('div', {}, [label(s.label || 'Final'), el('img', {
      src: s.img,
      alt: s.cap || ''
    }), s.cap ? el('div', {
      class: 'cs-final__cap'
    }, s.cap) : null]))]);
  }
  const RENDERERS = {
    heroBg,
    heroSplit,
    marquee,
    concept,
    textImage,
    prose,
    breakdown,
    steps,
    processGrid,
    detail,
    hoverTerms,
    references,
    final
  };
  function render(section, work) {
    const fn = RENDERERS[section.type];
    return fn ? fn(section, work) : null;
  }
  window.CSX = {
    render,
    has: t => !!RENDERERS[t]
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/cs-sections.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/drawings.js
try { (() => {
/* Drawings — label-style carousel: one active sheet centred, neighbours ghosted off both edges */
(function () {
  const SHEETS = [{
    n: '01',
    t: 'Long pose, seated',
    m: 'Graphite on newsprint',
    d: 'Nov 12, 2024',
    f: 'figure',
    img: 'assets/drawing-class-1.jpeg',
    note: 'Three-hour pose in one sitting. The weight sits in the hip and the rest follows from there.'
  }, {
    n: '02',
    t: 'Twenty-minute back',
    m: 'Graphite on newsprint',
    d: 'Nov 12, 2024',
    f: 'figure',
    img: 'assets/drawing-class-2.jpeg',
    note: 'Short pose from the same session. Enough time for structure, not for rendering.'
  }, {
    n: '03',
    t: 'Hands, repeated',
    m: 'Ink & brush pen',
    d: 'Mar 04, 2024',
    f: 'study',
    img: '',
    note: 'The same hand fourteen times, until the knuckle line stopped being a guess.'
  }, {
    n: '04',
    t: 'Drapery study',
    m: 'Graphite, 6B',
    d: 'Sep 21, 2023',
    f: 'study',
    img: '',
    note: 'Drawing folds as a lighting problem rather than a fabric one.'
  }, {
    n: '05',
    t: 'Head turnaround',
    m: 'Procreate',
    d: 'Jan 30, 2025',
    f: 'digital',
    img: '',
    note: 'Five angles of one head, built for a character sheet that never got made.'
  }, {
    n: '06',
    t: 'Commute pages',
    m: 'Sketchbook, ballpoint',
    d: 'Apr 08, 2025',
    f: 'sketchbook',
    img: '',
    note: 'Drawn on the train, where nobody holds still.'
  }, {
    n: '07',
    t: 'Value block-in',
    m: 'Procreate',
    d: 'Jun 15, 2025',
    f: 'digital',
    img: '',
    note: 'Four values, no line — testing how far shape alone carries a figure.'
  }, {
    n: '08',
    t: 'Gesture, one minute',
    m: 'Sketchbook, marker',
    d: 'Jul 02, 2025',
    f: 'sketchbook',
    img: '',
    note: 'Marker, so a wrong line stays in.'
  }];
  const track = document.getElementById('track');
  const rail = document.querySelector('.rail');
  const cnt = document.getElementById('cnt');
  const info = document.getElementById('info');
  let filter = 'all',
    view = SHEETS.slice(),
    cur = 0;

  // build every card once; filtering only changes which ones are laid out
  const nodes = SHEETS.map((s, i) => {
    const el = document.createElement('article');
    el.className = 'item';
    const media = s.img ? '<img src="' + s.img + '" alt="' + s.t + '">' : '<image-slot id="draw-' + s.n + '" shape="rect" placeholder="Drop sheet ' + s.n + '"></image-slot>';
    el.innerHTML = '<div class="band"><div class="tab"><span class="sq"></span>' + s.t + '</div>' + '<div class="tools"><button type="button" data-a="shuffle" title="Shuffle">⤨</button>' + '<button type="button" data-a="prev" title="Previous">&laquo;</button>' + '<button type="button" data-a="next" title="Next">&raquo;</button></div></div>' + '<div class="frame">' + media + '<span class="cm a"></span><span class="cm b"></span><span class="cm c"></span><span class="cm d"></span></div>' + '<div class="meta"><div class="l"><span><span class="no">[' + s.n + ']</span> &nbsp;' + s.t + '</span><span>' + s.d + '</span></div>' + '<div class="r"><button type="button" data-a="info">Sheet info ↳</button><button type="button" data-a="open">View full ↳</button></div></div>';
    el.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (b) {
        const a = b.dataset.a;
        if (a === 'next') step(1);else if (a === 'prev') step(-1);else if (a === 'shuffle') shuffle();else if (a === 'info' || a === 'open') openInfo();
        return;
      }
      if (e.target.closest('image-slot')) return;
      const at = view.indexOf(s);
      if (at > -1 && at !== cur) {
        cur = at;
        layout();
      }
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
    nodes.forEach(el => {
      el.style.display = 'none';
      el.classList.remove('active');
    });
    view.forEach((s, i) => {
      const el = nodes[SHEETS.indexOf(s)];
      // wrap the offset so ghosts always bleed off BOTH edges, at every index
      let d = i - cur;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;
      el.style.display = '';
      el.style.transform = 'translate3d(calc(-50% + ' + d * gapPct + '%),-50%,0) scale(' + (d === 0 ? 1 : 0.94) + ')';
      el.style.zIndex = String(10 - Math.abs(d));
      if (d === 0) el.classList.add('active');
    });
    cnt.textContent = cur + 1 + ' / ' + view.length;
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
    const b = e.target.closest('.fchip');
    if (!b) return;
    filter = b.dataset.f;
    document.querySelectorAll('.fchip').forEach(c => c.setAttribute('aria-pressed', String(c === b)));
    view = filter === 'all' ? SHEETS.slice() : SHEETS.filter(s => s.f === filter);
    cur = 0;
    layout();
  });
  addEventListener('keydown', e => {
    if (info.classList.contains('on')) {
      if (e.key === 'Escape') info.classList.remove('on');
      return;
    }
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  addEventListener('resize', () => layout());

  // wheel scrubbing, scoped to the rail so it can never fight page scroll
  let lock = 0;
  rail.addEventListener('wheel', e => {
    const now = Date.now();
    if (now < lock) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12) return;
    lock = now + 420;
    step(d > 0 ? 1 : -1);
  }, {
    passive: true
  });
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
  info.addEventListener('click', e => {
    if (e.target === info) info.classList.remove('on');
  });
  layout();
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/drawings.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/folder-desk-ui.js
try { (() => {
/* Folder Model v5 — 2D UI layer (index, cursor, HUD, CV, mode) */
(function () {
  // ongoing body of work — end year tracks the current year
  const ONGOING = '2023\u2013' + String(new Date().getFullYear()).slice(2);
  const WORKS = [{
    id: 'heads-up',
    title: 'Heads Up Redesign',
    year: '2026',
    disc: 'CODE',
    img: 'assets/hu-style.png',
    href: 'Case - Heads Up.html',
    desc: 'Website redesign for a student nonprofit working on screen time. Selected out of three directions, then built and handed off in Webflow.',
    tags: ['UX/UI', 'Webflow', 'Prototyping', 'Nonprofit']
  }, {
    id: 'music-boids',
    title: 'Boid Sequencer',
    year: '2025',
    disc: 'CODE',
    img: 'assets/boid.png',
    href: 'Case - Music Boids.html',
    desc: 'A step sequencer whose buttons drift out of position, so you steer the system instead of programming it.',
    tags: ['p5.js', 'Tone.js', 'Generative', 'Toy']
  }, {
    id: 'magnetoreception',
    title: 'Prosthesis',
    year: '2026',
    disc: 'PHYS',
    img: 'assets/mag-worn-1600.png',
    href: 'Case - Magnetoreception.html',
    desc: 'A wearable wing that flaps wide only when your arm points along a bird\'s migration route.',
    tags: ['Wearable', 'Servos', 'Compass', 'Fabrication']
  }, {
    id: 'window',
    title: 'Prosthetic Window',
    year: '2026',
    disc: 'PHYS',
    img: 'assets/win-final-1600.jpg',
    href: 'Case - Prosthetic Window.html',
    desc: 'A fake window of cast bioplastic and 559 LEDs that responds to room light and to being approached.',
    tags: ['Arduino', 'Bioplastic', 'Installation', 'Sensing']
  }, {
    id: 'hellorsell',
    title: 'Hell or Sell',
    year: '2026',
    disc: 'GAMES',
    img: 'assets/hellorsell.png',
    desc: 'A student game made with a team of about twenty across two schools. Co-art lead; in final testing.',
    tags: ['Game Art', 'Art Direction', 'Team of 20']
  }, {
    id: 'orbit',
    title: 'Orbit of Desire',
    year: '2025',
    disc: 'GAMES',
    img: 'assets/orbit-title.png',
    href: 'Case - Orbit of Desire.html',
    desc: 'A sci-fi romance visual novel set aboard an intergalactic botany station.',
    tags: ['Visual Novel', 'Character', 'Branching', 'Botany']
  }, {
    id: 'illustration',
    title: 'Illustration',
    year: ONGOING,
    disc: 'ART',
    img: 'assets/illustration-1-preview.jpg',
    href: 'Case - Illustration.html',
    desc: 'Painterly digital illustration: narrative, character, and mood.',
    tags: ['Procreate', 'Narrative', 'Mood', 'Colour']
  }, {
    id: 'drawing',
    title: 'Drawing',
    year: '2025',
    disc: 'ART',
    img: 'assets/drawing-class-1.jpeg',
    href: 'Case - Drawings.html',
    desc: 'Charcoal and observational studies of light, form, and atmosphere.',
    tags: ['Charcoal', 'Observational', 'Studies', 'Black & White']
  }];
  const DISCS = ['PHYS', 'CODE', 'GAMES', 'ART'];
  const DOT = {
    CODE: '#2b6fdb',
    PHYS: '#3d8a63',
    GAMES: '#eb8a2e',
    ART: '#efbd1e'
  };

  // Shared bridge for the three.js layer
  const Desk = window.Desk = {
    works: WORKS,
    dots: DOT,
    setFace: null,
    setMode: null,
    pending: null,
    mode: 'day'
  };
  const index = document.getElementById('index');
  const foot = index.querySelector('.foot');
  const mEls = {};
  document.getElementById('idxCount').textContent = String(WORKS.length).padStart(2, '0');
  DISCS.forEach(d => {
    const h = document.createElement('div');
    h.className = 'grp-head';
    h.textContent = d;
    index.insertBefore(h, foot);
    WORKS.forEach((w, i) => {
      if (w.disc !== d) return;
      const m = document.createElement('div');
      m.className = 'mitem' + (w.href ? ' has-page' : '');
      m.innerHTML = '<span class="ix">' + String(i + 1).padStart(2, '0') + '</span><span class="nm">' + w.title + '</span><span class="yr">' + w.year + '</span>';
      m.addEventListener('mouseenter', () => setActive(i));
      if (w.href) m.addEventListener('click', () => {
        location.href = w.href;
      });
      index.insertBefore(m, foot);
      mEls[i] = m;
    });
  });
  const info = document.getElementById('info'),
    iTitle = document.getElementById('iTitle'),
    iYear = document.getElementById('iYear'),
    iDesc = document.getElementById('iDesc'),
    iTags = document.getElementById('iTags');
  let lastIdx = -1;
  function setActive(i) {
    lastIdx = i;
    const w = WORKS[i];
    Object.keys(mEls).forEach(k => mEls[k].classList.toggle('active', Number(k) === i));
    iTitle.textContent = w.title;
    iYear.textContent = w.year;
    iDesc.textContent = w.desc;
    iTags.innerHTML = w.tags.map(t => '<span class="itag">' + t + '</span>').join('');
    info.classList.add('show');
    if (Desk.setFace) Desk.setFace(i);else Desk.pending = i;
  }
  // leaving the index hides the info panel only — the folder keeps the last preview
  index.addEventListener('mouseleave', () => {
    Object.keys(mEls).forEach(k => mEls[k].classList.remove('active'));
    info.classList.remove('show');
  });

  // ---- clock ----
  const clkTime = document.getElementById('clkTime'),
    clkDate = document.getElementById('clkDate'),
    clkView = document.getElementById('clkView');
  function tick() {
    const d = new Date();
    clkTime.textContent = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    clkDate.textContent = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    clkView.textContent = innerWidth + ' × ' + innerHeight;
  }
  tick();
  setInterval(tick, 1000);
  addEventListener('resize', tick);

  // ---- cursor ----
  const cursor = document.getElementById('cursor'),
    curH = document.getElementById('curH'),
    curV = document.getElementById('curV'),
    curRet = document.getElementById('curRet'),
    curEnter = document.getElementById('curEnter'),
    curX = document.getElementById('curX'),
    curY = document.getElementById('curY');
  addEventListener('mousemove', e => {
    const x = e.clientX,
      y = e.clientY;
    curH.style.top = y + 'px';
    curV.style.left = x + 'px';
    curRet.style.left = x + 'px';
    curRet.style.top = y + 'px';
    curEnter.style.left = x + 'px';
    curEnter.style.top = y + 'px';
    curX.style.top = y + 'px';
    curX.textContent = 'X:' + String(x).padStart(3, '0');
    curY.style.left = x + 'px';
    curY.textContent = 'Y:' + String(y).padStart(3, '0');
    cursor.classList.toggle('hot', !!(e.target && e.target.closest && e.target.closest('.mitem,.hudbtn,a,button')));
  });
  document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
  document.addEventListener('mouseenter', () => cursor.style.opacity = '1');

  // ---- day / night ----
  const btnMode = document.getElementById('btnMode');
  btnMode.addEventListener('click', () => {
    Desk.mode = Desk.mode === 'day' ? 'night' : 'day';
    document.body.classList.toggle('night', Desk.mode === 'night');
    btnMode.textContent = Desk.mode === 'day' ? 'Night' : 'Day';
    if (Desk.setMode) Desk.setMode(Desk.mode);
  });

  // ---- CV swipe ----
  const EASE = 'cubic-bezier(0.76,0,0.24,1)';
  const reduceM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resume = document.getElementById('resume'),
    swipe = document.getElementById('swipe'),
    swRule = document.getElementById('swRule');
  function anim(el, frames, dur, delay) {
    try {
      el.animate(frames, {
        duration: dur,
        delay: delay || 0,
        easing: EASE,
        fill: 'forwards'
      });
    } catch (e) {}
  }
  function themedSwipe(swap) {
    if (reduceM) {
      swap && swap();
      return;
    }
    swipe.style.pointerEvents = 'auto';
    swipe.style.transformOrigin = 'bottom';
    anim(swipe, [{
      transform: 'scaleY(0)'
    }, {
      transform: 'scaleY(1)'
    }], 440);
    swRule.style.width = '0px';
    anim(swRule, [{
      width: '0px'
    }, {
      width: '130px'
    }], 380, 150);
    setTimeout(() => {
      swap && swap();
      swipe.style.transformOrigin = 'top';
      anim(swipe, [{
        transform: 'scaleY(1)'
      }, {
        transform: 'scaleY(0)'
      }], 540);
      setTimeout(() => {
        swipe.style.pointerEvents = 'none';
        swRule.style.width = '0px';
      }, 560);
    }, 580);
  }
  const bio = document.getElementById('bio'),
    contact = document.getElementById('contact');
  function openSheet(el) {
    themedSwipe(() => {
      [resume, bio, contact].forEach(s => {
        s.classList.remove('show');
        s.setAttribute('aria-hidden', 'true');
      });
      el.classList.add('show');
      el.setAttribute('aria-hidden', 'false');
      el.scrollTop = 0;
    });
  }
  function closeSheet(el) {
    themedSwipe(() => {
      el.classList.remove('show');
      el.setAttribute('aria-hidden', 'true');
    });
  }
  document.getElementById('btnCV').addEventListener('click', () => openSheet(resume));
  document.getElementById('btnBio').addEventListener('click', () => openSheet(bio));
  document.getElementById('btnContact').addEventListener('click', () => openSheet(contact));
  document.getElementById('rsBack').addEventListener('click', () => closeSheet(resume));
  document.getElementById('bioBack').addEventListener('click', () => closeSheet(bio));
  document.getElementById('ctBack').addEventListener('click', () => closeSheet(contact));
  addEventListener('keydown', e => {
    if (e.key === 'Escape') [resume, bio, contact].forEach(s => {
      if (s.classList.contains('show')) closeSheet(s);
    });
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/folder-desk-ui.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/illus-gallery.js
try { (() => {
/* Illustration index + plate grid + lightbox.
   Index rows follow the label-page pattern: hover a title, its plate floats out by the cursor. */
(function () {
  const PLATES = [{
    t: 'Quiet Hours',
    y: '2025',
    m: 'Procreate · digital',
    img: 'assets/illustration-1-preview.jpg',
    w: 1600,
    h: 1118
  }, {
    t: 'Understory',
    y: '2025',
    m: 'Procreate · digital',
    img: 'assets/illus-2-web.jpg',
    w: 1600,
    h: 1118
  }, {
    t: 'Second Language',
    y: '2024',
    m: 'Procreate · digital',
    img: 'assets/illus-3-web.jpg',
    w: 1118,
    h: 1600
  }, {
    t: 'Low Tide',
    y: '2024',
    m: 'Photoshop · digital',
    img: 'assets/illus-4-web.jpg',
    w: 1130,
    h: 1600
  }, {
    t: 'Room With No Sun',
    y: '2024',
    m: 'Procreate · digital',
    img: 'assets/illus-5-web.jpg',
    w: 1118,
    h: 1600
  }, {
    t: 'Carry',
    y: '2023',
    m: 'Clip Studio · digital',
    img: 'assets/illus-6-web.jpg',
    w: 1130,
    h: 1600
  }];
  const n2 = i => String(i + 1).padStart(2, '0');
  const idx = document.getElementById('idx');
  const gal = document.getElementById('gal');
  const plate = document.getElementById('plate');
  const plateImg = plate.querySelector('img');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- index rows ----
  PLATES.forEach((p, i) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'row rv';
    row.dataset.i = i;
    row.innerHTML = `<span class="n">[${n2(i)}]</span><span class="t">${p.t}</span><span class="m">${p.m}</span><span class="y">${p.y}</span>`;
    idx.appendChild(row);
  });

  // ---- plate grid ----
  PLATES.forEach((p, i) => {
    const f = document.createElement('figure');
    f.className = 'plateItem rv';
    f.dataset.i = i;
    f.innerHTML = `<img src="${p.img}" alt="${p.t}" width="${p.w}" height="${p.h}"><figcaption><span>${n2(i)} · ${p.t}</span><span>${p.y}</span></figcaption>`;
    gal.appendChild(f);
  });

  // ---- cursor-following plate on index hover ----
  let px = 0,
    py = 0,
    tx = 0,
    ty = 0,
    raf = 0,
    live = false;
  function loop() {
    px += (tx - px) * 0.16;
    py += (ty - py) * 0.16;
    plate.style.transform = `translate3d(${px}px,${py}px,0) translate(-50%,-50%) rotate(-3deg)`;
    raf = live ? requestAnimationFrame(loop) : 0;
  }
  addEventListener('pointermove', e => {
    tx = e.clientX + 150;
    ty = e.clientY;
  }, {
    passive: true
  });
  idx.addEventListener('pointerover', e => {
    const row = e.target.closest('.row');
    if (!row || reduce) return;
    plateImg.src = PLATES[+row.dataset.i].img;
    plateImg.alt = PLATES[+row.dataset.i].t;
    plate.classList.add('on');
    if (!live) {
      live = true;
      px = tx;
      py = ty;
      loop();
    }
  });
  idx.addEventListener('pointerleave', () => {
    plate.classList.remove('on');
    live = false;
    if (raf) cancelAnimationFrame(raf);
  });

  // ---- lightbox ----
  const lb = document.getElementById('lb'),
    lbImg = document.getElementById('lbImg');
  const lbT = document.getElementById('lbT'),
    lbY = document.getElementById('lbY'),
    lbN = document.getElementById('lbN');
  let cur = 0;
  function show(i) {
    cur = (i + PLATES.length) % PLATES.length;
    const p = PLATES[cur];
    lbImg.src = p.img;
    lbImg.alt = p.t;
    lbT.textContent = p.t;
    lbY.textContent = p.y;
    lbN.textContent = n2(cur);
  }
  function open(i) {
    show(i);
    lb.classList.add('on');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    plate.classList.remove('on');
  }
  function close() {
    lb.classList.remove('on');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  idx.addEventListener('click', e => {
    const r = e.target.closest('.row');
    if (r) open(+r.dataset.i);
  });
  gal.addEventListener('click', e => {
    const f = e.target.closest('.plateItem');
    if (f) open(+f.dataset.i);
  });
  document.getElementById('lbX').addEventListener('click', close);
  document.getElementById('lbP').addEventListener('click', () => show(cur - 1));
  document.getElementById('lbNx').addEventListener('click', () => show(cur + 1));
  lb.addEventListener('click', e => {
    if (e.target === lb) close();
  });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });

  // ---- index / grid view toggle ----
  const tog = document.getElementById('viewToggle');
  const secIdx = document.getElementById('index'),
    secGal = document.getElementById('plates');
  let mode = 'both';
  tog.addEventListener('click', () => {
    mode = mode === 'both' ? 'grid' : mode === 'grid' ? 'list' : 'both';
    secIdx.style.display = mode === 'grid' ? 'none' : '';
    secGal.style.display = mode === 'list' ? 'none' : '';
    tog.textContent = mode === 'both' ? 'Grid view' : mode === 'grid' ? 'List view' : 'Both';
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/illus-gallery.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
// Copied omelette starter. Re-running copy_starter_component with this kind overwrites this file with the latest version (page content is unaffected).
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever a design needs an image.
 * You control the slot's shape; it sizes to its container by default. When the search_stock_photos tool
 * is available, prefill the slot by default — write the photo's URL into
 * src (with credit/credit-href); the user can still fill or replace it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The sidecar is a SIBLING of the HTML file that uses this component: the
 * read is a document-relative fetch, and the host resolves the bridge's
 * sidecar writes into the previewed file's directory to match (same
 * contract as design_canvas.jsx). Pages in the same directory share one
 * sidecar; keep slot ids distinct across them.
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          Initial framing baseline: cover | contain.   (default 'cover')
 *                cover starts the image filling the frame (overflow cropped);
 *                contain starts it fully visible (letterboxed). Either way the
 *                user can always pan/scale from there — double-click, or the
 *                Edit control, enters reframe mode (drag to move, scroll or
 *                corner-handles to scale; Escape / click-out commits). The
 *                crop persists alongside the image in the sidecar.
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. Prefill it with a real
 *                photo via search_stock_photos when that tool is available
 *                (set credit/credit-href from the result). A user drop
 *                overrides it; clearing the drop reveals src again.
 *   credit       Attribution text shown as a small overlay at the
 *                bottom-left of the filled slot. REQUIRED whenever src
 *                points at any Unsplash host (images.unsplash.com,
 *                plus.unsplash.com, …): an Unsplash src with no credit
 *                renders an error tile INSTEAD of the photo (Unsplash
 *                terms forbid showing their photos unattributed). Use the
 *                exact form 'Photo by {photographer name} on Unsplash' —
 *                the overlay then links the name to credit-href and
 *                'Unsplash' to the Unsplash homepage, and links back to
 *                unsplash.com automatically get the required utm referral
 *                params appended at render time. The credit belongs to
 *                the src image, so it only shows while src is what's
 *                displayed — a user-dropped image hides it.
 *   credit-href  Link for the photographer's name in the credit overlay
 *                (their Unsplash profile URL from the stock-photo search
 *                results). http(s) URLs only — anything else renders the
 *                name as plain text.
 *
 * Sizing: the slot fills its container by default (width/height 100%).
 * Put it in a sized wrapper — absolutely positioned, a grid cell, a fixed
 * frame — and it takes exactly that box. When the parent's height is
 * indefinite (ordinary flow), it falls back to full width at a 3:2 aspect
 * ratio instead of collapsing. In a shrink-to-fit parent (a float,
 * width:max-content, an unsized absolute wrapper), percentages have
 * nothing to resolve against — size the slot or its wrapper explicitly
 * there. For a fixed-size slot, set
 * width/height on the element itself (inline style), which overrides the
 * default. When
 * layering content above a slot (full-bleed layouts), make the overlay
 * click-through — pointer-events: none on scrims/text plates, re-enabled
 * on interactive children — so the slot's hover controls stay reachable.
 * Keep the slot's bottom-left corner visually clear as well: the credit
 * overlay renders there, and a dark fade or text plate covering it hides
 * the attribution Unsplash's terms require — end the fade above that
 * corner, or keep it nearly transparent where the credit sits.
 *
 * Usage:
 *   <div style="position:relative;width:100%;height:100%">      <!-- full-bleed: -->
 *     <image-slot id="bg" shape="rect"></image-slot>            <!-- fills the wrapper -->
 *   </div>
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';

  // Unsplash terms require visible attribution wherever their photos
  // display, and every link back to unsplash.com must carry utm referral
  // params. Two render-time rules enforce that here:
  //  - an Unsplash-src slot with NO credit attribute renders an error
  //    tile INSTEAD of the photo (an uncredited Unsplash photo on screen
  //    is itself the terms violation, so it never renders bare);
  //  - rendered credit links pointing at unsplash.com get the referral
  //    params appended when absent (credit-href values live in page
  //    content that can't be edited after the fact).
  // Keep the utm_source value in sync with UTM_SOURCE in
  // platform/web-agent/unsplash.ts — this file is a project-local
  // artifact and cannot import it (equality is pinned by tests).
  const UNSPLASH_HOMEPAGE_HREF = 'https://unsplash.com/?utm_source=claude_design&utm_medium=referral';
  // Host rule mirrors the hotlink validator that admits Unsplash srcs into
  // pages in the first place (cdn$ in unsplash.ts: apex or any subdomain)
  // — Unsplash+ results serve from plus.unsplash.com, not just images.*,
  // and an admitted-but-uncredited photo must error whatever unsplash
  // host it rides on.
  // Trailing-dot FQDNs (images.unsplash.com.) are the same host to the
  // browser but would miss the regex — strip one dot so the check fails
  // CLOSED (unrecognized-but-real Unsplash srcs must error, not render).
  const isUnsplashHost = u => {
    try {
      return /(^|\.)unsplash\.com$/.test(new URL(u, document.baseURI).hostname.replace(/\.$/, ''));
    } catch {
      return false;
    }
  };
  // Render-time referral normalization for links back to Unsplash:
  // appends utm_source/utm_medium when absent, preserves every existing
  // query param, never overwrites an existing utm_source, and passes
  // non-Unsplash URLs through untouched. Input is an ABSOLUTE validated
  // http(s) URL (the credit render funnel resolves + validates first).
  const withReferral = href => {
    try {
      const u = new URL(href);
      if (!/(^|\.)unsplash\.com$/.test(u.hostname.replace(/\.$/, ''))) {
        return href;
      }
      if (!u.searchParams.has('utm_source')) {
        u.searchParams.set('utm_source', 'claude_design');
      }
      if (!u.searchParams.has('utm_medium')) {
        u.searchParams.set('utm_medium', 'referral');
      }
      return u.toString();
    } catch (e) {
      return href;
    }
  };
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  // Unload-time flush: save()'s serialization defers a mid-RTT re-fire to a
  // .then that never runs in an unloading document, silently dropping a
  // pagehide commit. Post the current slots immediately instead — content
  // is a superset snapshot of any in-flight save's, the write is a
  // whole-file last-writer-wins replace, and postMessage FIFO delivers it
  // to the host after the in-flight one, so a backend-side reorder at
  // worst reproduces the dropped-commit outcome this flush improves on.
  // Guarded on the initial sidecar read: pre-hydration slots can miss
  // other slots' persisted entries, and flushing it would clobber them —
  // that narrow case stays best-effort (the in-memory merge in load()
  // cannot happen in an unloading document anyway).
  function flushNow() {
    if (!loaded) return;
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    try {
      Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {});
    } catch (e) {}
  }
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet =
  // Fill the container by default: slots are usually placed inside a
  // sized wrapper (a hero frame, a grid cell, an inset:0 layer) and are
  // expected to take that box — a fixed intrinsic size would render as
  // a small tile in the corner of a full-bleed wrapper instead.
  // aspect-ratio is the companion fallback that keeps a bare slot
  // visible when the parent's height is indefinite: height:100%
  // resolves to auto there, and the ratio then derives height from
  // width instead of letting the slot collapse to zero height.
  // Explicit width/height on the element override all of this.
  // color:inherit (not a fixed near-black): the placeholder chrome —
  // empty-state icon/caption (currentColor) and the dashed ring — must
  // read on dark decks too, and the slide's own text color is the one
  // color guaranteed to contrast with the slide background. The soft
  // look comes from opacity on those parts, not from a baked-in alpha.
  ':host{display:block;position:relative;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;' + '  width:100%;height:100%;aspect-ratio:3/2}' + '.empty .cap,.empty .sub{opacity:.75}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(127,127,127,.08)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  // popover=manual promotes the spill to the top layer on reframe, so it is
  // not clipped by any overflow:hidden / clip-path / scroll-container
  // ancestor (a plain z-index can't escape overflow clipping). UA popover
  // defaults (inset:0;margin:auto) are reset; _applyView sets viewport px.
  '.spill{position:fixed;margin:0;inset:auto;border:0;padding:0;background:transparent;' + '  overflow:visible;transform:translate(-50%,-50%);z-index:1;cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px}' + '.empty:hover .sub{opacity:1}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed currentColor;' + '  opacity:.35;transition:border-color .12s,opacity .12s}' + ':host([data-over]) .ring{border-color:#c96442;opacity:1}' + ':host([data-filled]) .ring{display:none}' +
  // Controls overlay INSIDE the frame, pinned to the top-right corner, so
  // a full-bleed slot in an overflow:hidden container still shows them
  // (the old below-mask placement got clipped). Credit sits bottom-left,
  // so top-right avoids collision. The blurred pill background keeps them
  // legible over the image.
  // The UA [popover] base rule styles the element in EVERY state (only
  // display:none is gated on :not(:popover-open), and the display:flex
  // below overrides that) — so the UA resets live HERE, like .spill's,
  // or the ordinary hover-state strip renders as a bordered Canvas box
  // centered by margin:auto. inset:auto precedes top/right (shorthand).
  '.ctl{position:absolute;inset:auto;top:8px;right:8px;margin:0;border:0;padding:0;' + '  background:transparent;overflow:visible;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' +
  // While reframing, the spill owns the top layer and would swallow every
  // click on the in-frame controls. Promoting .ctl into the top layer
  // ABOVE the spill (shown after it — later popovers stack higher) keeps
  // Edit-as-toggle and Replace clickable mid-reframe. _applyView pins it
  // to the frame's top-right in viewport px (translateX(-100%)
  // right-aligns against the computed left edge); inset:auto clears the
  // base rule's top/right so the inline left/top position it alone.
  '.ctl:popover-open{position:fixed;inset:auto;transform:translateX(-100%)}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}' +
  // Replacement in flight: after a src swap the browser keeps painting
  // the PREVIOUS image until the new one decodes, so a Replace would
  // flash the old photo and then pop. Hide the stale frame (visibility,
  // not display — _applyView geometry still applies) and spin until the
  // new image reports in (load/error clears data-swapping).
  ':host([data-swapping]) .frame img{visibility:hidden}' + '.loading{position:absolute;inset:0;display:none;align-items:center;' + '  justify-content:center;pointer-events:none}' + ':host([data-swapping]) .loading{display:flex}' + '.loading::after{content:"";width:22px;height:22px;border-radius:50%;' + '  border:2px solid rgba(127,127,127,.25);border-top-color:currentColor;' + '  animation:om-slot-spin .7s linear infinite}' + '@keyframes om-slot-spin{to{transform:rotate(360deg)}}' +
  // Reduced motion: the static two-tone ring still reads as "working".
  '@media (prefers-reduced-motion:reduce){.loading::after{animation:none}}' + '.credit{position:absolute;left:6px;bottom:6px;max-width:calc(100% - 12px);display:none;' + '  padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.55);color:#fff;' + '  font:10px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none;' + '  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;backdrop-filter:blur(6px)}' +
  // The credit is a SPAN holding one or two <a>s (Unsplash's prescribed
  // form links the photographer AND Unsplash) — anchors style inline so
  // the overlay reads as one line of text.
  '.credit a{color:inherit;text-decoration:none}' + '.credit a:hover,.credit a:focus-visible{text-decoration:underline}' + ':host([data-filled][data-credit]) .credit{display:block}' +
  // Exports must ship JUST the image — no hover controls, no credit chip
  // (the host marks <html data-om-exporting> for the capture window; the
  // page-level hide script can't reach shadow DOM, this rule can).
  ':host-context([data-om-exporting]) .ctl,' + ':host-context([data-om-exporting]) .credit{display:none !important}' +
  // Print must ship just the image too: the hover-gated controls can be
  // mid-hover when print() fires, and the credit chip is screen chrome —
  // the same rule the capture window gets, keyed on print media instead
  // of the host's data-om-exporting mark (the print path sets no mark).
  '@media print{.ctl,.credit{display:none !important}}' +
  // No export-window mask rules here on purpose: the export capture
  // releases the replacement mask by REMOVING data-swapping (the
  // shadow-root pass in pages/export/shared.ts HIDE_EXPORT_CHROME_SCRIPT)
  // — attribute removal works in every engine (:host-context is
  // Chromium-only), is scoped by construction to slots actually
  // mid-swap, and hides the spinner through the same gate. A masked img
  // would otherwise be silently dropped from PPTX decks (the capture
  // walk skips visibility:hidden imgs).
  // Attribution error tile: REPLACES the photo when an Unsplash src has
  // no credit attribute — rendering the photo uncredited is the terms
  // violation, so the photo must not appear at all.
  // Calm and neutral on purpose (review feedback): the tile informs the
  // user; the fix instructions are machine-facing (usage docblock, tool
  // description, and the turn-end scan's bounce copy name the attributes
  // for the agent).
  '.attr-error{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  background:#f2f1ef;color:#6e6c66;user-select:none;' + '  font:13px/1.45 system-ui,-apple-system,sans-serif}' + '.attr-error svg{opacity:.55}' + '.attr-error .cap{max-width:92%;font-weight:500;letter-spacing:.01em}' + ':host([data-attribution-error]) .attr-error{display:flex}' + ':host([data-attribution-error]) .ring{display:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  const warnIcon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>' + '<path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'placeholder', 'src', 'id', 'credit', 'credit-href'];
    }

    /** Duplicate-slide hook (called by deck-stage, see its
     *  _remintDuplicateIds): copy this id's stored image, if any, under a
     *  freshly minted key and return that key — so a duplicated slide's
     *  slot keeps its dropped photo instead of reverting to the
     *  placeholder. 'isFree' is the caller's uniqueness check (document
     *  ids); candidates must ALSO be unused in the sidecar, which can
     *  hold keys from other pages sharing the project root. (An EMPTY
     *  slot on another page leaves no sidecar entry, so its id is not
     *  detectable here — a minted key can collide with it and that slot
     *  would show this photo. Same blast radius as two pages reusing an
     *  id by hand, which the shared sidecar already permits.) Returns null
     *  when no id could be minted (caller strips the id, today's
     *  behavior). */
    static cloneSlot(fromId, isFree) {
      if (typeof fromId !== 'string' || !fromId) return null;
      // Pre-hydration the store can't veto candidates or source the copy
      // — degrade to the strip (today's behavior) rather than mint
      // against keys we can't see yet. Any rendered (= droppable) slot
      // means load() has already settled.
      if (!loaded) return null;
      const stem = fromId.replace(/-\d+$/, '') || fromId;
      for (let n = 2; n < 100; n++) {
        const toId = stem + '-' + n;
        if (toId === fromId) continue;
        if (slots[toId] !== undefined) {
          // Reuse a key holding this exact value (bytes AND crop) if no
          // live element here owns it — a duplicate op the host refused
          // after minting leaves such a key behind, and reusing keeps
          // refused retries from accumulating one orphaned copy per
          // attempt. Full equality (not just bytes) so a byte-identical
          // key another PAGE owns with its own crop is stepped past, not
          // adopted or rewritten. (Entries without .u never match.)
          const prev = getSlot(toId);
          const cur = getSlot(fromId);
          if (!(prev && cur && prev.u && prev.u === cur.u && prev.s === cur.s && prev.x === cur.x && prev.y === cur.y && (typeof isFree !== 'function' || isFree(toId)))) continue;
          return toId;
        }
        if (typeof isFree === 'function' && !isFree(toId)) continue;
        const v = getSlot(fromId);
        if (v) setSlot(toId, Object.assign({}, v));
        return toId;
      }
      return null;
    }
    constructor() {
      super();
      // clonable: rail thumbnails deep-clone slides and carry this shadow
      // along; reuse an already-cloned root so upgrade-after-clone works.
      // (Deliberately NOT serializable — a getHTML consumer would embed
      // multi-MB sidecar data-URLs into serialized page HTML.)
      const root = this.shadowRoot || this.attachShadow({
        mode: 'open',
        clonable: true
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="attr-error" part="attribution-error">' + warnIcon + '    <div class="cap">This photo needs attribution</div></div>' + '  <div class="loading" part="loading"></div>' + '  <div class="ring" part="ring"></div>' + '</div>' +
      // Outside .frame, like .spill/.ctl — the frame's overflow:hidden +
      // border-radius/clip-path would cut the credit off on circle/pill/mask.
      // A SPAN, not an <a>: the prescribed Unsplash credit holds two links
      // (photographer + Unsplash), built per-render in _render().
      '<span class="credit" part="credit"></span>' + '<div class="spill" popover="manual" data-dc-edit-transparent>' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' +
      // data-dc-edit-transparent: the DC editor's edit-mode picker lets
      // clicks through for chrome marked with it (EDIT_TRANSPARENT_SEL)
      // — without it, Replace/Edit clicks in Edit mode are swallowed by
      // element selection and the controls look dead.
      '<div class="ctl" popover="manual" data-dc-edit-transparent><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="edit" title="Reframe image">Edit</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ctl = root.querySelector('.ctl');
      this._credit = root.querySelector('.credit');
      this._attrError = root.querySelector('.attr-error');
      // Credit clicks open the link, not browse/reframe.
      this._credit.addEventListener('click', e => e.stopPropagation());
      this._credit.addEventListener('dblclick', e => e.stopPropagation());
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      // Encode-in-flight marker (the owning _ingest generation): while set,
      // the same-src "nothing in flight" clear in _render must not fire —
      // the stored value still points at the OLD image until the encode
      // lands, so that clear would unmask the stale image mid-replace.
      this._swapGen = 0;
      // Render-owned swap in flight: set when _render assigns a new src,
      // cleared only by the img's own load/error (or the empty branch).
      // img.complete CANNOT stand in for this — setting src only QUEUES
      // the current-request swap (a microtask), so synchronously after an
      // assignment, complete still reports the OLD settled request. The
      // pick path does exactly that: the host sets src, credit, and
      // credit-href back-to-back in one task, and renders #2/#3 would
      // read the stale complete === true and drop the mask one render
      // after it was set.
      this._loadPending = false;
      // See _render's empty branch: a transient attribution-error wipe of a
      // showing image must make the follow-up render a replacement (spinner),
      // not a first fill (blank frame).
      this._hidShowing = false;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        // The hidden controls are opacity-0 but still tabbable — without
        // this gate a keyboard user could drive them on a read-only share
        // link (mirrors the dblclick handler's editable gate).
        if (!this.hasAttribute('data-editable')) return;
        if (act === 'replace') {
          this._exitReframe(true);
          // Host-owned picker (Unsplash modal; it also offers local import).
          this.dispatchEvent(new CustomEvent('image-slot:pick', {
            bubbles: true,
            composed: true,
            detail: {
              id: this.id || null
            }
          }));
        }
        if (act === 'edit') {
          if (!this._reframes()) return;
          if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      // load/error also release the replacement-in-flight mask (via the
      // single discipline in _releaseMask): the swap is only revealed once
      // the new image can actually paint (on error the frame shows its
      // background, same as a fresh slot with a broken src).
      this._img.addEventListener('load', () => {
        this._loadPending = false;
        this._releaseMask(true);
        this._applyView();
      });
      this._img.addEventListener('error', () => {
        this._loadPending = false;
        this._releaseMask(true);
      });
      // Gated only on editable — any filled slot can be repositioned/scaled,
      // regardless of fit. Share links (no writeFile) stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
          const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // The host may inject window.omelette.writeFile AFTER the first render;
      // re-render on hover so the editable-gated controls reliably appear.
      this.addEventListener('pointerenter', this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('pointerenter', this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      // commit=false: a disconnect is not a user intent — committing here
      // would persist whatever half-finished drag a React remount or DOM
      // splice happened to interrupt. Deliberate exits commit on their own
      // paths (Escape/click-out/toggle), and unloads commit via pagehide.
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._signalReframe(true);
      // Best-effort commit when the document unloads mid-reframe (a host
      // navigation racing the enter signal, a manual reload, tab close):
      // the sidecar write rides the host bridge, which outlives this
      // document, so the crop survives even though the mode dies with the
      // DOM. Held on the instance so _exitReframe detaches exactly what
      // was attached.
      this._pagehide = () => {
        this._exitReframe(true);
        flushNow();
      };
      window.addEventListener('pagehide', this._pagehide);
      // Promote spill to the top layer, then keep it pinned over the frame:
      // scroll/resize cover the common cases, and a per-frame rect check
      // catches layout shifts that fire neither (an image above finishing
      // load, streamed DOM pushing the slot down, an ancestor transform
      // change) so the overlay can't detach from the frame.
      try {
        this._spill.showPopover();
      } catch {}
      // After the spill, so the controls stack above it in the top layer.
      try {
        this._ctl.showPopover();
      } catch {}
      this._reposition = () => {
        if (this.hasAttribute('data-reframe')) this._applyView();
      };
      window.addEventListener('scroll', this._reposition, true);
      window.addEventListener('resize', this._reposition);
      this._lastRect = '';
      this._watch = () => {
        if (!this.hasAttribute('data-reframe')) return;
        const r = this.getBoundingClientRect();
        const key = r.left + ',' + r.top + ',' + r.width + ',' + r.height;
        if (key !== this._lastRect) {
          this._lastRect = key;
          this._applyView();
        }
        this._watchId = requestAnimationFrame(this._watch);
      };
      this._watchId = requestAnimationFrame(this._watch);
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (this._reposition) {
        window.removeEventListener('scroll', this._reposition, true);
        window.removeEventListener('resize', this._reposition);
        this._reposition = null;
      }
      if (this._watchId) {
        cancelAnimationFrame(this._watchId);
        this._watchId = 0;
      }
      if (this._pagehide) {
        window.removeEventListener('pagehide', this._pagehide);
        this._pagehide = null;
      }
      try {
        this._spill.hidePopover();
      } catch {}
      try {
        this._ctl.hidePopover();
      } catch {}
      this._ctl.style.left = '';
      this._ctl.style.top = '';
      if (commit) this._commitView();
      this._signalReframe(false);
    }

    // Reframe state lives only in this DOM until commit, invisible to the
    // host's dirty signals — announce enter/exit so the host can hold
    // auto-reloads for exactly the gesture (the guest bundle forwards
    // image-slot:reframe to the host as imageSlotReframe). Dispatched on
    // the element (composed, so it escapes shadow roots) while connected;
    // a disconnected exit (disconnectedCallback) falls back to document so
    // the host still hears it.
    _signalReframe(active) {
      const target = this.isConnected ? this : document;
      target.dispatchEvent(new CustomEvent('image-slot:reframe', {
        bubbles: true,
        composed: true,
        detail: {
          active: active,
          id: this.id || null
        }
      }));
    }

    // Public: host's "Import from computer" calls this to run local browse.
    openFilePicker() {
      this._exitReframe(true);
      this._input.click();
    }

    // A src write is a newer intent for this slot's content — the host
    // pick path (setImageSlotImage) or an agent edit — so it must win
    // over any encode still in flight from an earlier drop: left live,
    // that encode lands later, passes _ingest's gen guard, and its
    // setSlot silently overwrites the pick (the stored value shadows
    // src in _render). Bumping _gen kills the encode before its own
    // _swapGen clear runs, so clear the dead claim here too — otherwise
    // _releaseMask (gated on !_swapGen) never fires and the pick's
    // spinner is stranded. src ONLY: the pick sets credit/credit-href
    // in the same task, and clearing _swapGen on those would let the
    // same-src branch unmask the old image mid-encode.
    attributeChangedCallback(name, oldVal, newVal) {
      if (name === 'src' && oldVal !== newVal) {
        this._gen++;
        this._swapGen = 0;
      }
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      // Replacing a shown image: surface the swap through the encode too,
      // not just the decode — otherwise the old photo sits there with no
      // feedback while the canvas re-encode runs. An empty slot keeps its
      // placeholder (no spinner) until the encode lands, as before.
      // _swapGen guards the mask against re-renders DURING the encode
      // (pointerenter, ResizeObserver, another slot's store write): the
      // stored value still resolves to the old image there, so _render's
      // same-src clear would otherwise unmask it mid-replace.
      if (this.hasAttribute('data-filled')) {
        this.setAttribute('data-swapping', '');
        this._swapGen = gen;
      }
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        // Clear BEFORE setSlot: its synchronous re-render must see no
        // pending encode, so a byte-identical re-upload (same data URL, no
        // load event coming) still clears the mask via the complete branch.
        this._swapGen = 0;
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._swapGen = 0;
        // Reveal the kept old image — unless another replacement (a
        // remote pick's src swap) is still in flight, in which case the
        // mask stays until THAT image settles (its load/error releases).
        this._releaseMask();
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is available on any filled slot — the user can
    // always reposition/scale. `fit` only sets the initial baseline (see
    // _geom): contain starts fully-visible, cover starts frame-filling.
    _reframes() {
      return this.hasAttribute('data-filled');
    }

    // The single release discipline for the replacement-in-flight mask
    // (data-swapping). The mask comes off only when BOTH hold:
    //  - no encode is pending (_swapGen) — mid-encode the stored value
    //    still resolves to the old image, so any reveal paints it;
    //  - the frame img has settled on its current src — an unsettled src
    //    means some replacement is still in flight (e.g. a remote pick),
    //    whoever started it, and revealing would paint the previous
    //    frame. The load/error listeners pass settled=true (the event IS
    //    the settlement signal, per spec complete is true by then);
    //    other callers rely on the complete flag (covers loaded AND
    //    failed).
    // Every release path funnels through here EXCEPT _render's empty
    // branch (the img is being cleared — nothing will ever settle).
    _releaseMask(settled) {
      if (!this._swapGen && !this._loadPending && (settled || this._img.complete)) {
        this.removeAttribute('data-swapping');
      }
    }

    // Baseline geometry, shared by clamp/apply/resize. `base` is the scale at
    // view-scale s=1: cover = fill the frame (overflow on the looser axis),
    // contain = fit fully inside (letterboxed). Zooming a contain image past
    // s where it overflows naturally becomes a crop. Null until the img has
    // loaded (naturalWidth is 0 before that) or when the slot has no layout
    // box — ResizeObserver fires with a 0×0 rect under display:none, and
    // clamping against a degenerate 1×1 frame would silently pull the stored
    // pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
      const base = contain ? Math.min(fw / iw, fh / ih) : Math.max(fw / iw, fh / ih);
      return {
        iw,
        ih,
        fw,
        fh,
        base
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      // Top-layer controls: pin to the frame's top-right in viewport px
      // (the same 8px inset as the in-frame layout; unscaled — top-layer UI
      // reads as chrome, not page content). BEFORE the geometry branch:
      // placement needs only the frame rect, and a not-yet-loaded or broken
      // src must not leave the promoted strip floating unpositioned. Gated
      // on the popover actually being open: without the Popover API,
      // showPopover() threw (swallowed in _enterReframe), .ctl stays in
      // its in-frame absolute layout, and viewport-px coordinates would
      // shove it off-frame — and matches(':popover-open') itself throws
      // there (unknown pseudo-class), hence the try/catch.
      if (this.hasAttribute('data-reframe')) {
        let onTop = false;
        try {
          onTop = this._ctl.matches(':popover-open');
        } catch {}
        if (onTop) {
          const r = this.getBoundingClientRect();
          this._ctl.style.left = r.right - 8 + 'px';
          this._ctl.style.top = r.top + 8 + 'px';
        }
      }
      if (!g) {
        // Dimensions not known yet (before img load) — centered fit so there
        // is no flash of an unpositioned image before the geometry lands.
        const contain = (this.getAttribute('fit') || 'cover').toLowerCase() === 'contain';
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = contain ? 'contain' : 'cover';
        return;
      }
      // Baseline (cover-fill or contain-fit) × view scale. Width/height and
      // left/top are all frame-% — depends only on the frame aspect ratio, so
      // a responsive resize keeps the same crop. The spill layer mirrors the
      // same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      if (this.hasAttribute('data-reframe')) {
        // Top-layer spill: position in viewport px over the frame. The top
        // layer escapes ancestor transforms entirely, so EVERY term must be
        // in viewport units: getBoundingClientRect gives the frame's scaled
        // origin AND size, and the rect/layout ratio rescales the ghost —
        // sizing from layout px alone renders it 1/scale too large under a
        // scaled deck slide. Inner ghost + handles stay box-relative.
        const r = this.getBoundingClientRect();
        const sx = g.fw ? r.width / g.fw : 1;
        const sy = g.fh ? r.height / g.fh : 1;
        this._spill.style.width = g.iw * k * sx + 'px';
        this._spill.style.height = g.ih * k * sy + 'px';
        this._spill.style.left = r.left + (50 + this._view.x) / 100 * r.width + 'px';
        this._spill.style.top = r.top + (50 + this._view.y) / 100 * r.height + 'px';
      }
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      // An Unsplash src with no credit attribute must NOT render — showing
      // the photo uncredited is the Unsplash-terms violation itself. The
      // error tile replaces the photo until the credit is written. A
      // user-dropped image is the user's own content and always renders.
      // Trimmed: credit is agent/user-editable content, and a whitespace-
      // only value must count as missing — otherwise it would suppress the
      // error tile AND render an empty credit box (no text, no links),
      // exactly the unattributed state this gate exists to prevent.
      const credit = (this.getAttribute('credit') || '').trim();
      const attrError = !!(!credit && !this._userUrl && srcAttr && isUnsplashHost(srcAttr));
      this.toggleAttribute('data-attribution-error', attrError);
      if (url && !attrError) {
        const prev = this._img.getAttribute('src');
        if (prev !== url) {
          // Replacing an already-shown image: mark the swap BEFORE setting
          // src so the stale frame is never revealed (see the data-swapping
          // stylesheet rules). First fill (prev empty) keeps the existing
          // placeholder-until-load behavior — no spinner. _hidShowing
          // covers the pick path's transient attribution-error wipe: prev
          // is gone, but an image WAS showing, so this is a replacement.
          if (prev || this._hidShowing) this.setAttribute('data-swapping', '');
          // Mark the swap BEFORE assigning src: complete keeps reporting
          // the old settled request until the browser's
          // update-the-image-data microtask runs, so same-task re-renders
          // (the pick path's credit/credit-href setAttributes) need this
          // flag, not complete, to know a load is in flight.
          this._loadPending = true;
          this._img.src = url;
          this._ghost.src = url;
        } else {
          // Same-src re-render — release if settled, so an ingest-set
          // spinner can't stick after a byte-identical re-upload (same
          // data URL, no further load event ever fires).
          this._releaseMask();
        }
        this._hidShowing = false;
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this.removeAttribute('data-swapping');
        // The src is being removed — no load/error will ever fire for it.
        this._loadPending = false;
        // A transient attribution-error wipe of a showing image happens on
        // the pick path: the host sets src one setAttribute before credit,
        // so render N hides the old image (attrError) and render N+1
        // restores a URL. Remember the wipe so that restore renders as a
        // replacement (spinner), not a first fill (blank frame).
        this._hidShowing = attrError && !!this._img.getAttribute('src');
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        // The error tile owns the blocked-photo state; .empty stays for
        // the genuinely-empty slot.
        this._empty.style.display = attrError ? 'none' : 'flex';
        this.removeAttribute('data-filled');
      }

      // Credit belongs to the author src, so a user drop hides it.
      // textContent + the http(s)-only funnel keep external strings inert.
      const showCredit = !!(url && credit && !this._userUrl && !attrError);
      this._credit.textContent = '';
      if (showCredit) {
        // Validate once (resolved against the document, http(s) only),
        // then append the terms-required utm referral params to links
        // that point back at unsplash.com.
        let href = '';
        const rawHref = this.getAttribute('credit-href') || '';
        if (rawHref) {
          try {
            const u = new URL(rawHref, document.baseURI);
            if (u.protocol === 'http:' || u.protocol === 'https:') {
              href = withReferral(u.href);
            }
          } catch {}
        }
        const mkLink = (text, linkHref) => {
          const a = document.createElement('a');
          a.setAttribute('target', '_blank');
          a.setAttribute('rel', 'noopener noreferrer');
          a.setAttribute('href', linkHref);
          a.textContent = text;
          return a;
        };
        // Unsplash's prescribed credit is TWO links — the photographer's
        // name to their profile (credit-href) and 'Unsplash' to the
        // homepage. Render that split whenever the text has the canonical
        // shape; other text keeps the legacy single-link rendering.
        const m = /^Photo by (.+) on Unsplash$/.exec(credit);
        if (m) {
          this._credit.appendChild(document.createTextNode('Photo by '));
          this._credit.appendChild(href ? mkLink(m[1], href) : document.createTextNode(m[1]));
          this._credit.appendChild(document.createTextNode(' on '));
          this._credit.appendChild(mkLink('Unsplash', UNSPLASH_HOMEPAGE_HREF));
        } else if (href) {
          this._credit.appendChild(mkLink(credit, href));
        } else {
          this._credit.textContent = credit;
        }
      }
      this.toggleAttribute('data-credit', showCredit);
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/image-slot.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/mac-hero.js
try { (() => {
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
function fail() {
  document.documentElement.classList.add('no3d');
}
async function init() {
  // Gate on reduced-motion only. Frames may never arrive (a hidden/backgrounded tab
  // fires no rAF at all), so this waits but never blocks: it resolves either way and
  // proceeds to build the scene. The render loop picks up frames when the tab is shown.
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return fail();
  if (document.hidden) {
    await new Promise(res => {
      const done = () => {
        document.removeEventListener('visibilitychange', done);
        res();
      };
      document.addEventListener('visibilitychange', done);
      setTimeout(done, 3000);
    });
  }
  await new Promise(res => {
    let settled = false;
    const settle = () => {
      if (!settled) {
        settled = true;
        res();
      }
    };
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
  try {
    THREE = await import(/* @vite-ignore */THREE_URL);
  } catch (e) {
    return fail();
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
  } catch (e) {
    return fail();
  }
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
  key.position.set(3.4, 5, 4.2);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd6e4ff, 1.32);
  fill.position.set(-4.2, 1.4, 2.6);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfffaf2, 1.62);
  rim.position.set(-1.2, 2.4, -5);
  scene.add(rim);

  // ---- screen texture: real site capture, with the drawn placeholder as fallback ----
  function screenTexture() {
    const c = document.createElement('canvas');
    c.width = 1600;
    c.height = 1000;
    const x = c.getContext('2d');
    x.fillStyle = '#f7f4ee';
    x.fillRect(0, 0, 1600, 1000);
    x.strokeStyle = 'rgba(60,96,180,.16)';
    x.lineWidth = 2;
    for (let i = 0; i < 1600; i += 64) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i, 1000);
      x.stroke();
    }
    for (let i = 0; i < 1000; i += 64) {
      x.beginPath();
      x.moveTo(0, i);
      x.lineTo(1600, i);
      x.stroke();
    }
    // faux page blocks
    x.fillStyle = '#2b4fa8';
    x.fillRect(0, 0, 1600, 96);
    x.fillStyle = 'rgba(255,255,255,.9)';
    x.fillRect(72, 40, 210, 18);
    [1050, 1220, 1390].forEach(px => x.fillRect(px, 42, 118, 14));
    x.fillStyle = '#2a2018';
    x.font = '700 104px ui-monospace, monospace';
    x.fillText('Heads Up', 90, 300);
    x.font = '700 104px ui-monospace, monospace';
    x.fillStyle = '#e2622a';
    x.fillText('prototype', 90, 416);
    x.fillStyle = 'rgba(42,32,24,.45)';
    x.font = '38px ui-monospace, monospace';
    x.fillText('Coded HTML / CSS / JS build', 92, 492);
    x.font = '700 32px ui-monospace, monospace';
    const btnLbl = 'Explore programs',
      btnTw = x.measureText(btnLbl).width;
    x.fillStyle = '#e2622a';
    x.fillRect(90, 546, btnTw + 64, 76);
    x.fillStyle = '#fff';
    x.fillText(btnLbl, 122, 594);
    [0, 1, 2].forEach(i => {
      x.fillStyle = 'rgba(42,32,24,.09)';
      x.fillRect(90 + i * 480, 700, 420, 240);
      x.fillStyle = 'rgba(42,32,24,.3)';
      x.font = '700 28px ui-monospace, monospace';
      x.fillText('Program 0' + (i + 1), 120 + i * 480, 760);
    });
    x.strokeStyle = 'rgba(226,98,42,.9)';
    x.setLineDash([14, 10]);
    x.lineWidth = 5;
    x.strokeRect(14, 14, 1572, 972);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }

  // ---- rounded-box helper (thin bevel reads as machined aluminium) ----
  function slab(w, h, d, r = 0.06) {
    const s = new THREE.Shape();
    const x = -w / 2,
      y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: d,
      bevelEnabled: true,
      bevelThickness: 0.022,
      bevelSize: 0.022,
      bevelSegments: 4,
      curveSegments: 14
    });
    g.center();
    return g;
  }

  // rounded-rect face, so the bezel corners follow the lid instead of squaring off
  function roundedFace(w, h, r) {
    const s = new THREE.Shape(),
      x = -w / 2,
      y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return new THREE.ShapeGeometry(s, 14);
  }

  // faint corner glint for the aluminium lid — kept off the display, whose artwork is already near-white
  function glintTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 190, 190);
    g.addColorStop(0, 'rgba(255,255,255,.20)');
    g.addColorStop(.55, 'rgba(255,255,255,.03)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const alu = new THREE.MeshStandardMaterial({
    color: 0xdcdce0,
    metalness: 0.82,
    roughness: 0.29
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x1a1a1c,
    metalness: 0.5,
    roughness: 0.55
  });
  const mac = new THREE.Group();

  // base
  const base = new THREE.Mesh(slab(3.3, 2.28, 0.13, 0.1), alu);
  base.rotation.x = -Math.PI / 2;
  base.name = 'Base';
  mac.add(base);
  // keyboard well + trackpad
  const well = new THREE.Mesh(new THREE.PlaneGeometry(2.86, 1.06), dark);
  well.rotation.x = -Math.PI / 2;
  well.position.set(0, 0.092, -0.36);
  mac.add(well);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 0.76), new THREE.MeshStandardMaterial({
    color: 0xc8c8cc,
    metalness: 0.4,
    roughness: 0.5
  }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, 0.094, 0.62);
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
  const screenMat = new THREE.MeshBasicMaterial({
    map: screenTexture()
  });
  // the capture is a full tall page; the display shows a window onto it that pans down
  // as the scroll advances, so each scene lands on a different part of the site
  let scanTex = null,
    scanSpan = 0;
  new THREE.TextureLoader().load('assets/hu-style.png', tex => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const target = 2.98 / 1.9,
      src = tex.image.width / tex.image.height;
    if (src > target) {
      // wider than the display: crop the sides, no vertical travel
      tex.repeat.set(target / src, 1);
      tex.offset.x = (1 - target / src) / 2;
    } else {
      // taller than the display: full width, and a window that can travel vertically
      const h = src / target;
      tex.repeat.set(1, h);
      tex.offset.x = 0;
      scanSpan = 1 - h;
      scanTex = tex;
      tex.offset.y = scanSpan; // start at the top of the page
    }
    screenMat.map = tex;
    screenMat.needsUpdate = true;
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.98, 1.9), screenMat);
  screen.position.set(0, 1.14, 0.030);
  screen.name = 'Screen';
  lidPivot.add(screen);
  // glint sits on the bezel frame, not over the artwork
  const glint = new THREE.Mesh(roundedFace(3.16, 2.1, 0.075), new THREE.MeshBasicMaterial({
    map: glintTexture(),
    transparent: true,
    depthWrite: false
  }));
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
    intro: {
      rx: 0,
      ry: 0,
      rz: 0,
      s: 2.4,
      y: -2.52,
      slot: 0,
      lid: -0.10,
      drift: 1,
      fitV: 0,
      scan: 0
    },
    // 01 overview — panel sits left, machine takes the free zone to its right
    p1: {
      rx: 0.34,
      ry: -0.62,
      rz: 0.10,
      s: 1.00,
      y: -0.40,
      slot: 1,
      lid: -0.42,
      drift: 1,
      fitV: 0,
      scan: 0
    },
    // 02 role — panel sits right, machine takes the free zone to its left
    p2: {
      rx: 0.10,
      ry: 0.52,
      rz: -0.16,
      s: 0.96,
      y: -0.30,
      slot: -1,
      lid: -0.30,
      drift: 1,
      fitV: 0,
      scan: 0.5
    },
    // 03 tools — face-on and centered, wedged between the fixed nav and the tools panel.
    // drift:0 because clearance on both edges is smaller than the idle sine's amplitude.
    p3: {
      rx: 0.05,
      ry: Math.PI * 2,
      rz: 0,
      s: 1.06,
      y: 0.16,
      slot: 0,
      lid: -0.34,
      drift: 0,
      fitV: 1,
      scan: 1
    },
    // dock — icon in the bottom-left corner, turned to face INTO the page.
    // ry keeps sweeping the same direction (past 2π) and lands on scene 2's inward angle.
    dock: {
      rx: 0.12,
      ry: Math.PI * 2 + 0.52,
      rz: -0.10,
      s: 0.34,
      y: 0,
      slot: 0,
      lid: -0.36,
      drift: 0,
      fitV: 0,
      scan: 1
    }
  };
  // every key every pose can touch has to exist here from the start: GSAP refuses to
  // tween a property that isn't on the target yet ("Invalid property"), which used to
  // leave fitV unwritten and poison the spring below
  const pose = {
    ...POSE.intro,
    fitV: 0,
    dock: 0
  };
  // What actually gets rendered. GSAP writes the scroll-exact `pose`; a critically-
  // under-damped spring chases it every frame, so wheel steps arrive as one continuous
  // motion with a little overshoot instead of a stair of discrete jumps.
  const shown = {
    ...pose
  };
  const vel = {};
  // omega = speed, zeta < 1 = overshoot. Rotation and travel get the bounce; scale,
  // dock and the fit blends stay critically damped so nothing pops past its frame.
  const SPRING = {
    rx: [13, 0.58],
    ry: [12, 0.55],
    rz: [13, 0.6],
    y: [12, 0.56],
    slot: [11, 0.6],
    lid: [14, 0.62],
    s: [15, 1],
    dock: [16, 1],
    fitV: [16, 1],
    drift: [10, 1],
    scan: [9, 1]
  };
  function settle(dt) {
    for (const k in pose) {
      const target = pose[k];
      if (typeof target !== 'number') {
        shown[k] = target;
        continue;
      }
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
      trigger: scroller,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
      onUpdate: s => {
        stage.classList.toggle('past', s.progress > 0.12);
        document.documentElement.classList.toggle('macpast', s.progress > 0.12);
      }
    }
  });
  tl.to(pose, {
    duration: 0.4
  }) // hold the front view
  .to(pose, {
    ...POSE.p1,
    duration: 1.1,
    ease: 'expo.inOut'
  }) // zoom out into scene 1
  .to(pose, {
    duration: 0.55
  }).to(pose, {
    ...POSE.p2,
    duration: 1.1,
    ease: 'power3.inOut'
  }) // scene 1 → 2
  .to(pose, {
    duration: 0.55
  }).to(pose, {
    ...POSE.p3,
    duration: 1.5,
    ease: 'power3.inOut'
  }) // all the way around, face middle
  .to(pose, {
    duration: 0.9
  }); // hold while panel 3 rises

  // Dock — its own trigger, keyed to the COVERING content rather than the pin, so the
  // icon conversion and the cover happen on the same scroll beat.
  const postmac = document.querySelector('.postmac');
  if (postmac) {
    // fromTo with immediateRender:false — an ordinary .to() captures its start values
    // during ScrollTrigger's refresh (scroll at 0, pose still at intro), which snapped
    // the machine back to full screen and added a spurious extra revolution.
    gsap.fromTo(pose, {
      ...POSE.p3,
      dock: 0
    }, {
      ...POSE.dock,
      dock: 1,
      ease: 'power2.inOut',
      immediateRender: false,
      scrollTrigger: {
        trigger: postmac,
        start: 'top bottom',
        end: 'top top+=42%',
        scrub: 0.7,
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
    0: {
      in: [0.4, 1.1],
      out: [2.05, 0.55]
    },
    // 01 rides scene 1, leaves as it turns
    1: {
      in: [2.2, 0.85],
      out: [3.6, 0.7]
    },
    // 02 rides scene 2
    2: {
      in: [4.6, 0.9],
      out: null
    } // 03 rises from below and STAYS
  };
  document.querySelectorAll('.gpanel').forEach(p => {
    const c = cue[p.dataset.phase];
    if (!c) return;
    const rise = p.dataset.phase === '2';
    tl.fromTo(p, {
      autoAlpha: 0,
      y: rise ? 120 : 46
    }, {
      autoAlpha: 1,
      y: 0,
      duration: c.in[1],
      ease: 'power3.out'
    }, c.in[0]);
    if (c.out) tl.to(p, {
      autoAlpha: 0,
      y: -40,
      duration: c.out[1],
      ease: 'power2.in'
    }, c.out[0]);
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
  const slots = {
    left: 0,
    right: 0,
    sLeft: 1,
    sRight: 1,
    midY: 0,
    sMid: 1
  };
  function measureSlots() {
    const W = innerWidth || 1;
    const hh = Math.tan(camera.fov * Math.PI / 180 / 2) * camera.position.z;
    const hw = hh * camera.aspect;
    const pxToWorld = 2 * hw / W;
    const r0 = document.querySelector('.gpanel.p0')?.getBoundingClientRect();
    const r1 = document.querySelector('.gpanel.p1')?.getBoundingClientRect();
    const pad = 18;
    // free zone LEFT of the right-anchored panel (used by scene 02)
    const leftEnd = r1 ? r1.left - pad : W * 0.5;
    slots.left = (leftEnd / 2 - W / 2) * pxToWorld;
    slots.sLeft = Math.max(0.42, Math.min(1, leftEnd * pxToWorld * 0.92 / MAC_W));
    // free zone RIGHT of the left-anchored panel (used by scene 01)
    const rightStart = r0 ? r0.right + pad : W * 0.5;
    slots.right = ((rightStart + W) / 2 - W / 2) * pxToWorld;
    slots.sRight = Math.max(0.42, Math.min(1, (W - rightStart) * pxToWorld * 0.92 / MAC_W));
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
    slots.sMid = Math.max(0.42, Math.min(1.25, bandH * pxToWorld * 0.94 / MAC_H));
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
  let t0 = performance.now(),
    tPrev = t0;
  (function loop(t) {
    requestAnimationFrame(loop);
    const drift = (t - t0) / 1000;
    settle(Math.min((t - tPrev) / 1000, 1 / 30)); // clamp: a tab-switch stall must not explode the spring
    tPrev = t;
    const calm = (shown.drift ?? 1) * (1 - shown.dock); // held/docked poses hold still
    // corner target recomputed every frame so docking survives a resize
    const hh = Math.tan(camera.fov * Math.PI / 180 / 2) * camera.position.z;
    const hw = hh * camera.aspect;
    const dockX = -(hw - 1.15),
      dockY = -(hh - 0.78);
    mac.rotation.set(shown.rx + Math.sin(drift * 0.5) * 0.022 * calm, shown.ry + Math.sin(drift * 0.34) * 0.03 * calm, shown.rz);
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/mac-hero.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/page-swipe.js
try { (() => {
/* Page load animation — the block wipe plays once, on load, then removes itself.
   Load in <head> so the curtain exists before first paint. No exit/inter-page state. */
(function () {
  if (window.PageSwipe) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent = '.pswipe{position:fixed;inset:0;z-index:100000;background:#0e0e0f;display:flex;align-items:center;justify-content:center;pointer-events:none;transform:scaleY(1);transform-origin:top}.pswipe .psw-name{display:flex;flex-direction:column;align-items:center;gap:12px;white-space:nowrap;font-family:Inconsolata,ui-monospace,monospace;font-size:27px;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:#fff}.pswipe .psw-rule{height:1.5px;width:0;background:#2b6fdb}';
  (document.head || document.documentElement).appendChild(css);
  const el = document.createElement('div');
  el.className = 'pswipe';
  el.innerHTML = '<div class="psw-name">Julianne Jin<span class="psw-rule"></span></div>';
  const rule = el.firstChild.lastChild;
  document.documentElement.appendChild(el);
  function done() {
    if (el.parentNode) el.parentNode.removeChild(el);
  }
  function reveal() {
    if (reduce) {
      done();
      return;
    }
    rule.animate([{
      width: '0px'
    }, {
      width: '130px'
    }], {
      duration: 300,
      easing: 'cubic-bezier(0.76,0,0.24,1)',
      fill: 'forwards'
    });
    setTimeout(() => {
      const a = el.animate([{
        transform: 'scaleY(1)'
      }, {
        transform: 'scaleY(0)'
      }], {
        duration: 540,
        easing: 'cubic-bezier(0.76,0,0.24,1)',
        fill: 'forwards'
      });
      a.onfinish = done;
      setTimeout(done, 700);
    }, 320);
  }
  if (document.readyState === 'complete') reveal();else addEventListener('load', () => setTimeout(reveal, 60));
  window.PageSwipe = {
    el
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/page-swipe.js", error: String((e && e.message) || e) }); }

// ui_kits/portfolio/transitions.js
try { (() => {
// =========================================================
//  Page transitions — first-load intro + between-page wipe.
//  Overlay REMOVAL is driven by setTimeout (not animation .onfinish)
//  so a throttled/offscreen timeline can never leave a panel stuck.
//  window.PX.intro(done) and window.PX.wipe(swap)
// =========================================================
(function () {
  const el = window.PK.el;
  const EASE = 'cubic-bezier(0.76, 0, 0.24, 1)';
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function intro(done) {
    if (reduce()) {
      if (done) done();
      return;
    }
    const rule = el('div', {
      class: 'px-intro__rule'
    });
    const ov = el('div', {
      class: 'px-intro'
    }, [el('div', {
      class: 'px-intro__name'
    }, ['Julianne Jin', rule])]);
    document.body.appendChild(ov);
    if (done) done(); // build the page underneath while the panel covers it

    const name = ov.querySelector('.px-intro__name');
    try {
      name.animate([{
        opacity: 0,
        transform: 'translateY(14px)'
      }, {
        opacity: 1,
        transform: 'none'
      }], {
        duration: 620,
        easing: 'cubic-bezier(0.22,1,0.36,1)',
        fill: 'both'
      });
      rule.animate([{
        width: '0px'
      }, {
        width: '120px'
      }], {
        duration: 620,
        delay: 260,
        easing: EASE,
        fill: 'both'
      });
    } catch (e) {}
    setTimeout(() => {
      try {
        ov.animate([{
          transform: 'scaleY(1)'
        }, {
          transform: 'scaleY(0)'
        }], {
          duration: 600,
          easing: EASE,
          fill: 'forwards'
        });
      } catch (e) {}
      setTimeout(() => ov.remove(), 640); // guaranteed cleanup
    }, 1150);
  }
  function wipe(swap) {
    if (reduce()) {
      if (swap) swap();
      return;
    }
    const ov = el('div', {
      class: 'px-wipe'
    });
    document.body.appendChild(ov);
    try {
      ov.animate([{
        transform: 'scaleY(0)'
      }, {
        transform: 'scaleY(1)'
      }], {
        duration: 400,
        easing: EASE,
        fill: 'forwards'
      });
    } catch (e) {}
    setTimeout(() => {
      if (swap) swap();
      ov.style.transformOrigin = 'top';
      try {
        ov.animate([{
          transform: 'scaleY(1)'
        }, {
          transform: 'scaleY(0)'
        }], {
          duration: 500,
          easing: EASE,
          fill: 'forwards'
        });
      } catch (e) {}
      setTimeout(() => ov.remove(), 540); // guaranteed cleanup
    }, 420);
  }
  window.PX = {
    intro,
    wipe
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/portfolio/transitions.js", error: String((e && e.message) || e) }); }

})();
