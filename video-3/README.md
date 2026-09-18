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

## Files

- `index.html` — single page: hero, work grid with filters, about, services,
  clients, Instagram grid, contact, footer
- `styles.css` — all styling, no framework
- `site.js` — intro, hero loop, timecode, work filters and the WhatsApp form (composes a pre-filled
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
