# Step 1 QBank Tracker

**Live app:** https://step1-dashboard.web.app

A modern dashboard for tracking UWorld Step 1 progress. You log each block's score by hand after finishing it in
UWorld; the tracker handles the rest. It does not connect to UWorld and is not affiliated with it.

- **Log blocks:** date, system, subject, tutor/timed, questions, correct, omitted, minutes, reviewed, notes
- **Overview:** attempted and reviewed progress against a goal and a fallback, daily pace needed, projection at your 7-day rate, accuracy trend, activity heatmap, weakest systems
- **Systems:** percent correct by system and by subject, plus systems you haven't started
- **Plan:** short-term reminders and self-assessment scores
- **Light and dark mode** (system by default), a ⌘K / Ctrl+K command palette, mobile layout
- **Sync** with Firebase (Google sign-in + Firestore), or device-only mode with no setup

Stack: Vite, React, TypeScript, Tailwind CSS v4, Firebase. The visual system follows the Cobalt theme from
[Hallmark](https://github.com/nutlope/hallmark).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173/
npm run build
```

Set up sync and hosting (Firebase Hosting, no GitHub Pages) with [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

The previous single-file version is kept in `legacy/` for reference.
