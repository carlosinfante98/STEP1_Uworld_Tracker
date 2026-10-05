# Firebase setup

The app stores your blocks, goals, reminders and assessments in Firestore, scoped per signed-in user.
Until Firebase is configured it runs in device-only mode (data stays in the browser).

## What to create in the Firebase console (https://console.firebase.google.com)

1. **Create a project** (Google Analytics is optional; you can turn it off).
2. **Add a web app**: Project overview → `</>` Web. Register it (no Firebase Hosting needed) and copy the `firebaseConfig` values.
3. **Authentication → Sign-in method → Google → Enable.** Pick a support email and save.
4. **Authentication → Settings → Authorized domains → Add domain:** `carlosinfante98.github.io`
   (`localhost` is normally already allowed for local development).
5. **Firestore Database → Create database.** Choose a region near you and start in **production mode**.
6. **Firestore → Rules:** replace the contents with `firestore.rules` from this repo and **Publish**.
   These rules let each user read and write only `users/{their uid}/...`.

No indexes are needed; the app reads whole collections per user.

## Data layout (created automatically on first write; you don't create these by hand)

```
users/{uid}/meta/settings       { examDate, totalQuestions, goalPct, fallbackPct }
users/{uid}/blocks/{id}         { date, name, system, subject, mode, total, correct, omitted, minutes, reviewed, notes, createdAt }
users/{uid}/tasks/{id}          { text, done, createdAt }
users/{uid}/assessments/{id}    { name, date, score, note, createdAt }
```

## Giving the app your config

The web config identifies your project; it is not a secret. Either:

- **GitHub Pages build (recommended):** repo → Settings → Secrets and variables → Actions → **Variables** tab →
  add `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
  `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
- **Local dev:** copy `.env.example` to `.env.local`, fill it in, run `npm run dev`.

## GitHub Pages

Repo → Settings → Pages → **Source: GitHub Actions**. The workflow in `.github/workflows/deploy.yml` builds and
publishes on every push to `main`. Expected URL: `https://carlosinfante98.github.io/STEP1_Uworld_Tracker/`.
