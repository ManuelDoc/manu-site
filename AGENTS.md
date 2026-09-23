# AGENTS.md

Single source of truth for every coding agent working on this repo (Claude Code,
Codex, others), on Manuel's Mac and on the VPS. `CLAUDE.md` imports this file
and only adds Claude-specific notes.

This file is versioned and **deployed with the site**, so it can be publicly
readable. Never put credentials, IPs, auth details or server internals here.
Server operations live only on the VPS (see "Where other context lives").

If you find something here that is no longer true, fix this file in the same
change. When you remove something, say what was removed and why, so the next
agent knows it was intentional.

## Communication

- Reply to Manuel in Spanish, with correct accents, unless he asks for another language.
- Write code, comments, identifiers, branch names and commit messages in English.
- Keep visible website copy in British English, except in `es/` (Spanish).
- Scope is exact: change what was asked, nothing else. No drive-by refactors.
- Finish with: what changed, files changed, commands run, and links or steps to test.

## Where this repo runs

The same Git repo (`github.com/ManuelDoc/manu-site`, branch `main`) is checked out in several places:

| Place | Role |
|---|---|
| Manuel's Mac, `~/proyectos/personal/manu-site` | Main authoring copy. Manuel pushes to GitHub from here. |
| VPS `/opt/stacks/static-site/site` | **Live**. Served at `https://manueldocampo.com` by the Caddy container `static-site`. |
| VPS `/opt/stacks/static-site/staging` | **Staging**. Previewed at `/staging/`. |
| VPS `/opt/stacks/static-site/previews/<name>` | Branch previews. |

Rules that follow from this:

- **Sync first.** The Mac and GitHub are often ahead of the VPS. On the VPS, run `git pull` in the checkout before touching it. It has already happened that a folder existed untracked on the VPS while it was committed on GitHub.
- **On the VPS, work on staging by default.** Touch live only when Manuel explicitly asks to publish. Publish with `/opt/stacks/static-site/publish-staging-to-live.sh` and verify the live site afterwards.
- **On the Mac, edit the working copy directly.** There is nothing to deploy from the Mac.

## Git

- Agents never run `git commit` or `git push` unless Manuel asks for it in that turn.
- Exception to be aware of: on the VPS, the **Codex VPS Panel commits and pushes successful jobs automatically** (staging, live and previews). This is the panel's behaviour, not the agent's. So never leave half-finished or broken changes in a VPS checkout.
- Do not change remotes. Commit messages: short, descriptive, in English.

## Technology

- Static HTML, plain CSS, vanilla JavaScript. No framework, no build step, no linter, no test suite, no versioned `package.json`.
- Local vendored GSAP (`assets/vendor/gsap.min.js`, plus `ScrollTrigger.min.js`).
- Served by Caddy in Docker on a VPS. Deployment and server config are **not** in this repo.
- Contact forms post to `/api/notify`, a small backend container that lives outside this repo (see "Forms").
- Third-party services currently used: Cloudflare Turnstile (forms), Cloudflare Web Analytics (all public pages), Behold.so JSON feed (Instagram slider). Do not add others without being asked.

Do not introduce React, Next.js, Vue, Astro, Vite, Webpack, SCSS, Tailwind, npm tooling or any build system unless Manuel explicitly asks. Preferred order for visual work: HTML/CSS first, small vanilla JS if needed, local GSAP for high-quality motion only when CSS/JS is not enough.

## Source structure

Root (main site):

- `index.html`: main English site.
- `styles.css`: shared by `index.html`, `thank-you.html`, `404.html` (and `es/`).
- `script.js`: contact form logic (Turnstile, submission).
- `hero.js`: hero word rotator (GSAP).
- `scroll-reveal.js`: lightweight reveal on scroll for section blocks.
- `theme.js`: light/dark toggle. The initial theme is set by an inline snippet in `<head>` before first paint; this script only wires the button. Dark `#08111f`, light `#f7fafd`.
- `instagram.js`: self-contained Instagram slider fed by a public Behold.so JSON URL.
- `thank-you.html`, `404.html` + `404.js`, `favicon.svg`.
- `assets/`: `vendor/` (GSAP), `decorative/` (pixel-art bots and Manu illustrations), `blog/`, `logo-pixel.svg`.

Sections and pages:

- `es/`: Spanish version of the main site (`index.html`, `thank-you.html`, `blog/`). Linked with `hreflang` en/es/x-default. **Changes to the main site's content usually need the same change in `es/`.**
- `blog/`: blog index and posts (e.g. `blog/web-mcp/`). Mirrored in `es/blog/`.
- `decorations/`: internal library of the decorative pixel-art illustrations.
- `styleguide/`: internal style guide (noindex).
- `login/`: "Panel" page (noindex).

Client work (all noindex, self-contained):

- `andrea/`: Andrea's Closet Millinery landing page (see below).
- `video/`, `video-2/`, `video-3/`: Harrison Wills concept sites. `video-2/` and `video-3/` have their own `README.md`; read it before editing.
- `harrison/`: Harrison Wills proposed site structure (wireframes). Published from `main` on 2026-09-21.
- `harrison-wills-questionnaire/`: private client questionnaire.
- `research/`: research and build plan behind the Harrison sites.

Ignored/local-only: `node_modules/`, `dist/`, `.claude/settings.local.json`, `.vps-agents/`. Never treat them as source, never edit them.

## Must-know traps

### Cache-busting is mandatory

Caddy sends no `Cache-Control`, so browsers cache heuristically. If you replace a CSS, JS, image or video file **keeping the same name**, Manuel will not see the change, not even with a hard reload (video is worse, because of range requests).

Always bump the query string on the reference in the HTML, e.g. `styles.css?v=20260810-forms` → `styles.css?v=YYYYMMDD-NN`. Checking that the server returns the new file proves nothing about what the browser shows.

### Cloudflare Web Analytics on every public page

All public HTML pages load the Cloudflare Web Analytics beacon via a manual snippet just before `</body>`. **Every new public page must include the same snippet** (copy it from `index.html`). Only analytics is enabled: DNS stays at GoDaddy and Cloudflare is not a proxy or cache.

### Verify visually before saying "done"

Manuel reviews from his iPhone and has already been told twice that something was finished when it was not visible. For visual changes, look at the rendered page at mobile width (390×844) with your own eyes, not just the status code. On the Mac, open the file in a browser. On the VPS, a headless Chromium is available (details in the VPS notes). Screenshots taken with a virtual time budget can catch opacity or transform transitions mid-fade. That is not a bug.

## Editing rules

Before editing: read the relevant files in full, understand nearby style, prefer the smallest safe change, and do not assume a build system or that ignored folders are source.

When editing, preserve static deployment, accessibility, performance, SEO basics and secure external links. Do not touch unrelated files, and do not make broad rewrites unless asked.

- 2-space indentation in HTML, CSS and JS.
- BEM-like classes: `block`, `block__element`, `block--modifier`.
- CSS custom properties in `:root` where appropriate. Responsive with `clamp()`, grid, flexbox and media queries.
- JS small, readable, vanilla. Comments only when they explain intent.

## Accessibility

Always preserve or improve: skip links, semantic landmarks, meaningful heading hierarchy, `aria-label`/`aria-labelledby` where useful, `aria-live` only where appropriate, `sr-only` text, visible `:focus-visible` states, real `alt` text (empty `alt` for decorative images), good colour contrast (in both themes), and reduced-motion fallbacks.

Every animation must respect `prefers-reduced-motion`. Important content must never be available only through animation or JavaScript.

## Performance

Low JS cost, small DOM, no unnecessary dependencies, no layout shift, no render-blocking third-party scripts, optimised images, local assets where reasonable, good mobile performance and Lighthouse scores. Avoid large assets, heavy animation libraries, particle systems, WebGL and huge video backgrounds unless explicitly asked and the trade-off is explained.

## Main website

`index.html` is Manuel's freelance website for small businesses. Sections: header, hero ("Freelance web Developer/Designer/Hosting/Maintenance"), who it's for, packages, hosting and maintenance, services, example work, about, Instagram feed, final CTA, contact form, footer.

Current offer:

- Starter £750, Standard £950, Premium £1,500.
- First year of hosting and basic maintenance included; then £180/year or £15/month.

Services: small business websites, landing pages, WordPress or lightweight static builds, hosting and maintenance, basic SEO and accessibility, short promo videos for social as an optional extra.

Visual direction: dark, premium, technical, modern and memorable, with a light theme also available. Fonts `"Avenir Next", "Trebuchet MS", sans-serif`. Dark background `#08111f`, text `#f4f7fb`, accents `#2dd4bf` and `#38bdf8`, gradients and dark cards. Good directions: strong typography, elegant word rotation, subtle cinematic motion, radial glows, SVG details, light reveal effects, tasteful depth. Avoid childish effects, generic template card layouts and anything that harms readability.

## Hero animation

`index.html` loads `assets/vendor/gsap.min.js`, `hero.js`, `script.js`, `scroll-reveal.js`, `theme.js` and `instagram.js`. `hero.js` animates `.hero-word-rotator` (Developer, Designer, Hosting, Maintenance) with a scramble effect only if GSAP exists and reduced motion is off. It must fail gracefully. The hero message must be readable without JS.

## Forms

Since 2026-08-10, forms **do not post to Formspree directly**. They post to `/api/notify` (the `whatsapp-notify` container on the VPS, outside this repo), which:

1. writes every submission to a log first, so nothing is lost,
2. sends a WhatsApp alert,
3. forwards to Formspree only as a secondary archive.

Why: Formspree's own captcha check could not validate the site's Turnstile token, so every submission was silently marked as spam and lost. **Do not "fix" the form back to a Formspree action.**

Keep intact: `action="/api/notify"`, `data-success-url="thank-you.html"`, the `_next` field, the `_gotcha` honeypot, Turnstile loaded only after the user interacts with the form, and the submit button disabled until Turnstile completes.

## Supporting pages

- `thank-you.html`: confirmation page ("Thanks. Your enquiry is on its way."), uses `styles.css`, links back home.
- `404.html`: custom 404 with absolute paths (`/favicon.svg`, `/styles.css`, `/404.js`). Playful three-button interaction that redirects to `/` after the third ordered click, with a direct fallback link to `/`.

## Client demos and microsites

- Root-level lowercase slug folder (`client-name/`), with `index.html`, `styles.css` and `assets/` if needed.
- Static and self-contained, relative paths inside. Do not share the main `styles.css`/JS unless asked.
- Demos get:

```html
<meta name="robots" content="noindex, nofollow, noarchive">
<meta name="googlebot" content="noindex, nofollow, noarchive">
```

- External links: `target="_blank" rel="noopener noreferrer"`, with `sr-only` new-tab warnings.
- Include the Cloudflare Web Analytics snippet if the page is public.
- Lowercase routes only: Linux paths are case-sensitive. Do not rename existing public paths without checking the implications.

### Andrea

`andrea/` is a boutique/editorial landing page for Andrea's Closet Millinery that sends traffic to her Shopify store (`https://andreasclosetmillinery.com/`). Own CSS, no JS, noindex. Contact: `+44 (0) 7379414729`, `andreaclosetcardiff@gmail.com`. Style: light background `#f8f7f4`, text `#173948`, gold `#9f8150`; display serif `"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif`; body `"Avenir Next", "Segoe UI", sans-serif`; generous whitespace, soft cards, large imagery.

### Harrison Wills

- Use `research/videographer-website-best-practices-2026.md` as the detailed research source and `research/videographer-website-build-plan.md` as the condensed build guide.
- Position him around commercial video, brand content, fashion, beauty, lifestyle, hospitality, restaurants, music artists, product videos, social content, personal branding and creative campaigns. **Not** primarily a wedding videographer.

## Routes that must keep working

- `https://manueldocampo.com` and `https://manueldocampo.com/es/`
- `https://manueldocampo.com/andrea/` (and `/Andrea` redirects there)
- Every published microsite folder above.

A separate private AI app lives on its own subdomain and is not part of this repo. Do not move it under a path of the main domain.

## Where other context lives

- **VPS server operations** (Caddy, Docker Compose, services, publishing, recovery, known server traps): only on the VPS, in `/root/.codex/AGENTS.md` and Claude's VPS memory. They are intentionally not in this file because this repo is deployed publicly. If you are on the VPS and about to touch anything outside the site checkout, read those first.
- **Agent tooling in this repo:** `.claude/agents/static-site-maintainer.md` and `.claude/skills/static-site-change/`. Both defer to this file.
- **Extra VPS-only skills** (GSAP, motion design, design-dna) live in `/opt/stacks/static-site/.claude/skills/` and only load for sessions on the VPS.

## Non-goals

This is not a WordPress project, even though Manuel works with WordPress professionally. Do not add PHP, theme structure, CMS assumptions or build tooling. Do not edit `node_modules/` or `dist/`. Do not assume Caddy or Docker config lives here.

## Changelog of this file

- 2026-09-23: merged the Mac `AGENTS.md` (previously git-ignored and never on the VPS) with the VPS `staging/AGENTS.md` and the site-relevant parts of the Codex VPS notes. Updated: forms now go through `/api/notify` (the Formspree-direct rule was obsolete), full folder map, staging/live workflow, cache-busting, Cloudflare Analytics, theme toggle, `es/`. Server internals deliberately left on the VPS only.
