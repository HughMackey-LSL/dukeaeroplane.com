// Eleventy config for the dates.html proof-of-concept.
//
// The whole point of this prototype: the *design* (css/style.css) and the
// *interactivity* (js/main.js) are the real, untouched site assets. Eleventy
// only assembles HTML from templates + data — the browser then runs the exact
// same grain/parallax/scroll-reveal/nav code as the hand-authored site.

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
  eleventyConfig.addPassthroughCopy({ "../video": "video" });

  // Phase 2 additions (banner styles + dismiss script) kept in their own
  // files so they don't touch the shared style.css / main.js while this is a
  // WIP branch. Folded into the main assets at cutover.
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });

  // Media that the CMS uploads (blog images, show flyers) lands here and is
  // committed to the repo; existing design images stay under ../images.
  eleventyConfig.addPassthroughCopy({ "uploads": "uploads" });

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
