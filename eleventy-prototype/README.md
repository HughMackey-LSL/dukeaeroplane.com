# Eleventy prototype — `dates.html`

A throwaway proof-of-concept for **Option B**: render the site's volatile page
(`dates.html`) from an editable data file instead of hand-authored HTML, while
keeping 100% of the existing design and interactivity.

**This folder is self-contained and touches none of the live site files.** Delete
it and the site is exactly as it was.

## What to look at

- [`src/_data/shows.json`](src/_data/shows.json) — **this is the file a CMS would
  turn into a friendly form.** No HTML, no `&ndash;`/`&ldquo;` entities — your
  friend types plain text (`venue`, `address`, a list of `details` lines). Type
  `&` and it becomes `&amp;` in the output automatically.
- [`src/dates.njk`](src/dates.njk) — the page template. Your current markup, with
  the hardcoded event block swapped for a loop over the data.
- [`src/_includes/base.njk`](src/_includes/base.njk) — the shared head/header/nav/
  footer. Today that's copy-pasted across 9 pages; here it lives once, and the nav
  is driven by [`src/_data/nav.json`](src/_data/nav.json).

## Run it

```
cd eleventy-prototype
npm install
npm start        # dev server with live reload, or:
npm run build    # writes _site/dates.html
```

The build copies the real `../css`, `../js`, `../images`, `../video` alongside the
generated page, so it renders pixel-for-pixel like the current site — same grain,
parallax, scroll-reveal, nav, everything. Eleventy only assembles the HTML; the
browser runs your untouched `js/main.js`.

## Two things this demonstrates that the hand-authored page can't

1. **Auto past/upcoming.** `date` in the past renders a "Past" stamp
   automatically (see `isPast` in `.eleventy.js`). Add a future-dated show and it
   appears with no stamp — no manual "Past" editing like the current page.
2. **Smart empty state.** The "Future dates forthcoming…" note hides itself once
   any upcoming show exists.

Try it: add this to `shows.json` (inside the array) and rebuild —

```json
{
  "date": "2026-09-12",
  "time": "8 PM",
  "venue": "The Broadside",
  "address": "600 N Broad St, New Orleans, LA",
  "details": ["Duke Aeroplane & The Rum Birds", "An Evening of New Songs"]
}
```
