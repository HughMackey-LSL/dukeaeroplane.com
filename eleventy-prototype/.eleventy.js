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

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
