# DuoTots

DuoTots is a visual vocabulary PWA for toddlers (built for a 2-year-old). It teaches English words with life-like images, tap-to-hear audio, swipe/tap lessons, practice quizzes, and simple progress rewards.

## Content

- **27 categories, ~670 words** across three stages:
  - **Foundation** — Numbers (0–100), Alphabets, Shapes, Colors, Actions, Emotions, Everyday, Nature, Animals, Food, Toys, Body, Family, 100 Words (kid_general), Power Words
  - **World & People** — World Basics, Landmarks, US Presidents, Great People, Inventions, Leadership, Technology
  - **Advanced** — Money, Finance, Space, Universe, Physics
- Numbers, Alphabets, Shapes, and Colors are typographic renders by design (the numeral/letter/shape/color *is* the lesson).

## Image pipeline (local-first)

1. **Local rebuilt photos (primary)** — photorealistic, QC-verified images live in `public/images/<category>/<word>.webp` and are indexed in `src/lib/local-images.ts`. A word with a local image always renders it — in lessons, practice, and grid cards.
   - US Presidents / Great People use **curated real portraits** (Wikipedia lead images), never AI-generated likenesses.
   - Regenerate the index after new images pass QC: `node scripts/build-local-images.mjs` (reads the QC manifests in `../duo-tots-image-rebuild/manifest-parts/`).
2. **Media API (fallback only)** — `/api/media` resolves anything without a local image (Vecteezy → Pixabay → Wikipedia photo, depending on configured keys). Empty lookups are never cached long-term, so a word recovers automatically once a source exists.

## Voice

- Tap-to-hear uses the browser's **speech synthesis** (`src/lib/audio.ts`), with a 4-second settle guard so a stalled engine can't wedge the speak button.
- (`/api/tts` exists in the codebase but is not wired to the UI.)

## Progress

- Local-only progress in `localStorage` (`src/lib/progress.ts`): stars, per-word practice history, and a streak counted on the **local** calendar day. Wrong answers never erase a streak; the streak only lapses after a full missed day.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3001](http://localhost:3001).

## Validation

```bash
npm run lint
npm run build
```

## PWA

- Installable: PNG icons (192/512/maskable + Apple touch icon) in `public/`, manifest in `src/app/manifest.ts`, offline fallback page included.
- Pinch zoom is enabled (no `user-scalable=no`).

## Deploy

- Push repository to GitHub.
- Import the GitHub repo in Vercel.
- Deploy with default Next.js settings.
