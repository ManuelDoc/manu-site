(function () {
  "use strict";

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
