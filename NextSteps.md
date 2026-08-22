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
- ~~Words: the New Orleans Night filename was missing an "s".~~ Renamed in Tina;
  it is now `New-Orleans-Night.md` at a matching URL. For future renames: the
  **Rename** action is in the collection **list** view's per-row menu (beside
  Duplicate and Delete), not in the piece's editing form.