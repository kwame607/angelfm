/* ============================================================
   ANGEL 96.1FM — PROGRAM SCHEDULE
   ============================================================ */
(function () {
  "use strict";
  const table = document.querySelector("[data-schedule-table]");
  if (!table) return;

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const SLOTS = [
    { start: 6, end: 9, part: "morning" },
    { start: 9, end: 12, part: "morning" },
    { start: 12, end: 15, part: "afternoon" },
    { start: 15, end: 18, part: "afternoon" },
    { start: 18, end: 21, part: "evening" },
    { start: 21, end: 24, part: "evening" },
  ];

  // Demo programming grid — same core lineup with weekend variants
  const PROGRAMS = {
    "6-9": { name: "Angel Wake-Up Show", host: "Kojo Mensah", cat: "Breakfast", desc: "Start your day with the finest mix of news, traffic, weather and feel-good music." },
    "9-12": { name: "Mid-Morning Vibes", host: "Ama Serwaa", cat: "Lifestyle", desc: "Lifestyle chats, relationship talk and the best throwback playlist in town." },
    "12-15": { name: "Angel News Hour", host: "Kwabena Otu", cat: "News", desc: "In-depth coverage of the day's top stories, politics and business headlines." },
    "15-18": { name: "Drive Time Live", host: "Efua Asante", cat: "Entertainment", desc: "The perfect soundtrack for your commute — hits, banter and listener call-ins." },
    "18-21": { name: "Angel Sports Desk", host: "Yaw Boateng", cat: "Sports", desc: "Match analysis, transfer news, and the loudest sports debate on radio." },
    "21-24": { name: "Late Night Grooves", host: "Nana Adjoa", cat: "Music", desc: "Smooth, slow, and soulful — the perfect wind-down to your night." },
  };
  const WEEKEND_PROGRAMS = {
    "6-9": { name: "Weekend Wake-Up", host: "Kojo Mensah", cat: "Breakfast", desc: "A relaxed start to your weekend with easy listening and light news." },
    "9-12": { name: "Family Hour", host: "Ama Serwaa", cat: "Lifestyle", desc: "Family-friendly discussions, health tips and community spotlights." },
    "12-15": { name: "Weekend Jams", host: "Efua Asante", cat: "Music", desc: "Non-stop weekend party mix across every genre you love." },
    "15-18": { name: "Sports Weekend", host: "Yaw Boateng", cat: "Sports", desc: "Full weekend fixtures coverage and live match commentary." },
    "18-21": { name: "The Request Line", host: "Nana Adjoa", cat: "Music", desc: "You call, we play — listener requests all evening long." },
    "21-24": { name: "Angel Afterglow", host: "Kwabena Otu", cat: "Music", desc: "Chilled-out sounds to close your weekend night." },
  };

  function getProgram(day, slot) {
    const key = `${slot.start}-${slot.end}`;
    const isWeekend = day === "Saturday" || day === "Sunday";
    return isWeekend ? WEEKEND_PROGRAMS[key] : PROGRAMS[key];
  }

  function fmtHour(h) {
    const period = h >= 12 ? "PM" : "AM";
    let hour = h % 12;
    if (hour === 0) hour = 12;
    return `${hour}${period}`;
  }

  function isNow(day, slot) {
    const now = new Date();
    const todayName = DAYS[(now.getDay() + 6) % 7]; // Monday-indexed
    if (todayName !== day) return false;
    const h = now.getHours();
    return h >= slot.start && h < slot.end;
  }

  let currentFilter = "all";
  let currentQuery = "";

  function renderTable() {
    let thead = "<thead><tr><th>Time</th>";
    DAYS.forEach((d) => (thead += `<th>${d}</th>`));
    thead += "</tr></thead>";

    let tbody = "<tbody>";
    SLOTS.forEach((slot) => {
      if (currentFilter !== "all" && currentFilter !== "weekend" && slot.part !== currentFilter) return;
      tbody += `<tr><td class="time-col">${fmtHour(slot.start)} – ${fmtHour(slot.end)}</td>`;
      DAYS.forEach((day) => {
        if (currentFilter === "weekend" && day !== "Saturday" && day !== "Sunday") {
          tbody += `<td></td>`;
          return;
        }
        const program = getProgram(day, slot);
        const live = isNow(day, slot);
        const matchesSearch =
          !currentQuery ||
          program.name.toLowerCase().includes(currentQuery) ||
          program.host.toLowerCase().includes(currentQuery) ||
          program.cat.toLowerCase().includes(currentQuery);
        if (!matchesSearch) {
          tbody += `<td><span class="slot-empty">—</span></td>`;
          return;
        }
        tbody += `<td><span class="slot ${live ? "slot-live" : ""}" data-day="${day}" data-slot="${slot.start}-${slot.end}" tabindex="0" role="button" aria-haspopup="dialog">${program.name}${live ? " · LIVE" : ""}</span></td>`;
      });
      tbody += "</tr>";
    });
    tbody += "</tbody>";
    table.innerHTML = thead + tbody;

    table.querySelectorAll(".slot").forEach((el) => {
      el.addEventListener("click", () => openModal(el.dataset.day, el.dataset.slot));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(el.dataset.day, el.dataset.slot);
        }
      });
    });
  }

  /* ---------- Modal ---------- */
  const overlay = document.querySelector("[data-program-modal]");
  function openModal(day, slotKey) {
    const [start, end] = slotKey.split("-").map(Number);
    const slot = SLOTS.find((s) => s.start === start && s.end === end);
    const program = getProgram(day, slot);
    if (!overlay) return;
    overlay.querySelector("[data-modal-name]").textContent = program.name;
    overlay.querySelector("[data-modal-day]").textContent = `${day}, ${fmtHour(start)}–${fmtHour(end)}`;
    overlay.querySelector("[data-modal-host]").textContent = program.host;
    overlay.querySelector("[data-modal-cat]").textContent = program.cat;
    overlay.querySelector("[data-modal-duration]").textContent = `${end - start} hrs`;
    overlay.querySelector("[data-modal-desc]").textContent = program.desc;
    overlay.classList.add("open");
    overlay.querySelector(".modal-close")?.focus();
  }
  function closeModal() {
    overlay?.classList.remove("open");
  }
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  overlay?.querySelector(".modal-close")?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  /* ---------- Filters ---------- */
  document.querySelectorAll("[data-schedule-filter]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-schedule-filter]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.scheduleFilter;
      renderTable();
    });
  });

  /* ---------- Search ---------- */
  const searchInput = document.querySelector("[data-schedule-search]");
  searchInput?.addEventListener("input", () => {
    currentQuery = searchInput.value.trim().toLowerCase();
    renderTable();
  });

  /* ---------- Countdown to next program ---------- */
  const countdownEl = document.querySelector("[data-next-countdown]");
  function updateCountdown() {
    if (!countdownEl) return;
    const now = new Date();
    const nextHourSlot = SLOTS.find((s) => s.start > now.getHours()) || SLOTS[0];
    const target = new Date(now);
    target.setHours(nextHourSlot.start, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const diff = target - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    countdownEl.textContent = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  renderTable();
})();
