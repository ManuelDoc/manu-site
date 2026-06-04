(() => {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = window.gsap && window.ScrollTrigger;

  if (!hasGsap || prefersReducedMotion) {
    document.querySelector(".camera-reveal")?.classList.add("is-static");
    document.querySelectorAll(".js-reveal").forEach((element) => {
      element.classList.remove("js-reveal");
    });
    return;
  }

  const { gsap, ScrollTrigger } = window;
  const revealTargets = document.querySelectorAll(
    ".section-heading, .intro__grid, .project-card, .capability-card, .brand-wall span, .showcase__media, .showcase-list article, .process-list li, .about__copy, .proof-grid article, .social__content, .social-mosaic figure, .youtube-cards article, .contact__content, .contact-panel",
  );

  gsap.registerPlugin(ScrollTrigger);

  const initCameraReveal = () => {
    const section = document.querySelector(".camera-reveal");
    const pin = document.querySelector(".camera-reveal__pin");
    const stage = document.querySelector(".camera-reveal__stage");
    const camera = document.querySelector(".camera-reveal__camera");
    const scene = document.querySelector(".camera-reveal__scene");

    if (!section || !pin || !stage || !camera || !scene) {
      return;
    }

    const display = {
      x: 558 / 1672,
      y: 388 / 941,
      scale: 494 / 1672,
    };
    const stageWidth = () => stage.clientWidth;
    const stageHeight = () => stage.clientHeight;
    const centeredOffset = (scale, size) => (size * (1 - scale)) / 2;

    gsap.set(camera, {
      autoAlpha: 0,
      scale: 1.025,
      transformOrigin: "50% 50%",
    });

    gsap.set(scene, {
      autoAlpha: 1,
      scale: 1.075,
      transformOrigin: "0 0",
      x: () => centeredOffset(1.075, stageWidth()),
      y: () => centeredOffset(1.075, stageHeight()),
    });

    const reveal = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${Math.max(window.innerHeight * 2.6, 1700)}`,
        pin,
        scrub: 1.05,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    reveal
      .to(scene, {
        duration: 0.2,
        scale: 0.96,
        x: () => centeredOffset(0.96, stageWidth()),
        y: () => centeredOffset(0.96, stageHeight()),
      })
      .to(
        camera,
        {
          autoAlpha: 0.18,
          duration: 0.22,
          scale: 1.018,
        },
        0.18,
      )
      .to(
        camera,
        {
          autoAlpha: 1,
          duration: 0.42,
          scale: 1,
        },
        0.36,
      )
      .to(
        scene,
        {
          duration: 0.58,
          scale: display.scale,
          x: () => stageWidth() * display.x,
          y: () => stageHeight() * display.y,
          filter: "saturate(0.96) contrast(1.02)",
        },
        0.26,
      )
      .to(
        scene,
        {
          autoAlpha: 0,
          duration: 0.16,
        },
        0.84,
      );
  };

  gsap.from(".brand, .site-nav a", {
    autoAlpha: 0,
    duration: 0.65,
    ease: "power2.out",
    stagger: 0.045,
    y: -12,
  });

  gsap.from(
    ".hero .eyebrow, .hero h1, .hero__lede, .hero__actions, .hero-card",
    {
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.08,
      y: 30,
    },
  );

  gsap.to(".hero__media", {
    ease: "none",
    scale: 1,
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  initCameraReveal();

  revealTargets.forEach((target) => {
    target.classList.add("js-reveal");
    gsap.to(target, {
      autoAlpha: 1,
      duration: 0.72,
      ease: "power2.out",
      y: 0,
      scrollTrigger: {
        trigger: target,
        start: "top 86%",
        once: true,
      },
    });
  });
})();
