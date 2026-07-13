// Shared config for every file in src/posts/. Authors just write a Markdown
// file with title/date/description front matter; this wires up the layout,
// the "posts" collection, a flat root-level URL, and the browser-tab title.
module.exports = {
  layout: "post.njk",
  tags: ["posts"],
  permalink: "{{ page.fileSlug }}.html",
  eleventyComputed: {
    headTitle: (data) => `${data.title} — Duke Aeroplane`,
  },
};
