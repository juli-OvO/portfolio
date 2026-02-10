// cursor.js

(() => {
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  if (isTouchDevice) {
    document.body.classList.add("cursor-disabled");
    return;
  }

  const cursor = document.getElementById("cursor");
  const cursorTrail = document.getElementById("cursorTrail");

  if (cursor) {
    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.5;
    let currentX = mouseX;
    let currentY = mouseY;
    let currentScale = 1;
    let targetScale = 1;
    let magnetTarget = null;
    let hasMoved = false;

    function setCursorPosition(x, y) {
      cursor.style.setProperty("--cursor-x", `${x}px`);
      cursor.style.setProperty("--cursor-y", `${y}px`);
    }

    function setCursorScale(scale) {
      cursor.style.setProperty("--cursor-scale", scale.toFixed(3));
    }

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMoved = true;
    });

    const hoverTargets = Array.from(
      document.querySelectorAll("a, button, [role='button'], input, textarea, select, .interactive")
    );

    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("is-hover");
        targetScale = 1;
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-hover");
        targetScale = 1;
      });
    });

    const linkTargets = Array.from(document.querySelectorAll("a"));
    linkTargets.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        magnetTarget = link;
      });
      link.addEventListener("mouseleave", () => {
        magnetTarget = null;
      });
    });

    function animate() {
      if (hasMoved) {
        let desiredX = mouseX;
        let desiredY = mouseY;

        if (magnetTarget && !prefersReducedMotion) {
          const rect = magnetTarget.getBoundingClientRect();
          const cx = rect.left + rect.width * 0.5;
          const cy = rect.top + rect.height * 0.5;
          const strength = 0.3;
          desiredX = mouseX + (cx - mouseX) * strength;
          desiredY = mouseY + (cy - mouseY) * strength;
        }

        if (prefersReducedMotion) {
          currentX = desiredX;
          currentY = desiredY;
          currentScale = targetScale;
        } else {
          currentX += (desiredX - currentX) * 0.38;
          currentY += (desiredY - currentY) * 0.38;
          currentScale += (targetScale - currentScale) * 0.2;
        }

        setCursorPosition(currentX, currentY);
        setCursorScale(currentScale);
      }

      requestAnimationFrame(animate);
    }

    setCursorPosition(currentX, currentY);
    setCursorScale(currentScale);
    requestAnimationFrame(animate);
  }

  if (cursorTrail) {
    cursorTrail.style.display = "none";
  }
})();
