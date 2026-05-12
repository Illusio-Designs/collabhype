# Collabhype — Backend

Node + Express + MySQL (via Prisma) REST API for the Collabhype influencer marketplace.

## Stack

- **Runtime**: Node 20+ (ESM)
- **Framework**: Express 4
- **Language**: JavaScript (ES modules)
- **ORM**: Prisma 5 (MySQL)
- **Auth**: JWT (bearer tokens) + bcrypt
- **Validation**: zod
- **Payments**: Razorpay (orders + Route payouts for escrow)
- **Social**: Meta Graph API (Instagram) + Google YouTube Data API

## Setup

1. Install MySQL locally (or use Docker / XAMPP / a hosted DB) and create a database:
   ```sql
   CREATE DATABASE collabhype CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Copy env and fill values:
   ```powershell
   Copy-Item .env.example .env
   ```
   At minimum set `DATABASE_URL` and `JWT_SECRET`.
3. Install deps:
   ```powershell
   npm install
   ```
4. Generate Prisma client + run first migration:
   ```powershell
   npm run prisma:migrate -- --name init
   ```
5. Seed reference data (niches, sample packages):
   ```powershell
   npm run prisma:seed
   ```
6. Start the dev server (auto-reload via Node's built-in `--watch`):
   ```powershell
   npm run dev
   ```
   API will be live at `http://localhost:4000`.

## Endpoints (v1)

### Health & auth
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/health` | — | Liveness |
| GET | `/api/v1/health/db` | — | DB connectivity check |
| POST | `/api/v1/auth/register` | — | Create a BRAND or INFLUENCER account |
| POST | `/api/v1/auth/login` | — | Exchange email+password for JWT |
| GET | `/api/v1/auth/me` | Bearer | Current user + profile |

### Niches
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/niches` | — | List all niches |

### Packages (brand-side browse)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/packages` | — | Browse packages. Filters: `tier`, `nicheSlug`, `minPrice`, `maxPrice`, `q`. Sort: `price_asc` / `price_desc` / `newest` / `reach_desc`. Pagination: `page`, `limit`. |
| GET | `/api/v1/packages/:slug` | — | Package detail with full influencer list |

### Influencers (brand-side browse)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/influencers` | — | Browse influencers. Filters: `tier`, `nicheSlug`, `city`, `minFollowers`, `maxFollowers`, `platform`, `verified`, `q`. Sort: `followers_desc` / `engagement_desc` / `newest`. Pagination: `page`, `limit`. |

### Influencer profile (self-management)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/influencers/me` | INFLUENCER | Full self profile (socials, niches, rate cards) |
| PATCH | `/api/v1/influencers/me` | INFLUENCER | Update bio/city/state/languages/baseRate/upiId/isAvailable |
| PUT | `/api/v1/influencers/me/niches` | INFLUENCER | Replace niche list (`{ nicheSlugs: [...] }`) |
| PUT | `/api/v1/influencers/me/rate-cards` | INFLUENCER | Replace rate cards (`{ rates: [{ deliverable, price }] }`) |
| GET | `/api/v1/influencers/me/socials` | INFLUENCER | List connected social accounts |
| DELETE | `/api/v1/influencers/me/socials/:platform` | INFLUENCER | Disconnect a platform (INSTAGRAM/YOUTUBE/...) |
| GET | `/api/v1/influencers/:id` | — | Public influencer profile (for brand browsing) |

### Social OAuth (Instagram + YouTube)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/oauth/instagram/start` | INFLUENCER | Returns `{ authUrl }` to redirect the influencer to Meta |
| GET | `/api/v1/oauth/instagram/callback` | — (state JWT) | Handles Meta redirect, exchanges code, fetches IG profile + recent media, computes engagement, stores token (AES-256-GCM) |
| GET | `/api/v1/oauth/youtube/start` | INFLUENCER | Returns `{ authUrl }` to redirect to Google |
| GET | `/api/v1/oauth/youtube/callback` | — (state JWT) | Handles Google redirect, exchanges code, fetches channel stats, stores token |

After any OAuth sync or disconnect, the influencer's `totalFollowers`, `tier`, and `avgEngagementRate` are auto-recomputed.

### Cart (BRAND only)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/cart` | BRAND | Get the brand's active cart with hydrated items + subtotal |
| POST | `/api/v1/cart/items` | BRAND | Add an item. Body is a discriminated union: `{ itemType: "PACKAGE", packageId, qty }` **or** `{ itemType: "INFLUENCER", influencerId, qty, deliverables: [{ type, qty }] }`. Server prices it. |
| PATCH | `/api/v1/cart/items/:itemId` | BRAND | Update qty |
| DELETE | `/api/v1/cart/items/:itemId` | BRAND | Remove an item |
| DELETE | `/api/v1/cart` | BRAND | Empty the cart |

### Checkout (Razorpay)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/checkout/create-order` | BRAND | Snapshots cart → creates `Order(PENDING)` + Razorpay order. Returns `{ orderId, razorpayOrderId, amount, currency, keyId }` for the Razorpay Checkout SDK |
| POST | `/api/v1/checkout/verify` | BRAND | Verifies HMAC of `razorpay_order_id|razorpay_payment_id` → marks `Order(PAID)`, creates `EscrowHold(HELD)`, materializes Campaigns + CampaignDeliverables, clears the cart |
| POST | `/api/v1/checkout/webhook` | HMAC | Async confirmation from Razorpay (`payment.captured`, `order.paid`). Verifies `X-Razorpay-Signature` on the raw body. Idempotent. |

### Payment flow

1. Brand builds cart → `POST /cart/items` for each pack/influencer
2. Brand clicks checkout → `POST /checkout/create-order` → backend snapshots prices and returns Razorpay handles
3. Frontend opens Razorpay Checkout with the `keyId`/`orderId`/`amount`. User pays.
4. On success, frontend `POST /checkout/verify` with the three Razorpay fields
5. Backend verifies signature, marks order PAID, holds funds in escrow, generates Campaign + CampaignDeliverable rows for every influencer × deliverable × qty, clears cart, notifies brand + influencers
6. As a safety net, Razorpay also calls `/checkout/webhook` — handler is idempotent (no-op if already PAID)

Payouts to influencers (escrow release) ship in the next phase, gated on per-deliverable approval.

### Orders (BRAND only)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/orders` | BRAND | List brand's orders. Filter: `status`. Pagination. |
| GET | `/api/v1/orders/:id` | BRAND | Order detail with items, escrow holds, and campaign summaries |

### Campaigns (role-aware: brand sees own, influencer sees assigned)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/campaigns` | Bearer | List campaigns. BRAND → owned via orders. INFLUENCER → assigned via deliverables. |
| GET | `/api/v1/campaigns/:id` | Bearer | Campaign detail (role-scoped — influencer sees only their own deliverables) |
| PATCH | `/api/v1/campaigns/:id` | BRAND | Update brief / hashtags / do-don't list / dates |

### Deliverables (the approval workflow)
The state machine: `PENDING → DRAFT_SUBMITTED → APPROVED → POSTED → PAID` (with `REVISION_REQUESTED` loop back to `DRAFT_SUBMITTED`).

| Method | Path | Auth | Allowed from | Effect |
|---|---|---|---|---|
| POST | `/api/v1/deliverables/:delivId/draft` | INFLUENCER | PENDING, REVISION_REQUESTED | Stores `draftUrl`, status → DRAFT_SUBMITTED, notifies brand |
| POST | `/api/v1/deliverables/:delivId/approve` | BRAND | DRAFT_SUBMITTED | Status → APPROVED, notifies influencer |
| POST | `/api/v1/deliverables/:delivId/revise` | BRAND | DRAFT_SUBMITTED | Stores `feedback`, status → REVISION_REQUESTED, notifies influencer |
| POST | `/api/v1/deliverables/:delivId/posted` | INFLUENCER | APPROVED | Stores `postedUrl`, status → POSTED, notifies brand |
| POST | `/api/v1/deliverables/:delivId/release-payment` | BRAND | POSTED | Status → PAID, creates `Payout(PENDING)` for influencer, auto-releases `EscrowHold` if all order deliverables are PAID, marks order `COMPLETED` |

Campaign status auto-recomputes after every transition:
- All deliverables `PAID` → `COMPLETED`
- Any progress beyond `PENDING` → `IN_PROGRESS`
- Otherwise → `BRIEF_SENT`

### Influencer payouts
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/influencers/me/payouts` | INFLUENCER | Lists own payouts with summary (`{ total, pending, paid, failed, currency }`) |

### Money flow summary
1. Brand pays → funds held in `EscrowHold(HELD)`
2. Per-deliverable approval flow runs
3. Brand calls `/release-payment` per deliverable → `Payout(PENDING)` row created (actual Razorpay disbursal is a future admin/cron step)
4. When all deliverables in an order reach `PAID` → `EscrowHold` flips to `RELEASED` and `Order` flips to `COMPLETED`

## Folder layout

```
src/
├── app.js                  Express app setup
├── index.js                Server bootstrap + graceful shutdown
├── config/env.js           zod-validated env
├── lib/prisma.js           Prisma client singleton
├── middleware/             auth, requireRole, errorHandler
├── utils/                  jwt, password, asyncHandler, ApiError
├── modules/
│   ├── auth/               register, login, me
│   ├── health/             liveness + DB ping
│   ├── influencer/         profile, niches, rate cards, socials, browse
│   ├── niche/              public niche catalog
│   ├── oauth/              Instagram (Meta) + YouTube (Google) connectors
│   ├── package/            brand-side package browse + detail
│   ├── cart/               brand cart: add/update/remove, server-side pricing
│   ├── checkout/           Razorpay create-order, verify, webhook → escrow + campaigns
│   ├── order/              brand order history + detail
│   └── campaign/           campaign mgmt + deliverable approval workflow + escrow release
└── routes/index.js         Mounts all modules under /api/v1
prisma/
├── schema.prisma           Full data model (users, influencers, packages, cart, orders, campaigns, escrow, payouts, social)
└── seed.js                 Seed niches + sample packages
```

## Useful commands

```powershell
npm run dev              # watch + reload (Node --watch)
npm run prisma:studio    # visual DB browser
npm run prisma:migrate -- --name <change>
```
