/* Harrison Wills microsite — all interactions.
   Vanilla, self-contained, and safe to run on every page of the microsite:
   each block bails out when its markup is not present. */

(() => {
  "use strict";

  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer =
    window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ----------------------------------------------------------------- intro */

  // The <head> decides whether the intro runs (first load of the session, no
  // reduced-motion); this only plays it out and hands the page back.
  const root = document.documentElement;

  if (root.classList.contains("is-intro")) {
    const intro = document.querySelector("[data-intro]");
    const introVideo = document.querySelector("[data-hero-video]");

    if (!intro || !introVideo) {
      root.classList.remove("is-intro");
    } else {
      // The frame has to be live before it is shown, so this one skips the
      // idle-time politeness the decorative loop gets below.
      introVideo.preload = "auto";

      const played = introVideo.play();

      if (played && typeof played.catch === "function") {
        // Refused autoplay just means the poster grows instead. Still works.
        played.catch(() => {});
      }

      const timers = [];
      const at = (delay, fn) => timers.push(window.setTimeout(fn, delay));

      const finish = () => {
        timers.forEach(window.clearTimeout);
        skipEvents.forEach((type) => window.removeEventListener(type, finish));

        // A reload keeps the scroll position the browser restored, and it is
        // only invisible while the intro covers the page — so the page has to
        // land back at the top in the same frame that scrolling is unlocked.
        // Order matters: overflow:hidden makes scrollTo a no-op.
        // "instant" because the page scrolls smoothly by default, and the
        // trip back up would be visible.
        root.classList.remove("is-intro", "is-frame", "is-expand");
        window.scrollTo({ top: 0, behavior: "instant" });

        // Back/forward navigation gets its scroll position back as usual; a
        // reload re-runs the head script and switches this off again.
        if ("scrollRestoration" in history) {
          history.scrollRestoration = "auto";
        }
      };

      // Anyone trying to scroll or key through the intro gets the page now.
      const skipEvents = ["wheel", "touchmove", "keydown"];
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

  /* ---------------------------------------------------------------- header */

  const header = document.querySelector("[data-header]");

  if (header) {
    const sync = () => {
      header.classList.toggle("is-stuck", window.scrollY > 24);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
  }

  /* ----------------------------------------------------------- mobile menu */

  const navToggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (navToggle && mobileNav) {
    const setOpen = (open) => {
      mobileNav.hidden = !open;
      navToggle.setAttribute("aria-expanded", String(open));
      document.documentElement.style.overflow = open ? "hidden" : "";

      if (open) {
        const first = mobileNav.querySelector("a");

        if (first) {
          first.focus();
        }
      } else {
        navToggle.focus();
      }
    };

    navToggle.addEventListener("click", () => setOpen(mobileNav.hidden));

    mobileNav.addEventListener("click", (event) => {
      if (event.target.closest("a, [data-nav-close]")) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !mobileNav.hidden) {
        setOpen(false);
      }
    });
  }

  /* -------------------------------------------------------------- marquee */

  const marquee = document.querySelector("[data-marquee]");

  if (marquee && !reducedMotion) {
    // The CSS animation travels -50%, so the strip needs exactly two copies.
    const group = marquee.firstElementChild;

    if (group) {
      marquee.appendChild(group.cloneNode(true));
    }
  }

  /* ------------------------------------------------------- scroll reveals */

  const revealTargets = document.querySelectorAll(".reveal, .reveal-stagger");

  if (revealTargets.length) {
    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((el) => el.classList.add("is-in"));
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
        { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
      );

      revealTargets.forEach((el) => observer.observe(el));
    }
  }

  /* ------------------------------------------------------------ hero video */

  const heroVideo = document.querySelector("[data-hero-video]");

  // Data Saver or a slow connection gets the poster only — it is a decorative
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
        // Autoplay can still be refused; the poster stays and nothing breaks.
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

  /* --------------------------------------------------------- hero timecode */

  const timecode = document.querySelector("[data-timecode]");

  if (timecode) {
    const pad = (value, size) => String(value).padStart(size || 2, "0");
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
          raf = window.requestAnimationFrame(tick);
        }
      });
    }
  }

  /* ----------------------------------------------------- work card previews */

  const workCards = document.querySelectorAll("[data-work-card]");

  if (workCards.length && !reducedMotion) {
    const play = (card) => {
      const video = card.querySelector("video");

      if (!video) {
        return;
      }

      if (!video.src && video.dataset.src) {
        video.src = video.dataset.src;
        // The still stays visible until the clip is genuinely running, so a
        // slow or blocked video never leaves an empty frame behind.
        video.addEventListener("playing", () => card.classList.add("is-playing"));
      }

      video.play().catch(() => {});
    };

    const stop = (card) => {
      const video = card.querySelector("video");

      card.classList.remove("is-playing");

      if (video) {
        video.pause();
      }
    };

    if (finePointer) {
      workCards.forEach((card) => {
        card.addEventListener("pointerenter", () => play(card));
        card.addEventListener("pointerleave", () => stop(card));
        card.addEventListener("focusin", () => play(card));
        card.addEventListener("focusout", () => stop(card));
      });
    } else if ("IntersectionObserver" in window) {
      // On touch screens only the card closest to the middle plays, so the page
      // never decodes six videos at once.
      let current = null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio > 0.75) {
              if (current && current !== entry.target) {
                stop(current);
              }

              current = entry.target;
              play(entry.target);
            } else if (entry.target === current && entry.intersectionRatio < 0.4) {
              stop(entry.target);
              current = null;
            }
          });
        },
        { threshold: [0.4, 0.75] },
      );

      workCards.forEach((card) => observer.observe(card));
    }
  }

  /* -------------------------------------------------------- work filtering */

  const filterButtons = document.querySelectorAll("[data-filter]");
  const workGrid = document.querySelector("[data-work-grid]");

  if (filterButtons.length && workGrid) {
    const empty = document.querySelector("[data-work-empty]");
    const cards = workGrid.querySelectorAll("[data-cat]");

    const apply = (key) => {
      let shown = 0;

      cards.forEach((card) => {
        const match = key === "all" || card.dataset.cat === key;

        card.hidden = !match;

        if (match) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown > 0;
      }

      filterButtons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.filter === key),
        );
      });
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => apply(button.dataset.filter));
    });
  }

  /* ------------------------------------------------------------------ reel */

  const reel = document.querySelector("[data-reel]");

  if (reel) {
    const video = reel.querySelector("[data-reel-video]");
    const trigger = reel.querySelector("[data-reel-play]");

    const startReel = () => {
      if (!video) {
        return;
      }

      if (!video.src && video.dataset.src) {
        video.src = video.dataset.src;
        video.addEventListener("playing", () => reel.classList.add("is-playing"));
      }

      video.controls = true;
      video.play().catch(() => {});
    };

    if (trigger) {
      trigger.addEventListener("click", startReel);
    }

    reel.addEventListener("click", (event) => {
      if (!reel.classList.contains("is-playing") && event.target !== video) {
        startReel();
      }
    });
  }

  /* ------------------------------------------------------- instagram feed */

  const feed = document.querySelector("[data-ig-feed]");

  if (feed) {
    const track = feed.querySelector("[data-ig-track]");
    const feedUrl = (feed.getAttribute("data-behold-url") || "").trim();
    const profileUrl =
      feed.getAttribute("data-ig-profile") || "https://www.instagram.com/";
    const maxPosts = 6;

    // Behold's schema has moved around over the years, so read it defensively.
    const pickImage = (post) => {
      const sizes = (post && post.sizes) || {};

      return (
        (sizes.medium && sizes.medium.mediaUrl) ||
        (sizes.large && sizes.large.mediaUrl) ||
        (sizes.small && sizes.small.mediaUrl) ||
        (sizes.full && sizes.full.mediaUrl) ||
        (post && post.thumbnailUrl) ||
        (post && post.mediaUrl) ||
        ""
      );
    };

    const pickCaption = (post) => {
      const raw =
        (post && post.prunedCaption) ||
        (post && typeof post.caption === "string"
          ? post.caption
          : (post && post.caption && post.caption.text) || "");

      return String(raw).replace(/\s+/g, " ").trim();
    };

    const excerpt = (text, max) =>
      text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;

    const buildCard = (post) => {
      const item = document.createElement("li");

      const link = document.createElement("a");
      link.className = "ig__link";
      link.href = (post && post.permalink) || profileUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const caption = pickCaption(post);
      link.setAttribute(
        "aria-label",
        (caption ? excerpt(caption, 90) : "View Instagram post") +
          " — opens in a new tab",
      );

      const img = document.createElement("img");
      img.src = pickImage(post);
      img.alt = caption ? excerpt(caption, 120) : "";
      img.loading = "lazy";
      img.decoding = "async";
      img.width = 800;
      img.height = 1000;
      link.appendChild(img);

      if (post && (post.mediaType === "VIDEO" || post.mediaType === "REEL")) {
        const badge = document.createElement("span");
        badge.className = "ig__badge";
        badge.setAttribute("aria-hidden", "true");
        badge.innerHTML =
          '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5-11-6.5Z"></path></svg>';
        link.appendChild(badge);
      }

      item.appendChild(link);
      return item;
    };

    const load = () => {
      if (!feedUrl || !track) {
        feed.hidden = true;
        return;
      }

      fetch(feedUrl, { headers: { Accept: "application/json" } })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Feed request failed: " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          const posts = Array.isArray(data) ? data : data && data.posts;

          if (!Array.isArray(posts) || !posts.length) {
            throw new Error("Empty feed");
          }

          track.textContent = "";
          posts.slice(0, maxPosts).forEach((post) => track.appendChild(buildCard(post)));
        })
        .catch(() => {
          // Never show a broken strip — the section removes itself instead.
          feed.hidden = true;
        });
    };

    // Only fetch once the section is close to the viewport.
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            load();
          }
        },
        { rootMargin: "600px 0px" },
      );

      observer.observe(feed);
    } else {
      load();
    }
  }

  /* ------------------------------------------------------------------ form */

  const form = document.getElementById("contact-form");

  if (form) {
    const TEXT = {
      verifying: "Verifying…",
      sending: "Sending…",
      spamLoading: "The spam check is still loading. Try again in a moment.",
      notVerified: "The spam check could not load. Please use WhatsApp or email instead.",
      expired: "The spam check expired. Please try again.",
      failed: "Something went wrong. Please use WhatsApp or email instead.",
    };

    const status = form.parentElement
      ? form.parentElement.querySelector("[data-fs-error]")
      : null;
    const submitButton = form.querySelector("[data-fs-submit-btn]");
    const defaultLabel = submitButton ? submitButton.textContent : "";
    const action = form.getAttribute("action") || "";
    const method = form.getAttribute("method") || "POST";
    const successUrl = new URL(
      form.dataset.successUrl || "../thank-you.html",
      window.location.href,
    ).href;
    const captcha = form.querySelector("[data-turnstile-container]");
    const sitekey = captcha ? captcha.dataset.sitekey : "";
    const theme = captcha ? captcha.dataset.theme || "dark" : "dark";

    let loadPromise = null;
    let widgetId = null;
    let started = false;

    const setStatus = (message) => {
      if (!status) {
        return;
      }

      if (!message) {
        status.textContent = "";
        status.removeAttribute("data-fs-active");
        return;
      }

      status.textContent = message;
      status.setAttribute("data-fs-active", "");
    };

    const setSubmit = (enabled, label) => {
      if (!submitButton) {
        return;
      }

      submitButton.disabled = !enabled;
      submitButton.textContent = label || defaultLabel;
    };

    const token = () => {
      const field = form.querySelector('[name="cf-turnstile-response"]');
      return field ? field.value.trim() : "";
    };

    const resetCaptcha = () => {
      if (window.turnstile && widgetId !== null) {
        window.turnstile.reset(widgetId);
      }
    };

    const loadScript = () => {
      if (window.turnstile) {
        return Promise.resolve(window.turnstile);
      }

      if (loadPromise) {
        return loadPromise;
      }

      loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () =>
          window.turnstile
            ? resolve(window.turnstile)
            : reject(new Error("Turnstile unavailable"));
        script.onerror = () => reject(new Error("Turnstile failed to load"));

        document.head.appendChild(script);
      });

      return loadPromise;
    };

    // Turnstile is only fetched once someone actually starts filling the form,
    // so a plain visit stays free of third-party requests.
    const startCaptcha = () => {
      if (started) {
        return;
      }

      if (!captcha || !sitekey) {
        setStatus(TEXT.notVerified);
        return;
      }

      started = true;
      setSubmit(false, TEXT.verifying);

      loadScript()
        .then((turnstile) => {
          widgetId = turnstile.render(captcha, {
            sitekey: sitekey,
            theme: theme,
            callback: () => {
              setStatus("");
              setSubmit(true, defaultLabel);
            },
            "error-callback": () => {
              setStatus(TEXT.notVerified);
              setSubmit(false, defaultLabel);
            },
            "expired-callback": () => {
              setStatus(TEXT.expired);
              setSubmit(false, defaultLabel);
              resetCaptcha();
            },
          });
        })
        .catch(() => {
          started = false;
          loadPromise = null;
          setStatus(TEXT.notVerified);
          setSubmit(false, defaultLabel);
        });
    };

    form.addEventListener("focusin", startCaptcha, { once: true });
    form.addEventListener("pointerdown", startCaptcha, { once: true });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!token()) {
        startCaptcha();
        setStatus(TEXT.spamLoading);
        setSubmit(false, TEXT.verifying);
        return;
      }

      setStatus("");
      form.setAttribute("aria-busy", "true");
      setSubmit(false, TEXT.sending);

      try {
        const response = await fetch(action, {
          body: new FormData(form),
          headers: { Accept: "application/json" },
          method: method,
        });

        if (!response.ok) {
          throw new Error(TEXT.failed);
        }

        window.location.assign(successUrl);
      } catch (error) {
        resetCaptcha();
        setStatus(error instanceof Error ? error.message : TEXT.failed);
        form.removeAttribute("aria-busy");
        setSubmit(false, TEXT.verifying);
      }
    });
  }
})();
