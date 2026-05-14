const mobileHeader = document.querySelector("[data-mobile-header]");

if (mobileHeader) {
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const mobileMenuOpenButton = mobileHeader.querySelector("[data-mobile-menu-open]");
  const mobileMenuCloseButton = mobileMenu ? mobileMenu.querySelector("[data-mobile-menu-close]") : null;
  const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll("a") : [];
  const mobileViewport = window.matchMedia("(max-width: 991px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let hideMenuTimer = null;
  let lastFocusedElement = null;
  let lockedScrollY = 0;
  let scrollTicking = false;

  const updateMobileHeaderState = () => {
    mobileHeader.classList.toggle("is-scrolled", window.scrollY > 12);
    scrollTicking = false;
  };

  const requestMobileHeaderState = () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(updateMobileHeaderState);
  };

  updateMobileHeaderState();
  window.addEventListener("scroll", requestMobileHeaderState, { passive: true });

  if (mobileMenu && mobileMenuOpenButton && mobileMenuCloseButton) {
    document.body.classList.add("has-mobile-nav");

    const getMobileMenuFocusableItems = () => Array.from(
      mobileMenu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );

    const lockPageScroll = () => {
      lockedScrollY = window.scrollY || window.pageYOffset;
      document.body.style.setProperty("--mobile-menu-scroll-y", `-${lockedScrollY}px`);
      document.documentElement.classList.add("is-mobile-menu-open");
      document.body.classList.add("is-mobile-menu-open");
    };

    const unlockPageScroll = () => {
      const scrollY = lockedScrollY;
      const previousScrollBehavior = document.documentElement.style.scrollBehavior;

      document.documentElement.classList.remove("is-mobile-menu-open");
      document.body.classList.remove("is-mobile-menu-open");
      document.body.style.removeProperty("--mobile-menu-scroll-y");
      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);

      if (previousScrollBehavior) {
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
      } else {
        document.documentElement.style.removeProperty("scroll-behavior");
      }
    };

    const hideMobileMenu = () => {
      window.clearTimeout(hideMenuTimer);
      mobileMenu.removeEventListener("transitionend", hideMobileMenu);
      mobileMenu.hidden = true;
      mobileMenu.setAttribute("aria-hidden", "true");
    };

    const closeMobileMenu = (restoreFocus = true) => {
      if (!mobileMenu.classList.contains("is-open") && mobileMenu.hidden) {
        return;
      }

      mobileMenu.classList.remove("is-open");
      mobileMenuOpenButton.setAttribute("aria-expanded", "false");
      mobileMenuOpenButton.setAttribute("aria-label", "Open navigation menu");
      unlockPageScroll();
      window.clearTimeout(hideMenuTimer);
      mobileMenu.removeEventListener("transitionend", hideMobileMenu);

      if (reducedMotion.matches) {
        hideMobileMenu();
      } else {
        mobileMenu.addEventListener("transitionend", hideMobileMenu, { once: true });
        hideMenuTimer = window.setTimeout(hideMobileMenu, 280);
      }

      if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus({ preventScroll: true });
      }
    };

    const openMobileMenu = () => {
      lastFocusedElement = document.activeElement;
      window.clearTimeout(hideMenuTimer);
      mobileMenu.removeEventListener("transitionend", hideMobileMenu);
      mobileMenu.hidden = false;
      mobileMenu.setAttribute("aria-hidden", "false");
      mobileMenuOpenButton.setAttribute("aria-expanded", "true");
      mobileMenuOpenButton.setAttribute("aria-label", "Close navigation menu");
      lockPageScroll();

      mobileMenu.getBoundingClientRect();
      mobileMenu.classList.add("is-open");
      mobileMenuCloseButton.focus({ preventScroll: true });
    };

    const toggleMobileMenu = () => {
      if (mobileMenu.classList.contains("is-open")) {
        closeMobileMenu();
        return;
      }

      openMobileMenu();
    };

    mobileMenuOpenButton.addEventListener("click", toggleMobileMenu);
    mobileMenuCloseButton.addEventListener("click", () => closeMobileMenu());

    mobileMenuLinks.forEach((link) => {
      link.addEventListener("click", () => closeMobileMenu(false));
    });

    mobileMenu.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusableItems = getMobileMenuFocusableItems();
      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];

      if (!firstItem || !lastItem) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        closeMobileMenu();
      }
    });

    const closeMobileMenuOutsideViewport = (event) => {
      if (!event.matches) {
        closeMobileMenu(false);
      }
    };

    if (mobileViewport.addEventListener) {
      mobileViewport.addEventListener("change", closeMobileMenuOutsideViewport);
    } else {
      mobileViewport.addListener(closeMobileMenuOutsideViewport);
    }
  }
}

const form = document.getElementById("contact-form");

if (form) {
  const status = form.parentElement ? form.parentElement.querySelector("[data-fs-error]") : null;
  const submitButton = form.querySelector("[data-fs-submit-btn]");
  const formMethod = form.getAttribute("method") || "POST";
  const formAction = form.getAttribute("action") || "";
  const successUrl = new URL(form.dataset.successUrl || "thank-you.html", window.location.href).href;
  const turnstileContainer = form.querySelector("[data-turnstile-container]");
  const turnstileSitekey = turnstileContainer ? turnstileContainer.dataset.sitekey : "";
  const turnstileTheme = turnstileContainer ? turnstileContainer.dataset.theme || "dark" : "dark";
  const defaultButtonLabel = submitButton ? submitButton.textContent : "";
  let turnstileLoadPromise;
  let turnstileWidgetId = null;
  let hasStartedTurnstile = false;

  const updateStatus = (message) => {
    if (!status) {
      return;
    }

    if (!message) {
      status.removeAttribute("data-fs-active");
      status.textContent = "";
      return;
    }

    status.textContent = message;
    status.setAttribute("data-fs-active", "");

    window.requestAnimationFrame(() => {
      status.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const setSubmitState = (isEnabled, label) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = !isEnabled;
    submitButton.textContent = label || defaultButtonLabel;
  };

  const getTurnstileResponse = () => {
    const responseField = form.querySelector('[name="cf-turnstile-response"]');

    return responseField ? responseField.value.trim() : "";
  };

  const handleTurnstileSuccess = () => {
    updateStatus("");
    setSubmitState(true, defaultButtonLabel);
  };

  const handleTurnstileError = (error) => {
    console.error("Turnstile error", error);
    updateStatus("Spam protection could not be verified. Refresh the page and try again.");
    setSubmitState(false, defaultButtonLabel);
  };

  const handleTurnstileExpired = () => {
    updateStatus("Verification expired. Please wait a moment and try again.");
    setSubmitState(false, defaultButtonLabel);

    resetTurnstile();
  };

  const resetTurnstile = () => {
    if (window.turnstile && turnstileWidgetId !== null) {
      window.turnstile.reset(turnstileWidgetId);
    }
  };

  const getSubmissionErrorMessage = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return "The message could not be sent. Please try again.";
    }

    try {
      const payload = await response.json();

      if (payload && Array.isArray(payload.errors) && payload.errors.length > 0) {
        return payload.errors
          .map((entry) => entry.message)
          .filter(Boolean)
          .join(" ");
      }
    } catch (error) {
      console.error("Formspree error payload could not be parsed", error);
    }

    return "The message could not be sent. Please try again.";
  };

  const loadTurnstileScript = () => {
    if (window.turnstile) {
      return Promise.resolve(window.turnstile);
    }

    if (turnstileLoadPromise) {
      return turnstileLoadPromise;
    }

    turnstileLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");

      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.turnstile) {
          resolve(window.turnstile);
          return;
        }

        reject(new Error("Turnstile did not become available after loading."));
      };
      script.onerror = () => {
        reject(new Error("Turnstile could not be loaded."));
      };

      document.head.appendChild(script);
    });

    return turnstileLoadPromise;
  };

  // Load Turnstile on user intent so the initial page visit stays free of third-party cookies.
  const startTurnstile = async () => {
    if (hasStartedTurnstile) {
      return;
    }

    if (!turnstileContainer || !turnstileSitekey) {
      handleTurnstileError(new Error("Missing Turnstile configuration."));
      return;
    }

    hasStartedTurnstile = true;
    setSubmitState(false, "Verifying...");

    try {
      const turnstile = await loadTurnstileScript();

      turnstileWidgetId = turnstile.render(turnstileContainer, {
        callback: handleTurnstileSuccess,
        "error-callback": handleTurnstileError,
        "expired-callback": handleTurnstileExpired,
        sitekey: turnstileSitekey,
        theme: turnstileTheme,
      });
    } catch (error) {
      hasStartedTurnstile = false;
      turnstileLoadPromise = null;
      handleTurnstileError(error);
    }
  };

  form.addEventListener("focusin", startTurnstile, { once: true });
  form.addEventListener("pointerdown", startTurnstile, { once: true });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!getTurnstileResponse()) {
      startTurnstile();
      updateStatus("Spam protection is still loading. Please wait a moment and submit again.");
      setSubmitState(false, "Verifying...");
      return;
    }

    updateStatus("");
    form.setAttribute("aria-busy", "true");
    setSubmitState(false, "Sending...");

    try {
      const response = await fetch(formAction, {
        body: new FormData(form),
        headers: {
          Accept: "application/json",
        },
        method: formMethod,
      });

      if (!response.ok) {
        const errorMessage = await getSubmissionErrorMessage(response);

        throw new Error(errorMessage);
      }

      window.location.assign(successUrl);
    } catch (error) {
      console.error("Form submission error", error);
      resetTurnstile();
      updateStatus(error instanceof Error ? error.message : "The message could not be sent. Please try again.");
      form.removeAttribute("aria-busy");
      setSubmitState(false, "Verifying...");
    }
  });
}
