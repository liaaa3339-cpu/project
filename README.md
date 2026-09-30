# Gymmy

Workouts made easy. Gymmy is a small web app for finding exercises and ready-made workouts for home or the gym, in English and Arabic.

Plain HTML, CSS and JavaScript. No framework, no build step.

## Features

- **Search and filters**: search by name in either language, then filter by muscle group (8 groups), home or gym, difficulty, and gender. Filters combine and update instantly.
- **Plans tailored by gender**: choosing Male or Female changes the recommended sets, reps and rest for every exercise. It also features that gender's workouts first and reorders the exercise list.
- **English and Arabic**: one-tap language switch with full right-to-left layout. Gymmy starts in the device language and remembers the choice.
- **Exercise cards**: each card opens a detail view with the plan (sets × reps, rest), equipment, step-by-step instructions, tips and common mistakes.
- **Workouts**: 6 ready-made routines. The workout player steps through every set and starts the rest timer automatically between sets.
- **Rest timer**: presets (30s, 60s, 90s, 2 min) and ±15s. A floating mini-timer stays visible on other tabs. When time is up it beeps, vibrates on phones and flashes.
- **Favorites**: save exercises and workouts. They stay after a refresh (stored in the browser with `localStorage`).
- **Installable**: add it to your home screen, and it works offline after the first visit.
- **Accessible**: full keyboard support, focus handling in dialogs, Esc to close, screen-reader labels and announcements, and reduced-motion support.

## Run it

The app lives in `public/`. Open `public/index.html` in a browser. Everything works this way except install/offline mode.

To test install and offline mode, serve it over HTTP the same way Cloudflare does:

```bash
npm install
npm run dev
```

Then open the local URL Wrangler prints (usually http://localhost:8787). Without Node, `python3 -m http.server 8000 -d public` also works.

## Project structure

```
public/                      Everything that gets deployed
  index.html                 Page shell, icon sprite, dialogs
  css/styles.css             All styles (design tokens at the top, RTL rules near the end)
  js/data.js                 Exercises, workouts and the sets/reps rules
  js/i18n.js                 Interface text in English and Arabic
  js/timer.js                Shared countdown, beep and vibration
  js/app.js                  Rendering, filters, favorites, language, detail view, workout player
  sw.js                      Service worker (offline cache)
  manifest.webmanifest       Install settings (name, icons, colors)
  assets/icons/              App icons
  assets/images/             Put your exercise photos or GIFs here
wrangler.jsonc               Cloudflare config (serves the public/ folder)
.github/workflows/deploy.yml Deploys to Cloudflare on every push to main
```

## Editing content

### Add an exercise

Copy an existing entry in `EXERCISES` in `public/js/data.js` and change the fields:

```js
{
  id: 'goblet-squat',             // unique, used for favorites and workouts
  muscle: 'legs',                 // chest, back, shoulders, arms, legs, glutes, core, fullbody
  location: ['home', 'gym'],      // where it can be done
  level: 'intermediate',          // beginner, intermediate, advanced
  type: 'reps',                   // 'reps', or 'time' for holds like a plank
  equipment: ['dumbbells'],       // keys from equipment in js/i18n.js
  perSide: false,                 // true if reps count per side
  image: '',                      // e.g. 'assets/images/goblet-squat.jpg'
  name: { en: 'Goblet Squat', ar: 'سكوات الكأس' },
  steps: { en: ['…'], ar: ['…'] },
  tips: { en: ['…'], ar: ['…'] },
  mistakes: { en: ['…'], ar: ['…'] },
}
```

Keep the English and Arabic lists the same length. The Arabic text uses verbal nouns ("ثني المرفقين" rather than "اثنِ مرفقيك") so the instructions read naturally for both men and women.

### Add photos

Put the file in `public/assets/images/` and set the exercise's `image` field. Cards show the photo. If the field is empty or the file is missing, cards show the tinted placeholder instead.

### Add a workout

Add an entry to `WORKOUTS` in `public/js/data.js` with a `gender` (`'all'`, `'male'` or `'female'`), a `location`, a `level` and a list of exercise `id`s in order. The session length is calculated automatically.

### Change the sets, reps and rest rules

Everything is in `PLANS` in `public/js/data.js`, organised by exercise type, gender and level. `FOCUS` controls which muscle groups are listed first for each gender. To give one exercise a different rep range, add a `reps` override to it (see `pull-up`).

### Change or add interface text

Edit `public/js/i18n.js`. Every key exists in both `en` and `ar`. Counted phrases ("3 exercises") use the `plurals` section, which includes the Arabic plural forms.

### After changing files

The service worker caches the app. When you deploy an update, change `CACHE` in `public/sw.js` (for example to `'gymmy-v2'`) so installed copies pick up the new files.

## Deploy

Every push to `main` deploys the `public/` folder to Cloudflare through the GitHub Actions workflow in `.github/workflows/deploy.yml`. The workflow needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. To deploy by hand, run `npm run deploy`.

It is a static site, so any other static host works too if you point it at the `public/` folder.
