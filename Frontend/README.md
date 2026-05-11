# Collabhype — Frontend

Next.js (App Router) marketplace frontend for **Collabhype**.

## Stack
- Next.js 14 (App Router)
- React 18
- **TypeScript** for `src/lib/*` (typed domain models)
- **JSX** for `src/app/*` and `src/components/*` (React components + pages)
- Tailwind CSS 3
- `@tanstack/react-query` (used in auth/dashboard flows)
- Server Components for public pages

## Local setup
1. (Optional) start the Backend at `http://localhost:4000`. With no backend, demo mode is automatic.
2. Copy env:
   ```bash
   cp .env.local.example .env.local
   ```
3. Install deps:
   ```bash
   npm install
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```
   App live at `http://localhost:3000`.

## Demo / dummy mode
The frontend ships with a full set of dummy data in `src/lib/dummyData.ts`. When
`NEXT_PUBLIC_DEMO_MODE=1` (or `NEXT_PUBLIC_API_BASE_URL` is unset), the axios
client short-circuits every request and returns dummy responses — no backend
needed. This is the default for production builds (`.env.production`), which
makes the project deployable to Vercel out of the box.

To wire up a real backend, set `NEXT_PUBLIC_API_BASE_URL` and
`NEXT_PUBLIC_DEMO_MODE=0`.

## Deploying to Vercel
1. Import this repo in Vercel.
2. Set **Root Directory** to `Frontend` (since the repo also contains a `Backend/`).
3. Vercel will pick up `Frontend/vercel.json` and detect Next.js automatically.
4. No env vars required — `.env.production` already turns on demo mode.

To wire to a real backend, add `NEXT_PUBLIC_API_BASE_URL` (and set
`NEXT_PUBLIC_DEMO_MODE=0`) in the Vercel project settings.

## Folder layout
```
src/
├── app/                       Next.js App Router (.jsx)
│   ├── layout.jsx             Root layout
│   ├── page.jsx               Marketing home
│   ├── globals.css            Tailwind + design tokens
│   ├── packages/              Browse + detail
│   ├── influencers/           Browse + detail
│   ├── dashboard/             Brand / Creator / Admin dashboards
│   └── …
├── components/                Reusable React components (.jsx)
│   ├── layout/{Header,Footer,LayoutChrome}.jsx
│   ├── ui/                    Full UI kit (Button, Card, Modal, …)
│   ├── home/                  Marketing sections
│   └── …
└── lib/                       Typed utilities (.ts)
    ├── types.ts               Shared domain types
    ├── api.ts                 fetch helper
    ├── apiClient.ts           axios client + demo-mode short-circuit
    ├── auth.ts                token / demo-mode helpers
    ├── dummyData.ts           dummy data for demo mode
    ├── analytics.ts           consent-gated tracking
    └── format.ts              INR + follower count formatters
```

## Notes
- `apiFetchSafe` (in `lib/api.ts`) returns a fallback when the backend is down.
- Filters auto-sync to URL params and reset pagination on change.
- Decimal prices coming from the API arrive as strings — `formatINR` handles coercion.
- TypeScript is permissive (`strict: false`, `allowJs: true`) so the existing
  `.jsx` components don't require type annotations.
