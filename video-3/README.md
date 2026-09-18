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
  hairline `#26303b`, accent cyan `#4fd1e8`.
- Type: Anybody (display, extended italic for the wordmark), Chivo (body),
  Azeret Mono (labels). Loaded from Google Fonts with `display=swap`.
- Grain overlay on the hero only, from a 256px tile.

## Files

- `index.html` — single page: hero, work grid with filters, about, services,
  clients, Instagram grid, contact, footer
- `styles.css` — all styling, no framework
- `site.js` — work filters and the WhatsApp form (composes a pre-filled
  `wa.me` message from the fields; without JS the form still opens WhatsApp)
- `assets/img/` — hero frame, six work stills, about portrait, twelve
  Instagram tiles, grain tile

## Placeholders to confirm with Harrison

- WhatsApp number (`447700900123` everywhere)
- Email (`hello@harrisonwills.co.uk`)
- The bracketed line in the About section
- Client list
- Work cards link to `#contact` for now
