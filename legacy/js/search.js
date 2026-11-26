/* ============================================================
   ANGEL 96.1FM — SITE-WIDE SEARCH SUGGESTIONS
   Lightweight autocomplete for the header search panel.
   ============================================================ */
(function () {
  "use strict";
  const SEARCH_INDEX = [
    { title: "Government Unveils New Roads Budget", type: "News", url: "news.html" },
    { title: "Black Stars Qualify for Finals", type: "News", url: "news.html" },
    { title: "Angel Wake-Up Show", type: "Program", url: "schedule.html" },
    { title: "Drive Time Live", type: "Program", url: "schedule.html" },
    { title: "Kojo Mensah", type: "Presenter", url: "presenters.html" },
    { title: "Ama Serwaa", type: "Presenter", url: "presenters.html" },
    { title: "Efua Asante", type: "Presenter", url: "presenters.html" },
    { title: "Listen Live", type: "Page", url: "listen.html" },
  ];

  const panel = document.querySelector(".search-panel");
  if (!panel) return;
  const input = panel.querySelector("input");
  let box = document.createElement("div");
  box.className = "search-suggestions";
  box.style.cssText =
    "max-width:100%;margin-top:8px;display:flex;flex-direction:column;gap:2px;";
  input?.insertAdjacentElement("afterend", null); // no-op, kept for structure clarity
  panel.querySelector("form")?.insertAdjacentElement("afterend", box);

  input?.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    box.innerHTML = "";
    if (!q) return;
    const results = SEARCH_INDEX.filter((item) => item.title.toLowerCase().includes(q)).slice(0, 5);
    results.forEach((item) => {
      const a = document.createElement("a");
      a.href = item.url;
      a.textContent = `${item.title} — ${item.type}`;
      a.style.cssText =
        "color:#F3F1EA;font-size:13.5px;padding:8px 4px;border-bottom:1px solid rgba(255,255,255,.08);";
      box.appendChild(a);
    });
  });
})();
