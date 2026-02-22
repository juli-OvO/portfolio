// intro.js
(() => {
  const titleEl = document.getElementById("revealTitle");
  if (!titleEl) return;

  const WORD = "Julianne Jin";

  function buildSpans(text) {
    titleEl.innerHTML = "";
    titleEl.setAttribute("aria-label", text);
    Array.from(text).forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.setProperty("--index", String(index));
      span.textContent = char === " " ? "\u00A0" : char;
      titleEl.appendChild(span);
    });
  }

  function replay() {
    buildSpans(WORD);
  }

  setTimeout(() => {
    buildSpans(WORD);
  }, 250);

  window.addEventListener("revealTitleReplay", replay);
})();
