/* =========================================================
   PLANNING APP – SINGLE PAGE (STABLE)
   ========================================================= */

const API_URL = window.APP_CONFIG.API_URL;
let calendar = null;

/* ================= COULEURS ================= */

const COLOR_PALETTE = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #10b981, #14b8a6)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #ef4444, #f43f5e)"
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

if (buttons.length) {
  buttons.forEach(btn => {
    btn.classList.remove("active");
    btn.disabled = true;
    btn.style.opacity = "0.6";
  });

  const activeBtn = document.querySelector(`[data-type="${type}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

if (section) {
  document.body.classList.add("planning-open");
  section.style.display = "block";
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

if (overlay) {
  overlay.style.display = "flex";
}




  /* ---------- Fetch API ---------- */

  let data;
  try {
    const res = await fetch(`${API_URL}?type=${type}`);
    if (!res.ok) throw new Error("API error");
    data = await res.json();
 } catch (err) {

  if (overlay) {
    overlay.innerHTML = `
      <div class="loader-box">
        <p style="color:#ef4444;font-weight:600;">
          ❌ Erreur de chargement
        </p>
      </div>
    `;
  }

  buttons.forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = "1";
  });

  return;
}


  const events = data.map(ev => {
  const gradient = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

  return {
    title: ev.title || "Cours",
    start: ev.start,
    end: ev.end,
    backgroundColor: "transparent",
    borderColor: "transparent",
    classNames: ["soft-event"],
    extendedProps: { gradient }
  };
});


  /* ================= FULLCALENDAR ================= */

  if (calendar) {
    calendar.removeAllEvents();
    calendar.addEventSource(events);

    setTimeout(() => {
      calendar.updateSize();
      calendar.scrollToTime("07:00:00");
    }, 50);

  } else {
  calendar = new FullCalendar.Calendar(calendarEl, {
  initialView: "timeGridWeek",
  locale: "fr",
  firstDay: 1,
  allDaySlot: false,

  height: "auto",
  expandRows: false,

  slotMinTime: "07:00:00",
  slotMaxTime: "24:00:00",

  nowIndicator: true,

  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "timeGridWeek,timeGridDay"
  },

  eventClick: function(info) {
    alert(info.event.title + "\n" + info.event.start.toLocaleString());
  },

  eventDidMount: function(info) {
    info.el.style.background = info.event.extendedProps.gradient;
  },

  events
});




    calendar.render();

    setTimeout(() => {
      calendar.updateSize();
      calendar.scrollToTime("07:00:00");
    }, 50);
  }

  window.addEventListener("resize", function() {
  if (!calendar) return;

  if (window.innerWidth < 768) {
    calendar.changeView("timeGridDay");
  } else {
    calendar.changeView("timeGridWeek");
  }

  calendar.updateSize();
});



  /* ---------- UI : fin loading ---------- */

  if (overlay) overlay.style.display = "none";

  buttons.forEach(btn => {
    btn.disabled = false;
    btn.style.opacity = "1";
  });
}

/* ================= EVENTS ================= */

document.addEventListener("DOMContentLoaded", () => {

  // Si on est sur une page planning dédiée
  if (window.PLANNING_KEY) {
    loadPlanning(window.PLANNING_KEY);
    return;
  }

  // Sinon on est sur la page d'accueil
  document.querySelectorAll(".home-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      loadPlanning(btn.dataset.type);
    });
  });

});
