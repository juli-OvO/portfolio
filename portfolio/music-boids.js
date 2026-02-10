const detailsContent = document.querySelector('.boid-details__content');

if (detailsContent) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(detailsContent);
}
