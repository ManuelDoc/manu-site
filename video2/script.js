(() => {
  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearTarget = document.querySelector("[data-year]");

  if (yearTarget) {
    yearTarget.textContent = String(new Date().getFullYear());
  }

  const openButton = document.querySelector("[data-menu-open]");
  const closeButton = document.querySelector("[data-menu-close]");
  const menu = document.querySelector("[data-menu]");

  if (openButton && closeButton && menu) {
    const setMenu = (open) => {
      menu.hidden = !open;
      openButton.setAttribute("aria-expanded", String(open));
      document.documentElement.style.overflow = open ? "hidden" : "";

      if (open) {
        closeButton.focus();
      } else {
        openButton.focus();
      }
    };

    openButton.addEventListener("click", () => setMenu(true));
    closeButton.addEventListener("click", () => setMenu(false));

    menu.querySelectorAll("[data-menu-link]").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) {
        setMenu(false);
      }
    });
  }

  const revealTargets = Array.from(document.querySelectorAll(".v-reveal"));

  if (revealTargets.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("is-in"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
      );

      revealTargets.forEach((target) => observer.observe(target));
    }
  }

  const timecode = document.querySelector("[data-timecode]");

  if (timecode) {
    if (reducedMotion) {
      timecode.textContent = "00:00:12:08";
      return;
    }

    const pad = (value) => String(value).padStart(2, "0");
    const start = performance.now();

    const tick = (now) => {
      if (!document.hidden) {
        const elapsed = (now - start) / 1000;
        const hours = Math.floor(elapsed / 3600) % 24;
        const minutes = Math.floor(elapsed / 60) % 60;
        const seconds = Math.floor(elapsed) % 60;
        const frames = Math.floor((elapsed % 1) * 25);

        timecode.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
      }

      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  }
})();
