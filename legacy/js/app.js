/* ============================================================
   ANGEL 96.1FM — CORE APP SCRIPT
   Handles: sticky nav shrink, mobile drawer, search toggle,
   live clock, dark mode, scroll reveal, back-to-top,
   dynamic active nav, listener counter, weather mock, newsletter
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Mobile drawer ---------- */
  const hamburger = document.querySelector(".hamburger");
  const mobileNav = document.querySelector(".mobile-nav");
  const scrim = document.querySelector(".scrim");
  const closeDrawer = document.querySelector(".close-drawer");

  function openDrawer() {
    mobileNav?.classList.add("open");
    scrim?.classList.add("show");
    hamburger?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeDrawerFn() {
    mobileNav?.classList.remove("open");
    scrim?.classList.remove("show");
    hamburger?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  hamburger?.addEventListener("click", openDrawer);
  closeDrawer?.addEventListener("click", closeDrawerFn);
  scrim?.addEventListener("click", closeDrawerFn);
  document.querySelectorAll(".mobile-nav a").forEach((a) =>
    a.addEventListener("click", closeDrawerFn)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawerFn();
  });

  /* ---------- Search panel toggle ---------- */
  const searchToggle = document.querySelector(".search-toggle");
  const searchPanel = document.querySelector(".search-panel");
  searchToggle?.addEventListener("click", () => {
    const willOpen = !searchPanel.classList.contains("open");
    searchPanel.classList.toggle("open");
    searchToggle.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) searchPanel.querySelector("input")?.focus();
  });

  /* ---------- Dynamic active nav (based on current page) ---------- */
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a, .mobile-nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  /* ---------- Live clock ---------- */
  const clockEl = document.querySelector("[data-clock]");
  const dateEl = document.querySelector("[data-date]");
  function tickClock() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- Dark mode ---------- */
  const themeToggle = document.querySelector(".theme-toggle");
  const savedTheme = localStorage.getItem("angel-fm-theme");
  if (savedTheme === "dark") document.documentElement.setAttribute("data-theme", "dark");
  function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (themeToggle) themeToggle.textContent = isDark ? "☀️" : "🌙";
  }
  updateThemeIcon();
  themeToggle?.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("angel-fm-theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("angel-fm-theme", "dark");
    }
    updateThemeIcon();
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Back to top ---------- */
  const backToTop = document.querySelector(".back-to-top");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 500) backToTop?.classList.add("show");
    else backToTop?.classList.remove("show");
  });
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Header hide-on-scroll-down ---------- */
  let lastY = window.scrollY;
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (header) {
      if (y > lastY && y > 200) header.style.transform = "translateY(-100%)";
      else header.style.transform = "translateY(0)";
    }
    lastY = y;
  });

  /* ---------- Animated counters (listeners, stats) ---------- */
  document.querySelectorAll("[data-count-to]").forEach((el) => {
    const target = parseInt(el.getAttribute("data-count-to"), 10);
    let current = 0;
    const step = Math.max(1, Math.round(target / 60));
    const run = () => {
      current += step;
      if (current >= target) {
        el.textContent = target.toLocaleString();
      } else {
        el.textContent = current.toLocaleString();
        requestAnimationFrame(run);
      }
    };
    if ("IntersectionObserver" in window) {
      const io2 = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            io2.unobserve(entry.target);
          }
        });
      });
      io2.observe(el);
    } else {
      run();
    }
  });

  /* Slowly fluctuate the live listener count for a "live" feel */
  const liveCountEl = document.querySelector("[data-live-listeners]");
  if (liveCountEl) {
    setInterval(() => {
      const base = parseInt(liveCountEl.getAttribute("data-base"), 10) || 1240;
      const jitter = Math.floor(Math.random() * 30) - 15;
      liveCountEl.textContent = (base + jitter).toLocaleString();
    }, 4000);
  }

  /* ---------- Weather widget (mock — no external API) ---------- */
  const weatherTemp = document.querySelector("[data-weather-temp]");
  if (weatherTemp) {
    weatherTemp.textContent = "29°C";
  }

  /* ---------- Newsletter validation ---------- */
  document.querySelectorAll(".newsletter-form, .newsletter-mini").forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const input = form.querySelector("input[type='email']");
      const msg = form.querySelector(".form-msg");
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!emailOk) {
        if (msg) {
          msg.textContent = "Please enter a valid email address.";
          msg.className = "form-msg err";
        }
        input.focus();
        return;
      }
      if (msg) {
        msg.textContent = "Thanks! You're subscribed to the Angel FM newsletter.";
        msg.className = "form-msg ok";
      }
      form.reset();
    });
  });

  /* ---------- Site-wide search (basic client filter demo) ---------- */
  document.querySelectorAll(".search-panel form, .search-inline").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = form.querySelector("input").value.trim();
      if (!q) return;
      window.location.href = `news.html?q=${encodeURIComponent(q)}`;
    });
  });
})();
