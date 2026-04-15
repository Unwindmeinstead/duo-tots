# DuoTots

DuoTots is a visual vocabulary PWA for toddlers. It teaches English words with real images, tap-to-hear audio, and simple progress rewards.

## Features

- Premium mobile-first UI with app-like cards, depth, and gradients.
- 6 vocabulary categories with visual flashcards and deterministic image lookup.
- Better voice pipeline: dictionary audio first, browser premium-voice fallback.
- Practice mode with quick image-to-word matching.
- Local progress tracking (stars, streak, practiced words).
- PWA support with offline fallback page.

## Media + Voice Sources (Free APIs)

- Images: Wikipedia REST API (`/api/media`) with local cache and fallback image.
- Voice: Dictionary API audio (`/api/tts`) with browser speech fallback.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm run lint
npm run build
```

## Deploy

- Push repository to GitHub.
- Import the GitHub repo in Vercel.
- Deploy with default Next.js settings.
