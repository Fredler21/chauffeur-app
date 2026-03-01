# Chauffeur App

A premium private chauffeur booking website. Riders can browse available drivers, view their profiles and reviews, pick a vehicle, and book a ride — all from their phone or computer.

---

## What This App Does

- **Homepage** — A showcase of the chauffeur team. Each driver has a card with their photo, rating, ride count, and a short bio. You can tap on any driver to see their full profile, background story, and client reviews.
- **Booking Page** — A step-by-step flow: pick a driver, pick a vehicle, enter your pickup and drop-off addresses, choose a date and time, and see the price before you confirm.
- **Pricing** — The fare is calculated automatically based on distance. There is a minimum fare. If the pickup is far from the base area, a small positioning fee is added.
- **Payment Page** — Shows a summary of the trip and lets you pay through a secure checkout.
- **Dashboard** — A simple page for managing ride info.

## Drivers

There are currently three drivers on the platform. Two are based in Florida and one is based in Massachusetts. If a rider picks the Massachusetts driver but enters a Florida address, the app will let them know that driver is not available in that area.

## Tech Stack

- Plain HTML, CSS, and JavaScript — no frameworks needed
- Dark theme with a modern, mobile-first design
- Works as a Progressive Web App (can be added to your phone's home screen)
- Distance calculations powered by a Cloudflare Worker API
- Payments handled through Stripe checkout

## Project Structure

```
index.html              → Homepage
Pages/
  book.html             → Booking flow
  payment.html          → Payment / trip summary
  dashboard.html        → Dashboard
  sw.js                 → Service worker (PWA support)
assets/
  css/styles.css        → All styles
  js/app.js             → Core utilities (navbar, toasts, dark mode)
  js/homepage.js        → Driver showcase + profile modal logic
  js/booking.js         → Booking flow + pricing logic
  js/payment.js         → Payment page logic
  images/               → Driver photos, vehicle photos, hero images
Data/
  Drivers.json          → Driver data
  Vehicles.json         → Vehicle data
```

## How to Run Locally

No build step needed. Just serve the files with any static server.

**Option 1 — Node:**

```bash
npx http-server . -p 8080
```

**Option 2 — Python:**

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## License

All rights reserved.
