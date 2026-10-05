# Firebase setup and hosting

The app is a static web app (Vite build) hosted on **Firebase Hosting**, with Google sign-in and Firestore for data
scoped per user. No GitHub Pages and no server to run. Until Firebase is configured it runs in device-only mode
(data stays in the browser).

## 1. Create these in the Firebase console (https://console.firebase.google.com)

1. **Create a project** (Google Analytics is optional; you can turn it off).
2. **Add a web app:** Project overview → `</>` Web. Register it, tick **"Also set up Firebase Hosting"** if offered,
   and copy the `firebaseConfig` values.
3. **Authentication → Sign-in method → Google → Enable.** Pick a support email and save.
4. **Firestore Database → Create database.** Choose a region near you and start in **production mode**.
5. **Hosting → Get started** (just click through; the deploy happens from your terminal below).

Your site's domains, `<project-id>.web.app` and `<project-id>.firebaseapp.com`, are authorized for sign-in by default.
If you later add a custom domain, add it under Authentication → Settings → Authorized domains.

## 2. Put your config in the app

```bash
The production config for `step1-dashboard` is already committed in `.env.production`, so `npm run deploy` needs nothing more.
For local dev, `cp .env.production .env.local`.
```

These values identify your project; they aren't secrets. Security comes from the Firestore rules below.

## 3. Deploy (from your own computer)

```bash
npm install
npx firebase-tools login
# (project already set to step1-dashboard in .firebaserc)
npm run deploy                   # builds, then publishes Hosting and the Firestore rules
```

`firebase.json` points Hosting at `dist/` and publishes `firestore.rules`, so the deploy also applies the security
rules. Re-run `npm run deploy` whenever you change the app. Your site will be at `https://<project-id>.web.app`.

## Data layout (created automatically on first write; you don't create these by hand)

```
users/{uid}/meta/settings       { examDate, totalQuestions, goalPct, fallbackPct }
users/{uid}/blocks/{id}         { date, name, system, subject, mode, total, correct, omitted, minutes, reviewed, notes, createdAt }
users/{uid}/tasks/{id}          { text, done, createdAt }
users/{uid}/assessments/{id}    { name, date, score, note, createdAt }
```

No indexes are needed; the app reads whole collections per user.

## Other hosts

Any static host works (`npm run build`, publish `dist/`, set the `VITE_FIREBASE_*` variables at build time, and add the
host's domain under Authentication → Authorized domains). Firebase Hosting is the one set up here.
