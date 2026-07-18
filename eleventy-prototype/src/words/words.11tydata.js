// Shared config for every file in src/words/. Authors write a Markdown file
// with title/category front matter (+ album/song for lyrics); this wires up the
// layout, the "words" collection, a flat root-level URL, and the tab title.
module.exports = {
  layout: "work.njk",
  tags: ["words"],
  permalink: "{{ page.fileSlug }}.html",
  eleventyComputed: {
    headTitle: (data) => `${data.title} — Duke Aeroplane`,
  },
};
