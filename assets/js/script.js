(() => {
  // ===== CONFIG =====
  const WORKER_URL = "https://y.freddy-b97.workers.dev";
  const RATE_PER_MILE = 5;
  const MIN_FARE = 75;

  // ===== STATE =====
  let selectedDriverId = null;
  let selectedDriverName = null;
  let selectedVehicleId = null;
  let selectedVehicleName = null;
  let miles = null;
  let total = null;

  // ===== ELEMENTS =====
  const driverCards = document.querySelectorAll(".driver-card");
  const vehicleSection = document.getElementById("vehicles");
  const vehicleCards = document.querySelectorAll(".vehicle-card");

  const driverHint = document.getElementById("driverHint");
  const vehicleHint = document.getElementById("vehicleHint");
  const stepVehicle = document.getElementById("stepVehicle");
  const stepTrip = document.getElementById("stepTrip");

  const pickupEl = document.getElementById("pickup");
  const dropoffEl = document.getElementById("dropoff");
  const dateEl = document.getElementById("tripDate");
  const timeEl = document.getElementById("tripTime");

  const selectedDriverText = document.getElementById("selectedDriverText");
  const selectedVehicleText = document.getElementById("selectedVehicleText");
  const milesText = document.getElementById("milesText");
  const totalText = document.getElementById("totalText");
  const calcMsg = document.getElementById("calcMsg");

  const mapFrame = document.getElementById("mapFrame");
  const openPickup = document.getElementById("openPickup");
  const openDropoff = document.getElementById("openDropoff");
  const openRoute = document.getElementById("openRoute");

  const continueBtn = document.getElementById("continueBookingBtn");

  // ===== UI HELPERS =====
  function setMsg(text) {
    if (calcMsg) calcMsg.textContent = text || "";
  }

  function setEstimateUI() {
    if (selectedDriverText) selectedDriverText.textContent = selectedDriverName || "None";
    if (selectedVehicleText) selectedVehicleText.textContent = selectedVehicleName || "None";
    if (milesText) milesText.textContent = Number.isFinite(miles) ? `${miles.toFixed(1)} miles` : "—";
    if (totalText) totalText.textContent = Number.isFinite(total) ? `$${total.toFixed(2)}` : "$ —";
  }

  function lockVehicles(locked) {
    if (!vehicleSection) return;
    vehicleSection.style.opacity = locked ? "0.55" : "1";
    vehicleSection.style.pointerEvents = locked ? "none" : "auto";

    if (vehicleHint) vehicleHint.textContent = locked ? "Locked: Select a driver first" : "Required: Select 1 vehicle";
    if (stepVehicle) stepVehicle.classList.toggle("is-active", !locked);
  }

  function setDriverSelectedUI() {
    if (driverHint) driverHint.textContent = selectedDriverId ? "Selected" : "Required: Select 1 driver";
  }

  function updateMapLinks() {
    const pickup = pickupEl?.value?.trim();
    const dropoff = dropoffEl?.value?.trim();

    const pickupUrl = pickup ? `https://www.google.com/maps?q=${encodeURIComponent(pickup)}` : "#";
    const dropoffUrl = dropoff ? `https://www.google.com/maps?q=${encodeURIComponent(dropoff)}` : "#";
    const routeUrl = (pickup && dropoff)
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(dropoff)}&travelmode=driving`
      : "#";

    if (openPickup) openPickup.href = pickupUrl;
    if (openDropoff) openDropoff.href = dropoffUrl;
    if (openRoute) openRoute.href = routeUrl;

    // simple embed preview (not exact route, but shows area)
    if (mapFrame) {
      if (pickup && dropoff) {
        mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(pickup)}&output=embed`;
      } else if (pickup) {
        mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(pickup)}&output=embed`;
      } else if (dropoff) {
        mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(dropoff)}&output=embed`;
      }
    }
  }

  function updateContinueState() {
    const pickup = pickupEl?.value?.trim();
    const dropoff = dropoffEl?.value?.trim();
    const date = dateEl?.value;
    const time = timeEl?.value;

    const ready =
      !!selectedDriverId &&
      !!selectedVehicleId &&
      !!pickup &&
      !!dropoff &&
      !!date &&
      !!time &&
      Number.isFinite(miles) &&
      Number.isFinite(total);

    if (continueBtn) continueBtn.disabled = !ready;
    if (stepTrip) stepTrip.classList.toggle("is-active", ready || (!!pickup && !!dropoff));
  }

  // ===== DISTANCE =====
  async function fetchMiles(origin, destination) {
    const url = `${WORKER_URL}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || !data.miles) throw new Error(data.error || "Distance lookup failed");
    return Number(data.miles);
  }

  async function calculateDistanceAndPrice() {
    const pickup = pickupEl?.value?.trim();
    const dropoff = dropoffEl?.value?.trim();

    miles = null;
    total = null;
    setEstimateUI();
    updateContinueState();

    if (!pickup || !dropoff) {
      setMsg("Enter pickup + drop-off to calculate miles.");
      return;
    }

    setMsg("Calculating distance…");

    try {
      const m = await fetchMiles(pickup, dropoff);

      let t = m * RATE_PER_MILE;
      if (t < MIN_FARE) t = MIN_FARE;
      t = Math.round(t * 100) / 100;

      miles = m;
      total = t;

      setEstimateUI();
      setMsg(m * RATE_PER_MILE < MIN_FARE ? "Minimum fare applied ($75)." : "Distance calculated successfully.");
      updateContinueState();
    } catch (e) {
      miles = null;
      total = null;
      setEstimateUI();
      setMsg("Could not calculate distance. Check the addresses and try again.");
      updateContinueState();
    }
  }

  // ===== DRIVER SELECTION =====
  driverCards.forEach((card) => {
    card.style.cursor = "pointer";
    const select = () => {
      driverCards.forEach((c) => c.classList.remove("is-selected"));
      card.classList.add("is-selected");

      selectedDriverId = card.getAttribute("data-driver-id");
      selectedDriverName = card.getAttribute("data-driver-name");
      setDriverSelectedUI();

      // unlock vehicles only after driver selected
      lockVehicles(false);

      setEstimateUI();
      updateContinueState();
    };

    card.addEventListener("click", select);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") select();
    });
  });

  // ===== VEHICLE SELECTION =====
  vehicleCards.forEach((card) => {
    card.style.cursor = "pointer";
    const select = () => {
      vehicleCards.forEach((c) => c.classList.remove("is-selected"));
      card.classList.add("is-selected");

      selectedVehicleId = card.getAttribute("data-vehicle-id");
      selectedVehicleName = card.getAttribute("data-vehicle-name");

      setEstimateUI();
      updateContinueState();
    };

    card.addEventListener("click", select);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") select();
    });
  });

  // lock vehicles until driver selected
  lockVehicles(true);
  setDriverSelectedUI();
  setEstimateUI();
  updateContinueState();

  // ===== INPUT TRIGGERS =====
  let typingTimer = null;
  function scheduleCalc() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      updateMapLinks();
      calculateDistanceAndPrice();
    }, 650);
  }

  if (pickupEl) {
    pickupEl.addEventListener("input", scheduleCalc);
    pickupEl.addEventListener("blur", () => {
      updateMapLinks();
      calculateDistanceAndPrice();
    });
  }
  if (dropoffEl) {
    dropoffEl.addEventListener("input", scheduleCalc);
    dropoffEl.addEventListener("blur", () => {
      updateMapLinks();
      calculateDistanceAndPrice();
    });
  }
  if (dateEl) dateEl.addEventListener("change", updateContinueState);
  if (timeEl) timeEl.addEventListener("change", updateContinueState);

  // ===== CONTINUE =====
  if (continueBtn) {
    continueBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const pickup = pickupEl?.value?.trim() || "";
      const dropoff = dropoffEl?.value?.trim() || "";
      const date = dateEl?.value || "";
      const time = timeEl?.value || "";
      const requests = document.getElementById("requests")?.value || "";

      if (!selectedDriverId || !selectedVehicleId || !pickup || !dropoff || !date || !time || !Number.isFinite(miles) || !Number.isFinite(total)) {
        setMsg("Complete driver + vehicle selection and enter pickup/drop-off to continue.");
        return;
      }

      const params = new URLSearchParams({
        driver: selectedDriverName || selectedDriverId,
        vehicle: selectedVehicleName || selectedVehicleId,
        pickup,
        dropoff,
        date,
        time,
        miles: String(miles),
        total: String(total),
        requests
      });

      // payment page lives in pages/ with book.html
      window.location.href = `payment.html?${params.toString()}`;
    });
  }

  // initial map links
  updateMapLinks();
})();
