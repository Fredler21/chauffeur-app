/* ==========================================================
   BOOKING.JS v3 — Premium pricing with positioning logic
   Base: Coral Springs, FL
   Ride rate: $5/mile | Positioning: $2/mile beyond 2mi radius
   ========================================================== */
(() => {
  'use strict';

  const WORKER_URL          = 'https://y.freddy-b97.workers.dev';
  const RATE_PER_MI         = 5;
  const POSITIONING_PER_MI  = 2;
  const FREE_RADIUS_MI      = 2;
  const MIN_FARE            = 75;
  const BASE_LOCATION       = 'Coral Springs, FL';

  /* ── State ── */
  let driverId = null, driverName = null;
  let vehicleId = null, vehicleName = null;
  let tripMiles = null, pickupMiles = null;
  let rideFare = null, positioningFee = null, totalFare = null;

  /* ── Elements ── */
  const driverGrid     = document.getElementById('driverGrid');
  const driverCards     = document.querySelectorAll('.driver-card');
  const vehicleSection  = document.getElementById('step-vehicle');
  const vehicleCards    = document.querySelectorAll('.vehicle-card');
  const driverHint      = document.getElementById('driverHint');
  const vehicleHint     = document.getElementById('vehicleHint');
  const pickupEl        = document.getElementById('pickup');
  const dropoffEl       = document.getElementById('dropoff');
  const dateEl          = document.getElementById('tripDate');
  const timeEl          = document.getElementById('tripTime');

  /* Fare breakdown elements */
  const fareDriver      = document.getElementById('fareDriver');
  const fareVehicle     = document.getElementById('fareVehicle');
  const fareTripDist    = document.getElementById('fareTripDist');
  const fareRideFare    = document.getElementById('fareRideFare');
  const farePosLine     = document.getElementById('farePosLine');
  const farePosValue    = document.getElementById('farePosValue');
  const fareTotal       = document.getElementById('fareTotal');
  const fareRadiusNote  = document.getElementById('fareRadiusNote');
  const calcMsg         = document.getElementById('calcMsg');

  const mapFrame    = document.getElementById('mapFrame');
  const openPickup  = document.getElementById('openPickup');
  const openDropoff = document.getElementById('openDropoff');
  const openRoute   = document.getElementById('openRoute');
  const continueBtn = document.getElementById('continueBookingBtn');

  const progressSteps = document.querySelectorAll('.progress-step');

  /* ── Mobile driver swipe ── */
  const driverPrev = document.getElementById('driverPrev');
  const driverNext = document.getElementById('driverNext');
  const driverDots = document.querySelectorAll('#driverDots .d-dot');

  if (window.innerWidth <= 768 && driverGrid) {
    driverGrid.classList.add('driver-grid-mobile');
    let driverIdx = 0;
    const totalDrivers = driverCards.length;

    function scrollToDriver(idx) {
      if (idx < 0) idx = 0;
      if (idx >= totalDrivers) idx = totalDrivers - 1;
      driverIdx = idx;
      const card = driverCards[idx];
      if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      driverDots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
    }
    driverPrev?.addEventListener('click', () => scrollToDriver(driverIdx - 1));
    driverNext?.addEventListener('click', () => scrollToDriver(driverIdx + 1));
    driverDots.forEach(dot => dot.addEventListener('click', () => scrollToDriver(Number(dot.dataset.idx))));

    let scrollTimer = null;
    driverGrid.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const gridLeft = driverGrid.scrollLeft;
        const cardWidth = driverCards[0]?.offsetWidth || 280;
        const nearest = Math.round(gridLeft / (cardWidth + 12));
        if (nearest !== driverIdx && nearest >= 0 && nearest < totalDrivers) {
          driverIdx = nearest;
          driverDots.forEach((d, i) => d.classList.toggle('is-active', i === driverIdx));
        }
      }, 80);
    });
  } else {
    if (driverPrev) driverPrev.style.display = 'none';
    if (driverNext) driverNext.style.display = 'none';
    const dotsWrap = document.getElementById('driverDots');
    if (dotsWrap) dotsWrap.style.display = 'none';
  }

  /* ── Helpers ── */
  function msg(t) { if (calcMsg) calcMsg.textContent = t || ''; }

  function updateFareDisplay() {
    if (fareDriver) fareDriver.textContent = driverName || 'None';
    if (fareVehicle) fareVehicle.textContent = vehicleName || 'None';

    if (fareTripDist) fareTripDist.textContent = Number.isFinite(tripMiles) ? `${tripMiles.toFixed(1)} mi` : '—';
    if (fareRideFare) fareRideFare.textContent = Number.isFinite(rideFare) ? `$${rideFare.toFixed(2)}` : '—';

    // Positioning line
    if (farePosLine) {
      if (positioningFee && positioningFee > 0) {
        farePosLine.style.display = 'flex';
        farePosLine.classList.add('positioning-highlight');
        if (farePosValue) farePosValue.textContent = `$${positioningFee.toFixed(2)}`;
      } else {
        farePosLine.style.display = 'none';
        farePosLine.classList.remove('positioning-highlight');
      }
    }

    // Radius note
    if (fareRadiusNote) {
      if (Number.isFinite(pickupMiles) && pickupMiles <= FREE_RADIUS_MI) {
        fareRadiusNote.style.display = 'block';
        fareRadiusNote.textContent = '✓ Within Preferred Service Radius';
      } else if (Number.isFinite(pickupMiles)) {
        fareRadiusNote.style.display = 'block';
        fareRadiusNote.textContent = `Pickup is ${pickupMiles.toFixed(1)} mi from base — positioning fee applied`;
        fareRadiusNote.style.background = 'rgba(177,18,38,.10)';
        fareRadiusNote.style.borderColor = 'rgba(177,18,38,.18)';
        fareRadiusNote.style.color = '#D61F3A';
      } else {
        fareRadiusNote.style.display = 'none';
      }
    }

    // Total
    if (fareTotal) fareTotal.textContent = Number.isFinite(totalFare) ? `$${totalFare.toFixed(2)}` : '$ —';
  }

  function setProgress(step) {
    progressSteps.forEach(el => {
      const s = Number(el.dataset.step);
      el.classList.toggle('is-done', s < step);
      el.classList.toggle('is-active', s === step);
    });
  }

  function updateMapLinks() {
    const p = pickupEl?.value?.trim();
    const d = dropoffEl?.value?.trim();
    if (openPickup)  openPickup.href  = p ? `https://www.google.com/maps?q=${encodeURIComponent(p)}` : '#';
    if (openDropoff) openDropoff.href = d ? `https://www.google.com/maps?q=${encodeURIComponent(d)}` : '#';
    if (openRoute)   openRoute.href   = (p && d) ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(p)}&destination=${encodeURIComponent(d)}&travelmode=driving` : '#';
    if (mapFrame && p && d) mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(p)}&output=embed`;
    else if (mapFrame && p) mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(p)}&output=embed`;
  }

  function canContinue() {
    return !!driverId && !!vehicleId && Number.isFinite(totalFare)
      && pickupEl?.value?.trim() && dropoffEl?.value?.trim() && dateEl?.value && timeEl?.value;
  }

  function syncContinue() {
    if (continueBtn) continueBtn.disabled = !canContinue();
    if (driverId && vehicleId && Number.isFinite(totalFare)) setProgress(4);
    else if (driverId && vehicleId) setProgress(3);
    else if (driverId) setProgress(2);
    else setProgress(1);
  }

  /* ── Unlock vehicles ── */
  function unlockVehicles() {
    if (!vehicleSection) return;
    vehicleSection.classList.add('is-unlocked');
    if (vehicleHint) vehicleHint.textContent = 'Select 1 vehicle';
    setTimeout(() => {
      vehicleSection.scrollIntoView({
        behavior: window.innerWidth <= 768 ? 'instant' : 'smooth',
        block: 'start'
      });
    }, 150);
  }

  /* ══════════════════════════════════════════
     DISTANCE + PRICING API
     ══════════════════════════════════════════ */
  async function fetchDistance(origin, destination) {
    const res = await fetch(`${WORKER_URL}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
    const data = await res.json();
    if (!res.ok || !data.miles) throw new Error(data.error || 'Distance lookup failed');
    return Number(data.miles);
  }

  async function calcPricing() {
    const pickup  = pickupEl?.value?.trim();
    const dropoff = dropoffEl?.value?.trim();

    // Reset
    tripMiles = null; pickupMiles = null;
    rideFare = null; positioningFee = null; totalFare = null;
    updateFareDisplay();
    syncContinue();

    if (!pickup || !dropoff) {
      msg('Enter pickup + drop-off to calculate.');
      return;
    }

    msg('Calculating distance & positioning…');

    try {
      // Fetch both distances in parallel:
      // 1. Base (Coral Springs) → Pickup (for positioning)
      // 2. Pickup → Dropoff (for ride fare)
      const [positioningDist, tripDist] = await Promise.all([
        fetchDistance(BASE_LOCATION, pickup),
        fetchDistance(pickup, dropoff)
      ]);

      pickupMiles = positioningDist;
      tripMiles   = tripDist;

      // Calculate ride fare ($5/mile)
      rideFare = tripMiles * RATE_PER_MI;

      // Calculate positioning fee
      if (pickupMiles > FREE_RADIUS_MI) {
        positioningFee = pickupMiles * POSITIONING_PER_MI;
        positioningFee = Math.round(positioningFee * 100) / 100;
      } else {
        positioningFee = 0;
      }

      // Total
      totalFare = rideFare + positioningFee;

      // Apply minimum fare (to ride fare portion)
      if (totalFare < MIN_FARE) totalFare = MIN_FARE;
      totalFare = Math.round(totalFare * 100) / 100;

      updateFareDisplay();
      syncContinue();

      if (positioningFee > 0) {
        msg(`Positioning: ${pickupMiles.toFixed(1)} mi from base · Trip: ${tripMiles.toFixed(1)} mi`);
      } else {
        msg(`Within service radius · Trip: ${tripMiles.toFixed(1)} mi`);
      }

      if (window.showToast) {
        window.showToast(`Route: ${tripMiles.toFixed(1)} mi — Total: $${totalFare.toFixed(2)}`);
      }
    } catch {
      msg('Could not calculate distance. Check addresses and retry.');
      syncContinue();
    }
  }

  /* ── Driver Selection ── */
  driverCards.forEach(card => {
    const select = () => {
      driverCards.forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      driverId   = card.dataset.driverId;
      driverName = card.dataset.driverName;
      if (driverHint) driverHint.textContent = '✓ Selected';
      unlockVehicles();
      updateFareDisplay();
      syncContinue();
    };
    card.addEventListener('click', select);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
  });

  /* ── Vehicle Selection ── */
  vehicleCards.forEach(card => {
    const select = () => {
      vehicleCards.forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      vehicleId   = card.dataset.vehicleId;
      vehicleName = card.dataset.vehicleName;
      if (vehicleHint) vehicleHint.textContent = '✓ Selected';
      updateFareDisplay();
      syncContinue();
      const routeSection = document.getElementById('step-route');
      if (routeSection) {
        setTimeout(() => routeSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      }
    };
    card.addEventListener('click', select);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
  });

  /* ── Input listeners ── */
  let timer = null;
  function schedule() { clearTimeout(timer); timer = setTimeout(() => { updateMapLinks(); calcPricing(); }, 650); }
  pickupEl?.addEventListener('input', schedule);
  dropoffEl?.addEventListener('input', schedule);
  pickupEl?.addEventListener('blur', () => { updateMapLinks(); calcPricing(); });
  dropoffEl?.addEventListener('blur', () => { updateMapLinks(); calcPricing(); });
  dateEl?.addEventListener('change', syncContinue);
  timeEl?.addEventListener('change', syncContinue);

  /* ── Continue → Payment ── */
  continueBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (!canContinue()) { msg('Complete all steps first.'); return; }

    /* ── Region guard: Sebastien is MA-only ── */
    const selectedCard = document.querySelector('.driver-card.is-selected');
    if (selectedCard?.dataset.region === 'ma') {
      const pickup  = (pickupEl?.value || '').toLowerCase();
      const dropoff = (dropoffEl?.value || '').toLowerCase();
      const flKeywords = ['florida', ', fl', ' fl ', ' fl,', 'miami', 'fort lauderdale', 'boca raton',
        'coral springs', 'pompano', 'hollywood, fl', 'west palm', 'orlando', 'tampa',
        'jacksonville', 'naples', 'clearwater', 'deerfield', 'plantation', 'sunrise',
        'margate', 'coconut creek', 'davie', 'pembroke', 'weston', 'miramar',
        'hialeah', 'homestead', 'kissimmee', 'delray', 'boynton'];
      const inFL = flKeywords.some(kw => pickup.includes(kw) || dropoff.includes(kw));
      if (inFL) {
        if (window.showToast) {
          window.showToast('Sebastien is only available in Massachusetts. Please choose another driver for Florida trips.', 'error', 5000);
        }
        msg('Sebastien is only available in Massachusetts.');
        return;
      }
    }
    const params = new URLSearchParams({
      driver: driverName || driverId,
      vehicle: vehicleName || vehicleId,
      pickup: pickupEl.value.trim(),
      dropoff: dropoffEl.value.trim(),
      date: dateEl.value,
      time: timeEl.value,
      miles: String(tripMiles),
      total: String(totalFare),
      rideFare: String(rideFare),
      positioningFee: String(positioningFee),
      pickupMiles: String(pickupMiles),
      requests: document.getElementById('requests')?.value || ''
    });
    window.location.href = `payment.html?${params.toString()}`;
  });

  /* ── Pre-fill from homepage ── */
  const urlParams = new URLSearchParams(window.location.search);
  const preDriver  = urlParams.get('preDriver');
  const preVehicle = urlParams.get('preVehicle');

  if (preDriver) {
    const card = document.querySelector(`.driver-card[data-driver-id="${preDriver}"]`);
    if (card) card.click();
  }
  if (preVehicle) {
    // tiny delay to allow unlock animation
    setTimeout(() => {
      const card = document.querySelector(`.vehicle-card[data-vehicle-id="${preVehicle}"]`);
      if (card) card.click();
    }, 400);
  }

  /* ── Init ── */
  updateFareDisplay();
  syncContinue();
  updateMapLinks();
})();
