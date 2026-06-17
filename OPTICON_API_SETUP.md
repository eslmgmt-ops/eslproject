# Opticon ESL API CSV Configuration Guide

This guide explains how to configure your Opticon ESL Web Server (EBS-50) to sync products from this API endpoint.

## Overview

The `/api/products/by-location` endpoint is designed to work with Opticon's **"Configure CSV from API connection"** feature (Manual section 8.4.1.1.3).

## Endpoint Details

**URL Format:**
```
https://eslproject.com/api/products/by-location?location=FRONT%20OF%20HOUSE&format=csv
```

**Parameters:**
- `location` (optional): Filter by location name (default: "FRONT OF HOUSE")
- `format=csv` (required): Return data as CSV format
- `limit` (optional): Limit number of products (max: 5000)
- `api_key` (optional): API key if authentication is enabled

**Response:** CSV file with product data including:
- ProductId, TreezUUID, Barcode, Description
- Brandname, Group (category)
- StandardPrice, SellPrice, Discount, DiscountTitle
- Content (size), Unit

## Memory Optimization

This endpoint uses **streaming** to handle large datasets (3000+ products) efficiently:
- Products are fetched in batches of 500
- CSV rows are generated and sent incrementally
- Minimal memory footprint regardless of dataset size
- No OutOfMemoryException errors in production

## Security Configuration

### Option 1: API Key Authentication (Recommended)

The endpoint supports optional API key authentication as described in the Opticon manual:

**1. Set environment variable on your server:**
```bash
OPTICON_API_KEY=your-secure-random-key-here
```

**2. Configure in Opticon ESL Web Server:**

Navigate to: **Products → Set up new connection → Configure CSV from API connection**

Add a request header:
```
Key:   X-API-Key
Value: your-secure-random-key-here
```

**Alternative header formats supported:**
- `X-API-Key: your-key` (recommended)
- `Authorization: Bearer your-key`
- Query parameter: `?api_key=your-key` (less secure, visible in logs)

### Option 2: No Authentication

If `OPTICON_API_KEY` environment variable is not set, the endpoint allows public access.

**⚠️ Only recommended for:**
- Internal networks behind a firewall
- Testing/development environments
- VPN-protected deployments

## Opticon ESL Web Server Setup

### Step 1: Start the Configuration Wizard

1. Log in to your EBS-50 at `https://ebs50.local`
2. Navigate to: **Products → Set up new connection**
3. Select: **"Configure CSV from API connection"**

### Step 2: Configure Endpoint

**API CSV endpoint:**
```
https://eslproject.com/api/products/by-location?location=FRONT%20OF%20HOUSE&format=csv
```

**Replace** `FRONT%20OF%20HOUSE` with your location name (URL-encoded):
- "FRONT OF HOUSE" → `FRONT%20OF%20HOUSE`
- "BACK OF HOUSE" → `BACK%20OF%20HOUSE`
- "WAREHOUSE" → `WAREHOUSE`

### Step 3: Add Request Headers (if using API key)

Click **"Add row"** and configure:

| Key | Value |
|-----|-------|
| X-API-Key | your-secure-random-key-here |

### Step 4: Set Complete Reload Interval

**Recommended:** `10` (every 10th sync will be a full reload)

- Partial syncs use `modified_since` parameter (if implemented)
- Full syncs reload entire dataset
- Helps catch any missed updates

### Step 5: Test Connection

Click **"Test connection"** to verify:
- ✅ Endpoint is reachable
- ✅ API key is valid (if configured)
- ✅ CSV format is correct
- ✅ Products are returned

### Step 6: Complete Setup

Follow the remaining wizard steps to:
1. Map CSV columns (ProductId, Description, etc.)
2. Set synchronization frequency
3. Configure system tables location

## CSV Column Mapping

The endpoint returns these columns (map in Opticon wizard):

| CSV Column | Opticon Field | Description |
|------------|---------------|-------------|
| ProductId | Unique ID | Sequential product number (001, 002, ...) |
| TreezUUID | Barcode/ID | Treez inventory UUID |
| Barcode | Barcode | Product barcode (EAN/UPC) |
| Description | Description | Product name |
| Brandname | Brand | Brand name |
| Group | Category | Product category |
| StandardPrice | Price | Regular price |
| SellPrice | Sale Price | Discounted price (if applicable) |
| Discount | Discount % | Discount percentage |
| DiscountTitle | Discount Name | Name of active discount |
| Content | Size | Product size/content |
| Unit | Unit | Unit of measure (EA, g, ml, etc.) |
| NotUsed | - | Reserved for future use |

## Troubleshooting

### Error: "500 Internal Server Error"

**Cause:** OutOfMemoryException when loading too many products

**Solution:** The streaming implementation fixes this. Ensure you're running the latest code.

### Error: "401 Unauthorized"

**Cause:** API key mismatch or missing

**Solutions:**
1. Verify `OPTICON_API_KEY` is set in your server environment
2. Check the `X-API-Key` header matches exactly
3. Restart your Next.js server after changing environment variables

### No Products Returned

**Check:**
1. Location name is correct and URL-encoded
2. Products exist in Treez for that location
3. `format=csv` parameter is included
4. Check server logs: `[Location API]` messages

### Connection Timeout

**Possible causes:**
1. Server is unreachable from EBS-50
2. Firewall blocking HTTPS
3. SSL certificate issues
4. Too many products causing timeout

**Solutions:**
1. Verify network connectivity from EBS-50
2. Use `limit` parameter for testing: `?limit=100&format=csv`
3. Check firewall rules allow HTTPS from EBS-50 IP
4. Increase timeout in Opticon if needed

## Testing

### Test with curl (no auth):
```bash
curl "https://eslproject.com/api/products/by-location?location=FRONT%20OF%20HOUSE&format=csv"
```

### Test with curl (with API key):
```bash
curl -H "X-API-Key: your-key-here" \
  "https://eslproject.com/api/products/by-location?location=FRONT%20OF%20HOUSE&format=csv"
```

### Test limited results:
```bash
curl "https://eslproject.com/api/products/by-location?location=FRONT%20OF%20HOUSE&format=csv&limit=10"
```

## Environment Variables Reference

Add to `.env.local`:

```bash
# Required for Treez integration
TREEZ_API_URL=https://your-treez-instance.treez.io/v2.0
TREEZ_DISPENSARY=your-dispensary-name
TREEZ_API_KEY=your-treez-api-key
TREEZ_CLIENT_ID=your-client-id

# Optional: Secure the Opticon endpoint
OPTICON_API_KEY=your-secure-random-key-here

# Optional: Performance tuning
TREEZ_PRODUCT_LIST_PAGE_SIZE=500
TREEZ_MIN_REQUEST_INTERVAL_MS=140
TREEZ_MAX_RETRIES=4
```

## Production Deployment Checklist

- [ ] Set `OPTICON_API_KEY` environment variable
- [ ] Configure API key in Opticon request headers
- [ ] Test endpoint from EBS-50 network
- [ ] Verify SSL certificate is valid
- [ ] Set appropriate reload interval (10-60 minutes)
- [ ] Set complete reload interval (e.g., 10)
- [ ] Monitor first few syncs for errors
- [ ] Check memory usage during sync
- [ ] Verify discount calculations are correct

## Advanced: Multiple Locations

To sync multiple locations, create multiple API CSV connections:

**Connection 1: Front of House**
```
URL: https://eslproject.com/api/products/by-location?location=FRONT%20OF%20HOUSE&format=csv
```

**Connection 2: Back of House**
```
URL: https://eslproject.com/api/products/by-location?location=BACK%20OF%20HOUSE&format=csv
```

Each connection can have its own:
- Sync frequency
- API key (if using store-specific keys)
- Product table in Opticon

## Support

For issues or questions:
1. Check server logs: `console.log` output shows `[Location API]` messages
2. Verify Treez API connectivity
3. Test endpoint manually with curl
4. Review Opticon ESL Web Server logs for sync errors

## References

- **Opticon Manual Section:** 8.4.1.1.3 API CSV connection (pages 62-63)
- **Opticon Request Headers:** Used for API key authentication (encrypted via HTTPS)
- **CSV Format:** Standard comma-separated values with header row
