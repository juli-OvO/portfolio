// App — wires up the click-thru prototype.
(function () {
const { el: makeEl, makeCursor, makeModeToggle, makeStatusBar, makeCredit,
        pillBtn, makeFolder, topicItem, cvSection } = window.PK;
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
const WORKS = [
  { id: 'music-boids', title: 'Music Boids', year: '2025', kind: 'Computational',
    img: 'assets/boid.png',
    deck: 'A flocking-system instrument that maps spatial behaviour to generative sound.',
    sections: [
      { type: 'heroBg', img: 'assets/boid.png',
        deck: 'A flocking-system instrument that maps spatial behaviour to generative sound.' },
      { type: 'marquee', items: ['Generative Audio','Flocking','WebAudio','Spatial Mapping','Emergence','Real-time'] },
      { type: 'concept', label: 'Concept',
        text: 'A flock that <span class="hl">hears itself.</span> The score isn’t written — it emerges from how the agents move.' },
      { type: 'breakdown', label: 'At a glance', cells: [
        { k: 'Role', v: 'Solo author' }, { k: 'Year', v: '2025' },
        { k: 'Tools', v: 'JS · WebAudio · Canvas' }, { k: 'Type', v: 'Generative instrument' },
        { k: 'Context', v: 'RISD · self-directed' } ] },
      { type: 'prose', label: 'Purpose', paras: [
        'I wanted an instrument with no keys — something you conduct rather than play. The question was whether a system built only from simple local rules could feel expressive rather than random.',
        'Flocking was the obvious substrate: legible, alive, and already full of the near-misses and sudden agreements that make music feel intentional.' ] },
      { type: 'textImage', label: 'Goal', heading: 'Make movement audible',
        paras: [ 'Every audible event had to trace back to something you could see on screen, so the sound never felt arbitrary.',
                 'The mapping is deliberately thin — proximity, heading, and threshold-crossings — so the ear can learn the rules by watching.' ],
        img: 'assets/illustration-2.png', cap: 'Voice-mapping sketch' },
      { type: 'steps', label: 'How it was achieved', items: [
        { title: 'Sense', body: 'Each agent measures separation, alignment, and distance to the cursor every frame.' },
        { title: 'Map', body: 'Threshold-crossings become events; position maps to pitch, velocity to dynamics.' },
        { title: 'Voice', body: 'A small synth voice is triggered live — no samples, everything generated in the browser.' } ] },
      { type: 'hoverTerms', label: 'Approach', parts: [
        'Each ', { term: 'agent', img: 'assets/boid.png' }, ' fires a ',
        { term: 'voice', img: 'assets/illustration-3.png' },
        ' as it crosses a threshold — separation, alignment, or distance to the cursor.' ] },
      { type: 'processGrid', label: 'Process', items: [
        { img: 'assets/blender-prison.png', cap: 'Spatial test' },
        { img: 'assets/illustration-2.png', cap: 'Voice map' },
        { img: 'assets/illustration-3.png', cap: 'Event router' },
        { img: 'assets/boid.png', cap: 'Flock field' } ] },
      { type: 'detail', img: 'assets/boid.png', cap: 'Live flock — three groups, orange / coral / yellow' },
      { type: 'references', label: 'References', items: [
        { title: 'Boids — Craig Reynolds', src: 'SIGGRAPH 1987' },
        { title: 'Formalized Music — Iannis Xenakis', src: '1971' },
        { title: 'Brian Eno — generative music', src: 'talk, 1996' } ] },
      { type: 'final', label: 'Final', img: 'assets/boid.png', cap: 'Music Boids — live build' },
    ] },

  { id: 'orbit-of-desire', title: 'Orbit of Desire', year: '2025', kind: 'Game Design',
    img: 'assets/orbit-title.png',
    deck: 'A sci-fi romance visual novel set aboard an intergalactic botany research station.',
    sections: [
      { type: 'heroSplit', img: 'assets/orbit-title.png',
        deck: 'A sci-fi romance visual novel set aboard an intergalactic botany research station.' },
      { type: 'concept', label: 'Concept',
        text: 'Tend the garden, tend the <span class="hl">relationship.</span> Light, heat, and humidity drive both the plants and the people.' },
      { type: 'textImage', label: 'Premise', heading: 'Botany as romance', flip: true,
        paras: [ 'Players manage plant-growth systems while navigating branching dialogue, affection meters, and multiple endings.',
                 'Environmental variables quietly influence both plant mechanics and character relationships, so play and story share one set of rules.' ],
        img: 'assets/orbit-uba-lab.png', cap: 'Uba — lab scene' },
      { type: 'textImage', label: 'My role', heading: 'Character designer & illustrator',
        paras: [ 'I designed Uba’s full visual identity — pose variations, emotional states, silhouette clarity — and refined her arc with the writers.',
                 'The aim was to keep her unsettling edge without flattening her into a caricature.' ],
        img: 'assets/orbit-title.png', cap: 'Title scene' },
      { type: 'processGrid', label: 'Character process', items: [
        { img: 'assets/orbit-uba-lab.png', cap: 'Uba — final' },
        { img: 'assets/illustration-2.png', cap: 'Expression sheet' },
        { img: 'assets/illustration-3.png', cap: 'Silhouette study' } ] },
      { type: 'references', label: 'References', items: [
        { title: 'Visual-novel pacing', src: 'study' },
        { title: 'Botanical illustration', src: 'archive' } ] },
      { type: 'final', label: 'Final', img: 'assets/orbit-title.png', cap: 'Orbit of Desire — title' },
    ] },

  { id: 'illustration', title: 'Illustration', year: '2024', kind: 'Fine Art',
    img: 'assets/illustration-1-preview.jpg',
    deck: 'Painterly digital illustration — narrative, character, mood.',
    sections: [
      { type: 'carousel', items: [
        { img: 'assets/illustration-1-preview.jpg', caption: 'study i' },
        { img: 'assets/illustration-2.png', caption: 'study ii' },
        { img: 'assets/illustration-3.png', caption: 'study iii' },
        { img: 'assets/orbit-uba-lab.png', caption: 'character' } ] },
      { type: 'marquee', items: ['Procreate','Narrative','Character','Mood','Colour'] },
      { type: 'concept', label: 'Statement',
        text: 'Painting as <span class="hl">narrative shorthand</span> — a single frame that implies the whole story around it.' },
      { type: 'final', label: 'Selected', img: 'assets/illustration-1-preview.jpg', cap: 'Selected illustration' },
    ] },

  { id: 'drawing', title: 'Drawing', year: '2025', kind: 'Fine Art',
    img: 'assets/drawing-class-1.jpeg',
    deck: 'Observational charcoal and graphite, RISD foundation studio.',
    sections: [
      { type: 'slides', items: [
        { img: 'assets/drawing-class-1.jpeg', caption: 'untitled (in-class drawing)', year: '2025' },
        { img: 'assets/drawing-class-2.jpeg', caption: 'untitled (in-class drawing)', year: '2025' } ] },
      { type: 'concept', label: 'Statement',
        text: 'Observational charcoal — <span class="hl">light before line.</span>' },
    ] },

  { id: 'blender', title: 'Blender / 3D', year: '2024', kind: 'Computational',
    img: 'assets/blender-scene5.png',
    deck: 'Procedurally lit interior scenes built in Blender.',
    sections: [
      { type: 'carousel', items: [
        { img: 'assets/blender-scene5.png', caption: 'scene v' },
        { img: 'assets/blender-prison.png', caption: 'interior study' } ] },
      { type: 'breakdown', label: 'At a glance', cells: [
        { k: 'Role', v: 'Solo' }, { k: 'Year', v: '2024' },
        { k: 'Tools', v: 'Blender · Cycles' }, { k: 'Focus', v: 'Procedural lighting' } ] },
      { type: 'final', label: 'Final', img: 'assets/blender-scene5.png', cap: 'Scene V' },
    ] },

  { id: 'hellorsell', title: 'Hell or Sell', year: '2024', kind: 'Game Design',
    img: 'assets/hellorsell.png',
    deck: 'A satirical UI mockup for a make-believe fintech.',
    sections: [
      { type: 'heroBg', img: 'assets/hellorsell.png',
        deck: 'A satirical UI mockup for a make-believe fintech.' },
      { type: 'steps', label: 'How it was made', items: [
        { title: 'Concept', body: 'A deliberately over-eager trading app — UI as satire.' },
        { title: 'Type & motion', body: 'Loud type and pushy motion that keep selling even when you say no.' } ] },
      { type: 'final', label: 'Final', img: 'assets/hellorsell.png', cap: 'Hell or Sell — UI' },
    ] },
];
// derive index/total/next
WORKS.forEach((w, i) => { w.index = String(i + 1).padStart(2, '0'); w.total = String(WORKS.length).padStart(2, '0'); w.next = WORKS[(i + 1) % WORKS.length].title; });

// ---------- Build app shell ----------
function buildHomepage(onPick, onResume) {
  const root = el('div', { class: 'landing' });

  // Left: nav strip
  const previewCard = el('div', { class: 'preview-card', id: 'preview-card' });
  const previewPanel = el('div', { class: 'preview-panel' }, [previewCard,
    el('div', { class: 'preview-empty', id: 'preview-empty' }, 'Hover a work →')
  ]);

  // ----- discipline folders: group works by kind -----
  const DISCIPLINES = [
    { tone: 'code',  label: 'CODE',  kind: 'Computational', heading: 'Computational' },
    { tone: 'games', label: 'GAMES', kind: 'Game Design',   heading: 'Game Design' },
    { tone: 'art',   label: 'ART',   kind: 'Fine Art',      heading: 'Fine Art' },
  ];
  function disciplineBody(d) {
    const list = el('div', { class: 'works-list', style: { display: 'flex', flexDirection: 'column', gap: '12px' } });
    list.appendChild(el('div', {
      style: { fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '600',
               letterSpacing: '0.06em', opacity: '0.6', marginBottom: '2px' }
    }, d.heading));
    WORKS.filter(w => w.kind === d.kind).forEach(w => {
      list.appendChild(topicItem({
        title: w.title, year: w.year,
        onhover: () => showPreview(w),
        onclick: () => onPick(w)
      }));
    });
    return list;
  }

  // ----- INFO folder: bio + key credential + résumé link (fits fixed body) -----
  const infoBody = el('div', { class: 'cv-block', style: { gap: '14px' } }, [
    el('p', { style: { fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.6', margin: '0' } },
      'Visual artist & designer at RISD (Art & Computation) — building systems where logic meets imagination.'),
    cvSection('EDUCATION', [
      { text: 'RISD — BFA Art & Computation, 2024–28', title: true },
    ]),
    el('a', {
      class: 'underline-link',
      style: { fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', width: 'fit-content' },
      onclick: () => onResume && onResume()
    }, 'Full résumé →'),
  ]);

  const folderDefs = [
    ...DISCIPLINES.map(d => ({ tone: d.tone, label: d.label, body: [disciplineBody(d)] })),
    { tone: 'info', label: 'INFO', body: [infoBody] },
    // decorative blank blocker: seals the right side of the fan past INFO
    { tone: 'info', label: '', body: [], blank: true },
  ];
  const folders = folderDefs.map((f, i) =>
    makeFolder({ tone: f.tone, label: f.label, body: f.body, index: i, count: folderDefs.length,
                 flushRight: f.blank, blank: f.blank }));
  // open the fifth (blank) folder by default
  const fifth = folders[folders.length - 1];
  if (fifth) fifth.classList.add('open');

  const navStrip = el('div', { class: 'nav-strip' }, [
    el('div', { class: 'brand-name' }, 'Julianne Jin'),
    el('div', { class: 'brand-sub' }, 'Visual Artist · Designer · RISD'),
    el('div', { class: 'contact-row' }, [
      pillBtn('Email', () => alert('mailto:julianne@risd.edu')),
      pillBtn('LinkedIn', () => alert('linkedin.com/in/julianne-jin')),
    ]),
    el('div', { class: 'folders', style: { '--n': String(folders.length) } }, folders)
  ]);

  root.append(navStrip, previewPanel);
  return root;
}

function showPreview(w) {
  const card = document.getElementById('preview-card');
  const empty = document.getElementById('preview-empty');
  if (!card) return;
  empty.style.display = 'none';
  card.innerHTML = '';
  card.appendChild(el('img', { src: w.img, alt: w.title }));
  card.appendChild(el('div', { class: 'preview-cap' }, [
    el('div', { class: 'ttl' }, w.title),
    el('div', { class: 'yr' }, w.year),
  ]));
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
    style: { position: 'fixed', inset: 0, display: 'grid', placeItems: 'center',
             background: 'var(--folder-bio)', zIndex: 'var(--z-panel)', cursor: 'none' }
  }, [
    el('div', { style: { textAlign: 'center', padding: '40px' } }, [
      el('div', {
        style: { fontFamily:'var(--font-serif)', fontStyle:'italic',
                 fontSize:'clamp(96px, 18vw, 220px)', lineHeight:'0.9',
                 color:'var(--ink)' }
      }, '404'),
      el('div', {
        style: { fontFamily:'var(--font-mono)', fontSize:'13px',
                 letterSpacing:'0.14em', textTransform:'uppercase',
                 color:'var(--fg-2)', marginTop:'20px' }
      }, 'This boid flew off-screen.'),
      el('div', { style: { marginTop: '32px' } }, [
        Object.assign(pillBtn('Back home', onHome), {})
      ])
    ])
  ]);
}

// ---------- Resume ----------
function buildResume(onBack) {
  return el('div', {
    style: { position:'fixed', inset:0, background:'var(--paper)', overflowY:'auto', cursor:'none', zIndex:'var(--z-panel)' }
  }, [
    el('button', { class: 'cs-back', onclick: onBack }, [el('div', { class: 'arr' })]),
    el('div', {
      style: { maxWidth:'780px', margin:'80px auto', padding:'0 32px', fontFamily:'var(--font-mono)' }
    }, [
      el('div', { style: { display:'flex', justifyContent:'space-between', alignItems:'flex-end', borderBottom:'2px solid var(--fg-1)', paddingBottom:'12px', marginBottom:'28px' } }, [
        el('div', {}, [
          el('div', { style: { fontSize:'40px', fontWeight:400 } }, 'Julianne Jin'),
          el('div', { style: { fontSize:'12px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--fg-2)', marginTop:'4px' } }, 'Visual Artist · Designer'),
        ]),
        el('div', { style: { fontSize:'12px', textAlign:'right', color:'var(--fg-2)' } }, [
          el('div', {}, 'julianne@risd.edu'),
          el('div', {}, 'linkedin.com/in/julianne-jin'),
        ])
      ]),
      makeResSection('EDUCATION', [
        ['Rhode Island School of Design', '2024 – 2028',
         'BFA, Art and Computation. Nature Culture Sustainability Studies concentration.'],
      ]),
      makeResSection('SELECTED PROJECTS', [
        ['Music Boids', '2025', 'Generative flocking instrument; spatial-to-sound event mapping. Vanilla JS + WebAudio.'],
        ['Orbit of Desire', '2025', 'Two-player gravity game. Unity / C#. Soft-body physics, narrative by interaction.'],
        ['Hell or Sell', '2024', 'Satirical fintech mockup. Concept, type, motion.'],
      ]),
      makeResSection('SKILLS', [
        ['Code', '', 'JavaScript · Three.js · p5.js · WebGL · C#'],
        ['Design', '', 'Figma · Procreate · Blender · Unity · Audition'],
        ['Practice', '', 'Generative systems · Interaction design · Sound · Drawing'],
      ]),
      makeResSection('EXHIBITIONS', [
        ['RISD Open Studios', '2025', 'Spring Showcase, Sol Koffler Gallery.'],
      ]),
      el('div', { class: 'credit', style: { position:'static', marginTop:'48px', display:'inline-block' } },
         '— Updated April 2026 —')
    ])
  ]);
}
function makeResSection(title, rows) {
  return el('section', { style: { marginBottom: '32px' } }, [
    el('h3', {
      style: { fontSize:'13px', letterSpacing:'0.14em', textTransform:'uppercase',
               color:'var(--orange)', fontWeight:800, marginBottom:'14px' }
    }, title),
    ...rows.map(([t, when, desc]) => el('div', {
      style: { display:'grid', gridTemplateColumns:'1fr auto', gap:'4px 16px', marginBottom:'14px', fontSize:'13px' }
    }, [
      el('div', { style: { fontWeight:700 } }, t),
      el('div', { style: { color:'var(--fg-2)', fontSize:'12px' } }, when),
      el('div', { style: { gridColumn:'1 / -1', color:'var(--fg-2)', lineHeight:1.6 } }, desc),
    ]))
  ]);
}

// ---------- Boot ----------
function boot() {
  makeCursor();
  document.body.appendChild(makeStatusBar());
  document.body.appendChild(makeModeToggle());
  document.body.appendChild(makeCredit());

  // Fixed bottom-left mini nav (kit-only — lets you jump between screens)
  const screenNav = el('div', {
    style: { position:'fixed', bottom:'14px', left:'14px', zIndex:'var(--z-fixed)',
             display:'flex', gap:'8px', fontFamily:'var(--font-mono)', fontSize:'11px',
             letterSpacing:'0.08em', textTransform:'uppercase' }
  });
  document.body.appendChild(screenNav);

  function mount(name, ...args) {
    document.querySelectorAll('.screen-root').forEach(x => x.remove());
    let r;
    if (name === 'home')   r = buildHomepage(w => go('case', w), () => go('resume'));
    if (name === 'case')   r = buildCaseStudy(args[0] || WORKS[0], () => go('home'));
    if (name === 'resume') r = buildResume(() => go('home'));
    if (name === '404')    r = build404(() => go('home'));
    r.classList.add('screen-root');
    document.body.appendChild(r);
    // status readout belongs to the landing only — hide elsewhere so it
    // doesn't collide with the back button.
    const sb = document.querySelector('.status-bar');
    if (sb) sb.style.display = (name === 'home') ? 'flex' : 'none';
    window.scrollTo(0, 0);
  }

  // navigate with a wipe transition between screens
  function go(name, ...args) {
    window.PX.wipe(() => mount(name, ...args));
  }

  ['home', 'case', 'resume', '404'].forEach(name => {
    const b = el('button', {
      class: 'btn-pill',
      style: { fontSize:'10px', padding:'2px 10px' },
      onclick: () => go(name)
    }, name);
    screenNav.appendChild(b);
  });

  // first load: intro panel lifts to reveal the homepage
  window.PX.intro(() => mount('home'));
}

addEventListener('DOMContentLoaded', boot);
})();
