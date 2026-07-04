# AGENTS.md — dukeaeroplane.com

Guidance for AI agents working on this project. Last updated: 2026-07-02.

## What this is

A static recreation of https://www.dukeaeroplane.com/ — the music/film site of
Galen Cassidy Peria (a.k.a. Duke Aeroplane). The original was built on
**Weebly** (not Wix, despite early assumptions); this rebuild exists so the
site can move to generic static hosting. All content, images, and the trailer
video were scraped from the live Weebly site on 2026-07-02.

Owner context: the user (Hugh Mackey) is the artist's friend and collaborator —
he is the producer/DP of the film featured on the site, and appears on the
film page. Content changes should stay faithful to the artist's voice.

## Architecture

Plain HTML/CSS/JS. No framework, no build step, no package manager. Deploy =
copy the folder to any static host.

- 9 pages at the root, filenames match the ORIGINAL Weebly URLs so inbound
  links survive the migration (`musics.html`, `theheartbeatthehammer.html`,
  `epk.html`, etc.). Do not rename them.
- `css/style.css` — single shared stylesheet, design tokens in `:root`.
- `js/main.js` — vanilla JS: mobile nav toggle, media-page carousel, lightbox.
- `images/` — all 55 site images (flattened basenames from Weebly's
  `/uploads/...` paths). `*_orig.*` files are the full-size versions.
- `video/heartbeat-trailer.mp4` (47 MB) + poster — self-hosted film trailer.
- Header/nav/footer markup is duplicated in every page (no templating). A
  change to shared chrome must be applied to all 9 files — use sed/grep.

## Conventions

- **Cache-busting is manual**: CSS/JS are linked as `style.css?v=N` /
  `main.js?v=N`. After editing either file, bump the version in ALL pages:
  `sed -i '' 's|main.js?v=7|main.js?v=8|' *.html`. Current: CSS v=4, JS v=8.
- Design tokens (preserve these — they're the original site's look):
  - Page bg `#242424`, content well `#000`, footer band `#BE1E2D`.
  - Heading red `--red-soft: #c23b3b` — 3.98:1 on black, passes WCAG AA for
    LARGE text only. Never use it below ~19px bold; that's why `.quote.red`
    has a 1.2rem floor.
  - Nav red `--red-nav: #d63e4a` — deliberately lightened from the original
    `#b2222c` to pass AA (4.65:1) at small sizes. Don't darken it back.
  - Headings: Josefin Slab uppercase; nav: Josefin Sans; body: Quicksand;
    accent: Special Elite (distressed typewriter — `--font-accent`, used only
    for pull-quotes/kickers/captions). All from Google Fonts.

## The "jazz layer" (added 2026-07-04)

A second, additive block at the bottom of `css/style.css` (marked `JAZZ LAYER`)
and a matching set of modules at the top of `js/main.js` add motion/texture on
top of the untouched original theme. Design brief: keep the black-and-red
Josefin/Quicksand aesthetic, but make it eye-catching, dynamic, and loose
("devil-may-care/bohemian"). Ground rules for extending it:

- **Graceful degradation is load-bearing.** JS adds `.js-anim` to `<html>`;
  the "hidden until revealed" CSS only applies under that class, so a no-JS or
  pre-JS page shows all content. The `@media (prefers-reduced-motion: reduce)`
  block at the very end force-shows everything and kills every loop/entrance —
  keep new effects covered there.
- **Scroll-reveal is automatic.** `main.js` selects `main .container > section,
  main > section, hr.redline`, tags sections `.reveal`, and an
  IntersectionObserver toggles `.in`. New pages get reveal + kinetic dividers
  for free — no per-page markup needed. Effects that fire *inside* a section
  (e.g. the homepage lyric lines) must key off `.reveal.in <descendant>`, NOT a
  class on the inner element (the observer only tags the section).
- **Texture layers (`.grain`, `.vignette`) are injected by JS**, not in markup,
  so they stay out of the 9 duplicated heads. They sit at z-index 149–150
  (above content/nav, below the lightbox at 200) with `pointer-events:none`.
- Homepage-only pieces live in `index.html`: `.hero` (full-bleed duotone
  portrait via grayscale img + red `mix-blend:color` tint + parallax),
  `.marquee` ticker, `.lyric-verse` (typed reveal), `.bio-collage` (polaroid
  snapshot + drop-cap). The hero/marquee break out of `.container` with
  negative margins that cancel `main`'s padding — they're direct children of
  `main`, not inside `.container`.
- **Interior page banner:** `.page-hero` is a shorter `.hero` (static image,
  no parallax — JS parallax is scoped to `.hero .hero-img` so it only touches
  the homepage). Reuses `.hero-img/-tint/-shade/-inner/-title/-kicker`.
- **Music jukebox:** `.album` cards (vinyl + `.album-meta`/`h2` + the original
  SoundCloud `.sc-embed` iframes preserved verbatim). `.vinyl` is pure CSS
  (grooves + `::after` red label / optional `<img>` cover + `::before`
  spindle); it spins on `.album:hover`.
- **Film cinema:** `.filmframe` (letterboxed title stage, full-bleed via
  negative margin like the hero), `.trailer-stage` (framed video), `.filmstrip`
  (perforated horizontal scroller — its `a` tags are wired into the lightbox
  selector in main.js), `.credits` (end-title layout). Bios stay as `.split`.
- **Collage passes (Phase 3):**
  - `.clipping` (EPK press quotes) — cream "pasted newspaper" cards with dark
    serif ink; `.tilt-l`/`.tilt-r` set the rotation, `.clipping-row` puts two
    side by side. Contrast is dark-on-cream so the old `.quote.red` AA floor no
    longer applies here.
  - `.typed-note` (Words, Dates) — cream sheet in the accent font with a
    blinking `.cursor`. Add `.tape` (shared class, translucent-red strip via
    `::after`) to any pasted element.
  - `.stamp` (Dates) — rotated red rubber "PAST" stamp inside `.event`.
  - `.product` + `.record-display` (Merch) — album `.sleeve` with a
    `.vinyl.disc` sliding out on hover.
- **Phasing:** ALL phases DONE — Phase 1 (foundation) + homepage hero,
  Phase 2 (film + music), Phase 3 (words/dates/media/epk/merch collage). Only
  page not restructured is `contact.html` (kept plain by design; its forms are
  the pre-existing Formspree TODO).
- Nav collapses to a menu button under 700px; between 700–1024px the nav type
  tightens so the full bar fits one line. Active page marked with
  `aria-current="page"` (set per page, remember it when adding pages).
- Accessibility is a requirement, not a nicety: focus-visible outlines,
  prefers-reduced-motion support, lightbox focus management, aria-live
  carousel counter all exist — keep them working.

## Verification

- `.claude/launch.json` defines a `static-site` server (`python3 -m
  http.server 8321`). Use the preview tools against http://localhost:8321/.
- Preview quirks discovered the hard way: smooth programmatic scrolls stall
  and native scroll events don't fire for programmatic scrolls in the embedded
  preview. The carousel JS has a 600ms settle-check fallback partly for this
  (and for real Safari, which has the same snap-vs-smooth-scroll stall).
  Verify carousel state via eval (`scrollLeft`, status text), not just
  screenshots. Screenshots often capture from the page top regardless of
  scroll position; the lightbox (position:fixed) screenshots fine.
- After CSS/JS edits, the preview caches aggressively — bump `?v=` and
  navigate with a `?fresh=' + Date.now()` query.

## Status

### Done
- All 9 pages built, responsive, faithful to the original look.
- Media page photo gallery is a snap-scroll carousel (arrows, keyboard,
  swipe, live counter) with click-through to a lightbox.
- Film-stills gallery (film page) and press photos (EPK) are grid + lightbox.
- Music/EPK use compact lazy-loaded SoundCloud embeds; videos are fluid 16:9
  YouTube iframes; trailer is a native `<video>` tag.
- WCAG AA contrast pass done (see tokens above); EPK quotes all render red.
- Film release references updated to 2026; footer says 2026.
- Booking email decoded from Cloudflare obfuscation:
  galencassidyperia@gmail.com (used as mailto on contact.html).

### Outstanding / TODO
1. **Forms are non-functional**: both forms on contact.html post to
   `https://formspree.io/f/YOUR_FORM_ID` (placeholder). User must create a
   Formspree (or similar) form and replace the ID in both places.
2. **Newsletter subscriber list** must be exported from the Weebly dashboard
   before the old account is closed.
3. **Words page** is a "Lyrics coming soon" placeholder (faithful to the
   original) — lyrics content may arrive later.
4. **Dates page** lists one event dated April 9, 2025 (now past). User was
   told; awaiting their call on removing/archiving it.
5. **No analytics** — old UA tag was dropped (dead since 2023). Add GA4/
   Plausible if requested.
6. Consider offloading the 47 MB trailer to YouTube/Vimeo if host bandwidth
   is a concern.
7. Not yet a git repository — worth `git init` before further work.
