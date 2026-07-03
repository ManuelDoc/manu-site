(() => {
  const section = document.querySelector("[data-orchestra]");

  if (!section || !window.matchMedia) {
    return;
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktopQuery = window.matchMedia("(min-width: 992px)");

  if (motionQuery.matches) {
    return;
  }

  const vendorScripts = ["assets/vendor/gsap.min.js", "assets/vendor/ScrollTrigger.min.js"];
  // Must match the SVG line endpoints and the CSS node positions.
  const nodePositions = [
    { x: 50, y: 10 },
    { x: 84, y: 30 },
    { x: 84, y: 70 },
    { x: 50, y: 90 },
    { x: 16, y: 70 },
    { x: 16, y: 30 },
  ];
  let loadStarted = false;

  const buildScene = (gsap) => {
    const pin = section.querySelector(".orchestra__pin");
    const stage = section.querySelector(".orchestra__stage");
    const conductor = section.querySelector(".orchestra__conductor");
    const agents = gsap.utils.toArray(section.querySelectorAll(".orchestra__agent"));
    const lines = gsap.utils.toArray(section.querySelectorAll(".orchestra__line"));
    const rings = gsap.utils.toArray(section.querySelectorAll(".orchestra__ring"));
    const pulses = gsap.utils.toArray(section.querySelectorAll(".orchestra__pulse"));
    const steps = gsap.utils.toArray(section.querySelectorAll(".orchestra__step"));

    if (!pin || !stage || !conductor || agents.length < 6 || lines.length < 6 || steps.length < 4) {
      return;
    }

    section.classList.add("orchestra--enhanced");
    section
      .querySelectorAll(".orchestra__conductor, .orchestra__agent, .orchestra__step")
      .forEach((element) => element.classList.remove("scroll-reveal"));

    const nodeFor = (index) => nodePositions[index % nodePositions.length];

    gsap.set(conductor, { autoAlpha: 0, scale: 0.7 });
    // Agents start on top of the conductor and burst out to their spots.
    gsap.set(agents, {
      autoAlpha: 0,
      scale: 0.3,
      rotation: (index) => (index % 2 === 0 ? -12 : 12),
      x: (index) => ((50 - nodeFor(index).x) / 100) * stage.clientWidth,
      y: (index) => ((50 - nodeFor(index).y) / 100) * stage.clientHeight,
    });
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(rings, { autoAlpha: 0, scale: 1, transformOrigin: "50% 50%" });
    gsap.set(steps, { autoAlpha: 0, y: 18 });

    const timeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        pin,
        start: "top top",
        end: () => `+=${Math.max(window.innerHeight * 1.25, 900)}`,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    const showStep = (step, at, out) => {
      timeline.to(step, { autoAlpha: 1, y: 0, duration: 0.04 }, at);

      if (out !== undefined) {
        timeline.to(step, { autoAlpha: 0, y: -14, duration: 0.03 }, out);
      }
    };

    timeline.to(conductor, { autoAlpha: 1, scale: 1, duration: 0.06, ease: "back.out(1.6)" }, 0);
    showStep(steps[0], 0.02, 0.2);

    timeline.to(
      agents,
      { autoAlpha: 1, scale: 1, rotation: 0, x: 0, y: 0, duration: 0.16, ease: "back.out(1.4)", stagger: 0.015 },
      0.05,
    );

    timeline.to(lines, { strokeDashoffset: 0, duration: 0.09, stagger: 0.008 }, 0.2);
    showStep(steps[1], 0.22, 0.4);

    timeline.to(rings, { autoAlpha: 0.9, duration: 0.03, stagger: 0.015 }, 0.3);
    timeline.to(rings, { autoAlpha: 0, scale: 2.6, duration: 0.12, stagger: 0.015 }, 0.33);
    pulses.forEach((pulse, index) => {
      const node = nodeFor(index);
      const offset = index * 0.008;

      timeline.to(pulse, { autoAlpha: 1, duration: 0.015 }, 0.3 + offset);
      timeline.to(pulse, { attr: { cx: node.x, cy: node.y }, duration: 0.09 }, 0.31 + offset);
      timeline.to(pulse, { autoAlpha: 0, duration: 0.02 }, 0.39 + offset);
    });
    timeline.to(agents, { scale: 1.06, duration: 0.04, stagger: 0.008 }, 0.34);
    timeline.to(agents, { scale: 1, duration: 0.04, stagger: 0.008 }, 0.4);
    showStep(steps[2], 0.42, 0.58);

    timeline.to(lines, { autoAlpha: 0.45, duration: 0.05 }, 0.62);
    timeline.to(agents, { autoAlpha: 0.55, duration: 0.05 }, 0.62);
    timeline.to(conductor, { scale: 1.06, duration: 0.06 }, 0.62);
    showStep(steps[3], 0.64);
    timeline.to({}, { duration: 0.06 });

    return () => {
      section.classList.remove("orchestra--enhanced");
    };
  };

  const init = () => {
    if (!window.gsap || !window.ScrollTrigger) {
      return;
    }

    // Skip enhancement if the section is already in or above view,
    // so the pin spacer never appears under the user's feet.
    if (section.getBoundingClientRect().top < window.innerHeight * 0.6) {
      return;
    }

    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap
      .matchMedia()
      .add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => buildScene(window.gsap));
  };

  const loadVendors = () => {
    if (loadStarted) {
      return;
    }

    loadStarted = true;
    let loadedCount = 0;

    vendorScripts.forEach((src) => {
      const script = document.createElement("script");

      script.src = src;
      script.async = false;
      script.onload = () => {
        loadedCount += 1;

        if (loadedCount === vendorScripts.length) {
          init();
        }
      };
      document.head.appendChild(script);
    });
  };

  if (desktopQuery.matches) {
    loadVendors();
  } else {
    const onDesktopChange = (event) => {
      if (event.matches) {
        desktopQuery.removeEventListener("change", onDesktopChange);
        loadVendors();
      }
    };

    desktopQuery.addEventListener("change", onDesktopChange);
  }
})();
