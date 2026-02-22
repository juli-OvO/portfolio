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
    const slideFiveBg = document.querySelector("[data-slide-five-bg]");
    const layers = [
      { el: heroBg, xVar: "--hero-bg-x", yVar: "--hero-bg-y", factor: 1 },
      { el: slideTwoBg, xVar: "--slide2-bg-x", yVar: "--slide2-bg-y", factor: 0.97 },
      { el: slideThreeBg, xVar: "--slide3-bg-x", yVar: "--slide3-bg-y", factor: 0.95 },
      { el: slideFiveBg, xVar: "--slide5-bg-x", yVar: "--slide5-bg-y", factor: 0.93 }
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

  function initDraftSlide() {
    const draftCanvas = document.querySelector("[data-draft-canvas]");
    const draftCopy = document.querySelector(".slide-four-copy");
    if (!draftCanvas) return;

    const draftImages = [
      "draft1.jpg",
      "draft2.jpg",
      "draft3.jpg",
      "draft4.jpg",
      "draftboard.png",
      "f6c861d0-693c-44d9-8320-42c79cefc27c.png",
      "lineart.png",
      "lineart2.png",
      "lineart3.png"
    ];

    let hoverTopZ = 40;
    let resizeTimer = null;

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function shuffle(list) {
      const copy = list.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
      }
      return copy;
    }

    function intersects(a, b) {
      return !(
        a.right <= b.left ||
        a.left >= b.right ||
        a.bottom <= b.top ||
        a.top >= b.bottom
      );
    }

    function centerDistance(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function layoutDraftCards() {
      const cards = Array.from(draftCanvas.querySelectorAll(".draft-card"));
      if (!cards.length) return;

      const canvasRect = draftCanvas.getBoundingClientRect();
      const canvasWidth = canvasRect.width;
      const canvasHeight = canvasRect.height;
      if (!canvasWidth || !canvasHeight) return;

      const floatPad = 24;
      const hoverPad = 30;
      const edgePad = floatPad + hoverPad + 8;
      const textGap = 52;

      let textRect = null;
      if (draftCopy) {
        const copyRect = draftCopy.getBoundingClientRect();
        textRect = {
          left: copyRect.left - canvasRect.left - textGap,
          top: copyRect.top - canvasRect.top - textGap,
          right: copyRect.right - canvasRect.left + textGap,
          bottom: copyRect.bottom - canvasRect.top + textGap
        };
      }

      const total = cards.length;
      const dominantSide = Math.random() < 0.5 ? "left" : "right";
      const dominantCount = Math.min(total - 1, Math.max(4, Math.ceil(total * 0.55)));
      const sideAssignments = shuffle(
        Array.from({ length: total }, (_, i) => {
          if (i < dominantCount) return dominantSide;
          return dominantSide === "left" ? "right" : "left";
        })
      );
      const placedCenters = [];
      const minCenterGap = 40;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardWidth = rect.width;
        const cardHeight = rect.height;
        if (!cardWidth || !cardHeight) return;

        const side = sideAssignments[index];
        const xMinBase = edgePad;
        const xMaxBase = canvasWidth - cardWidth - edgePad;
        const yMin = edgePad;
        const yMax = canvasHeight - cardHeight - edgePad;

        let xMin = xMinBase;
        let xMax = xMaxBase;
        if (textRect) {
          if (side === "left") {
            xMax = Math.min(xMaxBase, textRect.left - cardWidth - edgePad);
          } else {
            xMin = Math.max(xMinBase, textRect.right + edgePad);
          }
        } else if (side === "left") {
          xMax = Math.min(xMaxBase, canvasWidth * 0.33 - cardWidth);
        } else {
          xMin = Math.max(xMinBase, canvasWidth * 0.67);
        }

        if (xMax < xMin) {
          xMin = xMinBase;
          xMax = xMaxBase;
        }

        let x = xMin;
        let y = yMin;
        let placed = false;

        function isValidSpot(trialRect) {
          if (textRect && intersects(trialRect, textRect)) {
            return false;
          }
          const trialCenter = {
            x: trialRect.left + cardWidth / 2,
            y: trialRect.top + cardHeight / 2
          };
          for (let i = 0; i < placedCenters.length; i += 1) {
            if (centerDistance(trialCenter, placedCenters[i]) < minCenterGap) {
              return false;
            }
          }
          return true;
        }

        for (let attempt = 0; attempt < 220; attempt += 1) {
          const trialX = rand(xMin, xMax);
          const trialY = rand(yMin, Math.max(yMin, yMax));
          const trialRect = {
            left: trialX,
            top: trialY,
            right: trialX + cardWidth,
            bottom: trialY + cardHeight
          };

          if (isValidSpot(trialRect)) {
            x = trialX;
            y = trialY;
            placed = true;
            break;
          }
        }

        if (!placed && textRect) {
          const aboveY = textRect.top - cardHeight - edgePad;
          const belowY = textRect.bottom + edgePad;
          const fallbackRects = [];
          if (aboveY >= yMin) {
            fallbackRects.push({
              left: xMin,
              top: aboveY,
              right: xMin + cardWidth,
              bottom: aboveY + cardHeight
            });
          }
          if (belowY <= yMax) {
            fallbackRects.push({
              left: xMin,
              top: belowY,
              right: xMin + cardWidth,
              bottom: belowY + cardHeight
            });
          }
          for (let i = 0; i < fallbackRects.length; i += 1) {
            if (isValidSpot(fallbackRects[i])) {
              x = fallbackRects[i].left;
              y = fallbackRects[i].top;
              placed = true;
              break;
            }
          }
        }

        if (!placed) {
          for (let gx = xMin; gx <= xMax; gx += 18) {
            let foundGridSpot = false;
            for (let gy = yMin; gy <= yMax; gy += 18) {
              const trialRect = {
                left: gx,
                top: gy,
                right: gx + cardWidth,
                bottom: gy + cardHeight
              };
              if (isValidSpot(trialRect)) {
                x = gx;
                y = gy;
                placed = true;
                foundGridSpot = true;
                break;
              }
            }
            if (foundGridSpot) break;
          }
        }

        card.style.left = x.toFixed(1) + "px";
        card.style.top = y.toFixed(1) + "px";
        placedCenters.push({
          x: x + cardWidth / 2,
          y: y + cardHeight / 2
        });
      });
    }

    const imageReady = [];
    draftImages.forEach((name, index) => {
      const card = document.createElement("figure");
      card.className = "draft-card";
      card.style.margin = "0";
      const baseZ = 2 + Math.floor(Math.random() * 8);
      card.style.left = "0px";
      card.style.top = "0px";
      card.style.zIndex = String(baseZ);
      card.style.visibility = "hidden";

      const inner = document.createElement("div");
      inner.className = "draft-card__inner";
      inner.style.setProperty("--float-x", rand(-16, 16).toFixed(2) + "px");
      inner.style.setProperty("--float-y", rand(-20, 20).toFixed(2) + "px");
      inner.style.setProperty("--float-dur", rand(5.8, 10.2).toFixed(2) + "s");
      inner.style.setProperty("--float-delay", rand(-3.5, 0).toFixed(2) + "s");
      inner.style.setProperty("--rot-start", rand(-3.8, 3.8).toFixed(2) + "deg");
      inner.style.setProperty("--rot-end", rand(-3.8, 3.8).toFixed(2) + "deg");

      const image = document.createElement("img");
      image.src = "images/gamedesign/draft/" + name;
      image.alt = "Draft artwork " + (index + 1);
      image.loading = "eager";
      image.decoding = "async";
      image.style.setProperty("--img-h", rand(220, 400).toFixed(0) + "px");

      card.addEventListener("mouseenter", () => {
        hoverTopZ += 1;
        card.style.zIndex = String(hoverTopZ);
      });

      inner.appendChild(image);
      card.appendChild(inner);
      draftCanvas.appendChild(card);

      imageReady.push(
        new Promise((resolve) => {
          const revealAndResolve = () => resolve();
          if (image.complete) {
            revealAndResolve();
            return;
          }
          image.addEventListener("load", revealAndResolve, { once: true });
          image.addEventListener("error", revealAndResolve, { once: true });
        })
      );
    });

    Promise.all(imageReady).then(() => {
      layoutDraftCards();
      draftCanvas.querySelectorAll(".draft-card").forEach((card) => {
        card.style.visibility = "visible";
      });
    });

    window.addEventListener("resize", () => {
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(() => {
        layoutDraftCards();
        resizeTimer = null;
      }, 120);
    });
  }

  initDraftSlide();
  initHeroParallax();
})();
