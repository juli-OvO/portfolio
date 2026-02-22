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
const workTagSets = {
  "music-boids": [
    "Spatial-to-Sound Mapping |",
    "Generative Audio |",
    "Event-Driven Architecture |",
    "Interactive Media |",
    "Modular System Architecture |"
  ],
  "orbit-of-desire": [
    "Character Design |",
    "Visual Novel |",
    "Indie Game Development |",
    "Narrative Collaboration |",
    "Game Production |"
  ],
  "hell-or-sell": [
    "Game Systems Architecture |",
    "UI/UX Design |",
    "Visual Art Production |",
    "Inventory Optimization |",
    "Event-Driven Logic |"
  ]
};

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
    <div class="panel-content panel-content--bio">
      <p class="bio-copy">
        Julianne Jin is a visual artist and designer studying Art and
        Computation at the Rhode Island School of Design. Her practice
        spans generative systems, interactive media, web design, and
        game development, exploring how technology can function as
        both a conceptual and experiential medium. Through code,
        interface design, and real-time digital environments, she builds
        systems where algorithmic logic meets human imagination,
        creating immersive, participatory worlds shaped by interaction
        and narrative.
      </p>
      <div class="bio-links">
        <a class="bio-link bio-link--left" href="mailto:jjin04@risd.edu">Contact</a>
        <a class="bio-link bio-link--right" href="https://www.linkedin.com/in/chufan-jin-41b727311/" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </div>
  `,
  works: `
    <div class="panel-content panel-content--works">
      <div class="work-tags" data-work-tags>
        <p class="work-tags__line" data-final-text="Spatial-to-Sound Mapping |">Spatial-to-Sound Mapping |</p>
        <p class="work-tags__line" data-final-text="Generative Audio |">Generative Audio |</p>
        <p class="work-tags__line" data-final-text="Event-Driven Architecture |">Event-Driven Architecture |</p>
        <p class="work-tags__line" data-final-text="Interactive Media |">Interactive Media |</p>
        <p class="work-tags__line" data-final-text="Modular System Architecture |">Modular System Architecture |</p>
      </div>
      <div class="works-list">
        <div class="works-group">
          <div class="works-header">Computational work</div>
          <ul>
            <li><a class="topic-item" data-preview="images/boidgame/boid.png" data-work-tags="music-boids" href="music-boids.html">Music Boids</a></li>
            <li><a class="topic-item" data-preview="images/blender1/Scene5 copy.png" data-work-tags="coming-soon" data-disabled-link="true" href="#">Modeling</a></li>
          </ul>
        </div>
        <div class="works-group">
          <div class="works-header">Game Design</div>
          <ul>
            <li><a class="topic-item" data-preview="images/hellorsell.png" data-work-tags="hell-or-sell" data-disabled-link="true" href="#">Hell or Sell</a></li>
            <li><a class="topic-item" data-preview="images/gamedesign/TitleScreenFinalVersion.PNG" data-work-tags="orbit-of-desire" href="orbit-of-desire.html">Orbit of Desire</a></li>
          </ul>
        </div>
        <div class="works-group">
          <div class="works-header">Fine Art</div>
          <ul>
            <li><a class="topic-item" data-preview="images/drawing/ClassDrawing2 copy 2.jpeg" href="drawing.html">Drawing</a></li>
            <li><a class="topic-item" data-preview="images/illustration/1-preview.jpg" href="illustration.html">Illustration</a></li>
          </ul>
        </div>
        <div class="works-footer">More works in progress...</div>
      </div>
      <div class="works-preview-slot">
        <img alt="Preview" data-works-preview aria-hidden="true" />
        <p class="works-preview-note" aria-hidden="true" hidden>coming soon</p>
      </div>
    </div>
  `,
  cv: `
    <div class="panel-content panel-content--cv">
      <section class="cv-col">
        <div class="cv-block">
          <h3 class="cv-heading">Education</h3>
          <div class="cv-entry">
            <div class="cv-entry__head">
              <p class="cv-entry__title">Rhode Island School of Design, Providence, RI</p>
              <p class="cv-entry__year">2024-2028</p>
            </div>
            <p class="cv-entry__line">BFA - Art and Computation</p>
            <p class="cv-entry__line">Concentrating in Nature Culture Sustainability Studies</p>
          </div>
          <div class="cv-entry">
            <div class="cv-entry__head">
              <p class="cv-entry__title">Brown University, Providence, RI</p>
              <p class="cv-entry__year">2024-2028</p>
            </div>
            <p class="cv-entry__line">Classes taken</p>
            <p class="cv-entry__line">Mind and Perception</p>
          </div>
        </div>

        <div class="cv-block">
          <h3 class="cv-heading">Skills</h3>
          <div class="cv-entry">
            <p class="cv-entry__title">Technical</p>
            <p class="cv-entry__line">Programing, web development, game design, Auduino, character design, AI image/video generation, 3D Modeling, UI</p>
          </div>
          <div class="cv-entry">
            <p class="cv-entry__title">Software/Tools</p>
            <p class="cv-entry__line">HTML, CSS, p5.js, Processing, Figma, Blender, Photoshop, After Effects, Illustrator</p>
          </div>
          <div class="cv-entry">
            <p class="cv-entry__title">Fine Art</p>
            <p class="cv-entry__line">Bookbinding, Cyanotype, Painting, Sculpture, Jewelry making</p>
          </div>
          <div class="cv-entry">
            <p class="cv-entry__title">Language</p>
            <p class="cv-entry__line">English, Chinese, French</p>
          </div>
        </div>
      </section>

      <section class="cv-col">
        <div class="cv-block">
          <h3 class="cv-heading">Experience</h3>
          <div class="cv-entry">
            <div class="cv-entry__head">
              <p class="cv-entry__title">Rhode Island School of Design, Providence, RI<br>Teaching Assistant</p>
              <p class="cv-entry__year">2026</p>
            </div>
            <ul class="cv-bullets">
              <li>Assisted students with debugging HTML, CSS, and JavaScript</li>
              <li>Gave feedback on interactive UIUX design</li>
              <li>Reinforced lecture concepts through one-on-one and group support</li>
            </ul>
          </div>
          <div class="cv-entry">
            <div class="cv-entry__head">
              <p class="cv-entry__title">NYC, NY/Providence, RI<br>Freelance Artist</p>
              <p class="cv-entry__year">2024-2026</p>
            </div>
            <ul class="cv-bullets">
              <li>Produce commissioned illustrations and digital assets for private clients</li>
              <li>Translate client briefs into finished visual work</li>
              <li>Manage client communication and iterative feedback cycles</li>
            </ul>
          </div>
        </div>

        <div class="cv-block">
          <h3 class="cv-heading">Awards & Exhibition</h3>
          <div class="cv-entry">
            <div class="cv-entry__head">
              <p class="cv-entry__title">Group show art RISD - Reframing Representation</p>
              <p class="cv-entry__year">2025</p>
            </div>
          </div>
          <div class="cv-entry">
            <div class="cv-entry__head">
              <p class="cv-entry__title">Art and Computation Major Exhibition</p>
              <p class="cv-entry__year">2025</p>
            </div>
          </div>
          <div class="cv-entry">
            <div class="cv-entry__head">
              <p class="cv-entry__title">Mark Potter Studio Art Award</p>
              <p class="cv-entry__year">2024</p>
            </div>
          </div>
        </div>
      </section>
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
    initLetterSwap(panelBody);
  }
}

function initWorksPreview() {
  const previewImg = panelBody.querySelector("[data-works-preview]");
  const previewNote = panelBody.querySelector(".works-preview-note");
  const topics = Array.from(panelBody.querySelectorAll(".topic-item"));
  if (!previewImg || topics.length === 0) return () => {};

  function setPreviewImage(src) {
    if (!panelBody || !previewImg) return;
    if (src) {
      previewImg.src = src;
      panelBody.dataset.previewActive = "true";
      previewImg.setAttribute("aria-hidden", "false");
    } else {
      previewImg.removeAttribute("src");
      delete panelBody.dataset.previewActive;
      previewImg.setAttribute("aria-hidden", "true");
    }
  }

  function setPreviewNote(note) {
    const showComingSoon = note === "coming-soon";
    if (!panelBody) return;
    if (note) {
      panelBody.dataset.previewNote = note;
    } else {
      delete panelBody.dataset.previewNote;
    }
    if (previewNote) previewNote.hidden = !showComingSoon;
  }

  const handlers = new Map();
  topics.forEach((topic) => {
    const enter = () => {
      const src = topic.dataset.preview;
      setPreviewImage(src || "");
      const tagKey = topic.dataset.workTags;
      if (tagKey && workTagSets[tagKey]) {
        setWorkTags(tagKey);
        revealWorkTags();
      } else {
        hideWorkTags();
      }
      setPreviewNote(tagKey === "hell-or-sell" || tagKey === "coming-soon" ? "coming-soon" : "");
    };
    const leave = () => {
      const tagKey = topic.dataset.workTags;
      if (tagKey && workTagSets[tagKey]) {
        hideWorkTags();
      }
      setPreviewImage("");
      setPreviewNote("");
    };
    const click = (event) => {
      if (topic.dataset.disabledLink === "true") {
        event.preventDefault();
      }
    };
    topic.addEventListener("mouseenter", enter);
    topic.addEventListener("focus", enter);
    topic.addEventListener("mouseleave", leave);
    topic.addEventListener("blur", leave);
    topic.addEventListener("click", click);
    handlers.set(topic, { enter, leave, click });
  });

  return () => {
    handlers.forEach((fn, topic) => {
      const { enter, leave, click } = fn;
      topic.removeEventListener("mouseenter", enter);
      topic.removeEventListener("focus", enter);
      topic.removeEventListener("mouseleave", leave);
      topic.removeEventListener("blur", leave);
      topic.removeEventListener("click", click);
    });
    hideWorkTags();
    setPreviewImage("");
    setPreviewNote("");
  };
}

function initLetterSwap(container) {
  const items = Array.from(container.querySelectorAll(".topic-item"));
  items.forEach((item) => {
    if (item.dataset.letterSwap === "true") return;
    const label = item.textContent || "";
    item.textContent = "";
    item.dataset.letterSwap = "true";

    const sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = label;
    item.appendChild(sr);

    const wrapper = document.createElement("span");
    wrapper.className = "letter-swap";

    Array.from(label).forEach((char, index) => {
      const slot = document.createElement("span");
      slot.className = "letter-slot";
      slot.style.setProperty("--i", String(index));

      const primary = document.createElement("span");
      primary.className = "letter";
      primary.textContent = char === " " ? "\u00A0" : char;

      const secondary = document.createElement("span");
      secondary.className = "letter-secondary";
      secondary.textContent = char === " " ? "\u00A0" : char;

      slot.appendChild(primary);
      slot.appendChild(secondary);
      wrapper.appendChild(slot);
    });

    item.appendChild(wrapper);
  });
}

function setWorkTags(tagKey) {
  if (!panelBody) return;
  const tagBlock = panelBody.querySelector("[data-work-tags]");
  if (!tagBlock) return;
  const lines = Array.from(tagBlock.querySelectorAll(".work-tags__line"));
  const tags = workTagSets[tagKey];
  if (!tags || !tags.length) return;

  lines.forEach((line, index) => {
    const text = tags[index] || "";
    line.dataset.finalText = text;
    line.textContent = text;
  });
}

function revealWorkTags() {
  if (!panelBody) return;
  const tagBlock = panelBody.querySelector("[data-work-tags]");
  if (!tagBlock) return;

  const lines = Array.from(tagBlock.querySelectorAll(".work-tags__line"));
  lines.forEach((line) => {
    const finalText = line.dataset.finalText || line.textContent || "";
    line.textContent = finalText;
  });

  const reducedMotion = prefersReducedMotion();
  if (reducedMotion) {
    tagBlock.classList.add("is-entering");
    return;
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+/";
  const baseDuration = 300;
  const staggerMs = 80;

  tagBlock.classList.remove("is-entering");
  window.requestAnimationFrame(() => {
    tagBlock.classList.add("is-entering");
  });

  lines.forEach((line, index) => {
    const finalText = line.dataset.finalText || line.textContent || "";
    const startDelay = (lines.length - 1 - index) * staggerMs;
    const startTime = performance.now() + startDelay;

    const tick = (now) => {
      if (now < startTime) {
        window.requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / baseDuration, 1);
      const revealCount = Math.floor(progress * finalText.length);

      let scrambled = "";
      for (let i = 0; i < finalText.length; i += 1) {
        const ch = finalText[i];
        const resolvedFromRight = i >= finalText.length - revealCount;
        if (resolvedFromRight || ch === " ") {
          scrambled += ch;
        } else {
          const randomIndex = Math.floor(Math.random() * chars.length);
          scrambled += chars[randomIndex];
        }
      }
      line.textContent = progress === 1 ? finalText : scrambled;
      if (progress < 1) window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  });
}

function hideWorkTags() {
  if (!panelBody) return;
  const tagBlock = panelBody.querySelector("[data-work-tags]");
  if (!tagBlock) return;
  tagBlock.classList.remove("is-entering");
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

  const baseDuration = 550;

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
      const delay = rand(0, 130);
      const duration = baseDuration + rand(-80, 70);
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

    if (elapsed < baseDuration + maxDelay + 80) {
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
    setTimeout(cleanupIntroLayers, 325);
    return;
  }
  runBubbleWipe();
}

window.addEventListener("load", () => {
  setTimeout(startIntroSequence, 1000);
});
