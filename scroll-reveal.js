(() => {
  const revealSelector = [
    ".section-heading",
    ".pricing-card",
    ".maintenance-card",
    ".service-card",
    ".portfolio-card",
    ".about-copy",
    ".about-panel",
    ".final-cta",
    ".contact-panel",
  ].join(", ");
  const revealTargets = Array.from(document.querySelectorAll(revealSelector));
  const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  if (!revealTargets.length || !("IntersectionObserver" in window)) {
    return;
  }

  if (motionQuery && motionQuery.matches) {
    revealTargets.forEach((target) => target.classList.add("is-revealed"));
    return;
  }

  const isInitiallyVisible = (target) => {
    const rect = target.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    return rect.top < viewportHeight * 0.94 && rect.bottom > 0;
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.12,
  });

  revealTargets.forEach((target) => {
    if (isInitiallyVisible(target)) {
      target.classList.add("is-revealed");
      return;
    }

    target.classList.add("scroll-reveal");
    observer.observe(target);
  });
})();
