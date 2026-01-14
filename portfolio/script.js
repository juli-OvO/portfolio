// script.js
const stage = document.getElementById("stage");
const bookstack = document.getElementById("bookstack");
const books = Array.from(document.querySelectorAll(".book"));
const panelTab = document.getElementById("panelTab");

let openSection = null;

// Step 2 (hover preview): show panel + change tab text
books.forEach((btn) => {
  btn.addEventListener("mouseenter", () => {
    if (openSection) return; // if already opened, ignore hover preview
    stage.classList.add("is-preview");
    panelTab.textContent = labelFor(btn.dataset.section);
  });

  btn.addEventListener("mouseleave", () => {
    if (openSection) return;
    stage.classList.remove("is-preview");
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
    });

    panelTab.textContent = labelFor(section);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAll();
});

function closeAll() {
  openSection = null;
  stage.classList.remove("is-open");
  stage.classList.remove("is-preview");
  bookstack.classList.remove("is-open");
  books.forEach((b) => {
    b.classList.remove("active");
    b.setAttribute("aria-expanded", "false");
  });
  panelTab.textContent = "Text";
}

function labelFor(section) {
  switch (section) {
    case "bio": return "Bio";
    case "works": return "Works";
    case "cv": return "CV";
    case "contact": return "Contact";
    default: return "Text";
  }
}
