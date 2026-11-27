# QuizTime

**اختبر معلوماتك، وتحدّى أصحابك! · Think Fast. Play Together.**

QuizTime is an Arabic-first bilingual (`AR` RTL / `EN` LTR) singleplayer and real-time multiplayer trivia party game featuring 22 categories, 300+ subcategories, 6 interactive question modes, Daily Challenges, XP/level progression, achievements, friends, and global leaderboards.

---

## Features

- **22 Categories + ALL Mode**: Expanded Gaming catalog (Minecraft, GTA, Red Dead Redemption, Elden Ring, Resident Evil, Dark Souls, Valorant, Counter-Strike, EA Sports FC, Fortnite, Roblox, etc.) plus Anime, Movies, Football, Science, History, Geography, Technology, Culture, and more.
- **6 Question Types**: Guess The Game, True or False, Guess The Logo (SVG), Guess The Sound (Web Audio API cues + accessible captions), Who Am I? (progressive clues), and Speed Round.
- **Singleplayer Engine**: Classic, Endless (3 lives), Time Attack, Practice, Daily Challenge, and Category Challenge modes with pause/resume and personal history.
- **Dual-Transport Real-Time Multiplayer**:
  - **Vercel / Serverless Mode**: Real-time Firestore-synced rooms (`rooms/{code}`) with live lobby roster, ready states, host controls, 6-character codes, shareable invite links, and chat/reactions.
  - **Dedicated Node/Express Mode (`server.ts`)**: Authoritative WebSocket `/ws` server with server-side grading and matchmaking (also configurable via `VITE_WS_URL`).
- **Accounts & Progression (Firebase)**: Google Sign-In, Email/Password support (when enabled in Firebase Console), customizable usernames, unlockable avatars, XP/levels, 8 achievements, friend requests, and global/daily leaderboards.

---

## Project Structure

```text
├── api/health.ts                 # Vercel serverless health endpoint
├── public/
│   ├── favicon.svg               # QuizTime SVG icon
│   ├── manifest.webmanifest      # Web app manifest
│   └── og-preview.jpg            # Social share preview banner
├── src/
│   ├── components/               # UI pages, Play Hub modal, QuestionArenaCard
│   ├── context/AppContext.tsx    # Clean URL routing, i18n RTL/LTR, Auth state
│   ├── data/                     # 22 categories & 6 question mode definitions
│   ├── i18n/translations.ts      # Arabic & English localization bundles
│   ├── services/
│   │   ├── firebaseClient.ts     # Firebase SDK + VITE_FIREBASE_* env support
│   │   ├── profileService.ts     # Profiles, XP, achievements, friends, leaderboards
│   │   └── realtimeRoomService.ts# Firestore real-time multiplayer rooms
│   ├── shared/                   # Bilingual question database & selectors
│   └── utils/soundEngine.ts      # Web Audio API sound effects & cues
├── server.ts                     # Optional Express + WebSocket /ws server
├── firestore.rules               # Hardened Firestore security rules
├── firebase-blueprint.json       # Firestore schema blueprint
├── vercel.json                   # Vercel Vite preset + SPA route rewrites
└── .env.example                  # Environment variables template
```

---

## Local Development

### Prerequisites

- Node.js 20+ (or 22 LTS)
- npm

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your Firebase values if overriding `firebase-applet-config.json`:
   ```bash
   cp .env.example .env
   ```
3. Run the full-stack development server (Express + Vite + WebSocket `/ws` on port `3000`):
   ```bash
   npm run dev
   ```
4. Build and type-check for production:
   ```bash
   npm run lint
   npm run build
   ```

---

## Environment Variables

Configure these in **Vercel -> Project Settings -> Environment Variables** (never put private credentials in `VITE_*` variables):

| Variable | Scope | Description |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Client | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Client | Firebase Auth domain (`<project-id>.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Client | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Client | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Client | Firebase Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Client | Firebase Web App ID |
| `VITE_FIREBASE_DATABASE_ID` | Client | Firestore Database ID (`(default)` or provisioned DB ID) |
| `VITE_WS_URL` | Client (Optional) | External `wss://...` URL if hosting `server.ts` separately; leave blank to use Firestore real-time rooms on Vercel |
| `VITE_APP_URL` | Client (Optional) | Public site URL (e.g. `https://quiztime-game.vercel.app`) |

---

## Firebase Production Setup

Before using Authentication, Leaderboards, Profiles, and Live Multiplayer Rooms on your live GitHub Pages URL (or custom domain):

1. **Authorize Your GitHub Pages Domain**:
   - Open [Firebase Console](https://console.firebase.google.com/) -> select your project -> **Authentication** -> **Settings** -> **Authorized domains**.
   - Click **Add domain** and add `<your-github-username>.github.io` (without `https://` or the repo subpath).
2. **Sign-in Providers**:
   - **Google** sign-in is configured.
   - To allow **Email/Password** registration and login, go to **Authentication -> Sign-in method** and enable **Email/Password**.
3. **Firestore Security Rules**:
   - `firestore.rules` enforces strict schema validation, owner-only PII isolation (`users/{uid}/private/info`), and authenticated room/leaderboard rules.

---

## Deploying to GitHub Pages (Recommended)

This repository includes `.github/workflows/deploy-pages.yml`, which automatically builds `dist/` (with `404.html` SPA fallback, `.nojekyll`, and automatic `VITE_BASE_PATH` detection for `<user>.github.io` or `<user>.github.io/<repo>/`) and publishes to GitHub Pages.

1. Push your code to the `main` (or `master`) branch on GitHub.
2. In your GitHub repository, open **Settings -> Pages**.
3. Under **Build and deployment -> Source**, select **GitHub Actions**.
4. Wait ~1 minute for the **Deploy QuizTime to GitHub Pages** workflow in the **Actions** tab to finish (or click **Run workflow** manually).
5. Add `<your-github-username>.github.io` to **Firebase Console -> Authentication -> Settings -> Authorized domains**.

---

## Alternative: Deploying to Vercel (`quiztime-game.vercel.app`)

1. Import the GitHub repository in [Vercel](https://vercel.com/new) with Project Name **`quiztime-game`** (`Vite`, `npm run build`, output `dist`).
2. Add `quiztime-game.vercel.app` to Firebase **Authorized domains**.
