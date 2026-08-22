# dukeaeroplane.com

Website for Duke Aeroplane (Galen Cassidy Peria) — musician and subject of the
film *The Heartbeat, The Hammer*. Originally on Weebly; rebuilt as a static site
and now generated with **Eleventy** and edited through **TinaCMS**, deployed on
**Cloudflare Pages**.

## Where the site lives

The whole site is under [`eleventy-prototype/`](eleventy-prototype/):

```
eleventy-prototype/
  src/                 Page templates (*.njk), blog posts (posts/*.md), data
    _includes/base.njk Shared header/nav/footer layout (one place, not per-page)
    _data/site.json    Global content: copyright, contact address
  .eleventy.js         Build config — also passthrough-copies ../css, ../js, ../images
  tina/                TinaCMS schema + config
  package.json         Build/dev scripts
```

The design assets are shared with the build from the repo root and are the real,
original site files — Eleventy copies them in untouched:

```
css/style.css   Single shared stylesheet (design tokens in :root)
js/main.js      Vanilla JS: nav toggle, carousel, lightbox, contact-form submit
images/         All photos/artwork from the original site
```

> The old hand-authored root HTML pages (`index.html`, `contact.html`, …) were
> removed once the Eleventy build reached parity — the site is Eleventy-only now.
> **Edit pages in `eleventy-prototype/src/*.njk`, not at the root.**

## Develop

```
cd eleventy-prototype
npm install
npm start        # Eleventy dev server at http://localhost:8082
npm run build    # = tinacms build && eleventy → outputs to _site/
```

See [`eleventy-prototype/TINA-SETUP.md`](eleventy-prototype/TINA-SETUP.md) for the
TinaCMS / Tina Cloud setup and the Cloudflare Pages build configuration.

## Editing conventions

- **Pages** are `.njk` templates in `src/`; shared chrome lives once in
  `src/_includes/base.njk`. Global content (address, copyright) is in
  `src/_data/site.json` — editable through TinaCMS.
- **Cache-busting is automatic**: `base.njk` links assets through a `cacheBust`
  filter that appends a hash of the file's own bytes, so the URL changes when
  the file does and nothing has to be remembered after a CSS/JS edit.
- **Words pieces** (lyrics/poetics) keep the line breaks their author typed:
  in the CMS, Enter starts a stanza and Shift+Enter starts a line within one.
  [`AGENTS.md`](AGENTS.md) covers why that relies on `white-space: pre-line`
  rather than `<br>`; TINA-SETUP.md has the version to hand an editor.
- Design tokens and the motion/texture "jazz layer" conventions are documented
  in [`AGENTS.md`](AGENTS.md) — the same `css/style.css` and `js/main.js` drive
  the Eleventy output, so that guidance still applies.

## Things to finish before/after launch

1. **Contact form** — wired to Formspree (`formspree.io/f/mlgqbllz`), delivering
   to Galen's Gmail, with a honeypot and inline success/error handling in
   `js/main.js`. Galen must click Formspree's one-time "confirm this form" email
   for submissions to start forwarding.
2. **Newsletter** — the signup form was removed for now (no active newsletter).
   Weebly still has the old subscriber list; export it before closing that
   account, for whenever a newsletter is set up.
3. **Analytics** — the old Google Analytics (legacy ga.js, UA-7870337-1) was not
   carried over. Add a GA4 or Plausible/Fathom snippet if desired.
4. **DNS** — point `dukeaeroplane.com` at Cloudflare Pages when ready to cut over.
