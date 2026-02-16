(() => {
  const slides = Array.from(document.querySelectorAll(".drawing-slide"));
  const panelTexts = Array.from(document.querySelectorAll(".drawing-panel__text"));
  const total = slides.length;
  if (total === 0) return;

  let activeIndex = 0;
  let isLocked = false;
  let transitionTimer = null;
  const lockDuration = 1100;
  const deltaThreshold = 12;

  const setActive = (nextIndex) => {
    if (nextIndex === activeIndex) return;
    const current = slides[activeIndex];
    const next = slides[nextIndex];
    const enterClass = "is-entering-from-bottom";

    if (transitionTimer) {
      window.clearTimeout(transitionTimer);
      transitionTimer = null;
    }

    current.classList.remove("is-active");
    current.classList.add("is-exiting");
    next.classList.add(enterClass);
    // Force layout so the browser commits the starting transform before transitioning.
    void next.offsetHeight;
    next.classList.add("is-active");
    next.classList.remove(enterClass);

    panelTexts.forEach((text) => {
      text.classList.toggle("is-active", Number(text.dataset.index) === nextIndex);
    });

    transitionTimer = window.setTimeout(() => {
      current.classList.remove("is-exiting");
      current.classList.remove("is-active");
      current.classList.add(enterClass);
      transitionTimer = null;
    }, lockDuration);

    activeIndex = nextIndex;
  };

  const lockAndMove = (direction) => {
    if (isLocked) return;
    isLocked = true;
    const nextIndex = (activeIndex + direction + total) % total;
    setActive(nextIndex);
    window.setTimeout(() => {
      isLocked = false;
    }, lockDuration);
  };

  const onWheel = (event) => {
    event.preventDefault();
    if (Math.abs(event.deltaY) < deltaThreshold) return;
    const direction = event.deltaY > 0 ? 1 : -1;
    lockAndMove(direction);
  };

  window.addEventListener("wheel", onWheel, { passive: false });

  let touchStartY = 0;
  let touchActive = false;

  const onTouchStart = (event) => {
    if (event.touches.length !== 1) return;
    touchActive = true;
    touchStartY = event.touches[0].clientY;
  };

  const onTouchMove = (event) => {
    if (!touchActive) return;
    event.preventDefault();
  };

  const onTouchEnd = (event) => {
    if (!touchActive) return;
    const touchEndY = event.changedTouches[0].clientY;
    const delta = touchStartY - touchEndY;
    touchActive = false;
    if (Math.abs(delta) < 40) return;
    const direction = delta > 0 ? 1 : -1;
    lockAndMove(direction);
  };

  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
})();
