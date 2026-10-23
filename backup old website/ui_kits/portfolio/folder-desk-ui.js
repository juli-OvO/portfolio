/* Folder Model v5 — 2D UI layer (index, cursor, HUD, CV, mode) */
(function () {
  // ongoing body of work — end year tracks the current year
  const ONGOING = '2023\u2013' + String(new Date().getFullYear()).slice(2);
  const WORKS = [
    { id:'heads-up', title:'Heads Up Redesign', year:'2026', disc:'CODE', img:'assets/hu-style.png',
      href:'Case - Heads Up.html',
      desc:'Website redesign for a student nonprofit working on screen time. Selected out of three directions, then built and handed off in Webflow.',
      tags:['UX/UI','Webflow','Prototyping','Nonprofit'] },
    { id:'music-boids', title:'Boid Sequencer', year:'2025', disc:'CODE', img:'assets/boid.png',
      href:'Case - Music Boids.html',
      desc:'A step sequencer whose buttons drift out of position, so you steer the system instead of programming it.',
      tags:['p5.js','Tone.js','Generative','Toy'] },
    { id:'magnetoreception', title:'Prosthesis', year:'2026', disc:'PHYS', img:'assets/mag-worn-1600.png',
      href:'Case - Magnetoreception.html',
      desc:'A wearable wing that flaps wide only when your arm points along a bird\'s migration route.',
      tags:['Wearable','Servos','Compass','Fabrication'] },
    { id:'window', title:'Prosthetic Window', year:'2026', disc:'PHYS', img:'assets/win-final-1600.jpg',
      href:'Case - Prosthetic Window.html',
      desc:'A fake window of cast bioplastic and 559 LEDs that responds to room light and to being approached.',
      tags:['Arduino','Bioplastic','Installation','Sensing'] },
    { id:'hellorsell', title:'Hell or Sell', year:'2026', disc:'GAMES', img:'assets/hellorsell.png',
      desc:'A student game made with a team of about twenty across two schools. Co-art lead; in final testing.',
      tags:['Game Art','Art Direction','Team of 20'] },
    { id:'orbit', title:'Orbit of Desire', year:'2025', disc:'GAMES', img:'assets/orbit-title.png',
      href:'Case - Orbit of Desire.html',
      desc:'A sci-fi romance visual novel set aboard an intergalactic botany station.',
      tags:['Visual Novel','Character','Branching','Botany'] },
    { id:'illustration', title:'Illustration', year:ONGOING, disc:'ART', img:'assets/illustration-1-preview.jpg',
      href:'Case - Illustration.html',
      desc:'Painterly digital illustration: narrative, character, and mood.',
      tags:['Procreate','Narrative','Mood','Colour'] },
    { id:'drawing', title:'Drawing', year:'2025', disc:'ART', img:'assets/drawing-class-1.jpeg',
      href:'Case - Drawings.html',
      desc:'Charcoal and observational studies of light, form, and atmosphere.',
      tags:['Charcoal','Observational','Studies','Black & White'] },
  ];
  const DISCS = ['PHYS','CODE','GAMES','ART'];
  const DOT = { CODE:'#2b6fdb', PHYS:'#3d8a63', GAMES:'#eb8a2e', ART:'#efbd1e' };

  // Shared bridge for the three.js layer
  const Desk = window.Desk = { works: WORKS, dots: DOT, setFace: null, setMode: null, pending: null, mode: 'day' };

  const index = document.getElementById('index');
  const foot = index.querySelector('.foot');
  const mEls = {};
  document.getElementById('idxCount').textContent = String(WORKS.length).padStart(2,'0');

  DISCS.forEach(d => {
    const h = document.createElement('div'); h.className='grp-head'; h.textContent=d; index.insertBefore(h, foot);
    WORKS.forEach((w,i) => { if (w.disc !== d) return;
      const m = document.createElement('div'); m.className='mitem' + (w.href ? ' has-page' : '');
      m.innerHTML = '<span class="ix">'+String(i+1).padStart(2,'0')+'</span><span class="nm">'+w.title+'</span><span class="yr">'+w.year+'</span>';
      m.addEventListener('mouseenter', () => setActive(i));
      if (w.href) m.addEventListener('click', () => { location.href = w.href; });
      index.insertBefore(m, foot); mEls[i] = m;
    });
  });

  const info = document.getElementById('info'), iTitle=document.getElementById('iTitle'), iYear=document.getElementById('iYear'),
        iDesc=document.getElementById('iDesc'), iTags=document.getElementById('iTags');
  let lastIdx = -1;

  function setActive(i) {
    lastIdx = i;
    const w = WORKS[i];
    Object.keys(mEls).forEach(k => mEls[k].classList.toggle('active', Number(k) === i));
    iTitle.textContent = w.title; iYear.textContent = w.year; iDesc.textContent = w.desc;
    iTags.innerHTML = w.tags.map(t => '<span class="itag">'+t+'</span>').join('');
    info.classList.add('show');
    if (Desk.setFace) Desk.setFace(i); else Desk.pending = i;
  }
  // leaving the index hides the info panel only — the folder keeps the last preview
  index.addEventListener('mouseleave', () => {
    Object.keys(mEls).forEach(k => mEls[k].classList.remove('active'));
    info.classList.remove('show');
  });

  // ---- clock ----
  const clkTime=document.getElementById('clkTime'), clkDate=document.getElementById('clkDate'), clkView=document.getElementById('clkView');
  function tick(){ const d=new Date();
    clkTime.textContent = d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true});
    clkDate.textContent = d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    clkView.textContent = innerWidth+' × '+innerHeight; }
  tick(); setInterval(tick,1000); addEventListener('resize',tick);

  // ---- cursor ----
  const cursor=document.getElementById('cursor'), curH=document.getElementById('curH'), curV=document.getElementById('curV'),
        curRet=document.getElementById('curRet'), curEnter=document.getElementById('curEnter'),
        curX=document.getElementById('curX'), curY=document.getElementById('curY');
  addEventListener('mousemove', e => {
    const x=e.clientX, y=e.clientY;
    curH.style.top=y+'px'; curV.style.left=x+'px';
    curRet.style.left=x+'px'; curRet.style.top=y+'px';
    curEnter.style.left=x+'px'; curEnter.style.top=y+'px';
    curX.style.top=y+'px'; curX.textContent='X:'+String(x).padStart(3,'0');
    curY.style.left=x+'px'; curY.textContent='Y:'+String(y).padStart(3,'0');
    cursor.classList.toggle('hot', !!(e.target && e.target.closest && e.target.closest('.mitem,.hudbtn,a,button')));
  });
  document.addEventListener('mouseleave', ()=> cursor.style.opacity='0');
  document.addEventListener('mouseenter', ()=> cursor.style.opacity='1');

  // ---- day / night ----
  const btnMode = document.getElementById('btnMode');
  btnMode.addEventListener('click', () => {
    Desk.mode = Desk.mode === 'day' ? 'night' : 'day';
    document.body.classList.toggle('night', Desk.mode === 'night');
    btnMode.textContent = Desk.mode === 'day' ? 'Night' : 'Day';
    if (Desk.setMode) Desk.setMode(Desk.mode);
  });

  // ---- CV swipe ----
  const EASE='cubic-bezier(0.76,0,0.24,1)';
  const reduceM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const resume=document.getElementById('resume'), swipe=document.getElementById('swipe'), swRule=document.getElementById('swRule');
  function anim(el,frames,dur,delay){ try{ el.animate(frames,{duration:dur,delay:delay||0,easing:EASE,fill:'forwards'}); }catch(e){} }
  function themedSwipe(swap){
    if (reduceM) { swap && swap(); return; }
    swipe.style.pointerEvents='auto'; swipe.style.transformOrigin='bottom';
    anim(swipe,[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],440);
    swRule.style.width='0px'; anim(swRule,[{width:'0px'},{width:'130px'}],380,150);
    setTimeout(()=>{
      swap && swap();
      swipe.style.transformOrigin='top';
      anim(swipe,[{transform:'scaleY(1)'},{transform:'scaleY(0)'}],540);
      setTimeout(()=>{ swipe.style.pointerEvents='none'; swRule.style.width='0px'; },560);
    },580);
  }
  const bio = document.getElementById('bio'), contact = document.getElementById('contact');
  function openSheet(el){ themedSwipe(()=>{ [resume,bio,contact].forEach(s=>{ s.classList.remove('show'); s.setAttribute('aria-hidden','true'); }); el.classList.add('show'); el.setAttribute('aria-hidden','false'); el.scrollTop=0; }); }
  function closeSheet(el){ themedSwipe(()=>{ el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }); }
  document.getElementById('btnCV').addEventListener('click', ()=> openSheet(resume));
  document.getElementById('btnBio').addEventListener('click', ()=> openSheet(bio));
  document.getElementById('btnContact').addEventListener('click', ()=> openSheet(contact));
  document.getElementById('rsBack').addEventListener('click', ()=> closeSheet(resume));
  document.getElementById('bioBack').addEventListener('click', ()=> closeSheet(bio));
  document.getElementById('ctBack').addEventListener('click', ()=> closeSheet(contact));
  addEventListener('keydown', e => { if (e.key === 'Escape') [resume,bio,contact].forEach(s => { if (s.classList.contains('show')) closeSheet(s); }); });

})();
