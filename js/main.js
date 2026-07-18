/* Duke Aeroplane — mobile nav toggle + gallery lightbox (no dependencies) */

(function () {
  "use strict";

  var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = reduceMotionQuery.matches;
  var docEl = document.documentElement;

  /* ---------- Texture: film grain + vignette overlays ---------- */
  // Injected here (not in markup) so the decorative layers stay out of the
  // 9 duplicated page heads and simply don't exist when JS is unavailable.
  ["vignette", "grain"].forEach(function (cls) {
    var layer = document.createElement("div");
    layer.className = cls;
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
  });

  /* ---------- Scroll-reveal choreography ---------- */
  // Tag <html> so the CSS "hidden until revealed" rules only apply with JS.
  docEl.classList.add("js-anim");

  var revealTargets = [];
  Array.prototype.forEach.call(
    document.querySelectorAll("main .container > section, main > section, hr.redline"),
    function (el) {
      // HRs animate via their own `hr.redline` rule; sections get `.reveal`.
      if (el.tagName !== "HR") el.classList.add("reveal");
      revealTargets.push(el);
    }
  );

  function revealAll() {
    revealTargets.forEach(function (el) { el.classList.add("in"); });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

    revealTargets.forEach(function (el, i) {
      // Stagger neighbours a touch so groups cascade rather than pop together.
      el.style.transitionDelay = (Math.min(i % 4, 3) * 0.08) + "s";
      io.observe(el);
    });
  }

  /* ---------- Hero: kinetic title + lyric verse + parallax ---------- */
  var heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    // Kick the entrance on the next frame so the initial transform is painted.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { heroTitle.classList.add("in"); });
    });
  }

  // Parallax only the full-height homepage hero; interior `.page-hero`
  // banners are short, so a moving image would expose their edges.
  var heroImg = document.querySelector(".hero .hero-img");
  if (heroImg && !reduceMotion) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var offset = Math.min(window.pageYOffset, 700) * 0.28;
        heroImg.style.transform = "translate3d(0," + offset + "px,0) scale(1.08)";
        ticking = false;
      });
    }, { passive: true });
    heroImg.style.transform = "scale(1.08)";
  }

  /* ---------- Nav: shrink + shadow once the page starts scrolling ---------- */
  var nav = document.querySelector(".site-nav");
  if (nav) {
    var navTicking = false;
    window.addEventListener("scroll", function () {
      if (navTicking) return;
      navTicking = true;
      requestAnimationFrame(function () {
        nav.classList.toggle("scrolled", window.pageYOffset > 40);
        navTicking = false;
      });
    }, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Carousel ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".carousel"), function (c) {
    var track = c.querySelector(".carousel-track");
    var slides = track.children;
    var status = c.querySelector(".carousel-status");

    // Logical index for button/keyboard navigation. Deriving it from
    // scrollLeft on click would recompute the same target while a scroll
    // animation is still in flight (rapid clicks would stall on one slide).
    var current = 0;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var settleTimer = null;
    var swipeTimer = null;

    function index() {
      return Math.round(track.scrollLeft / track.clientWidth);
    }
    function update() {
      if (status) status.textContent = index() + 1 + " / " + slides.length;
    }

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      var target = current * track.clientWidth;
      track.scrollTo({
        left: target,
        behavior: reduceMotion.matches ? "auto" : "smooth"
      });
      // Mandatory snap can stall an animated scroll in some engines
      // (notably Safari); if we haven't arrived, jump there.
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        if (Math.abs(track.scrollLeft - target) > 2) {
          track.scrollTo({ left: target, behavior: "auto" });
        }
        update();
      }, 600);
    }

    c.querySelector(".carousel-btn.prev").addEventListener("click", function () { goTo(current - 1); });
    c.querySelector(".carousel-btn.next").addEventListener("click", function () { goTo(current + 1); });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); }
    });

    // Manual swipes: refresh the counter live, adopt the settled position.
    track.addEventListener("scroll", function () {
      update();
      clearTimeout(swipeTimer);
      swipeTimer = setTimeout(function () { current = index(); }, 150);
    }, { passive: true });

    update();
  });

  /* ---------- Contact form: inline submit via Formspree AJAX ---------- */
  // Progressive enhancement: without JS the form POSTs normally and lands on
  // Formspree's own thank-you page. With JS we submit in the background and
  // swap in an inline confirmation so the visitor never leaves the site.
  var contactForm = document.querySelector('form[action*="formspree.io"]');
  if (contactForm) {
    var formStatus = contactForm.parentNode.querySelector(".form-status");
    contactForm.addEventListener("submit", function (e) {
      // Leave the unconfigured placeholder to POST normally, so a form that
      // hasn't been wired up yet fails loudly instead of faking success.
      if (contactForm.action.indexOf("YOUR_FORM_ID") !== -1) return;

      e.preventDefault();
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { "Accept": "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("Bad response");
        contactForm.reset();
        contactForm.hidden = true;
        if (formStatus) {
          formStatus.classList.remove("error");
          formStatus.textContent = "Thanks — your message is on its way to the Duke.";
          formStatus.hidden = false;
        }
      }).catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (formStatus) {
          formStatus.classList.add("error");
          formStatus.textContent = "Something went wrong sending that. Please try again in a moment, or reach the Duke by mail.";
          formStatus.hidden = false;
        }
      });
    });
  }

  /* ---------- Lightbox ---------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".gallery a, .carousel-track a, .filmstrip a, a[data-lightbox]")
  );
  if (!links.length) return;

  var current = 0;

  var box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Image viewer");
  box.innerHTML =
    '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" aria-label="Previous image">&#8249;</button>' +
    '<img alt="">' +
    '<button class="lb-next" aria-label="Next image">&#8250;</button>' +
    '<span class="lb-count"></span>';
  document.body.appendChild(box);

  var img = box.querySelector("img");
  var count = box.querySelector(".lb-count");

  function show(i) {
    current = (i + links.length) % links.length;
    img.src = links[current].getAttribute("href");
    var thumb = links[current].querySelector("img");
    img.alt = thumb ? thumb.alt : "";
    count.textContent = current + 1 + " / " + links.length;
  }

  var lastFocus = null;

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.classList.add("open");
    document.body.style.overflow = "hidden";
    box.querySelector(".lb-close").focus();
  }

  function close() {
    box.classList.remove("open");
    img.src = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  links.forEach(function (link, i) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      open(i);
    });
  });

  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
  box.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
  box.addEventListener("click", function (e) {
    if (e.target === box) close();
  });

  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  /* Touch swipe */
  var startX = null;
  box.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) show(dx > 0 ? current - 1 : current + 1);
    startX = null;
  }, { passive: true });
})();
