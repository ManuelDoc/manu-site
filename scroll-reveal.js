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
  const sideRevealSelector = [
    ".pricing-card",
    ".maintenance-card",
    ".service-card",
    ".portfolio-card",
    ".about-panel",
  ].join(", ");
  const revealTargets = Array.from(document.querySelectorAll(revealSelector));
  const motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  if (!revealTargets.length || !motionQuery || motionQuery.matches || !window.gsap || !("IntersectionObserver" in window)) {
    return;
  }

  const revealTargetSet = new Set(revealTargets);
  const narrowViewportQuery = window.matchMedia("(max-width: 719px)");
  let observer;

  const getGroupIndex = (target) => {
    if (!target.parentElement) {
      return 0;
    }

    const siblings = Array.from(target.parentElement.children).filter((child) => revealTargetSet.has(child));
    const index = siblings.indexOf(target);

    return index < 0 ? 0 : index;
  };

  const getColumnCount = (target) => {
    if (!target.parentElement) {
      return 1;
    }

    const gridColumns = window.getComputedStyle(target.parentElement).gridTemplateColumns;

    return gridColumns ? gridColumns.split(" ").filter(Boolean).length : 1;
  };

  const getHorizontalOffset = (target, index) => {
    if (narrowViewportQuery.matches || !target.matches(sideRevealSelector)) {
      return 0;
    }

    if (target.matches(".maintenance-card, .about-panel")) {
      return 52;
    }

    const columnCount = getColumnCount(target);

    if (columnCount <= 1) {
      return 0;
    }

    const column = index % columnCount;
    const middleColumn = (columnCount - 1) / 2;

    return (column - middleColumn) * 46;
  };

  const getRevealVars = (target) => {
    const index = getGroupIndex(target);
    const x = getHorizontalOffset(target, index);

    return {
      delay: target.matches(".pricing-card, .service-card, .portfolio-card") ? Math.min(index % 3, 2) * 0.08 : 0,
      x,
      y: x ? 22 : 34,
    };
  };

  const revealTarget = (target) => {
    const { delay } = getRevealVars(target);

    target.classList.add("is-revealed");
    window.gsap.to(target, {
      autoAlpha: 1,
      clearProps: "opacity,visibility,transform,willChange",
      delay,
      duration: 0.82,
      ease: "power3.out",
      scale: 1,
      x: 0,
      y: 0,
    });
  };

  const revealAll = () => {
    if (observer) {
      observer.disconnect();
    }

    revealTargets.forEach((target) => {
      target.classList.add("is-revealed");
      window.gsap.killTweensOf(target);
      window.gsap.set(target, {
        clearProps: "opacity,visibility,transform,willChange",
      });
    });
  };

  revealTargets.forEach((target) => {
    const { x, y } = getRevealVars(target);

    target.classList.add("scroll-reveal");
    window.gsap.set(target, {
      autoAlpha: 0,
      scale: 0.985,
      willChange: "transform, opacity",
      x,
      y,
    });
  });

  observer = new IntersectionObserver((entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .forEach((entry) => {
        revealTarget(entry.target);
        observer.unobserve(entry.target);
      });
  }, {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.16,
  });

  revealTargets.forEach((target) => observer.observe(target));

  const handleMotionChange = (event) => {
    if (event.matches) {
      revealAll();
    }
  };

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", handleMotionChange);
    return;
  }

  motionQuery.addListener(handleMotionChange);
})();
