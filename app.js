/* ============================================================
   Hasara & Shehara · Engagement Invitation
   ------------------------------------------------------------
   RSVP STORAGE: Google Apps Script Web App (100% free, no signup
   beyond a Google account). Deploy the Apps Script (see README
   instructions the developer gave you) and paste the resulting
   Web App URL into RSVP_ENDPOINT below.
   ============================================================ */
const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbwGw3M7Gk5JiQe5ihNxZ7S0BzMvAhkEv_dIuTuaUUrhd4ibpS3GirtOICB75QRF-qXk3Q/exec";
const EVENT_DATE = new Date("2026-08-20T09:30:00+05:30"); // Sri Lanka time
/* ---------- Loader ---------- */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("hide"), 700);
});
/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add("in"), i * 80);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
/* ---------- Countdown ---------- */
function pad(n){ return String(n).padStart(2,"0"); }
function tick(){
  const now = new Date();
  let diff = EVENT_DATE - now;
  if (diff < 0) diff = 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById("cdD").textContent = pad(d);
  document.getElementById("cdH").textContent = pad(h);
  document.getElementById("cdM").textContent = pad(m);
  document.getElementById("cdS").textContent = pad(s);
}
tick(); setInterval(tick, 1000);
/* ---------- Smooth haptic-style feedback on radio ---------- */
document.querySelectorAll('.attend input[type=radio]').forEach(r=>{
  r.addEventListener('change',()=>{ if(navigator.vibrate) navigator.vibrate(15); });
});
/* ---------- RSVP submit ---------- */
const form = document.getElementById("rsvpForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  const fd = new FormData(form);
  const payload = {
    name: fd.get("name")?.toString().trim(),
    phone: fd.get("phone")?.toString().trim(),
    attending: fd.get("attending"),
    guests: fd.get("guests"),
    side: fd.get("side"),
    message: fd.get("message")?.toString().trim(),
    timestamp: new Date().toISOString()
  };
  if (!payload.name || !payload.phone || !payload.attending) {
    statusEl.textContent = "Please fill all required fields.";
    return;
  }
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  try {
    if (!RSVP_ENDPOINT || RSVP_ENDPOINT.startsWith("PASTE_")) {
      // Fallback while endpoint not configured — save locally so the demo works
      const local = JSON.parse(localStorage.getItem("rsvps") || "[]");
      local.push(payload);
      localStorage.setItem("rsvps", JSON.stringify(local));
    } else {
      // Google Apps Script Web App — use text/plain to avoid CORS preflight
      await fetch(RSVP_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
    }
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
    form.style.display = "none";
    document.getElementById("thanks").style.display = "block";
    document.getElementById("thanks").scrollIntoView({ behavior:"smooth", block:"center" });
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Something went wrong. Please try again.";
    submitBtn.disabled = false;
    submitBtn.textContent = "Send RSVP";
  }
});