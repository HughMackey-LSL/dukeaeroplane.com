# AGENTS.md — dukeaeroplane.com

Guidance for AI agents working on this project. Last updated: 2026-07-18.

## What this is

The music/film site of Galen Cassidy Peria (a.k.a. Duke Aeroplane). The original
was built on **Weebly** (not Wix, despite early assumptions); content, images,
and the trailer were scraped from the live Weebly site on 2026-07-02. The site is
now generated with **Eleventy** and edited through **TinaCMS**, deployed on
**Cloudflare Pages**. (It began as hand-authored root HTML; those root pages were
removed once the Eleventy build reached parity — the site is Eleventy-only now.)

Owner context: the user (Hugh Mackey) is the artist's friend and collaborator —
he is the producer/DP of the film featured on the site, and appears on the
film page. Content changes should stay faithful to the artist's voice.

## Architecture

Eleventy (v3) build under `eleventy-prototype/`, with TinaCMS for editing. The
design/interactivity assets at the repo root are the real, original site files —
`.eleventy.js` passthrough-copies them into the build untouched.

- **Pages** are `.njk` templates in `eleventy-prototype/src/` (`index.njk`,
  `musics.njk`, `theheartbeatthehammer.njk`, …); `permalink` keeps the output
  filenames matching the ORIGINAL Weebly URLs so inbound links survive. Blog
  posts are `src/posts/*.md`.
- **Shared chrome** (header/nav/footer + `<head>`) lives in ONE place:
  `src/_includes/base.njk`. No more per-page duplication — edit it once.
- **Global content** (copyright, contact address) is `src/_data/site.json`,
  editable via TinaCMS.
- `css/style.css` (repo root) — single shared stylesheet, design tokens in
  `:root`. Passthrough-copied to `_site/css/`.
- `js/main.js` (repo root) — vanilla JS: nav toggle, carousel, lightbox, and the
  contact-form AJAX submit. Passthrough-copied to `_site/js/`.
- `images/` (repo root) — all site images (flattened basenames from Weebly's
  `/uploads/...` paths). `*_orig.*` files are the full-size versions.

## Conventions

- **Cache-busting is automatic**: `base.njk` links assets through the
  `cacheBust` filter in `.eleventy.js`, which appends a short hash of the file's
  own bytes (`style.css?v=5a9e00c0`). It changes exactly when the file changes
  and stays put when it doesn't, so there is nothing to remember after a CSS/JS
  edit and deploys that touch no assets don't bust anyone's cache. Covers
  `css/style.css`, `js/main.js`, `assets/extras.css`, `assets/announce.js`.
  `../css` and `../js` are watch targets so a dev-server edit re-renders the
  HTML rather than only re-copying the file. This replaced a hand-typed `?v=N`
  that sat at 15 across several CSS commits — returning visitors kept the stale
  stylesheet, which is exactly how it fails when nobody remembers to bump it.
- **Words pieces keep their authored line breaks through CSS, not `<br>`.**
  Tina's rich-text field writes a Shift+Enter soft break as a plain newline
  inside the paragraph and parses that same newline back as a break — so the
  editor shows a line break, but CommonMark calls a bare newline a *soft* break
  and renders it as a space. `.work-body p` is `white-space: pre-line`
  (`assets/extras.css`) to honour them. In the CMS: Enter = a new stanza (its
  own `<p>`), Shift+Enter = a line within one; an empty paragraph is dropped on
  save, so Enter twice will not make a gap. Do **not** reach for a global
  markdown `breaks: true` instead — the legacy blog post
  `src/posts/higher-ground-back-on-vinyl.md` is hand-wrapped at ~80 columns and
  would sprout `<br>`s mid-sentence. Tina itself never wraps: it writes a
  paragraph as one long line, so inside a Words piece every newline is
  deliberate.
- **Audio embeds**: SoundCloud is `.sc-embed`, Bandcamp is `.bc-embed`; both
  appear on Music and the EPK. The Bandcamp player is fluid but stops growing at
  700px, so `.bc-embed iframe` is capped there and centred — past that the frame
  is wider than what it draws and the player sits pinned left. Its interior (the
  `#474747` panel, the type, the controls) is a cross-origin iframe and cannot
  be styled; `bgcol` only selects a light/dark theme and `linkcol` sets the link
  colour.
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
- **Texture layers (`.grain`, `.vignette`) are injected by JS**, not in markup.
  They sit at z-index 149–150 (above content/nav, below the lightbox at 200)
  with `pointer-events:none`.
- Homepage-only pieces live in `index.njk`: `.hero` (full-bleed duotone
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
- **Phasing:** ALL design phases DONE — Phase 1 (foundation) + homepage hero,
  Phase 2 (film + music), Phase 3 (words/dates/media/epk/merch collage). The
  `contact.njk` page is kept plain by design (mailing address + a single
  Formspree contact form).
- Nav collapses to a menu button under 700px; between 700–1024px the nav type
  tightens so the full bar fits one line. Active page marked with
  `aria-current="page"` (set per page, remember it when adding pages).
- Accessibility is a requirement, not a nicety: focus-visible outlines,
  prefers-reduced-motion support, lightbox focus management, aria-live
  carousel counter all exist — keep them working.

## Verification

- Run the Eleventy dev server from `eleventy-prototype/` (`npm start`, port
  8082) and use the preview tools against http://localhost:8082/. The
  `.claude/launch.json` `eleventy-prototype` entry starts it.
- Preview quirks discovered the hard way: smooth programmatic scrolls stall
  and native scroll events don't fire for programmatic scrolls in the embedded
  preview. The carousel JS has a 600ms settle-check fallback partly for this
  (and for real Safari, which has the same snap-vs-smooth-scroll stall).
  Verify carousel state via eval (`scrollLeft`, status text), not just
  screenshots. Screenshots often capture from the page top regardless of
  scroll position; the lightbox (position:fixed) screenshots fine.
- After CSS/JS edits the asset hash changes with the file, so a plain reload
  picks the change up; if a page still looks stale, check the served `?v=`
  against the file rather than reaching for a `?fresh=` query.
- The dev server can keep serving a **stale layout** after an edit to
  `_includes/` or `.eleventy.js` — it reports a rebuild but emits the old
  markup. Restart it (or run `npm run build:eleventy` and read `_site/`) when a
  template change doesn't show up.

## Status

### Done
- All pages built via Eleventy, responsive, faithful to the original look;
  deployed on Cloudflare Pages, edited through TinaCMS.
- Media page photo gallery is a snap-scroll carousel (arrows, keyboard,
  swipe, live counter) with click-through to a lightbox.
- Film-stills gallery (film page) and press photos (EPK) are grid + lightbox.
- Music/EPK use compact lazy-loaded SoundCloud and Bandcamp embeds; videos are
  fluid 16:9 YouTube iframes; the film trailer is an embedded YouTube video (the
  47 MB self-hosted mp4 was dropped — over Cloudflare Pages' 25 MB per-file
  limit).
- WCAG AA contrast pass done (see tokens above); EPK quotes all render red.
- Film release references updated to 2026; footer says 2026.
- The direct booking email (mailto link) was removed from `contact.njk` for
  professionalism/security — the contact form is now the only way to reach the
  Duke online. Do not re-add the address to any page.
- Contact form is wired to Formspree (`formspree.io/f/mlgqbllz`, → Galen's
  Gmail) with a honeypot and inline AJAX success/error in `main.js`.

### Outstanding / TODO
1. **Formspree form confirmation**: Galen must click Formspree's one-time
   "confirm this form" email before submissions forward to his inbox.
2. **Words page** now carries real content, authored by Galen in TinaCMS and
   grouped as Lyrics / Poetics / Short Works. `A-Congress-of-Cats.md` still has
   every line as its own paragraph (written before the Shift+Enter rule was
   documented) and reads uniformly double-spaced until he re-breaks it; the
   other pieces are correct. To rename a piece, the **Rename** action is in the
   collection **list** view's per-row menu (beside Duplicate/Delete), not in the
   editing form; it is gated on `ui.allowedActions.delete`, which defaults to
   true. Renaming changes the file and so the URL, since the permalink is
   `{{ page.fileSlug }}.html`.
3. **Dates page** — check whether the listed event is past and needs
   archiving.
4. **No analytics** — old UA tag was dropped (dead since 2023). Add GA4/
   Plausible if requested.
5. **DNS** — point `dukeaeroplane.com` at Cloudflare Pages at cutover.
