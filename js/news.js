/* ============================================================
   ANGEL 96.1FM — NEWS PAGE
   ============================================================ */
(function () {
  "use strict";
  const feed = document.querySelector("[data-article-feed]");
  if (!feed) return;

  const articles = Array.from(feed.querySelectorAll("[data-category]"));

  /* ---------- Category filter ---------- */
  document.querySelectorAll("[data-cat-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-cat-btn]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.catBtn;
      articles.forEach((a) => {
        const show = cat === "all" || a.dataset.category === cat;
        a.style.display = show ? "" : "none";
      });
    });
  });

  /* ---------- In-page search ---------- */
  const searchInput = document.querySelector("[data-news-search]");
  searchInput?.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    articles.forEach((a) => {
      const text = a.textContent.toLowerCase();
      a.style.display = !q || text.includes(q) ? "" : "none";
    });
  });

  /* ---------- Pre-fill from ?q= param (site-wide search hand-off) ---------- */
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q && searchInput) {
    searchInput.value = q;
    searchInput.dispatchEvent(new Event("input"));
  }

  /* ---------- Pagination (demo — toggles a "page" class, feed is static) ---------- */
  document.querySelectorAll("[data-page-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      document.querySelectorAll("[data-page-btn]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      feed.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
