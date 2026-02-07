/* =========================================================
   PLANNING APP
   - FullCalendar
   - Google Calendar (via Apps Script)
   - Couleur intelligente par titre
   ========================================================= */

/* ================= CONFIG ================= */

const API_URL = window.APP_CONFIG?.API_URL;
const PLANNING_KEY = window.PLANNING_KEY?.toLowerCase();

if (!API_URL) {
  console.error("API_URL manquante (config.js non chargé)");
}

if (!PLANNING_KEY) {
  console.error("PLANNING_KEY manquant (défini dans le HTML)");
}

/* Palette de couleurs (stable et lisible) */
const COLOR_PALETTE = [
  "#2563eb", // bleu
  "#16a34a", // vert
  "#dc2626", // rouge
  "#7c3aed", // violet
  "#ea580c", // orange
  "#0d9488", // teal
  "#ca8a04", // jaune
  "#9333ea"  // violet clair
];

/* ================= UTILS ================= */

/* Génère TOUJOURS la même couleur pour un même titre */
function colorFromTitle(title) {
  if (!title) return COLOR_PALETTE[0];

  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}

/* ================= API ================= */

async function fetchEvents() {
  if (!API_URL || !PLANNING_KEY) {
    throw new Error("Configuration incomplète");
  }

  const res = await fetch(`${API_URL}?type=${PLANNING_KEY}`);
  if (!res.ok) throw new Error("Erreur API");
  return await res.json();
}

/* ================= APP ================= */

document.addEventListener("DOMContentLoaded", async () => {
  const calendarEl = document.getElementById("calendar");

  if (!calendarEl) return;

  let events = [];

  try {
    const data = await fetchEvents();

    events = data.map(ev => {
      const title = ev.title || "Cours";
      const color = colorFromTitle(title);

      return {
        title,
        start: ev.start,
        end: ev.end,
        backgroundColor: color,
        borderColor: color
      };
    });

  } catch (err) {
    console.error(err);
    calendarEl.innerHTML =
      "<p>❌ Impossible de charger le planning (vérifie la console)</p>";
    return;
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    locale: "fr",
    firstDay: 1,
    allDaySlot: false,
    height: "auto",
    slotMinTime: "08:00:00",
    slotMaxTime: "22:00:00",

    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "timeGridWeek,timeGridDay,dayGridMonth"
    },

    events
  });

  calendar.render();
});
