/* ==========================================================
   BOOKING.JS v2 — 4-step engine with auto-reveal & smooth UX
   ========================================================== */
(() => {
  'use strict';

  const WORKER_URL  = 'https://y.freddy-b97.workers.dev';
  const RATE_PER_MI = 5;
  const MIN_FARE    = 75;

  /* ── State ── */
  let driverId = null, driverName = null;
  let vehicleId = null, vehicleName = null;
  let miles = null, total = null;

  /* ── Elements ── */
  const driverGrid     = document.getElementById('driverGrid');
  const driverCards     = document.querySelectorAll('.driver-card');
  const vehicleSection  = document.getElementById('step-vehicle');
  const vehicleGrid     = document.getElementById('vehicleGrid');
  const vehicleCards    = document.querySelectorAll('.vehicle-card');
  const driverHint      = document.getElementById('driverHint');
  const vehicleHint     = document.getElementById('vehicleHint');
  const pickupEl        = document.getElementById('pickup');
  const dropoffEl       = document.getElementById('dropoff');
  const dateEl          = document.getElementById('tripDate');
  const timeEl          = document.getElementById('tripTime');

  const driverText  = document.getElementById('selectedDriverText');
  const vehicleText = document.getElementById('selectedVehicleText');
  const milesText   = document.getElementById('milesText');
  const totalText   = document.getElementById('totalText');
  const calcMsg     = document.getElementById('calcMsg');

  const mapFrame    = document.getElementById('mapFrame');
  const openPickup  = document.getElementById('openPickup');
  const openDropoff = document.getElementById('openDropoff');
  const openRoute   = document.getElementById('openRoute');
  const continueBtn = document.getElementById('continueBookingBtn');

  const progressSteps = document.querySelectorAll('.progress-step');

  /* ── Mobile: make driver grid swipeable with arrows ── */
  const driverScrollWrap = document.getElementById('driverScrollWrap');
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

    // sync dots on manual swipe
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
    // hide arrows & dots on desktop
    if (driverPrev) driverPrev.style.display = 'none';
    if (driverNext) driverNext.style.display = 'none';
    const dotsWrap = document.getElementById('driverDots');
    if (dotsWrap) dotsWrap.style.display = 'none';
  }

  /* ── Helpers ── */
  function msg(t) { if (calcMsg) calcMsg.textContent = t || ''; }

  function updateEstimate() {
    if (driverText)  driverText.textContent  = driverName  || 'None';
    if (vehicleText) vehicleText.textContent = vehicleName || 'None';
    if (milesText)   milesText.textContent   = Number.isFinite(miles) ? `${miles.toFixed(1)} mi` : '—';
    if (totalText)   totalText.textContent   = Number.isFinite(total) ? `$${total.toFixed(2)}` : '$ —';
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
    return !!driverId && !!vehicleId && Number.isFinite(miles) && Number.isFinite(total)
      && pickupEl?.value?.trim() && dropoffEl?.value?.trim() && dateEl?.value && timeEl?.value;
  }

  function syncContinue() {
    if (continueBtn) continueBtn.disabled = !canContinue();
    if (driverId && vehicleId && Number.isFinite(miles)) setProgress(4);
    else if (driverId && vehicleId) setProgress(3);
    else if (driverId) setProgress(2);
    else setProgress(1);
  }

  /* ── Auto-reveal Vehicle Section ── */
  function unlockVehicles() {
    if (!vehicleSection) return;
    vehicleSection.classList.add('is-unlocked');
    if (vehicleHint) vehicleHint.textContent = 'Select 1 vehicle';
    // On mobile: instantly jump to vehicle section (no scroll animation for snappy feel)
    // On desktop: smooth scroll
    setTimeout(() => {
      if (window.innerWidth <= 768) {
        vehicleSection.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        vehicleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  }

  /* ── Distance API ── */
  async function calcDistance() {
    const p = pickupEl?.value?.trim(), d = dropoffEl?.value?.trim();
    miles = null; total = null; updateEstimate(); syncContinue();
    if (!p || !d) { msg('Enter pickup + drop-off to calculate.'); return; }
    msg('Calculating distance…');
    try {
      const res = await fetch(`${WORKER_URL}?origin=${encodeURIComponent(p)}&destination=${encodeURIComponent(d)}`);
      const data = await res.json();
      if (!res.ok || !data.miles) throw new Error(data.error || 'Distance lookup failed');
      const m = Number(data.miles);
      let t = m * RATE_PER_MI;
      if (t < MIN_FARE) t = MIN_FARE;
      t = Math.round(t * 100) / 100;
      miles = m; total = t;
      updateEstimate();
      msg(m * RATE_PER_MI < MIN_FARE ? 'Minimum fare applied ($75).' : 'Distance calculated.');
      syncContinue();
      if (window.showToast) window.showToast(`Route: ${miles.toFixed(1)} mi — $${total.toFixed(2)}`);
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
      updateEstimate();
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
      updateEstimate();
      syncContinue();
      // scroll to route
      const routeSection = document.getElementById('step-route');
      if (routeSection) {
        setTimeout(() => routeSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      }
    };
    card.addEventListener('click', select);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
  });

  /* ── Input Listeners ── */
  let timer = null;
  function schedule() { clearTimeout(timer); timer = setTimeout(() => { updateMapLinks(); calcDistance(); }, 650); }
  pickupEl?.addEventListener('input', schedule);
  dropoffEl?.addEventListener('input', schedule);
  pickupEl?.addEventListener('blur', () => { updateMapLinks(); calcDistance(); });
  dropoffEl?.addEventListener('blur', () => { updateMapLinks(); calcDistance(); });
  dateEl?.addEventListener('change', syncContinue);
  timeEl?.addEventListener('change', syncContinue);

  /* ── Continue → Payment ── */
  continueBtn?.addEventListener('click', e => {
    e.preventDefault();
    if (!canContinue()) { msg('Complete all steps first.'); return; }
    const params = new URLSearchParams({
      driver: driverName || driverId,
      vehicle: vehicleName || vehicleId,
      pickup: pickupEl.value.trim(),
      dropoff: dropoffEl.value.trim(),
      date: dateEl.value,
      time: timeEl.value,
      miles: String(miles),
      total: String(total),
      requests: document.getElementById('requests')?.value || ''
    });
    window.location.href = `payment.html?${params.toString()}`;
  });

  /* ── Init ── */
  updateEstimate();
  syncContinue();
  updateMapLinks();
})();
