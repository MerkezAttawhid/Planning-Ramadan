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

  // Boutons : état loading
  buttons.forEach(btn => {
    btn.classList.remove("active");
    btn.disabled = true;
    btn.style.opacity = "0.6";
  });
  document.querySelector(`[data-type="${type}"]`).classList.add("active");

  // Affichage section
  section.style.display = "block";
  section.scrollIntoView({ behavior: "smooth" });

  // Overlay ON
  overlay.style.display = "flex";
  overlay.innerText = "Chargement du planning…";

  let data;
  try {
    const res = await fetch(`${API_URL}?type=${type}`);
    if (!res.ok) throw new Error("API error");
    data = await res.json();
  } catch (err) {
    overlay.innerText = "❌ Erreur de chargement";
    buttons.forEach(btn => (btn.disabled = false));
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

  /* ===== FULLCALENDAR ===== */

  if (calendar) {
    calendar.removeAllEvents();
    calendar.addEventSource(events);

    // 🔥 FIX FULLCALENDAR (changement de source)
    setTimeout(() => {
      calendar.updateSize();
    }, 50);

  } else {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "timeGridWeek",
      locale: "fr",
      firstDay: 1,
      allDaySlot: false,
      height: "auto",
      slotMinTime: "07:00:00",
      slotMaxTime: "23:59:00",
      nowIndicator: true,

      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "timeGridWeek,timeGridDay,dayGridMonth"
      },

      events
    });

    calendar.render();

    // 🔥 FIX FULLCALENDAR (premier render)
    setTimeout(() => {
      calendar.updateSize();
    }, 50);
  }

  // Overlay OFF
  overlay.style.display = "none";

  // Boutons réactivés
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
