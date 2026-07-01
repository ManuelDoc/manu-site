---
name: static-site-change
description: Workflow for making a static HTML/CSS/vanilla-JS change in this repo — editing the main site, thank-you/404 pages, the hero rotator, the contact form, or adding/editing a self-contained microsite (e.g. andrea/). Use when the user asks to change a page, add a section, tweak styles, or scaffold a new client demo folder.
---

# Static site change

This repo has no build step, linter, or test suite. Follow this checklist for any change to HTML/CSS/JS files.

## 1. Scope the change

Decide which surface is affected:

- **Main site**: `index.html` + `styles.css` (also shared by `thank-you.html` and `404.html`).
- **Hero rotator**: `hero.js` (uses local `assets/vendor/gsap.min.js`).
- **Contact form**: the `#contact-form` markup in `index.html` plus `script.js`.
- **Scroll reveal**: `scroll-reveal.js`.
- **A microsite**: a lowercase root folder (e.g. `andrea/`) with its own `index.html`/`styles.css`/`assets/`.

## 2. Read before writing

Read the full contents of every file in scope, plus `AGENTS.md` and `CLAUDE.md` at the repo root for style, tone, and constraints. Do not guess at existing class names or CSS variables — check `styles.css` (or the microsite's own stylesheet).

## 3. Make the smallest correct change

- 2-space indentation; BEM-like classes (`block`, `block__element`, `block--modifier`).
- Code and identifiers in English; visible copy in British English.
- No new dependencies, frameworks, build tools, or external scripts.
- If touching the contact form: keep the Formspree action, `_gotcha` honeypot, `thank-you.html` redirect, and the Turnstile-after-interaction / disabled-until-verified behaviour intact.
- If touching the hero: keep the non-JS/no-motion fallback readable (plain text words still present in the DOM).
- If scaffolding a new microsite: lowercase folder name, self-contained `index.html` + `styles.css` (+ `assets/` if needed), relative paths only, add
  ```html
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="googlebot" content="noindex, nofollow, noarchive">
  ```
  if it's a demo, and `target="_blank" rel="noopener noreferrer"` on external links.

## 4. Check accessibility and performance

- Heading hierarchy still makes sense; landmarks (`header`, `main`, `nav`, `footer`) intact.
- Images have real `alt` text (or empty `alt` if decorative).
- Any new animation respects `prefers-reduced-motion`.
- Focus states remain visible; no keyboard traps introduced.
- No new render-blocking or third-party script added.

## 5. Manual validation (no automated tooling exists)

Suggest to the user, or perform if possible:

- Open the changed HTML file(s) directly in a browser and click through the change.
- If the contact form was touched, submit a test enquiry and confirm the `thank-you.html` redirect.
- Toggle "reduce motion" in OS settings (or devtools emulation) and re-check the page.
- Resize to a mobile width and check layout/tap targets.

## 6. Wrap up

Summarise in Spanish what changed, list the files touched, confirm no dependencies were added, and confirm no commit/push/deploy was performed unless explicitly requested.
