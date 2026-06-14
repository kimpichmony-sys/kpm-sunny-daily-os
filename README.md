# KPM Sunny Daily OS

KPM Sunny Daily OS is a local-first daily mission dashboard built with Next.js, TypeScript, and Tailwind CSS. It helps you generate a daily schedule, check off missions, track your KPM Score, plan tomorrow's main mission, save evening reviews, view history, review analytics, customize the default template, and use daily modes.

The app currently uses browser `localStorage` only. There is no database, login, backend, or AI API.

## What The App Does

- Generates daily missions from the KPM Sunny schedule.
- Tracks completed and skipped missions.
- Calculates KPM Score and day result level.
- Supports daily modes: Full Day, Low Energy, Recovery, Money, Skill, and CEO.
- Saves today's missions, tomorrow plans, reviews, history, settings, and templates in `localStorage`.
- Rolls over to a fresh day using `YYYY-MM-DD` date keys.
- Shows basic streaks, history, and analytics.
- Supports PWA installation with manifest, icons, and service worker.
- Allows JSON export/import backups from Settings.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build For Production

Run the production build:

```bash
npm run build
```

Optional local production test:

```bash
npm run start
```

## Deploy To Vercel

1. Push this project to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and sign in.
3. Click **Add New Project**.
4. Import the GitHub repository.
5. Keep the default Next.js settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: leave default
   - Install Command: `npm install`
6. Click **Deploy**.
7. Open the live Vercel link after deployment finishes.
8. Test the app on both phone and computer.

## Daily Use

1. Open the app from the browser or installed PWA icon.
2. Check the Dashboard for KPM Score, Day Level, Main Mission, and Next Mission.
3. Open **Today's Missions** and clear missions during the day.
4. Mark missions as skipped when they no longer apply.
5. Add a custom mission when today needs an extra task.
6. Use **Plan Tomorrow** to choose tomorrow's main mission and mode.
7. Use **Evening Review** at night to save what happened today.
8. Check **History** and **Analytics** to review progress over time.

## Customize Manhwa Artwork

To customize the manhwa artwork, place PNG files in `public/art` using the exact file names.

Supported artwork files:

```text
public/art/sunny-mascot.png
public/art/avatar-manhwa.png
public/art/hero-working.png
public/art/morning-reset.png
public/art/main-mission.png
public/art/afternoon-growth.png
public/art/evening-control.png
public/art/night-shutdown.png
```

If an artwork file is missing, the app shows a dark gold/teal gradient placeholder instead.

## Export / Import Data Backup

All data lives in this browser's `localStorage`, so backups matter.

To export:

1. Open **Settings**.
2. Find **Data Backup**.
3. Click **Export all data**.
4. Keep the downloaded JSON file somewhere safe.

To import:

1. Open the JSON backup file.
2. Copy its contents.
3. Open **Settings** in the app.
4. Paste the JSON into **Import data from JSON**.
5. Click **Import data from JSON**.
6. Confirm the import. Existing KPM Sunny data on that device will be replaced.

## Post-Deployment Test Checklist

- App opens from the live link.
- Dashboard loads.
- Today's missions load.
- Checkboxes work.
- KPM Score updates.
- `localStorage` saves after refresh.
- Plan Tomorrow works.
- Evening Review saves.
- History works.
- Analytics works.
- PWA install works.
- Mobile layout works.
- Desktop layout works.
- Export/import backup works.

## Current Limitations

- Data is stored per browser/device only.
- Clearing browser storage will delete app data unless you exported a backup.
- No account sync yet.
- No database yet.
- No AI features yet.
- Offline support is basic and depends on the app being loaded once before going offline.
