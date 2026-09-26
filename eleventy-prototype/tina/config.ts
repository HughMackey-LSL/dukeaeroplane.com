import { defineConfig } from "tinacms";

// Branch Tina reads/writes. On Cloudflare Pages, CF_PAGES_BRANCH is set; locally
// we default to main. (Set TINA_BRANCH to override.)
const branch =
  process.env.TINA_BRANCH ||
  process.env.CF_PAGES_BRANCH ||
  process.env.HEAD ||
  "main";

// Calendar days, not instants.
//
// Tina's stock `datetime` handling round-trips a date through a moment in time:
// it saves `value.toISOString()` and redisplays it with `new Date(value)` — that
// is, in the *browser's* timezone. So a show stored as
// "2026-11-06T00:00:00.000Z" shows up as 2026-11-05 in the CMS for an editor
// anywhere west of UTC, while the site (which formats in UTC — see .eleventy.js)
// prints November 6th. Nothing here means an instant; a show date is a day on a
// calendar, so these fields hand Tina a plain "YYYY-MM-DD". (Tina's GraphQL layer
// still writes that to the file as UTC midnight of the day —
// "2026-11-06T00:00:00.000Z" — which is exactly the day the site reads back.)
//
// The picker still works in local Dates, so each direction has to meet it there.
// Note a bare "2026-11-06" is no good to hand it: `new Date()` reads a date-only
// string as UTC midnight (the day before, west of UTC), whereas the same string
// with a time and no zone is read as *local* midnight.
const pad = (n: number) => String(n).padStart(2, "0");

const localDay = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Stored → picker. Either "2026-11-06" or a legacy "2026-11-06T00:00:00.000Z";
// both spell the day out up front, so read it off rather than re-deriving it
// from a Date, and hand the picker local midnight of that day.
const toPicker = (value: any) => {
  if (typeof value !== "string") return value;
  const ymd = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return ymd ? `${ymd[1]}T00:00:00` : value;
};

// Picker → stored. The picker hands back `toISOString()` of local midnight of
// the day clicked, which in UTC can fall on a neighbouring day, so the day is
// read back in local time. (Only picker output arrives here — `parse` runs on
// change, never on the stored value.)
const fromPicker = (value: any) => {
  if (!value) return value;
  if (value instanceof Date) return localDay(value);
  if (typeof value !== "string" || /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : localDay(d);
};

// Shared `ui` for every date field in the schema.
const dateFieldUI = {
  dateFormat: "YYYY-MM-DD",
  parse: fromPicker,
  format: toPicker,
};

export default defineConfig({
  branch,

  // From your Tina Cloud project (Project → Overview / Tokens). Kept in env vars,
  // never committed. See TINA-SETUP.md.
  clientId: process.env.TINA_PUBLIC_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",

  build: {
    // Tina compiles the /admin editor SPA into <publicFolder>/<outputFolder>.
    // publicFolder is Eleventy's build output; run `tinacms build` before eleventy.
    outputFolder: "admin",
    publicFolder: "_site",
  },

  media: {
    tina: {
      // Uploads are written to ./uploads (committed) and served from /uploads
      // after Eleventy copies the folder into _site.
      mediaRoot: "uploads",
      publicFolder: "_site",
    },
  },

  schema: {
    collections: [
      // ---------------------------------------------------------------------
      // Shows — one JSON file holding the list; edited as a repeatable list.
      // ---------------------------------------------------------------------
      {
        name: "shows",
        label: "Shows / Dates",
        path: "src/_data",
        format: "json",
        match: { include: "shows" },
        ui: {
          // Singleton file: no creating/deleting the document itself.
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: "object",
            name: "shows",
            label: "Shows",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.venue || "New show" }),
            },
            fields: [
              { type: "datetime", name: "date", label: "Date", required: true, ui: dateFieldUI },
              { type: "string", name: "time", label: "Time (e.g. 7–9 PM)" },
              { type: "string", name: "venue", label: "Venue", required: true },
              { type: "string", name: "venueUrl", label: "Venue link (optional)" },
              { type: "string", name: "address", label: "Address" },
              { type: "string", name: "details", label: "Detail lines", list: true },
            ],
          },
        ],
      },

      // ---------------------------------------------------------------------
      // Announcements — the site-wide banner(s).
      // ---------------------------------------------------------------------
      {
        name: "announcements",
        label: "Announcement Banner",
        path: "src/_data",
        format: "json",
        match: { include: "announcements" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object",
            name: "announcements",
            label: "Announcements",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.message || "New announcement" }),
            },
            fields: [
              { type: "string", name: "id", label: "ID (unique, e.g. spring-tour)", required: true },
              { type: "boolean", name: "active", label: "Show this announcement" },
              { type: "string", name: "message", label: "Message", required: true, ui: { component: "textarea" } },
              { type: "string", name: "url", label: "Link (optional, e.g. contact.html)" },
              {
                type: "string",
                name: "linkLabel",
                label: "Link button text (optional)",
                description:
                  "Fill in to show a clear clickable button after the message, e.g. \"Shop the vinyl\". Leave blank to show just the message (if a Link is set, the whole banner stays clickable).",
              },
              // `required: false` spelled out: Tina's picker shows an unset date
              // as *today* unless told the field is optional, which here reads
              // as "this banner expires today".
              { type: "datetime", name: "expires", label: "Hide after (optional)", required: false, ui: dateFieldUI },
            ],
          },
        ],
      },

      // ---------------------------------------------------------------------
      // Blog — one Markdown file per post.
      // ---------------------------------------------------------------------
      {
        name: "post",
        label: "Announcements",
        path: "src/posts",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Title", required: true, isTitle: true },
          { type: "datetime", name: "date", label: "Date", required: true, ui: dateFieldUI },
          { type: "string", name: "description", label: "Excerpt / summary", ui: { component: "textarea" } },
          { type: "rich-text", name: "body", label: "Body", isBody: true },
        ],
      },

      // ---------------------------------------------------------------------
      // Words — one Markdown file per piece (lyric, poem, or short work).
      // Grouped by Category on the Words page; lyrics carry album/song info.
      // ---------------------------------------------------------------------
      {
        name: "word",
        label: "Words (Lyrics / Poetics)",
        path: "src/words",
        format: "md",
        fields: [
          { type: "string", name: "title", label: "Title", required: true, isTitle: true },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true,
            options: [
              { value: "lyrics", label: "Lyrics" },
              // Label only — the "poetry" value is the key words.njk groups
              // on, so it stays put; renaming it would orphan existing pieces.
              { value: "poetry", label: "Poetics" },
              { value: "short-works", label: "Short Works" },
            ],
          },
          {
            type: "string",
            name: "album",
            label: "Album",
            description: "Lyrics only — the album/release this song is from.",
          },
          {
            type: "string",
            name: "song",
            label: "Song title",
            description: "Lyrics only — use if the song title differs from the title above.",
          },
          {
            type: "datetime",
            name: "date",
            label: "Date (optional)",
            description: "Used only to order pieces; leave blank to sort by title.",
            required: false, // else an unset date displays as today (see `expires`)
            ui: dateFieldUI,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Text",
            isBody: true,
            description:
              "Enter starts a new stanza. Shift+Enter starts a new line inside the " +
              "same stanza — use it for the lines of a verse.",
          },
        ],
      },

      // ---------------------------------------------------------------------
      // Site settings — global copy (footer, contact details).
      // ---------------------------------------------------------------------
      {
        name: "site",
        label: "Site Settings",
        path: "src/_data",
        format: "json",
        match: { include: "site" },
        ui: { allowedActions: { create: false, delete: false }, global: true },
        fields: [
          { type: "string", name: "copyright", label: "Footer copyright" },
          {
            type: "object",
            name: "contact",
            label: "Contact details",
            fields: [
              { type: "string", name: "addressLines", label: "Mailing address (one line each)", list: true },
            ],
          },
        ],
      },

      // ---------------------------------------------------------------------
      // Page copy — editable prose blocks per page (grows over time).
      // ---------------------------------------------------------------------
      {
        name: "copy",
        label: "Page Copy",
        path: "src/_data",
        format: "json",
        match: { include: "copy" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "object",
            name: "dates",
            label: "Dates page",
            fields: [
              { type: "string", name: "intro", label: "Intro blurb", ui: { component: "textarea" } },
            ],
          },
        ],
      },
    ],
  },
});
