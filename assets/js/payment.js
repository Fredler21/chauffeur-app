(() => {
  // ✅ Your Stripe Checkout link (TEST)
  // This is the link you sent earlier.
  const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_6oU9AU0Dw7J17oD1nh8N200";

  const qs = new URLSearchParams(window.location.search);

  const driver = qs.get("driver");
  const vehicle = qs.get("vehicle");
  const pickup = qs.get("pickup");
  const dropoff = qs.get("dropoff");
  const date = qs.get("date");
  const time = qs.get("time");
  const miles = qs.get("miles");
  const total = qs.get("total");

  const missingMsg = document.getElementById("missingMsg");
  const statusText = document.getElementById("statusText");

  const sumDriver = document.getElementById("sumDriver");
  const sumVehicle = document.getElementById("sumVehicle");
  const sumPickup = document.getElementById("sumPickup");
  const sumDropoff = document.getElementById("sumDropoff");
  const sumDateTime = document.getElementById("sumDateTime");
  const sumMiles = document.getElementById("sumMiles");
  const sumTotal = document.getElementById("sumTotal");

  const mapFrame = document.getElementById("mapFrame");
  const openPickup = document.getElementById("openPickup");
  const openDropoff = document.getElementById("openDropoff");
  const openRoute = document.getElementById("openRoute");

  const stripePayBtn = document.getElementById("stripePayBtn");

  const hasAll =
    driver && vehicle && pickup && dropoff && date && time && miles && total;

  function safeText(el, value) {
    if (!el) return;
    el.textContent = value || "—";
  }

  function setMapLinks(pick, drop) {
    const pickupUrl = pick ? `https://www.google.com/maps?q=${encodeURIComponent(pick)}` : "#";
    const dropoffUrl = drop ? `https://www.google.com/maps?q=${encodeURIComponent(drop)}` : "#";
    const routeUrl = (pick && drop)
      ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pick)}&destination=${encodeURIComponent(drop)}&travelmode=driving`
      : "#";

    if (openPickup) openPickup.href = pickupUrl;
    if (openDropoff) openDropoff.href = dropoffUrl;
    if (openRoute) openRoute.href = routeUrl;

    if (mapFrame) {
      mapFrame.src = pick
        ? `https://www.google.com/maps?q=${encodeURIComponent(pick)}&output=embed`
        : `https://www.google.com/maps?q=[Your%20City/Areas]&output=embed`;
    }
  }

  if (!hasAll) {
    if (missingMsg) missingMsg.style.display = "block";
    if (statusText) statusText.textContent = "Missing booking details — go back to Booking.";
    if (stripePayBtn) {
      stripePayBtn.classList.add("disabled");
      stripePayBtn.removeAttribute("href");
      stripePayBtn.style.pointerEvents = "none";
      stripePayBtn.style.opacity = "0.6";
    }
    setMapLinks(pickup, dropoff);
    return;
  }

  // Fill summary
  safeText(sumDriver, driver);
  safeText(sumVehicle, vehicle);
  safeText(sumPickup, pickup);
  safeText(sumDropoff, dropoff);
  safeText(sumDateTime, `${date} • ${time}`);
  safeText(sumMiles, `${Number(miles).toFixed(1)} miles`);
  safeText(sumTotal, `$${Number(total).toFixed(2)}`);

  setMapLinks(pickup, dropoff);

  // Stripe checkout redirect
  // Note: Stripe Checkout will show the best payment options automatically (card + Apple Pay when eligible).
  if (stripePayBtn) {
    stripePayBtn.href = STRIPE_CHECKOUT_URL;
  }

  if (statusText) statusText.textContent = "Ready to pay securely";
})();

(() => {

  // ✅ YOUR STRIPE TEST CHECKOUT LINK
  const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_6oU9AU0Dw7J17oD1nh8N200";

  const stripeBtn = document.getElementById("stripePayBtn");

  if (!stripeBtn) return;

  stripeBtn.addEventListener("click", function (e) {
    e.preventDefault();

    stripeBtn.textContent = "Redirecting to Stripe...";
    stripeBtn.style.pointerEvents = "none";
    stripeBtn.style.opacity = "0.8";

    // 🔥 Redirect straight to Stripe
    window.location.href = STRIPE_CHECKOUT_URL;
  });

})();

