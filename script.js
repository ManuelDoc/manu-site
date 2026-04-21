const form = document.getElementById("contact-form");

if (form) {
  const status = form.parentElement ? form.parentElement.querySelector("[data-fs-error]") : null;
  const submitButton = form.querySelector("[data-fs-submit-btn]");
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

    if (window.turnstile && turnstileWidgetId !== null) {
      window.turnstile.reset(turnstileWidgetId);
    }
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

  form.addEventListener("submit", (event) => {
    if (!getTurnstileResponse()) {
      event.preventDefault();
      startTurnstile();
      updateStatus("Spam protection is still loading. Please wait a moment and submit again.");
      setSubmitState(false, "Verifying...");
      return;
    }

    updateStatus("");
    form.setAttribute("aria-busy", "true");
    setSubmitState(false, "Sending...");
  });
}
