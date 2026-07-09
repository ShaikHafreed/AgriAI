# 🌾 AgriAI

AgriAI is a mobile app for Indian farmers that brings AI-powered crop guidance, disease
detection, live market/weather data, government scheme info, and farm record-keeping into
one offline-friendly app — in English, Telugu, Hindi, Tamil, Kannada, and Malayalam.

Built with **Expo / React Native**, **Firebase**, and a **Cloudflare Workers** backend.

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
┌─────────────────────┐
│   Expo / React      │  screens under app/screens/, routed with expo-router
│   Native client      │
└─────────┬────────────┘
          │
          ├── Firebase Auth + Firestore  → anonymous + Google sign-in, per-user tasks
          │
          └── Cloudflare Worker (worker/) → proxies OpenWeatherMap + data.gov.in,
                                             keeping real API keys off the device
```

Third-party API keys (weather, market prices) are never bundled into the app — they're
held as Cloudflare Worker secrets, and the client calls the Worker instead of the upstream
APIs directly. The existing `agriai-diagnose-v2` Worker (referenced in `ChatScreen.jsx` /
`CropDiseaseScreen.jsx` / `CropRecommendationScreen.jsx`) similarly proxies AI diagnosis calls.

## Tech Stack

- **Expo SDK 54** / React Native 0.81 / expo-router
- **Firebase** — Authentication (anonymous + Google), Firestore
- **Cloudflare Workers** — API key proxy (`worker/`)
- **@react-native-google-signin** — native Google sign-in (requires an EAS dev/standalone build, not Expo Go)
- **expo-notifications** — scheduled local task reminders
- AsyncStorage-backed offline cache + mutation queue for tasks, market prices, and the ledger

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
