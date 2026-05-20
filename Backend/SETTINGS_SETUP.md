# Platform Settings Configuration

## Overview
The Collabhype backend supports two-tier configuration:
- **Critical secrets** (JWT, database) → stored in `.env` file
- **Dynamic settings** (API keys, feature flags) → stored in `PlatformSettings` database table

## Setup Steps

### 1. Database Migration
Run this on the production server after deploying:
```bash
npx prisma migrate deploy
```

This creates the `PlatformSettings` table.

### 2. Critical Environment Variables (.env)
These MUST be in `.env`:
```
JWT_SECRET=<secure-key-min-16-chars>
JWT_EXPIRES_IN=7d
DATABASE_URL=mysql://collabhype_saas:Rishi@1995@localhost:3306/collabhype_saas
CORS_ORIGIN=https://collabhype.in
FRONTEND_BASE_URL=https://collabhype.in
```

### 3. Optional Settings (Database)
These can be managed via API or added to database:
- `razorpay_key_id`
- `razorpay_key_secret`
- `razorpay_webhook_secret`
- `meta_app_id`
- `meta_app_secret`
- `google_client_id`
- `google_client_secret`

## API Endpoints (Admin Only)

```bash
# Get all settings (secrets excluded)
GET /api/v1/admin/settings
Authorization: Bearer <admin-jwt>

# Get single setting
GET /api/v1/admin/settings/:key
Authorization: Bearer <admin-jwt>

# Update/Create setting
PUT /api/v1/admin/settings/:key
Authorization: Bearer <admin-jwt>
Content-Type: application/json
{
  "value": "your_api_key_here",
  "type": "string",
  "isSecret": true
}

# Delete setting
DELETE /api/v1/admin/settings/:key
Authorization: Bearer <admin-jwt>
```

## Setting Types
- `string` — Plain text (default)
- `number` — Numeric value
- `boolean` — true/false
- `json` — Structured JSON object

## Caching
Settings are cached in-memory for 5 minutes. Use the API to update settings; cache will be invalidated automatically.

## Fallback Logic
When `platformSettings.getSetting(key)` is called:
1. Check in-memory cache
2. Check `.env` file (for critical secrets)
3. Query database
4. Return null if not found
