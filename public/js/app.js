/* =========================================================
   PLANNING APP – SINGLE PAGE
   ========================================================= */

const API_URL = window.APP_CONFIG.API_URL;

let calendar = null;

/* ================= UTILS ================= */

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
  const section = document.getElementById("planning-section");
  section.style.display = "block";
  section.scrollIntoView({ behavior: "smooth" });

  let data;
  try {
    const res = await fetch(`${API_URL}?type=${type}`);
    if (!res.ok) throw new Error("API error");
    data = await res.json();
  } catch (err) {
    section.innerHTML = "<p>❌ Impossible de charger le planning</p>";
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
    return;
  }

  calendar = new FullCalendar.Calendar(
    document.getElementById("calendar"),
    {
      initialView: "timeGridWeek",
      locale: "fr",
      firstDay: 1,
      allDaySlot: false,
      height: "auto",
      slotMinTime: "09:00:00",
      slotMaxTime: "20:00:00",
      nowIndicator: true,

      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "timeGridWeek,timeGridDay,dayGridMonth"
      },

      events
    }
  );

  calendar.render();
}

/* ================= EVENTS ================= */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".home-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      loadPlanning(btn.dataset.type);
    });
  });
});
