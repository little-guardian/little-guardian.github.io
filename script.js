(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


  /* ---------------------------------------------------------
     Theme toggle: keeps the site comfortable in light or dark.
  --------------------------------------------------------- */
  var themeToggle = document.getElementById("themeToggle");
  var setTheme = function (theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("lg-theme", theme);
    if (themeToggle) {
      var isDark = theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  };
  setTheme(localStorage.getItem("lg-theme") || "light");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Nav: solid background once the hero starts scrolling away
  --------------------------------------------------------- */
  var nav = document.getElementById("nav");
  if (nav) {
    var updateNav = function () {
      if (window.scrollY > 24) {
        nav.classList.add("is-scrolled");
      } else {
        nav.classList.remove("is-scrolled");
      }
    };
    updateNav();
    window.addEventListener("scroll", updateNav, { passive: true });
  }

  /* ---------------------------------------------------------
     Scroll reveal: fade/rise elements into view once, then
     leave them alone. Falls back to "just show everything" if
     IntersectionObserver isn't available or motion is reduced.
  --------------------------------------------------------- */
  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll(".reveal")
  );

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------
     Feature "heart rate" demo line: only draw once it's on
     screen, so the animation reads as a reveal rather than
     something that already happened off-screen.
  --------------------------------------------------------- */
  var bpmDemo = document.querySelector(".bpm-demo");
  if (bpmDemo && "IntersectionObserver" in window) {
    var bpmObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            bpmObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    bpmObserver.observe(bpmDemo);
  } else if (bpmDemo) {
    bpmDemo.classList.add("in-view");
  }

  /* ---------------------------------------------------------
     Hero BPM chip: a gentle, believable live tick so the hero
     visual feels alive rather than static - small variation
     around a resting heart rate, nothing dramatic.
  --------------------------------------------------------- */
  var bpmValueEl = document.getElementById("bpmValue");
  if (bpmValueEl && !prefersReducedMotion) {
    var currentBpm = 82;
    setInterval(function () {
      var drift = Math.round((Math.random() - 0.5) * 4);
      currentBpm = Math.min(96, Math.max(70, currentBpm + drift));
      bpmValueEl.textContent = currentBpm;
    }, 2200);
  }

  /* ---------------------------------------------------------
     Early access form: front-end only for this landing page.
     Validates, shows a success state, and resets politely.
  --------------------------------------------------------- */
  var ctaForm = document.getElementById("ctaForm");
  var ctaNote = document.getElementById("ctaNote");
  if (ctaForm && ctaNote) {
    var defaultNote = ctaNote.textContent;
    ctaForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var emailInput = document.getElementById("ctaEmail");
      var email = emailInput ? emailInput.value.trim() : "";
      var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValidEmail) {
        ctaNote.textContent = "That email does not look quite right. Mind checking it?";
        ctaNote.classList.remove("is-success");
        emailInput.focus();
        return;
      }

      ctaForm.classList.add("is-success");
      ctaNote.textContent = "You are on the list. We will be in touch soon.";
      ctaNote.classList.add("is-success");
      emailInput.value = "";
      emailInput.blur();

      window.setTimeout(function () {
        ctaForm.classList.remove("is-success");
        ctaNote.classList.remove("is-success");
        ctaNote.textContent = defaultNote;
      }, 5000);
    });
  }

  /* ---------------------------------------------------------
     Smooth-scroll for in-page nav links (native scroll-behavior
     already handles most browsers; this only adds a focus jump
     for keyboard/screen-reader users landing on the section).
  --------------------------------------------------------- */
  var inPageLinks = document.querySelectorAll('a[href^="#"]');
  inPageLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      var targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      var target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      window.setTimeout(function () {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }, prefersReducedMotion ? 0 : 500);
    });
  });
})();
