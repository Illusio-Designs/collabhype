# Collabcreator — Frontend

Next.js (App Router) marketplace frontend for Collabcreator.

## Stack
- Next.js 14 (App Router, JavaScript / ESM — no TypeScript)
- React 18
- Tailwind CSS 3
- `@tanstack/react-query` (used in auth/dashboard phases)
- Server Components for public pages (server-side fetch from the API for SEO)

## Setup
1. Start the Backend (`cd ../Backend && npm run dev`) — defaults to `http://localhost:4000`.
2. Copy env:
   ```powershell
   Copy-Item .env.local.example .env.local
   ```
3. Install deps:
   ```powershell
   npm install
   ```
4. Run dev server:
   ```powershell
   npm run dev
   ```
   App will be live at `http://localhost:3000`.

## Pages shipped in Phase A
| Route | Description |
|---|---|
| `/` | Marketing home — hero, how-it-works, featured packages, niches |
| `/packages` | Browse packages with filters (tier, niche, price, sort) + pagination |
| `/packages/[slug]` | Package detail with deliverables + included influencer roster |
| `/influencers` | Browse influencers with filters (tier, niche, city, platform) + pagination |
| `/influencers/[id]` | Influencer profile with socials + rate card |

All public, all server-rendered. **No auth, cart, or dashboard yet** — those ship in Phase B (auth + brand checkout) and Phase C (influencer dashboard).

## Folder layout
```
src/
├── app/
│   ├── layout.js              Root layout w/ Header + Footer
│   ├── page.js                Home
│   ├── globals.css            Tailwind + design tokens
│   ├── not-found.js           404
│   ├── packages/
│   │   ├── page.js            Browse
│   │   └── [slug]/page.js     Detail
│   └── influencers/
│       ├── page.js            Browse
│       └── [id]/page.js       Detail
├── components/
│   ├── layout/{Header,Footer}.js
│   ├── PackageCard.js
│   ├── InfluencerCard.js
│   ├── Filters.js             Client component (URL-driven filters)
│   └── Pagination.js
└── lib/
    ├── api.js                 fetch helper + apiFetchSafe with fallback
    └── format.js              INR, follower counts, tier/deliverable/platform labels
```

## Notes
- `apiFetchSafe` gracefully returns a fallback when the backend is down, so the marketing UI still renders during local dev.
- Filters auto-sync to URL params and reset pagination on change.
- Decimal prices from the API arrive as strings — `formatINR` handles the coercion.
