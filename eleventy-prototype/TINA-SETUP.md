# TinaCMS setup

The site is wired for [TinaCMS](https://tina.io). Your friend edits content through
a form-based editor at `/admin`, logging in with **just his email** (no GitHub
account); saves commit to this repo and trigger a redeploy.

There are two modes: **local** (works today, no accounts) and **Tina Cloud**
(what powers the live editor + the email login).

---

## 1. Local editing — works right now, no accounts

```
cd eleventy-prototype
npm install
npm run dev          # tinacms dev + eleventy --serve on :8082
```

Open **http://localhost:8082/admin** → "Enter Edit Mode". Edits save straight to
the local files (e.g. `src/_data/shows.json`). Use this to try the editor and to
make changes yourself without the cloud.

Plain preview without the CMS: `npm start` (Eleventy only).

---

## 2. Tina Cloud — the live editor + your friend's email login

This is the part that needs **your** accounts (one-time, ~15 min). Your friend
needs nothing but an email invite.

1. **Create the project.** Go to <https://app.tina.io> and sign in with the
   GitHub account that owns this repo. Create a project and connect it to the
   `HughMackey-LSL/dukeaeroplane.com` repository, branch `main` (or whichever
   branch you deploy).
2. **Grab credentials** from the project dashboard:
   - **Client ID** (Project → Overview)
   - a **Read/Write token** (Project → Tokens)
3. **Set them locally:** copy `.env.example` to `.env` and fill in:
   ```
   TINA_PUBLIC_CLIENT_ID=xxxxxxxx
   TINA_TOKEN=xxxxxxxx
   ```
   `.env` is gitignored — never commit it.
4. **Set the same two vars in Cloudflare Pages** (Phase 4) under the project's
   Environment Variables, so production builds can reach Tina Cloud.
5. **Invite your friend:** Tina Cloud project → Collaborators → invite by email.
   He accepts, sets a password/one-time login **with his email — no GitHub
   account** — and from then on only ever sees the `/admin` editor.

Production build command (used by Cloudflare Pages):
```
npm run build        # = tinacms build && eleventy   → outputs to _site/
```

---

## What your friend can edit

| In the editor | Edits this file | Notes |
|---|---|---|
| **Shows / Dates** | `src/_data/shows.json` | Add/remove/reorder shows; past ones auto-stamp "Past". |
| **Announcements** | `src/_data/announcements.json` | The site-wide banner; toggle "active", optional expiry. |
| **Blog Posts** | `src/posts/*.md` | Create/edit posts with a rich-text body. |
| **Site Settings** | `src/_data/site.json` | Footer copyright, contact address + booking email. |
| **Page Copy** | `src/_data/copy.json` | Editable prose blocks (currently the Dates intro; grows over time). |

Structural changes (new pages, layout, styling) stay in the templates and go
through you — by design, so the editor can't break the layout.

## Notes / follow-ups

- **Media:** CMS image uploads (blog images, show flyers) go to `uploads/` and
  are committed to the repo; existing design images stay under `../images`.
- **Directory:** this all lives under `eleventy-prototype/` for now. At cutover
  (Phase 4/5) the project is promoted to the repo root and the `../css`/`../js`/
  `../images` passthroughs + the `uploads` path get simplified.
- **Editing feel:** on Eleventy, Tina is a form-based editor at `/admin` (not the
  click-on-the-page inline editing, which is React/Next-only). Expected and fine.
