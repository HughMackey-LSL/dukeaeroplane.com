/* Announcement bar: dismiss + remember per announcement id (localStorage).
   No dependencies; a no-op when the bar isn't present. */
(function () {
  "use strict";
  var bar = document.querySelector(".announce-bar");
  if (!bar) return;

  var id = bar.getAttribute("data-announce-id") || "default";
  var key = "ann-dismissed:" + id;

  try {
    if (localStorage.getItem(key)) {
      bar.parentNode.removeChild(bar);
      return;
    }
  } catch (e) {
    /* private mode / storage disabled — just show the bar */
  }

  var btn = bar.querySelector(".announce-dismiss");
  if (btn) {
    btn.addEventListener("click", function () {
      try {
        localStorage.setItem(key, "1");
      } catch (e) {}
      bar.parentNode.removeChild(bar);
    });
  }
})();
