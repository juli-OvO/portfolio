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
  if (reduce()) { if (done) done(); return; }
  const rule = el('div', { class: 'px-intro__rule' });
  const ov = el('div', { class: 'px-intro' }, [
    el('div', { class: 'px-intro__name' }, ['Julianne Jin', rule])
  ]);
  document.body.appendChild(ov);
  if (done) done(); // build the page underneath while the panel covers it

  const name = ov.querySelector('.px-intro__name');
  try {
    name.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
      { duration: 620, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'both' });
    rule.animate([{ width: '0px' }, { width: '120px' }],
      { duration: 620, delay: 260, easing: EASE, fill: 'both' });
  } catch (e) {}

  setTimeout(() => {
    try { ov.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
      { duration: 600, easing: EASE, fill: 'forwards' }); } catch (e) {}
    setTimeout(() => ov.remove(), 640);   // guaranteed cleanup
  }, 1150);
}

function wipe(swap) {
  if (reduce()) { if (swap) swap(); return; }
  const ov = el('div', { class: 'px-wipe' });
  document.body.appendChild(ov);
  try { ov.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
    { duration: 400, easing: EASE, fill: 'forwards' }); } catch (e) {}

  setTimeout(() => {
    if (swap) swap();
    ov.style.transformOrigin = 'top';
    try { ov.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
      { duration: 500, easing: EASE, fill: 'forwards' }); } catch (e) {}
    setTimeout(() => ov.remove(), 540);   // guaranteed cleanup
  }, 420);
}

window.PX = { intro, wipe };
})();