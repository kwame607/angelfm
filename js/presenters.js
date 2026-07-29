/* ============================================================
   ANGEL 96.1FM — PRESENTERS PAGE
   ============================================================ */
(function () {
  "use strict";
  const grid = document.querySelector("[data-presenter-grid]");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll("[data-presenter-name]"));
  const searchInput = document.querySelector("[data-presenter-search]");

  searchInput?.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    cards.forEach((card) => {
      const match = card.textContent.toLowerCase().includes(q);
      card.style.display = match ? "" : "none";
    });
  });
})();
