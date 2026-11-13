# GRAPHICAL — designer landing pages

A Next.js site with one page per featured designer: name, category badges,
portrait, Profile / Portfolio / Circle buttons, a scrollable day dial, and
the GRAPHICAL footer. This sample build has 4 real days wired up (Jan 1–4)
so you can review the template before all 365 are added.

## Run it locally

```
npm install
npm run dev
```

Then open http://localhost:3000 — it redirects to the first sample day.
Individual pages live at `/day/jan-01`, `/day/jan-02`, `/day/jan-03`,
`/day/jan-04`.

## Adding portraits

Portraits aren't included yet — see `public/portraits/README.txt`. Export
each one from the Figma "Personal-Exploration" file as an SVG and drop it
in `public/portraits/` using the matching slug name (e.g. `jan-01.svg`).
Until a file is added, that designer's circle shows their initials instead,
so the page still renders correctly either way.

## Scaling to all 365 days

Each day lives as one object in `data/designers.json`:

```json
{
  "slug": "jan-05",
  "day": 5,
  "month": "January",
  "weekday": "Tuesday",
  "dayOfYear": "5/365",
  "name": "...",
  "line1": "...",
  "line2": "...",
  "category": "Graphic & Brand Designers",
  "categoryCode": "G&B",
  "links": { "profile": "...", "portfolio": "...", "circle": "..." }
}
```

Add one entry per day (bios/categories already exist in your Google Sheet —
this just needs reformatting into this JSON shape), add the matching
portrait SVG, and the site and dial pick it up automatically. Days without
a matching entry show as greyed-out, unclickable numbers on the dial until
they're wired up.

The `/` redirect and the dial's "Today" button currently default to the
first sample day — once all 365 days exist, point both at the designer
whose month/day matches the visitor's real-world today.

## Deploying to Vercel

1. Push this folder to a new GitHub repository.
2. Go to vercel.com → New Project → import that repository.
3. Framework preset: Next.js (auto-detected). No environment variables or
   special build settings are needed — the defaults work.
4. Deploy. Vercel gives you a live URL immediately, and redeploys
   automatically on every push to the main branch.

Each calendar page's QR code should point to
`https://<your-vercel-domain>/day/<slug>`.
