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

  // "2025-04-09" -> "Wed, April 9th, 2025"  (matches the old hand-typed format)
  eleventyConfig.addFilter("prettyDate", function (dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const day = d.getDate();
    return `${weekday}, ${month} ${day}${ordinal(day)}, ${d.getFullYear()}`;
  });

  // A show is "past" if its date is before today — computed at build time, so
  // old shows demote themselves to a "Past" stamp with no manual editing.
  eleventyConfig.addFilter("isPast", function (dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr + "T00:00:00") < today;
  });

  // True if any show is today or later — used to auto-hide the
  // "Future dates forthcoming…" note once real upcoming shows exist.
  eleventyConfig.addFilter("hasUpcoming", function (shows) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return shows.some((s) => new Date(s.date + "T00:00:00") >= today);
  });

  // Display order for the dates page: upcoming shows soonest-first, then past
  // shows most-recent-first. This is the ordering a hand-edited page can't keep
  // correct on its own — it re-sorts every build.
  eleventyConfig.addFilter("sortShows", function (shows) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const withDate = shows.map((s) => ({ ...s, _d: new Date(s.date + "T00:00:00") }));
    const upcoming = withDate.filter((s) => s._d >= today).sort((a, b) => a._d - b._d);
    const past = withDate.filter((s) => s._d < today).sort((a, b) => b._d - a._d);
    return upcoming.concat(past);
  });

  // Pick the announcement to show site-wide: the first one flagged active
  // whose optional `expires` date hasn't passed. Returns null when there's
  // nothing to show, so the banner markup renders only when warranted.
  eleventyConfig.addFilter("activeAnnouncement", function (announcements) {
    if (!announcements) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (
      announcements.find(
        (a) => a.active && (!a.expires || new Date(a.expires + "T00:00:00") >= today)
      ) || null
    );
  });

  // "2026-07-12" -> "July 12, 2026" for blog post datelines.
  eleventyConfig.addFilter("readableDate", function (dateStr) {
    const d = typeof dateStr === "string" ? new Date(dateStr + "T00:00:00Z") : dateStr;
    // Force UTC so a front-matter date (parsed as UTC midnight) doesn't slip a
    // day when the build runs in a negative-offset timezone.
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
