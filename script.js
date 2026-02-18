// ===== State =====
let selectedDriver = null;   // { id, name }
let selectedVehicle = null;  // { id, name }
let selectedPayment = null;  // string

// ===== Elements =====
const driversGrid = document.getElementById("driversGrid");
const fleetGrid = document.getElementById("fleetGrid");
const vehicleHint = document.getElementById("vehicleHint");
const driverHint = document.getElementById("driverHint");

const bookingForm = document.getElementById("bookingForm");
const submitBtn = document.getElementById("submitBtn");
const formError = document.getElementById("formError");

const summaryDriver = document.getElementById("summaryDriver");
const summaryVehicle = document.getElementById("summaryVehicle");
const summaryDateTime = document.getElementById("summaryDateTime");
const summaryPickup = document.getElementById("summaryPickup");
const summaryDropoff = document.getElementById("summaryDropoff");
const summaryPayment = document.getElementById("summaryPayment");
const summaryTotal = document.getElementById("summaryTotal");

const stickyBookBtn = document.getElementById("stickyBookBtn");
const backToTopBtn = document.getElementById("backToTopBtn");
const yearEl = document.getElementById("year");

// Maps
const mapFrame = document.getElementById("mapFrame");
const mapPickupText = document.getElementById("mapPickupText");
const mapDropoffText = document.getElementById("mapDropoffText");
const openPickupBtn = document.getElementById("openPickupBtn");
const openDropoffBtn = document.getElementById("openDropoffBtn");
const openRouteBtn = document.getElementById("openRouteBtn");

// ===== Helpers =====
function lockVehicles(lock = true){
  document.querySelectorAll(".vehicle-card").forEach(card => {
    card.classList.toggle("locked", lock);
  });
  vehicleHint.textContent = lock ? "Locked: Select a driver first" : "Required: Select 1 vehicle";
}

function setSelectedCard(selector, cardEl){
  document.querySelectorAll(selector).forEach(c => c.classList.remove("selected"));
  cardEl.classList.add("selected");
}

function refreshSummary(){
  summaryDriver.textContent = selectedDriver?.name || "None";
  summaryVehicle.textContent = selectedVehicle?.name || "None";
  summaryPayment.textContent = selectedPayment || "None";
}

function canEnableSubmit(){
  // Rule: driver + vehicle required before submit enabled
  return Boolean(selectedDriver && selectedVehicle);
}

function syncSubmitButton(){
  submitBtn.disabled = !canEnableSubmit();
}

function showError(msg){ formError.textContent = msg; }
function clearError(){ formError.textContent = ""; }

function validateEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function updateSummaryFromForm(){
  const fd = new FormData(bookingForm);

  const date = (fd.get("date") || "").toString().trim();
  const time = (fd.get("time") || "").toString().trim();
  summaryDateTime.textContent = (date && time) ? `${date} • ${time}` : "—";

  const pickup = (fd.get("pickup") || "").toString().trim();
  const dropoff = (fd.get("dropoff") || "").toString().trim();
  summaryPickup.textContent = pickup || "—";
  summaryDropoff.textContent = dropoff || "—";

  // Placeholder estimate
  summaryTotal.textContent = "$ —";
}

function validateForm(){
  const fd = new FormData(bookingForm);
  const required = ["fullName","phone","email","pickup","dropoff","date","time","tripType"];

  for (const key of required){
    const val = (fd.get(key) || "").toString().trim();
    if (!val) return { ok:false, msg:"Please fill in all required fields." };
  }

  if (!validateEmail(fd.get("email"))) {
    return { ok:false, msg:"Please enter a valid email address." };
  }

  if (!selectedPayment) {
    return { ok:false, msg:"Please select a payment method (Debit, Credit, or Apple Pay)." };
  }

  return { ok:true };
}

// ===== Maps helpers =====
function enc(q){ return encodeURIComponent(String(q || "").trim()); }

function updateMapAndLinks(pickup, dropoff){
  const p = String(pickup || "").trim();
  const d = String(dropoff || "").trim();

  mapPickupText.textContent = p || "—";
  mapDropoffText.textContent = d || "—";

  const pickupUrl = p ? `https://www.google.com/maps/search/?api=1&query=${enc(p)}` : `https://www.google.com/maps?q=${enc("[Your City/Areas]")}`;
  const dropoffUrl = d ? `https://www.google.com/maps/search/?api=1&query=${enc(d)}` : `https://www.google.com/maps?q=${enc("[Your City/Areas]")}`;
  const routeUrl = (p && d)
    ? `https://www.google.com/maps/dir/?api=1&origin=${enc(p)}&destination=${enc(d)}`
    : `https://www.google.com/maps?q=${enc("[Your City/Areas]")}`;

  openPickupBtn.href = pickupUrl;
  openDropoffBtn.href = dropoffUrl;
  openRouteBtn.href = routeUrl;

  if (p && d) {
    mapFrame.src = `https://www.google.com/maps?q=${enc(p + " to " + d)}&output=embed`;
  } else if (p) {
    mapFrame.src = `https://www.google.com/maps?q=${enc(p)}&output=embed`;
  } else {
    mapFrame.src = `https://www.google.com/maps?q=${enc("[Your City/Areas]")}&output=embed`;
  }
}

// ===== Reveal animation =====
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("show"); });
},{ threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ===== Driver selection =====
driversGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".select-driver");
  if (!btn) return;

  const card = e.target.closest(".driver-card");
  if (!card) return;

  const name = card.querySelector(".card-title").textContent.trim();
  const id = card.getAttribute("data-driver-id");

  selectedDriver = { id, name };
  setSelectedCard(".driver-card", card);

  driverHint.textContent = "Selected ✓";
  lockVehicles(false);

  refreshSummary();
  syncSubmitButton();
});

// ===== Vehicles locked until driver chosen =====
lockVehicles(true);

fleetGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".select-vehicle");
  if (!btn) return;

  if (!selectedDriver) return;

  const card = e.target.closest(".vehicle-card");
  if (!card) return;

  const name = card.querySelector(".card-title").textContent.trim();
  const id = card.getAttribute("data-vehicle-id");

  selectedVehicle = { id, name };
  setSelectedCard(".vehicle-card", card);

  vehicleHint.textContent = "Selected ✓";

  refreshSummary();
  syncSubmitButton();
});

// ===== Payment selection =====
document.querySelectorAll(".pay-option").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pay-option").forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });

    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");

    selectedPayment = btn.getAttribute("data-pay");
    refreshSummary();
    clearError();
  });
});

// ===== Live updates (summary + map) =====
bookingForm.addEventListener("input", () => {
  updateSummaryFromForm();
  const fd = new FormData(bookingForm);
  updateMapAndLinks(fd.get("pickup"), fd.get("dropoff"));
});

bookingForm.addEventListener("change", () => {
  updateSummaryFromForm();
  const fd = new FormData(bookingForm);
  updateMapAndLinks(fd.get("pickup"), fd.get("dropoff"));
});

// ===== Submit =====
bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!canEnableSubmit()){
    showError("Please select a driver and a vehicle first.");
    return;
  }

  const v = validateForm();
  if (!v.ok){
    showError(v.msg);
    return;
  }

  clearError();
  alert("Booking request submitted! You will receive confirmation shortly.");

  bookingForm.reset();

  // Reset payment UI
  document.querySelectorAll(".pay-option").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });

  selectedPayment = null;

  updateSummaryFromForm();
  refreshSummary();
  updateMapAndLinks("", "");
});

// ===== Sticky Book Now =====
stickyBookBtn.addEventListener("click", () => {
  document.getElementById("book").scrollIntoView({ behavior:"smooth" });
});

// ===== Back to top =====
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top:0, behavior:"smooth" });
});
window.addEventListener("scroll", () => {
  backToTopBtn.style.display = (window.scrollY > 600) ? "grid" : "none";
});

// ===== Footer year =====
yearEl.textContent = new Date().getFullYear();

// ===== Init =====
refreshSummary();
updateSummaryFromForm();
syncSubmitButton();
updateMapAndLinks("", "");
