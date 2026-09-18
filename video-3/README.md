# Harrison Wills — concept C

A self-contained static microsite at `/video-3/`, the third Harrison Wills
proposal alongside `/video/` and `/video-2/`. It is `noindex`.

## Origin

Rebuilt by hand from the "Videographer C — desktop 1440" mockup exported from
Claude Design (`harrison/opcion C`). The export is a React-rendered artboard
with inline styles; only its values were kept (colours, type scale, spacing)
and everything was rewritten as plain HTML/CSS so it is responsive and needs
no runtime.

## Design

- Background `#0b0f14`, surface `#151b23`, text `#e8ecf0`, muted `#9aa5b1`,
  hairline `#26303b`, accent film yellow `#e9b949` (buttons carry the grain tile
  blended over it, so the accent reads as printed rather than flat).
- Type: Anybody (display, extended italic for the wordmark), Chivo (body),
  Azeret Mono (labels). Loaded from Google Fonts with `display=swap`.
- Hero: same structure as `/video-2/` — first-load intro (name fades in, the
  loop scales up to fill the viewport), REC dot, running timecode, frame
  corners, animated grain. Any scroll or key press skips the intro. The loop
  is `preload="none"`, starts when idle and is skipped under reduced motion
  or Data Saver; the poster carries the hero on its own.

## Motion

Two engines produce the same result, chosen per browser:

1. **Scroll-driven CSS.** `animation-timeline: view()` on the reveals, and
   `scroll(root)` on the progress bar. The compositor runs these, so they cost
   no main-thread work and track the scrollbar exactly. Chrome, Edge and
   Safari 18+ (~84% of users in 2026).
2. **IntersectionObserver fallback,** gated behind `@supports not
   (animation-timeline: view())`. Mainly Firefox stable, which still keeps the
   feature behind a flag.

Scroll timelines ignore `animation-delay`, so stagger is done by offsetting
each item's `animation-range` instead. The fallback uses `transition-delay`
with a `--i` index set in JS.

What animates, and why:

| Element | Motion |
| --- | --- |
| Hero loop | Drifts up as the section exits, for depth on the first scroll. Scoped to `html:not(.is-intro)` so it never fights the intro's scale-up |
| Progress bar | A hairline of accent across the top, tied to document scroll |
| Headings | Each line wipes up from behind its own mask, so type arrives as a block instead of fading |
| Work cards | The frame opens from the bottom while the picture settles out of an over-scaled, desaturated state: a print coming up in the tray |
| About photo | Same wipe, slower |
| Services, clients, Instagram, form | Staggered rise or pop |
| Hover | Focus brackets on card frames, underline on the card name, accent rule drawing across a service row |

The hidden starting state is gated behind a `.js` class set before paint, so
with scripting off everything renders in its final position. Everything sits
inside `prefers-reduced-motion: no-preference`, and the reduced-motion block
clears every transform, filter and clip-path.

## Files

- `index.html` — single page: hero, work grid with filters, about, services,
  clients, Instagram grid, contact, footer
- `styles.css` — all styling, no framework
- `site.js` — intro, hero loop, timecode, the fallback reveal engine, work
  filters and the WhatsApp form (composes a pre-filled
  `wa.me` message from the fields; without JS the form still opens WhatsApp)
- `assets/img/` — hero poster, six work stills, about portrait, twelve
  Instagram tiles, grain tile
- `assets/video/hero-loop.mp4` — shared with `/video-2/`

## Placeholders to confirm with Harrison

- WhatsApp number (`447700900123` everywhere)
- Email (`hello@harrisonwills.co.uk`)
- The bracketed line in the About section
- Client list
- Work cards link to `#contact` for now
