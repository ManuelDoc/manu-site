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

  if (!revealTargets.length || !window.gsap || !motionQuery) {
    return;
  }

  const revealTargetSet = new Set(revealTargets);

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

    return gridColumns && gridColumns !== "none" ? gridColumns.split(" ").filter(Boolean).length : 1;
  };

  const getHorizontalOffset = (target, index, isDesktop) => {
    if (!isDesktop || !target.matches(sideRevealSelector)) {
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

  const getRevealVars = (target, isDesktop) => {
    const index = getGroupIndex(target);
    const x = getHorizontalOffset(target, index, isDesktop);
    const isGroupedCard = target.matches(".pricing-card, .service-card, .portfolio-card");
    const groupSize = isDesktop ? 3 : 2;
    const staggerStep = isDesktop ? 0.08 : 0.04;

    return {
      delay: isGroupedCard ? (index % groupSize) * staggerStep : 0,
      duration: isDesktop ? 0.82 : 0.58,
      scale: isDesktop ? 0.985 : 0.992,
      x,
      y: x ? 22 : isDesktop ? 34 : 18,
    };
  };

  const setRevealState = (target, isRevealed) => {
    target.classList.toggle("is-revealed", isRevealed);
  };

  const createFallbackReveal = () => {
    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        window.gsap.to(entry.target, {
          autoAlpha: entry.isIntersecting ? 1 : 0,
          duration: entry.isIntersecting ? 0.58 : 0.32,
          ease: "power2.out",
          scale: entry.isIntersecting ? 1 : 0.992,
          y: entry.isIntersecting ? 0 : 18,
        });

        setRevealState(entry.target, entry.isIntersecting);
      });
    }, {
      rootMargin: "0px 0px -14% 0px",
      threshold: 0.14,
    });

    revealTargets.forEach((target) => {
      target.classList.add("scroll-reveal");
      window.gsap.set(target, {
        autoAlpha: 0,
        scale: 0.992,
        y: 18,
      });
      observer.observe(target);
    });
  };

  const createScrollTriggerReveal = (target, isDesktop) => {
    const { delay, duration, scale, x, y } = getRevealVars(target, isDesktop);

    target.classList.add("scroll-reveal");

    return window.gsap.fromTo(target, {
      autoAlpha: 0,
      scale,
      x,
      y,
    }, {
      autoAlpha: 1,
      delay,
      duration,
      ease: "power3.out",
      onComplete: () => setRevealState(target, true),
      onReverseComplete: () => setRevealState(target, false),
      onStart: () => setRevealState(target, true),
      overwrite: "auto",
      paused: true,
      scale: 1,
      x: 0,
      y: 0,
      scrollTrigger: {
        end: isDesktop ? "bottom 18%" : "bottom 10%",
        invalidateOnRefresh: true,
        start: isDesktop ? "top 82%" : "top 88%",
        toggleActions: "play reverse play reverse",
        trigger: target,
      },
    });
  };

  const resetRevealState = () => {
    revealTargets.forEach((target) => {
      setRevealState(target, false);
      window.gsap.set(target, {
        clearProps: "opacity,visibility,transform",
      });
    });
  };

  if (!window.ScrollTrigger || !window.gsap.matchMedia) {
    if (!motionQuery.matches) {
      createFallbackReveal();
    }

    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);
  window.ScrollTrigger.saveStyles(revealTargets);

  const media = window.gsap.matchMedia();

  media.add({
    isDesktop: "(min-width: 720px)",
    isMobile: "(max-width: 719px)",
    reduceMotion: "(prefers-reduced-motion: reduce)",
  }, (context) => {
    const { isDesktop, reduceMotion } = context.conditions;

    if (reduceMotion) {
      resetRevealState();
      return;
    }

    revealTargets.forEach((target) => createScrollTriggerReveal(target, isDesktop));
  });
})();
