const form = document.getElementById("contact-form");

if (form) {
  const status = form.parentElement ? form.parentElement.querySelector("[data-fs-error]") : null;
  const submitButton = form.querySelector("[data-fs-submit-btn]");
  const defaultButtonLabel = submitButton ? submitButton.textContent : "";

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

  const syncSubmitStateWithToken = () => {
    if (getTurnstileResponse()) {
      updateStatus("");
      setSubmitState(true, defaultButtonLabel);
      return true;
    }

    return false;
  };

  setSubmitState(false, "Verifying...");

  const tokenObserver = window.setInterval(() => {
    if (syncSubmitStateWithToken()) {
      window.clearInterval(tokenObserver);
    }
  }, 400);

  window.onTurnstileSuccess = () => {
    updateStatus("");
    setSubmitState(true, defaultButtonLabel);
    window.clearInterval(tokenObserver);
  };

  window.onTurnstileError = (errorCode) => {
    console.error("Turnstile error", errorCode);
    updateStatus("Verification failed. Refresh the page and try again.");
    setSubmitState(false, defaultButtonLabel);
  };

  window.onTurnstileExpired = () => {
    updateStatus("Verification expired. Please wait a moment and try again.");
    setSubmitState(false, defaultButtonLabel);
  };

  form.addEventListener("submit", (event) => {
    if (!getTurnstileResponse()) {
      event.preventDefault();
      updateStatus("Verification is still loading. Please wait a moment and submit again.");
      setSubmitState(false, defaultButtonLabel);
      return;
    }

    updateStatus("");
    form.setAttribute("aria-busy", "true");
    setSubmitState(false, "Sending...");
  });
}
