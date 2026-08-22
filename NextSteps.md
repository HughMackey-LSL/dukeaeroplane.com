- [x] Figure out Tina Token - Instructions call for Read/Write, but Readonly and Search are all that's available
  - [x] Trailer asset too large. Swap for Direct YouTube Link
- [x] Figure out Cloudflare pages deployment
- [x] Update project docs to reflect status
- [x] Test live deployment
- [x] Share w/ Galen for feedback and adjustments
  - [x] Test CMS login w/ email — Galen is authoring in Tina Cloud; his edits
        land on `main` as "TinaCMS content update" commits
- [ ] Transfer DNS


# Possible changes

- ~~Remove contact form and limit to email?~~ Settled the other way: the direct
  address was removed and the Formspree form is the only route. Don't re-add it.
- ~~Naming of "Blog" to "Updates," "Announcements" or similar?~~ Done — the page
  is "Announcements"; `_redirects` keeps the old `/blog` URL working.
- Update Blog header image to something new
- Words: `A-Congress-of-Cats.md` still needs its stanza breaks re-done by Galen
  (every line is its own paragraph, so it reads uniformly double-spaced)
- Words: `New-Orlean-Night.md` is missing an "s" in the filename, which is also
  its URL. Low priority — nothing links to it directly. To fix it, use **Rename**
  in the *Words (Lyrics / Poetics)* **list** view (the per-row action menu, next
  to Duplicate and Delete) — it is not in the piece's editing form, which only
  exposes the title and content fields. Renaming changes the URL to match.