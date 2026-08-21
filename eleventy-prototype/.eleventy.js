// Eleventy config for the dates.html proof-of-concept.
//
// The whole point of this prototype: the *design* (css/style.css) and the
// *interactivity* (js/main.js) are the real, untouched site assets. Eleventy
// only assembles HTML from templates + data — the browser then runs the exact
// same grain/parallax/scroll-reveal/nav code as the hand-authored site.

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

// Where a built URL comes from on disk. The passthrough copies below serve the
// repo-root css/ and js/ at those URLs, so hashing has to look outside this
// directory. Resolved from __dirname, not cwd, so the build works whether
// eleventy runs from here or from the repo root.
const ASSET_SOURCES = {
  "css/": path.join(__dirname, "..", "css"),
  "js/": path.join(__dirname, "..", "js"),
  "assets/": path.join(__dirname, "assets"),
};

function assetSourcePath(urlPath) {
  for (const [prefix, dir] of Object.entries(ASSET_SOURCES)) {
    if (urlPath.startsWith(prefix)) {
      return path.join(dir, urlPath.slice(prefix.length));
    }
  }
  return null;
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// Accept a plain "YYYY-MM-DD" (how the JSON reads today), a full ISO string
// (how a Tina datetime picker writes it), or a Date — and always resolve to
// UTC midnight for date-only values so "past" checks and the weekday label
// never slip a day across timezones.
function toDate(v) {
  if (v instanceof Date) return v;
  if (typeof v !== "string" || !v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(v + "T00:00:00Z");
  return new Date(v);
}
function todayUTC() {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

module.exports = function (eleventyConfig) {
  // Serve the REAL site assets untouched, so the built page renders
  // pixel-for-pixel like the current dukeaeroplane.com. Nothing here is a
  // fork of your CSS/JS — it's the same files the live site uses.
  eleventyConfig.addPassthroughCopy({ "../css": "css" });
  eleventyConfig.addPassthroughCopy({ "../js": "js" });
  eleventyConfig.addPassthroughCopy({ "../images": "images" });
  // The site's favicons — the red "G" mark, extracted from the live
  // dukeaeroplane.com. Sources live at the repo root and are served from the
  // site root: legacy .ico, a scalable .svg (vectorized from the mark),
  // 16/32px PNGs, and a 180px apple-touch-icon for iOS home screens.
  eleventyConfig.addPassthroughCopy({ "../favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "../favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "../favicon-32x32.png": "favicon-32x32.png" });
  eleventyConfig.addPassthroughCopy({ "../favicon-16x16.png": "favicon-16x16.png" });
  eleventyConfig.addPassthroughCopy({ "../apple-touch-icon.png": "apple-touch-icon.png" });
  // ../video is NOT copied: the trailer is a 47MB mp4, over Cloudflare
  // Pages' 25MB per-file limit. The trailer is embedded from YouTube instead
  // (see theheartbeatthehammer.njk) — nothing in this build needs the file.

  // Phase 2 additions (banner styles + dismiss script) kept in their own
  // files so they don't touch the shared style.css / main.js while this is a
  // WIP branch. Folded into the main assets at cutover.
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });

  // Media that the CMS uploads (blog images, show flyers) lands here and is
  // committed to the repo; existing design images stay under ../images.
  eleventyConfig.addPassthroughCopy({ "uploads": "uploads" });

  // Cloudflare Pages redirects (e.g. the old /blog URL -> /announcements after
  // the page was renamed). Copied to the site root as _site/_redirects.
  eleventyConfig.addPassthroughCopy({ "_redirects": "_redirects" });

  // "css/style.css" -> "css/style.css?v=1f4a9c02" — the query is a hash of the
  // file's own bytes, so it changes exactly when the file does and never when
  // it doesn't. This replaced a hand-typed ?v=15 that had to be remembered on
  // every CSS edit; when it wasn't, returning visitors kept the stale asset.
  eleventyConfig.addFilter("cacheBust", function (urlPath) {
    const source = assetSourcePath(urlPath);
    if (!source) {
      console.warn(`[cacheBust] no source mapped for "${urlPath}" — serving unversioned`);
      return urlPath;
    }
    let bytes;
    try {
      bytes = fs.readFileSync(source);
    } catch (err) {
      console.warn(`[cacheBust] cannot read ${source} (${err.code}) — serving "${urlPath}" unversioned`);
      return urlPath;
    }
    const hash = crypto.createHash("sha1").update(bytes).digest("hex").slice(0, 8);
    return `${urlPath}?v=${hash}`;
  });

  // The hashes above are baked into every page, so a change to the real assets
  // has to re-render the HTML — not just re-copy the file, which is all
  // passthrough copy would do on its own in --serve.
  eleventyConfig.addWatchTarget("../css");
  eleventyConfig.addWatchTarget("../js");

  // "2025-04-09" -> "Wed, April 9th, 2025"  (matches the old hand-typed format)
  eleventyConfig.addFilter("prettyDate", function (value) {
    const d = toDate(value);
    if (!d) return "";
    const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
    const month = d.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
    const day = d.getUTCDate();
    return `${weekday}, ${month} ${day}${ordinal(day)}, ${d.getUTCFullYear()}`;
  });

  // A show is "past" if its date is before today — computed at build time, so
  // old shows demote themselves to a "Past" stamp with no manual editing.
  eleventyConfig.addFilter("isPast", function (value) {
    const d = toDate(value);
    return d ? d < todayUTC() : false;
  });

  // True if any show is today or later — used to auto-hide the
  // "Future dates forthcoming…" note once real upcoming shows exist.
  eleventyConfig.addFilter("hasUpcoming", function (shows) {
    const t = todayUTC();
    return (shows || []).some((s) => {
      const d = toDate(s.date);
      return d && d >= t;
    });
  });

  // Display order for the dates page: upcoming shows soonest-first, then past
  // shows most-recent-first. This is the ordering a hand-edited page can't keep
  // correct on its own — it re-sorts every build.
  eleventyConfig.addFilter("sortShows", function (shows) {
    const t = todayUTC();
    const withDate = (shows || []).map((s) => ({ ...s, _d: toDate(s.date) }));
    const upcoming = withDate.filter((s) => s._d && s._d >= t).sort((a, b) => a._d - b._d);
    const past = withDate.filter((s) => s._d && s._d < t).sort((a, b) => b._d - a._d);
    return upcoming.concat(past);
  });

  // Pick the announcement to show site-wide: the first one flagged active
  // whose optional `expires` date hasn't passed. Returns null when there's
  // nothing to show, so the banner markup renders only when warranted.
  eleventyConfig.addFilter("activeAnnouncement", function (announcements) {
    if (!announcements) return null;
    const t = todayUTC();
    return (
      announcements.find((a) => {
        if (!a.active) return false;
        const ex = toDate(a.expires);
        return !ex || ex >= t;
      }) || null
    );
  });

  // Filter a list to items whose (dot-path) key equals a value — used to
  // group the Words collection by category. e.g. items | where("data.category", "lyrics")
  eleventyConfig.addFilter("where", function (arr, keyPath, value) {
    if (!Array.isArray(arr)) return [];
    const parts = String(keyPath).split(".");
    return arr.filter((item) => {
      let v = item;
      for (const p of parts) v = v == null ? undefined : v[p];
      return v === value;
    });
  });

  // "2026-07-12" -> "July 12, 2026" for blog post datelines.
  eleventyConfig.addFilter("readableDate", function (value) {
    const d = toDate(value);
    if (!d) return "";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
