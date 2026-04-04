const boidBg = document.querySelector('.boid-bg');

if (boidBg) {
  const animatedBg = new Image();
  animatedBg.decoding = 'async';
  animatedBg.src = '../../images/boidgame/boidpreview.gif';
  animatedBg.addEventListener('load', () => {
    boidBg.classList.add('is-animated');
  }, { once: true });
}

// Concept section scroll animation — replays on every enter/exit
const conceptSection = document.querySelector('.boid-concept');
if (conceptSection) {
  const conceptObserver = new IntersectionObserver(
    (entries) => {
      conceptSection.classList.toggle('is-visible', entries[0].isIntersecting);
    },
    { threshold: 0.2 }
  );
  conceptObserver.observe(conceptSection);
}

// Sticky link: show when hero title link leaves viewport
const heroLink = document.querySelector('.boid-hero__title-link');
const stickyLink = document.querySelector('.boid-sticky-link');
if (heroLink && stickyLink) {
  const stickyObserver = new IntersectionObserver(
    (entries) => {
      stickyLink.classList.toggle('is-visible', !entries[0].isIntersecting);
    },
    { threshold: 0 }
  );
  stickyObserver.observe(heroLink);
}

// Panel scroll animations — replay on every enter/exit
const panels = document.querySelectorAll('.panel-item');
if (panels.length) {
  const panelObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('visible', entry.isIntersecting);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
  );
  panels.forEach((panel) => panelObserver.observe(panel));
}

window.requestAnimationFrame(() => {
  document.body.classList.add('is-entering');
});
