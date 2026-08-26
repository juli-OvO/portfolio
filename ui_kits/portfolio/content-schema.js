/* Structure of the live site. Each page → sections → fields.
   type: text | long | list | img       id must stay stable (it maps to the real markup). */
window.PORTFOLIO_SCHEMA = [
{
  id:'global', title:'Global / shared', file:'all pages',
  note:'Appears on every page — chrome, footer, contact links.',
  sections:[
    {id:'identity', title:'Identity', fields:[
      {id:'name', type:'text', label:'Your name', hint:'Footer + browser title'},
      {id:'role', type:'text', label:'Role line', hint:'e.g. Designer & developer, Providence RI'},
      {id:'email', type:'text', label:'Email'},
      {id:'linkedin', type:'text', label:'LinkedIn URL'},
      {id:'links', type:'list', label:'Other links', hint:'Label — URL, one per row'}
    ]},
    {id:'footer', title:'Footer', fields:[
      {id:'cta', type:'text', label:'Closing question', hint:'Currently "Interested in working together?"'},
      {id:'copyright', type:'text', label:'Copyright line'}
    ]}
  ]
},
{
  id:'index', title:'Index — the desk', file:'Folder Model v5.html',
  note:'The landing page: desk scene with the folder, project list, and the Bio / Contact sheets that wipe in.',
  sections:[
    {id:'hero', title:'Header', fields:[
      {id:'name', type:'text', label:'Name / wordmark'},
      {id:'tagline', type:'long', label:'Tagline', hint:'One or two lines under the name'},
      {id:'nav', type:'list', label:'Nav labels', hint:'Currently Index · Bio · Contact'}
    ]},
    {id:'projects', title:'Project list', fields:[
      {id:'rows', type:'list', label:'Rows, in order', hint:'Title — Year — Category — page file. One per row.',
       seed:['Hell or Sell — 2026 — Code — (page not built yet)','Heads Up Website Redesign — 2026 — Code — Case - Heads Up.html','Orbit of Desire — 2025 — Game design — Case - Orbit of Desire.html','Boid Sequencer — 2025 — Computational — Case - Music Boids.html','Illustration — 2023–26 — Fine art — Case - Illustration.html','Drawings — 2023–26 — Fine art — Case - Drawings.html']},
      {id:'blurbs', type:'list', label:'One-line blurbs', hint:'Optional short description per project, same order as above'}
    ]},
    {id:'desk', title:'Desk objects', fields:[
      {id:'objects', type:'list', label:'What sits on the desk', hint:'Currently: organizer with 3 books (Novecento, The Iliad, Do Androids Dream of Electric Sheep), volleyball, notepad',
       seed:['Book — Novecento','Book — The Iliad','Book — Do Androids Dream of Electric Sheep','Volleyball','Notepad']},
      {id:'notepad', type:'long', label:'Notepad text', hint:'The handwritten note on the desk'}
    ]},
    {id:'bio', title:'Bio sheet', fields:[
      {id:'headline', type:'text', label:'Headline'},
      {id:'body', type:'long', label:'Bio copy', hint:'2–4 short paragraphs; blank line between them'},
      {id:'portrait', type:'img', label:'Portrait'},
      {id:'education', type:'list', label:'Education', hint:'School — degree — years'},
      {id:'experience', type:'list', label:'Experience', hint:'Org — role — years'},
      {id:'skills', type:'list', label:'Skills'},
      {id:'exhibitions', type:'list', label:'Exhibitions / awards'}
    ]},
    {id:'contact', title:'Contact sheet', fields:[
      {id:'headline', type:'text', label:'Headline'},
      {id:'body', type:'long', label:'Copy'}
    ]}
  ]
},
{
  id:'headsup', title:'Case — Heads Up Website Redesign', file:'Case - Heads Up.html',
  note:'3D MacBook intro with three frosted panels, then three sections: Overview, Design direction, Prototype & tooling.',
  sections:[
    {id:'intro', title:'Intro panels (over the 3D Mac)', fields:[
      {id:'p1_title', type:'text', label:'01 Overview — title'},
      {id:'p1_body', type:'long', label:'01 Overview — copy'},
      {id:'p2_title', type:'text', label:'02 Role — title'},
      {id:'p2_body', type:'long', label:'02 Role — copy'},
      {id:'p3_tools', type:'list', label:'03 Tools — chips', seed:['Figma','Claude / AI-assisted coding','HTML','CSS','JavaScript','Lucidchart','Webflow']}
    ]},
    {id:'rail', title:'Side rail', fields:[
      {id:'outcome', type:'list', label:'Outcome bullets'}
    ]},
    {id:'overview', title:'01 — Overview', fields:[
      {id:'h', type:'text', label:'Heading'},
      {id:'body', type:'long', label:'Copy'},
      {id:'stats', type:'list', label:'Scale numbers', hint:'Number — label', seed:['120+ — Chapters','38 — States','10k+ — Students reached']},
      {id:'statnote', type:'text', label:'Footnote under numbers'},
      {id:'wins', type:'list', label:'Four outcome cells'}
    ]},
    {id:'direction', title:'02 — Design direction', fields:[
      {id:'take', type:'text', label:'Pull-quote / takeaway'},
      {id:'body', type:'long', label:'Copy'},
      {id:'img_before', type:'img', label:'Image — the previous website'},
      {id:'h_prog', type:'text', label:'Progression heading'},
      {id:'prog_body', type:'long', label:'Progression copy'},
      {id:'img_p1', type:'img', label:'Image — initial direction'},
      {id:'img_p2', type:'img', label:'Image — team feedback artifact'},
      {id:'img_p3', type:'img', label:'Image — refined / selected direction'},
      {id:'det', type:'long', label:'“What changed between rounds” — expandable copy'}
    ]},
    {id:'build', title:'03 — Prototype & tooling', fields:[
      {id:'take', type:'text', label:'Pull-quote / takeaway'},
      {id:'body', type:'long', label:'Copy'},
      {id:'img_proto', type:'img', label:'Image / video still — coded prototype'},
      {id:'h_tool', type:'text', label:'Tool section heading'},
      {id:'tool_body', type:'long', label:'Tool copy'},
      {id:'tool_props', type:'list', label:'Tool readout labels', seed:['Element — Type and tag','Classes — Applied selectors','Context — Parent / layout','Size — Width & height behavior','Spacing — Margins and padding','Type — Typography values','Inherited — Cascaded properties','Sizing — Fixed, fill, or hug']},
      {id:'img_t1', type:'img', label:'Image — helper running on the site'},
      {id:'img_t2', type:'img', label:'Image — zoomed helper interface'},
      {id:'img_t3', type:'img', label:'Image — element → Webflow settings'},
      {id:'det', type:'long', label:'“Implementation notes” — expandable copy'},
      {id:'closer', type:'text', label:'Closing line'}
    ]}
  ]
},
{
  id:'boids', title:'Case — Boid Sequencer', file:'Case - Music Boids.html',
  note:'Live boids instrument. Five sections: Concept, At a glance, How it works, Under the hood, References.',
  sections:[
    {id:'hero', title:'Hero', fields:[
      {id:'eyebrow', type:'text', label:'Eyebrow', hint:'Currently: Computational · 2025 · Solo'},
      {id:'title', type:'text', label:'Title'},
      {id:'deck', type:'long', label:'Deck / subtitle'}
    ]},
    {id:'concept', title:'01 — Concept', fields:[
      {id:'body', type:'long', label:'Copy'},
      {id:'img', type:'img', label:'Image (optional)'}
    ]},
    {id:'glance', title:'02 — At a glance', fields:[
      {id:'facts', type:'list', label:'Fact rows', hint:'Label — value'}
    ]},
    {id:'works', title:'03 — How it works', fields:[
      {id:'h', type:'text', label:'Heading', hint:'Currently "Four panels, one instrument."'},
      {id:'panels', type:'list', label:'Four panels', hint:'Name — description', seed:['Harmonic Line — ','Orbiters — ','Instruments — ','Tempo & Motion — ']}
    ]},
    {id:'hood', title:'04 — Under the hood', fields:[
      {id:'steps', type:'list', label:'Four steps', hint:'Name — description', seed:['Sense — ','Cross — ','Voice — ','Draw — ']}
    ]},
    {id:'refs', title:'05 — References', fields:[
      {id:'items', type:'list', label:'References', hint:'Title — author/source — URL'}
    ]}
  ]
},
{
  id:'orbit', title:'Case — Orbit of Desire', file:'Case - Orbit of Desire.html',
  note:'Five horizontal slides: title, Premise, In the scene, Drafts, Final scene.',
  sections:[
    {id:'s1', title:'Slide 01 — Title', fields:[
      {id:'eyebrow', type:'text', label:'Eyebrow', hint:'Currently: Game design · 2025 · Brown–RISD Game Dev'},
      {id:'title', type:'text', label:'Title'},
      {id:'deck', type:'long', label:'Deck'}
    ]},
    {id:'s2', title:'Slide 02 — Premise', fields:[
      {id:'body', type:'long', label:'Copy'},
      {id:'img', type:'img', label:'Image'}
    ]},
    {id:'s3', title:'Slide 03 — In the scene', fields:[
      {id:'body', type:'long', label:'Copy'},
      {id:'img', type:'img', label:'Image'}
    ]},
    {id:'s4', title:'Slide 04 — Drafts', fields:[
      {id:'body', type:'long', label:'Copy'},
      {id:'img1', type:'img', label:'Draft 1'},
      {id:'img2', type:'img', label:'Draft 2'},
      {id:'img3', type:'img', label:'Draft 3'}
    ]},
    {id:'s5', title:'Slide 05 — Final scene', fields:[
      {id:'body', type:'long', label:'Copy'},
      {id:'img', type:'img', label:'Final artwork'}
    ]}
  ]
},
{
  id:'illustration', title:'Case — Illustration', file:'Case - Illustration.html',
  note:'Six plates with an index, the plate gallery, and a statement.',
  sections:[
    {id:'hero', title:'Hero', fields:[
      {id:'eyebrow', type:'text', label:'Eyebrow', hint:'Currently: Fine Art · 2023 — 2025 · Six plates'},
      {id:'title', type:'text', label:'Title'},
      {id:'deck', type:'long', label:'Deck'}
    ]},
    {id:'plates', title:'Plates', fields:[
      {id:'p1', type:'img', label:'Plate 01'}, {id:'c1', type:'text', label:'Plate 01 — title, medium, year'},
      {id:'p2', type:'img', label:'Plate 02'}, {id:'c2', type:'text', label:'Plate 02 — title, medium, year'},
      {id:'p3', type:'img', label:'Plate 03'}, {id:'c3', type:'text', label:'Plate 03 — title, medium, year'},
      {id:'p4', type:'img', label:'Plate 04'}, {id:'c4', type:'text', label:'Plate 04 — title, medium, year'},
      {id:'p5', type:'img', label:'Plate 05'}, {id:'c5', type:'text', label:'Plate 05 — title, medium, year'},
      {id:'p6', type:'img', label:'Plate 06'}, {id:'c6', type:'text', label:'Plate 06 — title, medium, year'}
    ]},
    {id:'statement', title:'03 — Statement', fields:[
      {id:'body', type:'long', label:'Artist statement'}
    ]}
  ]
},
{
  id:'drawings', title:'Case — Drawings', file:'Case - Drawings.html',
  note:'Browsable drawing frame with crop marks; each drawing shows at its true aspect ratio. Add as many rows as you have drawings.',
  sections:[
    {id:'hero', title:'Hero', fields:[
      {id:'title', type:'text', label:'Title'},
      {id:'deck', type:'long', label:'Deck'}
    ]},
    {id:'works', title:'Drawings', fields:[
      {id:'d1', type:'img', label:'Drawing 01'}, {id:'m1', type:'text', label:'01 — title, medium, size, year'},
      {id:'d2', type:'img', label:'Drawing 02'}, {id:'m2', type:'text', label:'02 — title, medium, size, year'},
      {id:'d3', type:'img', label:'Drawing 03'}, {id:'m3', type:'text', label:'03 — title, medium, size, year'},
      {id:'d4', type:'img', label:'Drawing 04'}, {id:'m4', type:'text', label:'04 — title, medium, size, year'},
      {id:'d5', type:'img', label:'Drawing 05'}, {id:'m5', type:'text', label:'05 — title, medium, size, year'},
      {id:'d6', type:'img', label:'Drawing 06'}, {id:'m6', type:'text', label:'06 — title, medium, size, year'},
      {id:'more', type:'list', label:'Additional drawings', hint:'Filename — title, medium, size, year'}
    ]}
  ]
},
{
  id:'magnetoreception', title:'Case — Magnetoreception', file:'Case - Magnetoreception.html',
  note:'Wearable wing. Six sections: Concept, At a glance, How it behaves, How it\'s built, What got cut, Where it started. Copy is written from your concept statement — these fields are the gaps it could not answer.',
  sections:[
    {id:'facts', title:'Missing facts', fields:[
      {id:'when', type:'text', label:'Semester / dates', hint:'Page currently says 2026'},
      {id:'course', type:'text', label:'Course name and instructor'},
      {id:'birds', type:'list', label:'The five bird species', hint:'And their migration headings if you mapped specific ones'},
      {id:'display', type:'text', label:'What is the display, exactly?', hint:'LCD, OLED, 7-segment?'},
      {id:'board', type:'text', label:'Which microcontroller?'},
      {id:'response', type:'long', label:'How did people react when they wore it?', hint:'Critique, demo, anything said out loud'}
    ]},
    {id:'images', title:'Images', fields:[
      {id:'hero', type:'img', label:'The finished wearable, worn'},
      {id:'aligned', type:'img', label:'Wing wide — aligned'},
      {id:'off', type:'img', label:'Wing narrow — off course'},
      {id:'circuit', type:'img', label:'Soldered circuit board'},
      {id:'cuff', type:'img', label:'Printed cuff, five panels'},
      {id:'feather', type:'img', label:'Wire and foil feather detail'},
      {id:'ref', type:'img', label:'Reference board'},
      {id:'video', type:'text', label:'Video of it moving?', hint:'If you have a clip, say where — a moving wing is worth more than any still'}
    ]}
  ]
},
{
  id:'window', title:'Case — Prosthetic Window', file:'Case - Prosthetic Window.html',
  note:'Responsive bioplastic window. Six sections: Concept, At a glance, How it responds, Three systems, Making the surface, Drafts.',
  sections:[
    {id:'facts', title:'Missing facts', fields:[
      {id:'when', type:'text', label:'Semester / dates'},
      {id:'course', type:'text', label:'Course name and instructor'},
      {id:'size', type:'text', label:'Finished dimensions', hint:'How big is the window?'},
      {id:'board', type:'text', label:'Which Arduino board and LED type?'},
      {id:'batches', type:'text', label:'How many bioplastic batches did it take?'},
      {id:'shown', type:'text', label:'Was it exhibited or installed anywhere?'},
      {id:'response', type:'long', label:'How did people react to it in the room?'}
    ]},
    {id:'images', title:'Images', fields:[
      {id:'hero', type:'img', label:'Installed and lit, straight on'},
      {id:'cold', type:'img', label:'Cold state — nobody near'},
      {id:'warm', type:'img', label:'Warm state — viewer at the surface'},
      {id:'circuit', type:'img', label:'Arduino circuit and sensors'},
      {id:'leds', type:'img', label:'LED array on reflective fabric'},
      {id:'membrane', type:'img', label:'Membrane backlit'},
      {id:'bio', type:'img', label:'Bioplastic experiments'},
      {id:'assembly', type:'img', label:'Trimming and assembling'},
      {id:'draft1', type:'img', label:'Draft 01'},
      {id:'draft2', type:'img', label:'Draft 02'}
    ]}
  ]
},
{
  id:'hellorsell', title:'Case — Hell or Sell (not built yet)', file:'— to be created',
  note:'Newest project, listed on the index but with no page yet. Fill this in and I will build the page from it.',
  sections:[
    {id:'hero', title:'Hero', fields:[
      {id:'eyebrow', type:'text', label:'Eyebrow', hint:'Category · year · context'},
      {id:'title', type:'text', label:'Title'},
      {id:'deck', type:'long', label:'Deck — what it is in two sentences'},
      {id:'role', type:'text', label:'Your role'},
      {id:'tools', type:'list', label:'Tools'}
    ]},
    {id:'body', title:'Body', fields:[
      {id:'problem', type:'long', label:'The problem / brief'},
      {id:'process', type:'long', label:'Process'},
      {id:'outcome', type:'long', label:'Outcome'},
      {id:'img1', type:'img', label:'Hero image'},
      {id:'img2', type:'img', label:'Process image'},
      {id:'img3', type:'img', label:'Final image'},
      {id:'shape', type:'long', label:'How should this page feel?', hint:'Anything about structure, motion, or reference pages you want me to follow'}
    ]}
  ]
}
];
