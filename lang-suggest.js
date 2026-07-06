// Suggests the Spanish version to visitors whose browser prefers Spanish.
// Suggestion only (dismissible, remembered) — never an automatic redirect.
(() => {
  const STORAGE_KEY = "lang-suggest-dismissed";

  try {
    if (window.localStorage.getItem(STORAGE_KEY)) {
      return;
    }
  } catch (error) {
    return;
  }

  const languages = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ""];
  const prefersSpanish = languages.some(
    (lang) => typeof lang === "string" && lang.toLowerCase().startsWith("es")
  );

  if (!prefersSpanish) {
    return;
  }

  const banner = document.createElement("div");

  banner.className = "lang-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Sugerencia de idioma");
  banner.lang = "es";

  const message = document.createElement("p");
  message.textContent = "Esta página también está disponible en español.";

  const link = document.createElement("a");
  link.className = "button button--small button--primary";
  link.href = "/es/";
  link.hreflang = "es";
  link.textContent = "Ver en español";

  const close = document.createElement("button");
  close.className = "lang-banner__close";
  close.type = "button";
  close.setAttribute("aria-label", "Cerrar aviso");
  close.textContent = "✕";

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch (error) {
      /* storage unavailable: dismiss for this page view only */
    }

    banner.remove();
  };

  close.addEventListener("click", dismiss);
  link.addEventListener("click", () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch (error) {
      /* ignore */
    }
  });

  banner.append(message, link, close);
  document.body.appendChild(banner);
})();
