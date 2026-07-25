# 🌾 AgriAI

AgriAI is a mobile app for Indian farmers that brings AI-powered crop guidance, disease
detection, live market/weather data, government scheme info, and farm record-keeping into
one offline-friendly app — in English, Telugu, Hindi, Tamil, Kannada, and Malayalam.

Built with **Expo / React Native**, **Firebase**, **Cloudflare Workers**, and **Groq** for AI.

🌐 **Landing page:** [agriai.hafreedshaik.online](https://agriai.hafreedshaik.online)

## 📲 Try It Now

Install the latest Android build directly — no Play Store needed:

**[Download AgriAI (Android)](https://expo.dev/accounts/hafreex/projects/agriai/builds/793d3efa-3e38-4674-8097-4b2c21d39317)**

Open the link on an Android phone and tap install (Android will ask you to allow
"install from unknown sources" — expected, since this isn't distributed via the Play Store yet).

## Features

| Screen | What it does |
|---|---|
| 🌱 Crop Recommendation | AI-suggested crops based on location, season, and live weather |
| 🤖 Ask AgriAI (Chat) | Conversational assistant with image analysis (crops, soil, pests, leaves, test reports) |
| 🔬 Disease Detection | Photograph a crop and get an AI diagnosis + organic treatment suggestions |
| 📈 Market Prices | Live mandi (market) prices by state, with offline caching |
| 🌧️ Weather Alerts | Local weather + farming-relevant alerts, with voice read-out |
| ✅ Task Manager | Daily farm task list, seasonal crop-calendar auto-suggestions, and scheduled reminders |
| 💰 Farm Ledger | Offline expense/income tracker with per-crop profit tracking |
| 🌿 Organic Prep | Organic treatment recipes (Jeevamrutha, Panchagavya, etc.) with curated video links |
| 🏛️ Govt Schemes | Major central schemes (PM-KISAN, PMFBY, KCC, Soil Health Card, and more) with eligibility & how-to-apply steps |
| 👤 Profile | Google sign-in or guest, editable name/photo, live task stats, language & sync preferences |

**Navigation**: an animated bottom nav bar for the 5 core screens, plus a slide-out drawer menu
for everything else — with pull-to-refresh throughout.

Every screen supports **English, Telugu, Hindi, Tamil, Kannada, and Malayalam**, including
voice output on select screens.

## Architecture

```
┌───────────────────────┐
│  Expo / React Native   │  screens under app/screens/, routed with expo-router
│  mobile client         │
└──────────┬──────────────┘
           │
           ├── Firebase Auth + Firestore     → anonymous + Google sign-in, per-user tasks
           │
           ├── Cloudflare Worker (worker/)   → proxies OpenWeatherMap + data.gov.in,
           │                                    keeping real API keys off the device
           │
           └── Cloudflare Worker (agriai-diagnose-v2, deployed separately)
                                             → proxies Groq for chat, crop recommendations,
                                                and photo-based disease diagnosis

┌───────────────────────┐
│  landing/ (static)     │  →  Vercel  →  agriai.hafreedshaik.online (DNS on Hostinger)
└───────────────────────┘
```

Third-party API keys (weather, market prices, Groq) are never bundled into the app —
they're held as Cloudflare Worker secrets, and the client calls the Worker instead of the
upstream APIs directly.

## Tech Stack

### Frontend (mobile app)
- **[Expo](https://expo.dev) SDK 54** on **React Native 0.81** + **React 19**
- **expo-router 6** — file-based navigation (`app/screens/`), replacing React Navigation boilerplate
- **@react-native-google-signin** — native on-device Google account picker (needs a custom dev/standalone build; not supported in plain Expo Go)
- **expo-notifications** — scheduled local push notifications for task reminders
- **expo-speech** — text-to-speech voice read-out (weather alerts, chat replies)
- **expo-location**, **expo-image-picker**, **expo-image-manipulator** — GPS for weather/crop context, camera/gallery capture, and client-side image compression before upload
- **expo-linear-gradient**, **react-native-webview**, **@react-native-community/datetimepicker** — UI and media rendering
- Custom UI system (no component library) — `components/BottomNavBar.jsx` (animated sliding-indicator tab bar), `components/DrawerMenu.jsx`, `components/LanguageSwitcher.jsx`, `components/OfflineBanner.jsx`

### Backend
- **[Cloudflare Workers](https://workers.cloudflare.com)** — two serverless edge functions, no traditional server to manage:
  - `worker/` (this repo) — proxies OpenWeatherMap and data.gov.in market-price APIs, and exists solely so third-party API keys stay server-side as Worker Secrets instead of being bundled into the app
  - `agriai-diagnose-v2` (deployed separately) — proxies AI calls for crop recommendations, chat, and disease-image diagnosis
- **Groq** — LLM/vision inference (fast Llama-family models) behind the diagnose Worker, for chat responses, crop recommendations, and photo-based disease diagnosis
- Plain `fetch` from the client to both Workers — no GraphQL/REST framework needed for a surface this small

### Database & Auth
- **Firebase Authentication** — anonymous sign-in on first launch, upgraded (linked, not replaced) to a Google account so guest-created data isn't lost
- **Cloud Firestore** — per-user task storage at `users/{uid}/tasks`

### Offline & local storage
- **AsyncStorage** — offline cache and mutation queue for tasks, market prices, and the farm ledger, plus locally stored profile overrides (name/photo) and guest profile data
- **@react-native-community/netinfo** — connectivity detection driving the offline banner and sync logic

### Landing page / web
- Static **HTML/CSS/vanilla JS** (`landing/`), no framework — deployed on **[Vercel](https://vercel.com)** at [agriai.hafreedshaik.online](https://agriai.hafreedshaik.online), DNS on Hostinger

### Build & deployment
- **EAS Build** (`eas.json`) — `development` (dev client), `preview` (standalone installable APK), and `production` profiles
- **EAS CLI** / **Wrangler CLI** — building the app and deploying the Cloudflare Worker respectively
- **Vercel CLI** — landing page deploys and custom domain/DNS management

## Getting Started

### Prerequisites
- Node.js, npm
- An Expo account ([expo.dev](https://expo.dev)) for EAS builds
- A Firebase project (Authentication + Firestore enabled)
- A Cloudflare account (free tier is enough) for the Worker proxy

### Install

```bash
npm install
```

> This repo ships a `.npmrc` with `legacy-peer-deps=true` — some transitive web dependencies
> from `expo-router` conflict on peer versions otherwise.

### Configure Firebase
Update `firebaseConfig.js` with your own Firebase project's config, and place your
`google-services.json` (Android) in the project root.

### Deploy the API proxy Worker

```bash
cd worker
npx wrangler login
npx wrangler deploy
npx wrangler secret put OPENWEATHER_KEY
npx wrangler secret put MARKET_API_KEY
```

Update `WORKER_BASE_URL` in `utils/apiConfig.js` to match your deployed Worker's URL.

### Run it

Native Google Sign-In requires a custom **dev client** — plain Expo Go cannot run it:

```bash
npx eas-cli login
npx eas-cli build --profile development --platform android   # one-time, installs a dev client
npx expo start --dev-client
```

For a fully standalone build that doesn't depend on your machine or Metro at all:

```bash
npx eas-cli build --profile preview --platform android
```

**On college/public WiFi:** `expo start` normally needs your phone and laptop on the same
network with device-to-device visibility, which most college and public networks block
("client isolation"). Use tunnel mode instead — it routes through the internet, so it works
regardless of what network either device is on:

```bash
npm run start:tunnel
```

## Project Structure

```
app/
  _layout.jsx           # expo-router stack
  screens/               # one file per screen
components/              # shared UI (BottomNavBar, DrawerMenu, LanguageSwitcher, OfflineBanner)
utils/                   # i18n (6 languages), offline cache, task/crop-calendar logic, auth helpers
worker/                  # Cloudflare Worker — proxies weather + market-price APIs
firebaseConfig.js
eas.json                 # EAS build profiles (development / preview / production)
```

## Notes

- This is an active learning/personal project, built iteratively day by day (see commit history).
- Anonymous Firestore accounts are upgraded (linked, not replaced) to a Google account on
  sign-in, so guest-created tasks aren't lost.
- No third-party API keys, secrets, or Firebase credentials are committed to this repo.
