# Treez Sync Middleware

Sync products from Treez dispensary POS to Opticon ESL (Electronic Shelf Labels) via EBS50 base stations.

## Features

- **Treez API integration** – Auth and product fetch (v2 sandbox)
- **Admin dashboard** – Product list and manual sync
- **EBS50 ready** – Structure prepared for Opticon ChangeStrings push

## Getting Started

1. Copy `.env.example` to `.env.local` and set your Treez credentials:

```
TREEZ_API_KEY=your_api_key
TREEZ_DISPENSARY=partnersandbox3
TREEZ_API_URL=https://api.treez.io/v2.0/dispensary
# Optional: Treez `product_list` page size (100–5000). Default 1000; use 100 for smaller JSON per request (more pages).
# TREEZ_PRODUCT_LIST_PAGE_SIZE=100
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) and go to **Admin Dashboard** to view products and run manual sync.

## Project Structure

- `app/admin/` – Admin dashboard (product list, manual sync)
- `app/api/products/` – Fetch products from Treez
- `app/api/sync/` – Manual sync endpoint
- `app/api/auth/` – Test Treez connection
- `lib/treez.ts` – Treez API client

## Opticon ESL Integration

The `/api/products/by-location` endpoint provides **streaming CSV** output optimized for Opticon ESL Web Server (EBS-50).

**Key Features:**
- ✅ Streams 3000+ products without memory issues
- ✅ Optional API key authentication
- ✅ Real-time discount calculations (PST timezone aware)
- ✅ Supports multiple locations via query parameter

**Setup Guide:** See [OPTICON_API_SETUP.md](./OPTICON_API_SETUP.md) for complete configuration instructions.

**Quick Start:**
```
https://eslproject.com/api/products/by-location?location=FRONT%20OF%20HOUSE&format=csv
```

## Security

Set `OPTICON_API_KEY` in environment to enable API key authentication:
```bash
OPTICON_API_KEY=your-secure-key
```

Configure in Opticon request header: `X-API-Key: your-secure-key`

## Next Steps

- ~~Add EBS50 integration~~ ✅ CSV API endpoint ready
- ~~Map Treez product fields to Opticon format~~ ✅ Complete
- Deploy agent in-store for EBS50 LAN access
