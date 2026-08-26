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

  function done() { if (el.parentNode) el.parentNode.removeChild(el); }

  function reveal() {
    if (reduce) { done(); return; }
    rule.animate([{ width: '0px' }, { width: '130px' }],
      { duration: 300, easing: 'cubic-bezier(0.76,0,0.24,1)', fill: 'forwards' });
    setTimeout(() => {
      const a = el.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
        { duration: 540, easing: 'cubic-bezier(0.76,0,0.24,1)', fill: 'forwards' });
      a.onfinish = done;
      setTimeout(done, 700);
    }, 320);
  }

  if (document.readyState === 'complete') reveal();
  else addEventListener('load', () => setTimeout(reveal, 60));

  window.PageSwipe = { el };
})();
