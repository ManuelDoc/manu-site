(function () {
  "use strict";

  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const root = document.documentElement;
  const heroVideo = document.querySelector("[data-hero-video]");

  /* -------------------------------------------------------------- intro */

  // The <head> decides whether the intro runs; this only plays it out and
  // hands the page back. Any scroll or key press skips straight to the end.
  if (root.classList.contains("is-intro")) {
    const intro = document.querySelector("[data-intro]");

    if (!intro || !heroVideo) {
      root.classList.remove("is-intro");
    } else {
      heroVideo.preload = "auto";
      const played = heroVideo.play();

      if (played && typeof played.catch === "function") {
        played.catch(() => {});
      }

      const timers = [];
      const at = (delay, fn) => timers.push(window.setTimeout(fn, delay));
      const skipEvents = ["wheel", "touchmove", "keydown"];

      const finish = () => {
        timers.forEach(window.clearTimeout);
        skipEvents.forEach((type) => window.removeEventListener(type, finish));

        // overflow:hidden makes scrollTo a no-op, so the classes go first.
        root.classList.remove("is-intro", "is-frame", "is-expand");
        window.scrollTo({ top: 0, behavior: "instant" });

        if ("scrollRestoration" in history) {
          history.scrollRestoration = "auto";
        }
      };

      skipEvents.forEach((type) =>
        window.addEventListener(type, finish, { passive: true })
      );

      at(120, () => intro.classList.add("is-name"));
      at(2000, () => intro.classList.add("is-name-out"));
      at(2450, () => root.classList.add("is-frame"));
      at(3100, () => root.classList.add("is-expand"));
      at(4550, finish);
    }
  }

  /* --------------------------------------------------------- hero video */

  // Data Saver or a slow connection gets the poster only. It is a decorative
  // loop, not content, and it is the heaviest thing on the page.
  const connection = navigator.connection || {};
  const frugal =
    connection.saveData === true ||
    /^(slow-)?2g$/.test(connection.effectiveType || "") ||
    connection.effectiveType === "3g";

  if (heroVideo && !reducedMotion && !frugal) {
    const start = () => {
      heroVideo.preload = "auto";
      const attempt = heroVideo.play();

      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {});
      }
    };

    // Held back until the page is idle so the loop never competes with the
    // fonts, the stylesheet or the poster for bandwidth.
    const queue = () =>
      window.requestIdleCallback
        ? window.requestIdleCallback(start, { timeout: 2000 })
        : window.setTimeout(start, 600);

    if (document.readyState === "complete") {
      queue();
    } else {
      window.addEventListener("load", queue, { once: true });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        heroVideo.pause();
      } else {
        heroVideo.play().catch(() => {});
      }
    });
  }

  /* ------------------------------------------------------ hero timecode */

  const timecode = document.querySelector("[data-timecode]");

  if (timecode) {
    const pad = (value) => String(value).padStart(2, "0");
    const format = (seconds) => {
      const whole = Math.floor(seconds);
      const frames = Math.floor((seconds - whole) * 24);

      return [
        pad(Math.floor(whole / 3600)),
        pad(Math.floor(whole / 60) % 60),
        pad(whole % 60),
        pad(frames),
      ].join(":");
    };

    if (reducedMotion) {
      timecode.textContent = format(0);
    } else {
      const started = performance.now();
      let raf = 0;

      const tick = () => {
        timecode.textContent = format((performance.now() - started) / 1000);
        raf = window.requestAnimationFrame(tick);
      };

      tick();

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          window.cancelAnimationFrame(raf);
        } else {
          tick();
        }
      });
    }
  }

  /* ------------------------------------------------------------- motion

     The stylesheet does all of this natively where `animation-timeline` is
     supported. What follows only runs in the browsers that are still
     missing it, so nothing here duplicates work the compositor is already
     doing. */

  const nativeScrollTimeline =
    window.CSS &&
    CSS.supports &&
    CSS.supports("animation-timeline", "view()");

  if (!reducedMotion && !nativeScrollTimeline) {
    // Index each child so the stylesheet can stagger it with a delay.
    document.querySelectorAll(".stagger").forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        child.style.setProperty("--i", String(i));
      });
    });

    const targets = document.querySelectorAll(".reveal, .stagger, .lines");

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
      );

      targets.forEach((el) => observer.observe(el));
    } else {
      targets.forEach((el) => el.classList.add("is-in"));
    }

    // Scroll progress, rounded to whole percent so it only writes to the
    // style when the bar would actually move.
    const bar = document.querySelector(".progress__bar");

    if (bar) {
      let last = -1;
      let ticking = false;

      const paint = () => {
        ticking = false;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;

        if (pct !== last) {
          last = pct;
          bar.style.transform = "scaleX(" + pct / 100 + ")";
        }
      };

      window.addEventListener(
        "scroll",
        () => {
          if (ticking) return;
          ticking = true;
          window.requestAnimationFrame(paint);
        },
        { passive: true }
      );

      paint();
    }
  }

  /* ------------------------------------------------------------ filters */

  const grid = document.querySelector("[data-work-grid]");
  const filters = Array.from(document.querySelectorAll("[data-filter]"));
  const empty = document.querySelector("[data-work-empty]");

  if (grid && filters.length) {
    const cards = Array.from(grid.children);

    const apply = (cat) => {
      let shown = 0;

      cards.forEach((card) => {
        const match = cat === "all" || card.dataset.cat === cat;
        card.hidden = !match;
        if (match) shown += 1;
      });

      filters.forEach((btn) => {
        const active = btn.dataset.filter === cat;
        btn.classList.toggle("chip--strong", active);
        btn.setAttribute("aria-pressed", String(active));
      });

      if (empty) empty.hidden = shown > 0;
    };

    filters.forEach((btn) =>
      btn.addEventListener("click", () => apply(btn.dataset.filter))
    );
  }

  /* ------------------------------------------------ WhatsApp enquiry form */

  const form = document.querySelector("[data-whatsapp-form]");

  if (form) {
    form.addEventListener("submit", (event) => {
      if (!form.reportValidity()) {
        event.preventDefault();
        return;
      }

      const value = (name) => (form.elements[name].value || "").trim();

      const lines = [
        "Hi Harrison, I'd like to talk about a shoot.",
        "",
        "Name: " + value("name"),
        value("email") && "Email: " + value("email"),
        value("phone") && "Phone: " + value("phone"),
        value("company") && "Company / brand: " + value("company"),
        value("msg") && "",
        value("msg"),
      ].filter((line) => line !== false && line !== undefined);

      const url = new URL(form.action);
      url.searchParams.set("text", lines.join("\n"));

      event.preventDefault();
      window.open(url.toString(), "_blank", "noopener");
    });
  }
})();
