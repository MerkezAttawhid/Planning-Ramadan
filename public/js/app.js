/* =========================================================
   PLANNING APP – SINGLE PAGE
   ========================================================= */

const API_URL = window.APP_CONFIG.API_URL;
let calendar = null;

/* ================= COULEURS ================= */

const COLOR_PALETTE = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#7c3aed",
  "#ea580c",
  "#0d9488",
  "#ca8a04",
  "#9333ea"
];

function colorFromTitle(title) {
  if (!title) return COLOR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

/* ================= CORE ================= */

async function loadPlanning(type) {
  // Bouton actif
  document.querySelectorAll(".home-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-type="${type}"]`).classList.add("active");

  const section = document.getElementById("planning-section");
  const loading = document.getElementById("loading");
  const calendarEl = document.getElementById("calendar");

  section.style.display = "block";
  section.scrollIntoView({ behavior: "smooth" });

  // TRANSITION
  loading.style.display = "block";
  calendarEl.classList.add("loading");

  document.querySelectorAll(".home-btn").forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = "0.6";
  });

  let data;
  try {
    const res = await fetch(`${API_URL}?type=${type}`);
    if (!res.ok) throw new Error("API error");
    data = await res.json();
  } catch (err) {
    loading.innerText = "❌ Erreur de chargement";
    return;
  }

  const events = data.map(ev => {
    const color = colorFromTitle(ev.title);
    return {
      title: ev.title || "Cours",
      start: ev.start,
      end: ev.end,
      backgroundColor: color,
      borderColor: color
    };
  });

  if (calendar) {
    calendar.removeAllEvents();
    calendar.addEventSource(events);
  } else {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "timeGridWeek",
      locale: "fr",
      firstDay: 1,
      allDaySlot: false,
      height: "auto",
      slotMinTime: "09:00:00",
      slotMaxTime: "20:00:00",
      nowIndicator: true,
      events
    });
    calendar.render();
  }

  // FIN TRANSITION
  loading.style.display = "none";
  calendarEl.classList.remove("loading");

  document.querySelectorAll(".home-btn").forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = "1";
  });
}

/* ================= EVENTS ================= */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".home-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      loadPlanning(btn.dataset.type);
    });
  });
});
