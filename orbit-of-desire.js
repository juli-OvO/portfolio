(() => {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const wipe = document.querySelector(".wipe-overlay");
  if (!slides.length || !wipe) return;

  let activeIndex = slides.findIndex((s) => s.classList.contains("is-active"));
  if (activeIndex < 0) activeIndex = 0;

  let locked = false;
  let hideTimer = null;
  let unlockTimer = null;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const transitionMs = 1000;
  const hideAtMs = 520;

  function normalizeIndex(index) {
    const total = slides.length;
    return (index + total) % total;
  }

  function setActiveInstant(nextIndex) {
    slides.forEach((slide, idx) => {
      slide.classList.remove("is-revealing");
      slide.classList.toggle("is-active", idx === nextIndex);
      slide.style.zIndex = idx === nextIndex ? "1" : "0";
    });
    activeIndex = nextIndex;
  }

  function transitionTo(direction) {
    if (locked || direction === 0) return;
    const nextIndex = normalizeIndex(activeIndex + direction);
    if (nextIndex === activeIndex) return;

    if (prefersReduced) {
      setActiveInstant(nextIndex);
      return;
    }

    locked = true;

    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    if (unlockTimer) {
      clearTimeout(unlockTimer);
      unlockTimer = null;
    }

    const currentSlide = slides[activeIndex];
    const nextSlide = slides[nextIndex];

    wipe.classList.remove("is-wiping");
    void wipe.offsetWidth;
    wipe.classList.add("is-wiping");

    nextSlide.classList.remove("is-active");
    nextSlide.classList.add("is-revealing");
    nextSlide.style.zIndex = "2";

    hideTimer = window.setTimeout(() => {
      currentSlide.classList.remove("is-active");
      currentSlide.style.zIndex = "0";
      hideTimer = null;
    }, hideAtMs);

    unlockTimer = window.setTimeout(() => {
      nextSlide.classList.remove("is-revealing");
      nextSlide.classList.add("is-active");
      nextSlide.style.zIndex = "1";

      wipe.classList.remove("is-wiping");
      activeIndex = nextIndex;
      locked = false;
      unlockTimer = null;
    }, transitionMs + 20);
  }

  function onWheel(event) {
    event.preventDefault();
    if (Math.abs(event.deltaY) < 6) return;
    transitionTo(event.deltaY > 0 ? 1 : -1);
  }

  function onKeyDown(event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      transitionTo(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      transitionTo(-1);
    }
  }

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKeyDown);

  function initHeroParallax() {
    const heroBg = document.querySelector("[data-hero-bg]");
    const slideTwoBg = document.querySelector("[data-slide-two-bg]");
    const slideThreeBg = document.querySelector("[data-slide-three-bg]");
    const layers = [
      { el: heroBg, xVar: "--hero-bg-x", yVar: "--hero-bg-y", factor: 1 },
      { el: slideTwoBg, xVar: "--slide2-bg-x", yVar: "--slide2-bg-y", factor: 0.97 },
      { el: slideThreeBg, xVar: "--slide3-bg-x", yVar: "--slide3-bg-y", factor: 0.95 }
    ].filter((layer) => layer.el);
    if (!layers.length) return;
    if (prefersReduced) return;

    const isTouch =
      window.matchMedia("(hover: none), (pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const maxOffset = 24;
    const lerpFactor = 0.08;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;

    function update() {
      currentX += (targetX - currentX) * lerpFactor;
      currentY += (targetY - currentY) * lerpFactor;
      layers.forEach((layer) => {
        layer.el.style.setProperty(layer.xVar, (currentX * layer.factor).toFixed(2) + "px");
        layer.el.style.setProperty(layer.yVar, (currentY * layer.factor).toFixed(2) + "px");
      });
      rafId = window.requestAnimationFrame(update);
    }

    function onMove(event) {
      const nx = event.clientX / window.innerWidth - 0.5;
      const ny = event.clientY / window.innerHeight - 0.5;
      targetX = nx * maxOffset * 2;
      targetY = ny * maxOffset * 2;
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });
    rafId = window.requestAnimationFrame(update);

    window.addEventListener("beforeunload", () => {
      window.cancelAnimationFrame(rafId);
    });
  }

  initHeroParallax();
})();
