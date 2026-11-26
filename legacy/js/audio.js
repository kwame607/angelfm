/* ============================================================
   ANGEL 96.1FM — AUDIO PLAYER
   Simulated live-stream player UI (progress, volume, quality,
   favorite, share). No real audio source is wired up.
   ============================================================ */
(function () {
  "use strict";
  const player = document.querySelector("[data-player]");
  if (!player) return;

  const playBtn = player.querySelector("[data-play]");
  const stopBtn = player.querySelector("[data-stop]");
  const muteBtn = player.querySelector("[data-mute]");
  const volume = player.querySelector("[data-volume]");
  const progressFill = player.querySelector(".progress-fill");
  const progressBar = player.querySelector(".progress-bar");
  const elapsedEl = player.querySelector("[data-elapsed]");
  const remainingEl = player.querySelector("[data-remaining]");
  const favBtn = player.querySelector("[data-favorite]");
  const shareBtn = player.querySelector("[data-share]");
  const qualityChips = player.querySelectorAll(".quality-chip");

  let playing = false;
  let elapsed = 0;
  const total = 180; // demo 3-minute loop for the progress bar
  let timer = null;

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function updateProgress() {
    const pct = (elapsed / total) * 100;
    if (progressFill) progressFill.style.width = pct + "%";
    if (elapsedEl) elapsedEl.textContent = formatTime(elapsed);
    if (remainingEl) remainingEl.textContent = "-" + formatTime(total - elapsed);
  }

  function play() {
    playing = true;
    playBtn.innerHTML = pauseIcon();
    playBtn.setAttribute("aria-label", "Pause");
    timer = setInterval(() => {
      elapsed = (elapsed + 1) % total;
      updateProgress();
    }, 1000);
  }

  function pause() {
    playing = false;
    playBtn.innerHTML = playIcon();
    playBtn.setAttribute("aria-label", "Play");
    clearInterval(timer);
  }

  function playIcon() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }
  function pauseIcon() {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
  }

  playBtn?.addEventListener("click", () => (playing ? pause() : play()));

  stopBtn?.addEventListener("click", () => {
    pause();
    elapsed = 0;
    updateProgress();
  });

  progressBar?.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    elapsed = Math.max(0, Math.min(total, Math.round(ratio * total)));
    updateProgress();
  });

  let lastVolume = 80;
  volume?.addEventListener("input", () => {
    if (parseInt(volume.value, 10) === 0) {
      muteBtn.textContent = "🔇";
    } else {
      muteBtn.textContent = "🔊";
    }
  });

  muteBtn?.addEventListener("click", () => {
    if (parseInt(volume.value, 10) > 0) {
      lastVolume = volume.value;
      volume.value = 0;
      muteBtn.textContent = "🔇";
    } else {
      volume.value = lastVolume;
      muteBtn.textContent = "🔊";
    }
  });

  qualityChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      qualityChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    });
  });

  let isFav = false;
  favBtn?.addEventListener("click", () => {
    isFav = !isFav;
    favBtn.textContent = isFav ? "★ Favourited" : "☆ Favourite";
    favBtn.classList.toggle("btn-gold", isFav);
  });

  shareBtn?.addEventListener("click", async () => {
    const shareData = {
      title: "Angel 96.1FM — Listen Live",
      text: "Tune in to Angel 96.1FM, the finest, live right now!",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        shareBtn.textContent = "Link copied!";
        setTimeout(() => (shareBtn.textContent = "Share Stream"), 2000);
      }
    } catch (err) {
      /* user cancelled share — no action needed */
    }
  });

  updateProgress();

  /* ---------- Contact form validation ---------- */
  const contactForm = document.querySelector("[data-contact-form]");
  contactForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;
    const fields = contactForm.querySelectorAll("[data-required]");
    fields.forEach((field) => {
      const row = field.closest(".form-row");
      let ok = field.value.trim().length > 1;
      if (field.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      if (field.type === "tel") ok = /^[0-9+\-\s()]{7,}$/.test(field.value.trim());
      row.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });
    const successEl = contactForm.querySelector(".form-success");
    if (valid) {
      successEl?.classList.remove("hidden");
      contactForm.reset();
    } else {
      successEl?.classList.add("hidden");
    }
  });
})();
