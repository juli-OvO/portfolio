// landing.js — interaction logic for the new folder-tab landing page

// ======== DATA ========
const workTagSets = {
  "music-boids": [
    "| Spatial-to-Sound Mapping",
    "| Generative Audio",
    "| Event-Driven Architecture",
    "| Interactive Media",
    "| Modular System Architecture"
  ],
  modeling: [
    "| blender",
    "| volumetrics",
    "| rhino",
    "| experimental"
  ],
  "orbit-of-desire": [
    "| Character Design",
    "| Visual Novel",
    "| Indie Game Development",
    "| Narrative Collaboration",
    "| Game Production"
  ],
  "hell-or-sell": [
    "| Game Systems Architecture",
    "| UI/UX Design",
    "| Visual Art Production",
    "| Inventory Optimization",
    "| Event-Driven Logic"
  ],
  drawing: [
    "| Observational Drawing",
    "| Figure & Portrait",
    "| Charcoal · Graphite",
    "| Fine Art",
    "| Studio Practice"
  ],
  illustration: [
    "| Digital Illustration",
    "| Character & Narrative",
    "| Commissioned Work",
    "| Photoshop · Illustrator",
    "| Fine Art"
  ],
  cv: [
    "| RISD — BFA Art & Computation",
    "| Brown University",
    "| Teaching Assistant",
    "| Freelance Artist",
    "| Programming · Web · Game Design"
  ],
  bio: [
    "| Visual Artist",
    "| Designer",
    "| Generative Systems",
    "| Interactive Media",
    "| Art and Computation"
  ]
};

// ======== DOM REFS ========
const landingRight = document.getElementById("landingRight");
const workTagBlock = document.querySelector("div[data-work-tags]");
const previewImg = document.querySelector("[data-works-preview]");
const previewLink = document.querySelector("[data-works-preview-link]");
const previewNote = document.querySelector(".works-preview-note");
const modeToggle = document.getElementById("modeToggle");
const intro = document.getElementById("intro");
const main = document.getElementById("main");
const bubbleWipe = document.getElementById("bubbleWipe");

// ======== UTILS ========
function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ======== LETTER SWAP ========
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

// ======== WORK TAGS ========
function setWorkTags(tagKey) {
  if (!workTagBlock) return;
  const lines = Array.from(workTagBlock.querySelectorAll(".work-tags__line"));
  const tags = workTagSets[tagKey];
  if (!tags || !tags.length) return;
  lines.forEach((line, index) => {
    const text = tags[index] || "";
    line.dataset.finalText = text;
    line.textContent = text;
  });
}

function revealWorkTags() {
  if (!workTagBlock) return;
  const lines = Array.from(workTagBlock.querySelectorAll(".work-tags__line"));
  lines.forEach((line) => {
    const finalText = line.dataset.finalText || line.textContent || "";
    line.textContent = finalText;
  });

  if (prefersReducedMotion()) {
    workTagBlock.classList.add("is-entering");
    return;
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+/";
  const baseDuration = 150;
  const staggerMs = 45;

  workTagBlock.classList.remove("is-entering");
  window.requestAnimationFrame(() => {
    workTagBlock.classList.add("is-entering");
  });

  lines.forEach((line, index) => {
    const finalText = line.dataset.finalText || line.textContent || "";
    const startDelay = (lines.length - 1 - index) * staggerMs;
    const startTime = performance.now() + startDelay;

    const tick = (now) => {
      if (now < startTime) { window.requestAnimationFrame(tick); return; }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / baseDuration, 1);
      const revealCount = Math.floor(progress * finalText.length);

      let scrambled = "";
      for (let i = 0; i < finalText.length; i++) {
        const ch = finalText[i];
        const resolvedFromRight = i >= finalText.length - revealCount;
        if (resolvedFromRight || ch === " ") {
          scrambled += ch;
        } else if (Math.random() < 0.4) {
          scrambled += chars[Math.floor(Math.random() * chars.length)];
        } else {
          scrambled += ch;
        }
      }
      line.textContent = progress === 1 ? finalText : scrambled;
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  });
}

function hideWorkTags() {
  if (!workTagBlock) return;
  workTagBlock.classList.remove("is-entering");
}

// ======== PREVIEW IMAGE ========
function setPreviewImage(src, href, isDisabled) {
  if (!previewImg || !landingRight) return;
  if (src) {
    previewImg.src = src;
    landingRight.dataset.previewActive = "true";
    previewImg.setAttribute("aria-hidden", "false");
    if (previewLink) {
      if (isDisabled || !href) {
        previewLink.removeAttribute("href");
        previewLink.classList.add("is-disabled");
      } else {
        previewLink.href = href;
        previewLink.target = "_blank";
        previewLink.classList.remove("is-disabled");
      }
    }
  } else {
    previewImg.removeAttribute("src");
    delete landingRight.dataset.previewActive;
    previewImg.setAttribute("aria-hidden", "true");
    if (previewLink) {
      previewLink.removeAttribute("href");
      previewLink.classList.add("is-disabled");
    }
  }
}

function setPreviewNote(note) {
  if (!landingRight) return;
  const showComingSoon = note === "coming-soon";
  if (note) {
    landingRight.dataset.previewNote = note;
  } else {
    delete landingRight.dataset.previewNote;
  }
  if (previewNote) previewNote.hidden = !showComingSoon;
}

// ======== TOPIC HOVER LISTENERS ========
function initTopicListeners() {
  const topics = Array.from(document.querySelectorAll(".topic-item"));
  topics.forEach((topic) => {
    const enter = () => {
      if (!worksFolder || !worksFolder.matches(":hover")) return;
      const src = topic.dataset.preview;
      const isDisabled = topic.dataset.disabledLink === "true";
      setPreviewImage(src || "", topic.href, isDisabled);
      const tagKey = topic.dataset.workTags;
      if (tagKey && workTagSets[tagKey]) {
        setWorkTags(tagKey);
        revealWorkTags();
      } else {
        hideWorkTags();
      }
      setPreviewNote(isDisabled ? "coming-soon" : "");
    };
    const leave = () => {
      // Preview stays visible until another item is hovered or works folder is left
    };
    const click = (e) => {
      if (topic.dataset.disabledLink === "true") e.preventDefault();
    };
    topic.addEventListener("mouseenter", enter);
    topic.addEventListener("focus", enter);
    topic.addEventListener("mouseleave", leave);
    topic.addEventListener("blur", leave);
    topic.addEventListener("click", click);
  });
}

// ======== MODE TOGGLE ========
if (modeToggle) {
  modeToggle.dataset.label = "MODE: day time";
  modeToggle.addEventListener("click", () => {
    const isNight = document.body.classList.toggle("night");
    modeToggle.setAttribute("aria-label", isNight ? "Night mode" : "Day mode");
    modeToggle.dataset.label = isNight ? "MODE: night time" : "MODE: day time";
    modeToggle.setAttribute("aria-pressed", String(isNight));
  });
}

// ======== INTRO / BUBBLE WIPE (ported from script.js) ========
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

  let width = 0, height = 0, bubbles = [], maxDelay = 0;
  const baseDuration = 550;

  function rand(min, max) { return Math.random() * (max - min) + min; }

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
      bubbles.push({ x, r: radius, startY, endY, delay, duration, drift, color: `hsl(${hue} 92% ${light}%)` });
      maxDelay = Math.max(maxDelay, delay);
      x += radius * rand(0.65, 0.9);
      safety++;
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  bubbleWipe.classList.add("is-active");

  const start = performance.now();
  let introFaded = false, mainShown = false;

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
    if (!introFaded && elapsed > baseDuration * 0.3) { intro.classList.add("is-fading"); introFaded = true; }
    if (!mainShown && elapsed > baseDuration * 0.45) { main.classList.add("is-visible"); mainShown = true; }
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

// ======== SLIDING PANELS (CV + BIO) ========
// Panels lock open on hover — only close when another folder is hovered.
const cvPanel = document.getElementById("cv-panel");
const bioPanel = document.getElementById("bio-panel");
const cvFolder = document.querySelector('.folder[data-section="cv"]');
const bioFolder = document.querySelector('.folder[data-section="bio"]');
const worksFolder = document.querySelector('.folder[data-section="works"]');

function openPanel(name) {
  // Close all panels first
  [cvPanel, bioPanel].forEach((p) => {
    if (p) { p.classList.remove("is-open"); p.setAttribute("aria-hidden", "true"); }
  });
  // Open the requested panel
  const panel = name === "cv" ? cvPanel : bioPanel;
  if (panel) { panel.classList.add("is-open"); panel.setAttribute("aria-hidden", "false"); }
}

function closeAllPanels() {
  [cvPanel, bioPanel].forEach((p) => {
    if (p) { p.classList.remove("is-open"); p.setAttribute("aria-hidden", "true"); }
  });
}

// Hover CV folder → open CV panel
if (cvFolder) {
  cvFolder.addEventListener("mouseenter", () => {
    openPanel("cv");
    setPreviewImage("");
    setPreviewNote("");
    hideWorkTags();
  });
}
// Hover BIO folder → open BIO panel
if (bioFolder) {
  bioFolder.addEventListener("mouseenter", () => {
    openPanel("bio");
    setPreviewImage("");
    setPreviewNote("");
    hideWorkTags();
  });
}
// Hover WORKS folder → close all panels
if (worksFolder) {
  worksFolder.addEventListener("mouseenter", () => {
    closeAllPanels();
    hideWorkTags();
  });
  worksFolder.addEventListener("mouseleave", () => {
    // Tags and preview stay open — both dismissed together by clicking empty background
  });
}

// ======== FOLDER LOCK-OPEN ========
// Folder stays expanded until another folder is hovered
document.querySelectorAll(".folder").forEach((folder) => {
  folder.addEventListener("mouseenter", () => {
    document.querySelectorAll(".folder").forEach((f) => f.classList.remove("is-expanded"));
    folder.classList.add("is-expanded");
  });
});

// ======== 3D MOUSE TILT ========
const previewGroup = document.querySelector(".preview-group");
let tiltTargetX = 0, tiltTargetY = 0;
let tiltCurrentX = 0, tiltCurrentY = 0;
const TILT_MAX = 20;   // max degrees
const TILT_LERP = 0.07;

function applyTilt() {
  tiltCurrentX += (tiltTargetX - tiltCurrentX) * TILT_LERP;
  tiltCurrentY += (tiltTargetY - tiltCurrentY) * TILT_LERP;
  if (previewGroup) {
    previewGroup.style.transform =
      `translate(-50%, -50%) rotateX(${tiltCurrentX}deg) rotateY(${tiltCurrentY}deg)`;
  }
  requestAnimationFrame(applyTilt);
}
requestAnimationFrame(applyTilt);

document.addEventListener("mousemove", (e) => {
  if (!landingRight || !landingRight.dataset.previewActive) {
    tiltTargetX = 0;
    tiltTargetY = 0;
    return;
  }
  const rect = landingRight.getBoundingClientRect();
  const cx = rect.left + rect.width  / 2;
  const cy = rect.top  + rect.height / 2;
  // Normalize -1..1 relative to right panel center
  const nx = (e.clientX - cx) / (rect.width  / 2);
  const ny = (e.clientY - cy) / (rect.height / 2);
  tiltTargetY =  nx * TILT_MAX;
  tiltTargetX = -ny * TILT_MAX;
});

// ======== DISMISS PREVIEW ON BACKGROUND CLICK ========
document.addEventListener("click", (e) => {
  if (!landingRight || !landingRight.dataset.previewActive) return;
  // Keep preview if clicking inside the nav or on the preview image itself
  if (e.target.closest(".landing-nav") || e.target.closest(".works-preview-slot")) return;
  setPreviewImage("");
  setPreviewNote("");
  hideWorkTags();
});

// ======== INIT ========
initLetterSwap(document.body);
initTopicListeners();
