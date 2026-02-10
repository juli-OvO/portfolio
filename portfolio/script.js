// script.js
const stage = document.getElementById("stage");
const bookstack = document.getElementById("bookstack");
const books = Array.from(document.querySelectorAll(".book"));
const panel = document.getElementById("panel");
const panelBody = panel ? panel.querySelector(".panel-body") : null;
const modeToggle = document.getElementById("modeToggle");
const siteHeaderTitle = document.querySelector(".site-header h1");
const defaultHeaderText = siteHeaderTitle ? siteHeaderTitle.textContent : "";

let openSection = null;
let previewExitTimer = null;
let worksCleanup = null;

// cache original labels for quick restore
books.forEach((btn) => {
  const textEl = btn.querySelector(".spine-text");
  if (textEl) btn.dataset.label = textEl.textContent.trim();
});

function setSpineText(btn, text) {
  const textEl = btn.querySelector(".spine-text");
  if (textEl) textEl.textContent = text;
}

function resetSpineText(btn) {
  setSpineText(btn, btn.dataset.label || "");
}

const panelTemplates = {
  bio: `
    <div class="panel-content panel-content--center">
      <p>
        Julianne Jin is a visual artist and designer studying Art and Computation at the Rhode Island School of
        Design. Her practice bridges generative systems, and emotional storytelling, exploring how technology can
        become a poetic and philosophical medium. Through code, installation, and digital imagery, she builds
        worlds where algorithmic logic meets human imagination.
      </p>
      <div class="panel-section">
        <h3>Contact</h3>
        <ul class="panel-list">
          <li>name@email.com</li>
          <li>LinkedIn</li>
        </ul>
      </div>
    </div>
  `,
  works: `
    <div class="panel-content panel-content--works">
      <div class="works-list">
        <div class="works-group">
          <div class="works-header">art and computation</div>
          <ul>
            <li><a class="topic-item" data-preview="images/16fd1705-9e10-436b-9255-53d879187edd.jpg" href="music-boids.html">music boids</a></li>
            <li><a class="topic-item" data-preview="images/88774859-3f23-4a6e-9b62-1c0dda6000ea.jpg" href="archive.html">archive</a></li>
            <li><a class="topic-item" data-preview="images/bf61c19b-a292-4155-a760-69d30730e2af.jpg" href="tree-growth.html">tree growth</a></li>
            <li><a class="topic-item" data-preview="images/e1ff05b8-7209-490e-9bca-9150f1c94561.jpg" href="blender.html">blender</a></li>
          </ul>
        </div>
        <div class="works-group">
          <div class="works-header">fine art</div>
          <ul>
            <li><a class="topic-item" data-preview="images/16fd1705-9e10-436b-9255-53d879187edd.jpg" href="drawing.html">drawing</a></li>
            <li><a class="topic-item" data-preview="images/88774859-3f23-4a6e-9b62-1c0dda6000ea.jpg" href="illustration.html">illustration</a></li>
            <li><a class="topic-item" data-preview="images/bf61c19b-a292-4155-a760-69d30730e2af.jpg" href="photography.html">photography</a></li>
          </ul>
        </div>
      </div>
      <div class="works-preview-slot">
        <img src="images/16fd1705-9e10-436b-9255-53d879187edd.jpg" alt="Preview" data-works-preview />
      </div>
    </div>
  `,
  cv: `
    <div class="panel-content">
      <div class="panel-section">
        <h3>Education</h3>
        <ul class="panel-list">
          <li>School / Program</li>
          <li>Workshops</li>
        </ul>
      </div>
      <div class="panel-section">
        <h3>Experience</h3>
        <ul class="panel-list">
          <li>Project A</li>
          <li>Project B</li>
        </ul>
      </div>
    </div>
  `,
};

function updatePanel(section) {
  if (!panelBody) return;
  if (worksCleanup) {
    worksCleanup();
    worksCleanup = null;
  }
  panelBody.innerHTML = panelTemplates[section] || "";
  if (panel) panel.dataset.section = section || "";
  if (section === "works") {
    worksCleanup = initWorksPreview();
  }
}

function initWorksPreview() {
  const previewImg = panelBody.querySelector("[data-works-preview]");
  const topics = Array.from(panelBody.querySelectorAll(".topic-item"));
  if (!previewImg || topics.length === 0) return () => {};

  const handlers = new Map();
  topics.forEach((topic) => {
    const enter = () => {
      const src = topic.dataset.preview;
      if (src) previewImg.src = src;
    };
    topic.addEventListener("mouseenter", enter);
    topic.addEventListener("focus", enter);
    handlers.set(topic, enter);
  });

  return () => {
    handlers.forEach((enter, topic) => {
      topic.removeEventListener("mouseenter", enter);
      topic.removeEventListener("focus", enter);
    });
  };
}

// Step 2 (hover preview): show panel + change tab text
books.forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    if (openSection) return; // if already opened, ignore hover preview
    if (previewExitTimer) {
      clearTimeout(previewExitTimer);
      previewExitTimer = null;
    }
    stage.classList.remove("is-exiting");
    stage.classList.add("is-preview");
    updatePanel(btn.dataset.section);
    setSpineText(btn, "OPEN");
    if (siteHeaderTitle) siteHeaderTitle.textContent = labelFor(btn.dataset.section);
  });

  btn.addEventListener("mouseleave", () => {
    if (openSection) return;
    stage.classList.remove("is-preview");
    stage.classList.add("is-exiting");
    previewExitTimer = window.setTimeout(() => {
      stage.classList.remove("is-exiting");
      previewExitTimer = null;
    }, 220);
    resetSpineText(btn);
    if (siteHeaderTitle) siteHeaderTitle.textContent = defaultHeaderText;
  });

  // Step 3 (click open)
  btn.addEventListener("click", () => {
    const section = btn.dataset.section;

    // clicking the active one closes
    if (openSection === section) {
      closeAll();
      return;
    }

    openSection = section;

    stage.classList.remove("is-preview");
    stage.classList.add("is-open");
    bookstack.classList.add("is-open");

    books.forEach((b) => {
      const isActive = b.dataset.section === section;
      b.classList.toggle("active", isActive);
      b.setAttribute("aria-expanded", String(isActive));
      if (isActive) {
        setSpineText(b, "CLOSE");
        if (siteHeaderTitle) siteHeaderTitle.textContent = labelFor(section);
      } else {
        resetSpineText(b);
      }
    });

    updatePanel(section);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAll();
});

function closeAll() {
  openSection = null;
  stage.classList.remove("is-open");
  stage.classList.remove("is-preview");
  stage.classList.add("is-exiting");
  window.setTimeout(() => {
    stage.classList.remove("is-exiting");
  }, 220);
  bookstack.classList.remove("is-open");
  books.forEach((b) => {
    b.classList.remove("active");
    b.setAttribute("aria-expanded", "false");
    resetSpineText(b);
  });
  updatePanel("");
  if (siteHeaderTitle) siteHeaderTitle.textContent = defaultHeaderText;
}

function labelFor(section) {
  switch (section) {
    case "bio": return "Bio";
    case "works": return "Works";
    case "cv": return "CV";
    default: return "Text";
  }
}


if (modeToggle) {
  modeToggle.dataset.label = "MODE: day time";
  modeToggle.addEventListener("click", () => {
    const isNight = document.body.classList.toggle("night");
    modeToggle.setAttribute("aria-label", isNight ? "Night mode" : "Day mode");
    modeToggle.dataset.label = isNight ? "MODE: night time" : "MODE: day time";
    modeToggle.setAttribute("aria-pressed", String(isNight));
  });
}

const intro = document.getElementById("intro");
const main = document.getElementById("main");
const bubbleWipe = document.getElementById("bubbleWipe");

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cleanupIntroLayers() {
  if (intro) intro.style.display = "none";
  if (bubbleWipe) bubbleWipe.style.display = "none";
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function runBubbleWipe() {
  if (!intro || !main || !bubbleWipe) {
    if (main) main.classList.add("is-visible");
    if (intro) intro.classList.add("is-fading");
    return;
  }

  const ctx = bubbleWipe.getContext("2d");
  if (!ctx) {
    main.classList.add("is-visible");
    intro.classList.add("is-fading");
    return;
  }

  let width = 0;
  let height = 0;
  let bubbles = [];
  let maxDelay = 0;

  const baseDuration = 1100;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    width = bubbleWipe.clientWidth;
    height = bubbleWipe.clientHeight;
    bubbleWipe.width = Math.round(width * dpr);
    bubbleWipe.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    generateBubbles();
  }

  function generateBubbles() {
    bubbles = [];
    maxDelay = 0;
    let x = -220;
    let safety = 0;
    while (x < width + 220 && safety < 24) {
      const radius = rand(120, 460);
      const startY = height + radius + rand(40, 160);
      const endY = -radius - rand(60, 220);
      const delay = rand(0, 260);
      const duration = baseDuration + rand(-160, 140);
      const drift = rand(-60, 60);
      const hue = rand(28, 50);
      const light = rand(52, 64);
      bubbles.push({
        x,
        r: radius,
        startY,
        endY,
        delay,
        duration,
        drift,
        color: `hsl(${hue} 92% ${light}%)`,
      });
      maxDelay = Math.max(maxDelay, delay);
      x += radius * rand(0.65, 0.9);
      safety += 1;
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  bubbleWipe.classList.add("is-active");

  const start = performance.now();
  let introFaded = false;
  let mainShown = false;

  function draw(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, width, height);
    bubbles.forEach((b) => {
      const local = elapsed - b.delay;
      if (local <= 0) return;
      const t = Math.min(local / b.duration, 1);
      const eased = easeInOutCubic(t);
      const y = b.startY + (b.endY - b.startY) * eased;
      const xPos = b.x + b.drift * eased;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(xPos, y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!introFaded && elapsed > baseDuration * 0.3) {
      intro.classList.add("is-fading");
      introFaded = true;
    }
    if (!mainShown && elapsed > baseDuration * 0.45) {
      main.classList.add("is-visible");
      mainShown = true;
    }

    if (elapsed < baseDuration + maxDelay + 160) {
      requestAnimationFrame(draw);
    } else {
      window.removeEventListener("resize", resizeCanvas);
      cleanupIntroLayers();
    }
  }

  requestAnimationFrame(draw);
}

function startIntroSequence() {
  if (!intro || !main) return;
  if (prefersReducedMotion()) {
    intro.classList.add("is-fading");
    main.classList.add("is-visible");
    setTimeout(cleanupIntroLayers, 650);
    return;
  }
  runBubbleWipe();
}

window.addEventListener("load", () => {
  setTimeout(startIntroSequence, 2000);
});
