# Collabcreator

Self-serve influencer marketplace for India. Brands buy pre-built influencer packages or hand-pick creators directly. Escrow-backed payments via Razorpay, in-app campaign briefs, and per-deliverable payouts.

## Repo layout

```
Collabcreator/
├── Backend/          Node + Express + Prisma + MySQL REST API
├── Frontend/         Next.js 14 (App Router, JavaScript / ESM)
└── Application/      Expo (React Native) mobile app — scaffolded
```

Each project has its own `README.md`, `.env.example`, and `package.json`.

## Stack

- **Backend:** Node 20+ · Express · Prisma 5 · MySQL · JWT auth · Razorpay · Meta Graph API · YouTube Data API
- **Frontend:** Next.js 14 (App Router) · Tailwind CSS · Framer Motion · Lenis smooth scroll · React Hook Form · Zod
- **Mobile:** Expo (single app, role-switch for brand & creator)
- **Operator:** Managed by Finvera Solution LLP

## Features

### Backend
- Auth (register, login, JWT, change/forgot/reset password, soft-delete account)
- Influencer profiles + Meta/Google OAuth + niches + rate cards
- Brand profiles
- Packages catalog + cart + Razorpay checkout + escrow
- Campaigns with deliverable approval workflow (draft → approve → posted → paid)
- Orders, payouts, notifications
- **SEO content CMS** (admin-managed page metadata + body)
- **Platform tracking** (event ingest + admin analytics)

### Frontend
- Public marketing site with floating-pill header, Medicare-style violet/pastel aesthetic
- Browse packages + influencers with filters, sort, pagination
- Cart + Razorpay checkout
- Role-aware dashboards: **Brand / Creator / Admin**
- Admin pages: Users, Packages, Orders, SEO content, Tracking
- Complete UI kit (Button, Card, Badge, Tabs, Modal, Toast, Avatar, Stat, Progress, Skeleton, Tag, Tooltip, FormField, Input, PasswordInput, Textarea, Select, Checkbox, Radio, Switch, FileUpload, Accordion, Breadcrumb, EmptyState, Alert, Spinner, Divider)
- Cookie consent + analytics (consent-gated, posts to backend)
- Demo mode — preview Brand / Creator / Admin dashboards without a backend

## Quick start

### Backend
```powershell
cd Backend
Copy-Item .env.example .env   # fill DATABASE_URL + JWT_SECRET
npm install
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev                    # http://localhost:4000
```

### Frontend
```powershell
cd Frontend
Copy-Item .env.local.example .env.local
npm install
npm run dev                    # http://localhost:3000
```

For demo mode (no backend needed), open `/login` and click **View as Brand / Creator / Admin**.

## License

Proprietary. © Finvera Solution LLP.
