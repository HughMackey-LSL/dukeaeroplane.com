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
   branch you deploy). This installs Tina's GitHub App on the repo with write
   access — that's the actual mechanism that commits saves; see the note below.
2. **Grab credentials** from the project dashboard:
   - **Client ID** (Project → Overview)
   - a **Content token** (Project → Tokens). Tina's token types are named
     "Content" (read-only) and "Search" — there is no "read/write" token, and
     that's expected. This token is only used so the *build* can query
     content via Tina's API; it has nothing to do with how editor saves get
     written (see below).
3. **Set them locally:** copy `.env.example` to `.env` and fill in:
   ```
   TINA_PUBLIC_CLIENT_ID=xxxxxxxx
   TINA_TOKEN=xxxxxxxx   # the Content (read-only) token
   ```
   `.env` is gitignored — never commit it.
4. **Set the same two vars in Cloudflare Pages** (Phase 4) under the project's
   Environment Variables, so production builds can reach Tina Cloud.
5. **Invite your friend:** Tina Cloud project → User Management → invite by
   email, then grant access under the project's Collaborators tab. He accepts
   and logs in **with his email — no GitHub account** — and from then on only
   ever sees the `/admin` editor.

**How saves actually get written:** when your friend clicks Save, the commit
is made by Tina's own GitHub App (installed in step 1), authored as
`tina-cloud-app` — not by a personal token, and not by his email login
directly. His Collaborator access is what authorizes *him* to trigger that;
the token in `.env` plays no part in it. This is a cleaner setup than a shared
personal-access-token approach: there's no repo-write secret exposed to the
browser at all.

Production build command (used by Cloudflare Pages):
```
npm run build        # = tinacms build && eleventy   → outputs to _site/
```

---

## Changing the schema (adding/removing a collection or field)

**When you edit `tina/config.ts`, you must regenerate and commit `tina/tina-lock.json` in the same change — or the next Cloudflare deploy will fail.**

`tina-lock.json` is the *compiled* schema, and it's the **only committed copy**
(`tina/__generated__/` is gitignored). TinaCloud reads the schema from it. If the
lock is stale, TinaCloud never sees your new schema and the production build dies
at the `tinacms build` step with:

> The local GraphQL schema doesn't match the remote GraphQL schema … Type 'X' was added.

The catch: **`tinacms build` does NOT update the lock — `tinacms dev` does.** So
after any `config.ts` change:

```
cd eleventy-prototype
npx tinacms dev        # let it start (~5s, it rewrites tina/tina-lock.json), then Ctrl-C
git add tina/config.ts tina/tina-lock.json
git commit && git push
```

On that push TinaCloud re-indexes the schema. Watch the TinaCloud dashboard →
**Configuration → Branches**: `main` should show a fresh "indexed" timestamp
(the project-level "Config Updated" date is cosmetic and may lag — trust the
per-branch status). Then retry the Cloudflare deploy if it hadn't already run.
If the branch stays stale (a known webhook-lag bug), use the **⋮ → Re-index**
action on `main` in that dashboard.

**Content-only edits don't need this** — editing shows/announcements/blog/words
*entries* doesn't change the schema, so those deploy normally.

---

## What your friend can edit

| In the editor | Edits this file | Notes |
|---|---|---|
| **Shows / Dates** | `src/_data/shows.json` | Add/remove/reorder shows; past ones auto-stamp "Past". |
| **Announcements** | `src/_data/announcements.json` | The site-wide banner; toggle "active", optional expiry. |
| **Blog Posts** | `src/posts/*.md` | Create/edit posts with a rich-text body. |
| **Words (Lyrics / Poetry)** | `src/words/*.md` | Create/edit pieces; pick a category (Lyrics / Poetry / Short Works); lyrics carry album + song. Grouped by category on the Words page. |
| **Site Settings** | `src/_data/site.json` | Footer copyright, contact mailing address. |
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
