/* =========================================================
   Sai Suprabath Chadalavada — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Mobile nav toggle ---- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close menu after tapping a link
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- Scroll reveal + chart/stat triggers ---- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var io = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-in");

        // count up numbers inside this element (stat tiles + flagship KPIs)
        el.querySelectorAll && el.querySelectorAll(".stat__num, .count").forEach(animateNumber);

        // dashboard widgets
        if (el.classList.contains("dash-card")) animateDashboard(el);

        obs.unobserve(el);
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".reveal, .dash-card").forEach(function (el) {
    if (reduceMotion) {
      el.classList.add("is-in");
      el.querySelectorAll && el.querySelectorAll(".stat__num, .count").forEach(function (n) { setFinal(n); });
      if (el.classList.contains("dash-card")) animateDashboard(el, true);
    } else {
      io.observe(el);
    }
  });

  /* ---- Count-up animation ---- */
  function animateNumber(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1300;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var val = target * eased;
      el.textContent = prefix + (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function setFinal(el) {
    var t = parseFloat(el.getAttribute("data-target"));
    el.textContent = (el.getAttribute("data-prefix") || "") + t + (el.getAttribute("data-suffix") || "");
  }

  /* ---- Dashboard mini-widgets ---- */
  function animateDashboard(card, instant) {
    // bars
    var bars = card.querySelector(".bars");
    if (bars) bars.classList.add("is-in");

    var line = card.querySelector(".line-chart");
    if (line) line.classList.add("is-in");

    // gauge (semicircle, dasharray 157)
    var gauge = card.querySelector(".gauge");
    if (gauge) {
      var gv = parseInt(gauge.getAttribute("data-value"), 10);
      var fill = gauge.querySelector(".gauge__fill");
      var num = gauge.querySelector(".gauge__num");
      if (fill) fill.style.strokeDashoffset = 157 - (157 * gv) / 100;
      if (num) instant ? (num.textContent = gv + "%") : countText(num, gv, "%");
    }

    // donut (circle r=32, circumference ~201, dasharray 201)
    var donut = card.querySelector(".donut");
    if (donut) {
      var dv = parseInt(donut.getAttribute("data-value"), 10);
      var dfill = donut.querySelector(".donut__fill");
      var dnum = donut.querySelector(".donut__num");
      if (dfill) dfill.style.strokeDashoffset = 201 - (201 * dv) / 100;
      if (dnum) instant ? (dnum.textContent = dv + "%") : countText(dnum, dv, "%");
    }

    // RCA 7-step ladder — light up steps up to data-done, staggered
    var ladder = card.querySelector(".ladder");
    if (ladder) {
      ladder.classList.add("is-in");
      var done = parseInt(ladder.getAttribute("data-done"), 10) || 0;
      var steps = ladder.querySelectorAll(".ladder__steps span");
      steps.forEach(function (s, i) {
        if (i < done) {
          if (instant) { s.classList.add("done"); }
          else { setTimeout(function () { s.classList.add("done"); }, 250 + i * 130); }
        }
      });
    }
  }

  function countText(el, target, suffix) {
    var dur = 1300, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- Subtle 3D tilt on project cards ---- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        card.style.transform = "perspective(800px) rotateX(" + rx + "deg) rotateY(" + ry + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* ---- Active nav link on scroll ---- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  var navIO = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navAnchors.forEach(function (a) {
            a.style.color = a.getAttribute("href") === "#" + entry.target.id ? "var(--ink)" : "";
          });
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach(function (s) { navIO.observe(s); });

  /* ---- Contact form (Formspree-friendly, graceful fallback) ---- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form) {
    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";

      // Not configured yet → fall back to opening the user's mail client.
      if (action.indexOf("YOUR_FORM_ID") !== -1 || action.indexOf("formspree.io/f/") === -1) {
        e.preventDefault();
        var name = (form.name && form.name.value) || "";
        var email = (form.email && form.email.value) || "";
        var msg = (form.message && form.message.value) || "";
        var body = encodeURIComponent("From: " + name + " (" + email + ")\n\n" + msg);
        var subject = encodeURIComponent("Portfolio message from " + name);
        window.location.href =
          "mailto:saichadalavada2027@u.northwestern.edu?subject=" + subject + "&body=" + body;
        setStatus("Opening your email app… (set up Formspree for in-page sending)", "ok");
        return;
      }

      // Configured → submit via fetch for a smooth in-page experience.
      e.preventDefault();
      setStatus("Sending…", "ok");
      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            setStatus("Thanks! Your message is on its way. ✓", "ok");
          } else {
            setStatus("Hmm, something went wrong. Try emailing me directly.", "err");
          }
        })
        .catch(function () {
          setStatus("Network error. Try emailing me directly.", "err");
        });
    });
  }

  function setStatus(text, type) {
    if (!status) return;
    status.textContent = text;
    status.className = "form-status " + (type || "");
  }

  /* ---- Friendly nudge for un-set placeholder links ---- */
  document.querySelectorAll('a[data-todo]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (a.getAttribute("href") === "#") {
        e.preventDefault();
        alert("Add your " + a.getAttribute("data-todo") + " link in index.html (search for data-todo=\"" + a.getAttribute("data-todo") + "\").");
      }
    });
  });
  /* ---- Render reading shelf from window.READING ---- */
  (function renderShelf() {
    var shelf = document.getElementById("shelf");
    var empty = document.getElementById("shelfEmpty");
    var countEl = document.getElementById("readingCount");
    var list = (window.READING || []).slice();
    if (!shelf) return;

    if (!list.length) { return; } // keep the empty-state message

    if (empty) empty.remove();

    // newest first
    list.sort(function (a, b) {
      return new Date(b.date || 0) - new Date(a.date || 0);
    });

    var frag = document.createDocumentFragment();
    list.forEach(function (item) {
      var type = item.type === "article" ? "article" : "book";
      var card = document.createElement("article");
      card.className = "read-card";

      var dateStr = "";
      if (item.date) {
        var d = new Date(item.date);
        if (!isNaN(d)) dateStr = d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
      }

      var linkHtml = item.link
        ? '<a class="read-card__link" href="' + escapeAttr(item.link) + '" target="_blank" rel="noopener">read it ↗</a>'
        : "";

      card.innerHTML =
        '<div class="read-card__top">' +
          '<span class="read-card__type read-card__type--' + type + '">' + (type === "book" ? "📖 book" : "📰 article") + "</span>" +
          '<span class="read-card__date">' + esc(dateStr) + "</span>" +
        "</div>" +
        '<h3 class="read-card__title">' + esc(item.title || "Untitled") + "</h3>" +
        '<span class="read-card__author">' + esc(item.author || "") + "</span>" +
        '<p class="read-card__note">' + esc(item.note || "") + "</p>" +
        linkHtml;

      frag.appendChild(card);
    });
    shelf.appendChild(frag);

    if (countEl) countEl.textContent = "· " + list.length + " logged";
  })();

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escAttr(s) { return esc(s).replace(/"/g, "&quot;"); }
  // alias used above
  function escapeAttr(s) { return escAttr(s); }
})();
