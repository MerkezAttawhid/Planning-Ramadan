/* =========================================================
   PLANNING APP – SINGLE PAGE (STABLE)
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
  const buttons = document.querySelectorAll(".home-btn");
  const section = document.getElementById("planning-section");
  const overlay = document.getElementById("calendar-overlay");
  const calendarEl = document.getElementById("calendar");

  /* ---------- UI : loading ---------- */

  buttons.forEach(btn => {
    btn.classList.remove("active");
    btn.disabled = true;
    btn.style.opacity = "0.6";
  });
  document.querySelector(`[data-type="${type}"]`).classList.add("active");

  section.style.display = "block";
  section.scrollIntoView({ behavior: "smooth" });

  overlay.style.display = "flex";
  overlay.innerText = "Chargement du planning…";

  /* ---------- Fetch API ---------- */

  let data;
  try {
    const res = await fetch(`${API_URL}?type=${type}`);
    if (!res.ok) throw new Error("API error");
    data = await res.json();
  } catch (err) {
    overlay.innerText = "❌ Erreur de chargement";
    buttons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = "1";
    });
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

  /* ================= FULLCALENDAR ================= */

  if (calendar) {
    // Mise à jour des événements
    calendar.removeAllEvents();
    calendar.addEventSource(events);

    setTimeout(() => {
      calendar.updateSize();
      calendar.scrollToTime("07:00:00");
    }, 50);

  } else {
    // Création initiale
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: window.innerWidth < 768 ? "timeGridDay" : "timeGridWeek",
      locale: "fr",
      firstDay: 1,
      allDaySlot: false,

      /* 🔥 CLÉ UX : tout visible sans scroll vertical */
      height: "100%",
      expandRows: true,

      slotMinTime: "07:00:00",
      slotMaxTime: "24:00:00",

      nowIndicator: true,

      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "timeGridWeek,timeGridDay"
      },

      events
    });

    calendar.render();

    setTimeout(() => {
      calendar.updateSize();
      calendar.scrollToTime("07:00:00");
    }, 50);
  }

  /* ---------- UI : fin loading ---------- */

  overlay.style.display = "none";

  buttons.forEach(btn => {
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
