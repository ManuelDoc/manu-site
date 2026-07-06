// Light/dark theme toggle. The initial theme is applied by an inline snippet
// in <head> (before first paint); this script wires up the toggle button.
(() => {
  const STORAGE_KEY = "theme";
  const root = document.documentElement;
  const THEME_COLORS = { dark: "#08111f", light: "#f7fafd" };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", THEME_COLORS[theme] || THEME_COLORS.dark);
    }

    // Keep the Turnstile widget theme in sync (read lazily by script.js).
    const turnstile = document.querySelector("[data-turnstile-container]");
    if (turnstile) {
      turnstile.dataset.theme = theme;
    }
  };

  applyTheme(root.dataset.theme === "light" ? "light" : "dark");

  const buttons = document.querySelectorAll("[data-theme-toggle]");

  const updateLabels = () => {
    const isLight = root.dataset.theme === "light";
    const isSpanish = (root.lang || "").toLowerCase().startsWith("es");
    const label = isLight
      ? (isSpanish ? "Cambiar a modo oscuro" : "Switch to dark mode")
      : (isSpanish ? "Cambiar a modo claro" : "Switch to light mode");

    buttons.forEach((button) => button.setAttribute("aria-label", label));
  };

  const reducedMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";

      const run = () => {
        applyTheme(next);
        updateLabels();
      };

      if (reducedMotion && reducedMotion.matches) {
        run();
      } else if (document.startViewTransition) {
        // Full-page cross-fade (also blends the background gradients).
        document.startViewTransition(run);
      } else {
        // Fallback: morph colours in place for browsers without view transitions.
        root.classList.add("theme-transition");
        run();
        window.setTimeout(() => root.classList.remove("theme-transition"), 550);
      }

      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (error) {
        /* private mode: theme lasts for this page view only */
      }
    });
  });

  updateLabels();
})();
