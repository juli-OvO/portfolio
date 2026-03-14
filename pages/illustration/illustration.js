// illustration.js — 3D coverflow carousel
(() => {
  const cards = Array.from(document.querySelectorAll('.illus-card'));
  const prevBtn = document.querySelector('.illus-arrow--prev');
  const nextBtn = document.querySelector('.illus-arrow--next');
  const total = cards.length;
  if (total === 0) return;

  let active = 0;
  let isLocked = false;
  const lockDur = 680;
  const deltaThreshold = 12;

  // Returns the CSS transform + style values for a card at the given signed offset
  function styleForOffset(offset) {
    const abs = Math.abs(offset);
    const sign = offset >= 0 ? 1 : -1;

    if (offset === 0) {
      return {
        transform: 'translate(-50%, -50%) perspective(1200px) translateX(0%) rotateY(0deg) scale(1.3)',
        opacity: '1',
        zIndex: '10',
        pointerEvents: 'auto',
      };
    }
    if (abs === 1) {
      return {
        // shift 68% of card width + 80px to each side, rotate 48deg inward, shrink 50%
        transform: `translate(-50%, -50%) perspective(1200px) translateX(calc(${sign * 68}% + ${sign * 80}px)) rotateY(${sign * 30}deg) scale(0.5)`,
        opacity: '0.5',
        zIndex: '5',
        pointerEvents: 'auto',
      };
    }
    // abs >= 2: hidden off-screen
    return {
      transform: `translate(-50%, -50%) perspective(1200px) translateX(${sign * 130}%) rotateY(${sign * 90}deg)`,
      opacity: '0',
      zIndex: '0',
      pointerEvents: 'none',
    };
  }

  function updateCarousel() {
    cards.forEach((card, i) => {
      // Compute shortest signed offset from active to i
      let offset = ((i - active) % total + total) % total;
      if (offset > Math.floor(total / 2)) offset -= total;

      const s = styleForOffset(offset);
      card.style.transform = s.transform;
      card.style.opacity = s.opacity;
      card.style.zIndex = s.zIndex;
      card.style.pointerEvents = s.pointerEvents;

      card.classList.toggle('is-active', offset === 0);
      card.classList.toggle('is-adjacent', Math.abs(offset) === 1);
    });
  }

  function go(dir) {
    if (isLocked) return;
    isLocked = true;
    active = (active + dir + total) % total;
    updateCarousel();
    setTimeout(() => { isLocked = false; }, lockDur);
  }

  // Arrow buttons
  prevBtn && prevBtn.addEventListener('click', () => go(-1));
  nextBtn && nextBtn.addEventListener('click', () => go(1));

  // Click an adjacent card to navigate to it
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      let offset = ((i - active) % total + total) % total;
      if (offset > Math.floor(total / 2)) offset -= total;
      if (offset !== 0) go(Math.sign(offset));
    });
  });

  // Horizontal (trackpad) or vertical (mouse wheel) scroll navigation
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < deltaThreshold) return;
    go(delta > 0 ? 1 : -1);
  }, { passive: false });

  // Touch swipe
  let touchStartX = 0;
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) < 40) return;
    go(dx > 0 ? 1 : -1);
  }, { passive: true });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  // Initial render
  updateCarousel();
})();
