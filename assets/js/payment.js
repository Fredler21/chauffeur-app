/* ==========================================================
   PAYMENT.JS v3 — Stripe + fare breakdown summary
   ========================================================== */
(() => {
  'use strict';

  const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/test_6oU9AU0Dw7J17oD1nh8N200';
  const FREE_RADIUS = 2;

  const qs = new URLSearchParams(window.location.search);
  const driver         = qs.get('driver');
  const vehicle        = qs.get('vehicle');
  const pickup         = qs.get('pickup');
  const dropoff        = qs.get('dropoff');
  const date           = qs.get('date');
  const time           = qs.get('time');
  const miles          = qs.get('miles');
  const total          = qs.get('total');
  const rideFareParam  = qs.get('rideFare');
  const posFeeParam    = qs.get('positioningFee');
  const pickupMiParam  = qs.get('pickupMiles');

  const hasAll = driver && vehicle && pickup && dropoff && date && time && miles && total;

  /* ── Elements ── */
  const missingMsg    = document.getElementById('missingMsg');
  const statusText    = document.getElementById('statusText');
  const sumDriver     = document.getElementById('sumDriver');
  const sumVehicle    = document.getElementById('sumVehicle');
  const sumPickup     = document.getElementById('sumPickup');
  const sumDropoff    = document.getElementById('sumDropoff');
  const sumDateTime   = document.getElementById('sumDateTime');
  const sumMiles      = document.getElementById('sumMiles');
  const sumMilesFare  = document.getElementById('sumMilesFare');
  const sumRideFare   = document.getElementById('sumRideFare');
  const sumPosLine    = document.getElementById('sumPosLine');
  const sumPosValue   = document.getElementById('sumPosValue');
  const sumTotal      = document.getElementById('sumTotal');
  const sumRadiusNote = document.getElementById('sumRadiusNote');
  const mapFrame      = document.getElementById('mapFrame');
  const openPickup    = document.getElementById('openPickup');
  const openDropoff   = document.getElementById('openDropoff');
  const openRoute     = document.getElementById('openRoute');
  const payBtn        = document.getElementById('stripePayBtn');

  function safe(el, v) { if (el) el.textContent = v || '—'; }

  function setMapLinks(p, d) {
    if (openPickup)  openPickup.href  = p ? `https://www.google.com/maps?q=${encodeURIComponent(p)}` : '#';
    if (openDropoff) openDropoff.href = d ? `https://www.google.com/maps?q=${encodeURIComponent(d)}` : '#';
    if (openRoute)   openRoute.href   = (p && d) ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(p)}&destination=${encodeURIComponent(d)}&travelmode=driving` : '#';
    if (mapFrame && p) mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(p)}&output=embed`;
  }

  if (!hasAll) {
    if (missingMsg) missingMsg.style.display = 'block';
    if (statusText) statusText.textContent = 'Missing details — go back to Booking.';
    if (payBtn) { payBtn.disabled = true; payBtn.classList.add('disabled'); }
    setMapLinks(pickup, dropoff);
    return;
  }

  /* Fill summary */
  safe(sumDriver, driver);
  safe(sumVehicle, vehicle);
  safe(sumPickup, pickup);
  safe(sumDropoff, dropoff);
  safe(sumDateTime, `${date} · ${time}`);
  safe(sumMiles, `${Number(miles).toFixed(1)} miles`);

  /* Fare breakdown */
  if (sumMilesFare) sumMilesFare.textContent = `${Number(miles).toFixed(1)} mi`;
  if (sumRideFare && rideFareParam) sumRideFare.textContent = `$${Number(rideFareParam).toFixed(2)}`;
  else if (sumRideFare) sumRideFare.textContent = `$${(Number(miles) * 5).toFixed(2)}`;

  const posFee = Number(posFeeParam) || 0;
  const pickupMi = Number(pickupMiParam) || 0;
  if (posFee > 0 && sumPosLine) {
    sumPosLine.style.display = 'flex';
    sumPosLine.classList.add('positioning-highlight');
    if (sumPosValue) sumPosValue.textContent = `$${posFee.toFixed(2)}`;
  }

  if (sumRadiusNote) {
    if (pickupMi > 0 && pickupMi <= FREE_RADIUS) {
      sumRadiusNote.style.display = 'block';
      sumRadiusNote.textContent = '✓ Within Preferred Service Radius';
    } else if (pickupMi > FREE_RADIUS) {
      sumRadiusNote.style.display = 'block';
      sumRadiusNote.textContent = `Pickup is ${pickupMi.toFixed(1)} mi from base — positioning fee applied`;
      sumRadiusNote.style.background = 'rgba(177,18,38,.10)';
      sumRadiusNote.style.borderColor = 'rgba(177,18,38,.18)';
      sumRadiusNote.style.color = '#D61F3A';
    }
  }

  safe(sumTotal, `$${Number(total).toFixed(2)}`);
  if (statusText) statusText.textContent = 'Ready to pay securely';
  setMapLinks(pickup, dropoff);

  /* Pay button → Stripe */
  payBtn?.addEventListener('click', e => {
    e.preventDefault();
    payBtn.textContent = 'Redirecting to Stripe…';
    payBtn.style.pointerEvents = 'none';
    payBtn.style.opacity = '.7';
    setTimeout(() => { window.location.href = STRIPE_CHECKOUT_URL; }, 600);
  });

})();
