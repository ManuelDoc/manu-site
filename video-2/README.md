# Harrison Wills — concept site

A self-contained static microsite at `/video-2/`, built as a proposal for Harrison
Wills. It is `noindex` on every page.

## Positioning

Built directly from Harrison's questionnaire answers:

| Answer | How the site responds |
| --- | --- |
| "Professional portfolio and credibility" | Portfolio-led, no packages or pricing anywhere |
| "Brands who need a constant stream and variety of content" | The whole site sells continuity, not single films: the H1 is *"Not one film. A constant stream."*, and "The monthly set" is the commercial engine |
| Commercial, fashion, lifestyle, hospitality, product, social-first, photography | Exactly these seven in the marquee and the six services; no wedding, beauty or music language |
| "Simple selected work page" | One flat grid of six projects with light category filters — no nested category trees |
| Instagram only, "full feed if it stays lightweight" | A six-tile grid fetched lazily from Behold; no embed widget, no third-party script |
| Contact via Instagram DM and WhatsApp | WhatsApp is the primary CTA in the header, hero, contact block, every case study and the mobile dock. The form is the fallback |
| Wants Name, Email, Phone, Company/brand | Those four, plus "What are you looking to create?" and "Tell me about your project" |

Reference for tone was mustardmitt.com — same confidence and scale of type, but
a different system: warm off-white and ink instead of mustard and black, a
tally-light red accent, and a camera/viewfinder motif (REC dot, running
timecode, frame corners) rather than an agency layout.

## Pages

- `index.html` — home
- `work/index.html` — selected work, filterable
- `work/<slug>/index.html` — six case studies (`canteen-no-9`, `lumen-atelier`,
  `north-and-pine`, `salt-road`, `after-hours`, `the-front-room`)

## Files

- `styles.css` — the whole design system, no framework
- `site.js` — every interaction: sticky header, mobile menu, marquee, scroll
  reveals, hero loop, timecode, card previews, showreel, Instagram feed, form
- `favicon.svg`
- `assets/fonts/` — Archivo (variable) and JetBrains Mono, self-hosted
- `assets/img/` — graded frames, posters, OG cover
- `assets/video/` — hero loop, six card loops, showreel
- `assets/*.jpg|png` — the seven original production photos every generated
  asset is derived from. Keep them: without them nothing can be regenerated

## Placeholders to replace before this goes anywhere real

Everything below is invented. Nothing here is a real claim about Harrison.

| What | Where | Current value |
| --- | --- | --- |
| WhatsApp number | all pages | `447700900123` (Ofcom's reserved fictional range) |
| Email | `index.html` contact | `hello@harrisonwills.co.uk` |
| Instagram feed | `index.html` — `data-behold-url` | Manuel's feed. Needs Harrison's own Behold feed (behold.so, connected to his Business/Creator account) |
| Six projects | `work/` | Invented clients, briefs, numbers and outcomes |
| Testimonials | `index.html` | Labelled "Sample testimonials — placeholder copy" on the page |
| Showreel | `assets/video/showreel.mp4` | 17s cut assembled from the seven stock production photos, silent |
| Imagery | `assets/img/` | Stock behind-the-scenes photos, graded to one look. Harrison's actual work should replace all of it |
| Location | hero, studio | Cardiff, UK |

The form posts to Manuel's own Formspree endpoint (`xzdygglk`) with
`source=harrison-wills-video`, and redirects to `/thank-you.html`. Turnstile
uses the same site key as the main site and only loads once someone touches the
form.

## How the assets were made

All generated with ffmpeg from the seven originals — one shared grade so a set
of unrelated stock photos reads as a single body of work:

```
curves=master='0/0.035 0.22/0.20 0.5/0.51 0.78/0.82 1/0.985':
       r='0/0.02 0.5/0.5 1/1':b='0/0.06 0.5/0.5 1/0.97',
eq=contrast=1.10:saturation=0.90:gamma=0.99,
unsharp=5:5:0.5:5:5:0.0, vignette, noise=alls=5
```

Video loops are ping-pong `zoompan` moves (zoom in, then back out over the same
duration) so they loop seamlessly with no visible cut. Grain is deliberately
left out of the encodes — it destroys compression — and added over the hero in
CSS instead.

## Behaviour worth knowing

- **The hero loop is decorative.** It is `preload="none"`, starts only when the
  page is idle, and is skipped entirely under `prefers-reduced-motion`, Data
  Saver, or a 2G/3G connection. The poster carries the page on its own.
- **Posters never disappear on trust.** A card or the showreel only hides its
  still once the video fires a real `playing` event, so a blocked or slow video
  can never leave an empty black frame.
- **Card previews adapt to input.** Mouse: play on hover. Touch: only the card
  nearest the middle of the screen plays, one at a time.
- **Content does not depend on JavaScript.** Scroll reveals are gated behind a
  `.js` class set inline in `<head>`, so with scripting off everything is
  simply visible.
- **The Instagram section removes itself** if the feed fails or returns
  nothing, rather than showing an empty strip.

## Performance

Measured locally, cache disabled, 1440×900:

- First load: **679 KB** across 10 requests (382 KB of that is the hero loop)
- Whole page after scrolling everything: **1.68 MB**
- FCP 144 ms, DOMContentLoaded 85 ms, 455 DOM nodes

## Testing

There is no build step. Open the files in a browser, or serve the repo root:

```
python3 -m http.server 8899
# then http://127.0.0.1:8899/video-2/
```

Worth checking by hand: the hero at 320px wide, the mobile menu, the work
filters, the showreel, and the form with Turnstile.
