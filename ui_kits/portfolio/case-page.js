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
  const framesOK = new Promise(res => { resolveFrames = res; });
  if (reduce) resolveFrames(false);
  else {
    let done = false;
    const settle = v => { if (!done) { done = true; resolveFrames(v); } };
    setTimeout(() => settle(false), 300);
    requestAnimationFrame(() => requestAnimationFrame(() => settle(true)));
  }
  return { reduce, framesOK };
})();

CasePage.framesOK.then(ok => {
  if (!ok) return; // static render — .rv stays visible, nothing else to do
  document.documentElement.classList.add('anim');

  const show = el => {
    const d = parseFloat(el.dataset.d || 0);
    el.classList.add('seen');
    if (d) setTimeout(() => el.classList.add('in'), d * 1000);
    else el.classList.add('in');
  };
  function checkAll() {
    const nodes = document.querySelectorAll('.rv:not(.seen)');
    if (!nodes.length) return true;
    const vh = innerHeight || document.documentElement.clientHeight;
    nodes.forEach(n => { if (n.getBoundingClientRect().top < vh * 0.94) show(n); });
    return !document.querySelectorAll('.rv:not(.seen)').length;
  }
  checkAll();
  const beat = setInterval(() => { if (checkAll()) clearInterval(beat); }, 150);
  addEventListener('scroll', checkAll, { passive: true });
  addEventListener('resize', checkAll, { passive: true });
  addEventListener('load', checkAll);
});

window.addEventListener('load', async () => {
  const ok = await CasePage.framesOK;
  if (!window.gsap || !ok) return; // no splits, no parallax — text stays as authored
  gsap.registerPlugin(ScrollTrigger);

  const prog = document.querySelector('.prog');
  if (prog) gsap.to(prog, { scaleX: 1, ease: 'none', scrollTrigger: { scrub: .25, start: 0, end: 'max' } });

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
        s.className = 'ch'; s.textContent = c;
        wrap.appendChild(s);
      });
      el.appendChild(wrap);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    gsap.from(el.querySelectorAll('.ch'), { yPercent: 118, opacity: 0, duration: 1.05, ease: 'expo.out', stagger: .028, delay: .12 });
  });

  // pull quotes — words
  document.querySelectorAll('[data-split="words"]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.className = 'w'; s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    const tw = gsap.fromTo(el.querySelectorAll('.w'), { yPercent: 90, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .035, paused: true });
    (function watch() {
      if (el.getBoundingClientRect().top < innerHeight * 0.94) { tw.play(); return; }
      setTimeout(watch, 150);
    })();
  });

  gsap.utils.toArray('[data-par]').forEach(el => {
    gsap.fromTo(el, { yPercent: -(+el.dataset.par || 6) }, {
      yPercent: (+el.dataset.par || 6), ease: 'none',
      scrollTrigger: { trigger: el.closest('figure, .parwrap') || el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  document.querySelectorAll('.mq').forEach(mq => {
    const track = mq.querySelector('.track');
    if (!track) return;
    const half = track.scrollWidth / 2 || 1;
    let x = 0, dir = -1;
    gsap.ticker.add(() => { x += dir * 1.1; if (x <= -half) x += half; if (x > 0) x -= half; gsap.set(track, { x }); });
    ScrollTrigger.create({ onUpdate: s => { dir = s.direction === 1 ? -1 : 1; } });
  });

  document.querySelectorAll('.toc a').forEach(a => {
    const id = a.getAttribute('href');
    const target = id && id.startsWith('#') && document.querySelector(id);
    if (!target) return;
    a.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 88, behavior: 'smooth' });
    });
    ScrollTrigger.create({ trigger: target, start: 'top 42%', end: 'bottom 42%', onToggle: s => a.classList.toggle('on', s.isActive) });
  });

  ScrollTrigger.refresh();
});
