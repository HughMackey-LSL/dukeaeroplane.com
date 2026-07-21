import { defineConfig } from "tinacms";

// Branch Tina reads/writes. On Cloudflare Pages, CF_PAGES_BRANCH is set; locally
// we default to main. (Set TINA_BRANCH to override.)
const branch =
  process.env.TINA_BRANCH ||
  process.env.CF_PAGES_BRANCH ||
  process.env.HEAD ||
  "main";

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
              { type: "datetime", name: "date", label: "Date", required: true, ui: { dateFormat: "YYYY-MM-DD" } },
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
              { type: "datetime", name: "expires", label: "Hide after (optional)", ui: { dateFormat: "YYYY-MM-DD" } },
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
          { type: "datetime", name: "date", label: "Date", required: true, ui: { dateFormat: "YYYY-MM-DD" } },
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
        label: "Words (Lyrics / Poetry)",
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
              { value: "poetry", label: "Poetry" },
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
            ui: { dateFormat: "YYYY-MM-DD" },
          },
          { type: "rich-text", name: "body", label: "Text", isBody: true },
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
