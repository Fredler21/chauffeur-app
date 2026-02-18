# Chauffeur App (Web & PWA)

This repository contains the static frontend for the Chauffeur App.

Quick start (no install required):

1. Serve with Node's http-server (recommended):

```bash
npx http-server Pages -p 8080
```

2. Or use Python's simple server:

```bash
python -m http.server --directory Pages 8080
```

Open http://localhost:8080 in your browser.

Make it a mobile app (Capacitor):

1. Install Capacitor in project root:

```bash
npm init -y
npm install @capacitor/core @capacitor/cli
npx cap init chauffeur-app com.example.chauffeur
```

2. Copy the built/static `Pages` folder into `www/`, then add platforms:

```bash
npx cap add android
npx cap add ios
npx cap open android
```

For detailed packaging steps, tell me which platform(s) you want and I will prepare the Capacitor config and automate copying.
