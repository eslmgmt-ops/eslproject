# Test CSV Endpoint - Quick Testing Guide

## 🚀 Fast Mock API for Opticon EBS-50 Testing

This endpoint returns **instant dummy data** in the same CSV format as the real API, perfect for testing Opticon EBS-50 connectivity.

---

## Endpoint URLs

### Local Testing
```
http://localhost:3000/api/products/test-csv
```

### Production Testing
```
https://eslproject.com/api/products/test-csv
```

---

## Query Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `count` | `50` | Number of mock products (1-5000) |
| `delay` | `0` | Artificial delay in milliseconds (for testing timeouts) |

---

## Test Scenarios

### ✅ Test 1: Quick Response (50 products)
**Use this in Opticon EBS-50 first!**

```
https://eslproject.com/api/products/test-csv?count=50
```

**Expected:** Returns in **< 1 second**

If this works → Your network connection is fine!
If this fails → Network/firewall issue between EBS-50 and your server

---

### ✅ Test 2: Medium Dataset (500 products)
```
https://eslproject.com/api/products/test-csv?count=500
```

**Expected:** Returns in **< 2 seconds**

---

### ✅ Test 3: Large Dataset (3000 products like real API)
```
https://eslproject.com/api/products/test-csv?count=3000
```

**Expected:** Returns in **< 5 seconds**

If this works but real API times out → The issue is **Treez API fetch speed**, not network!

---

### ⏱️ Test 4: Simulate Slow Response (for timeout testing)
```
https://eslproject.com/api/products/test-csv?count=100&delay=5000
```

**Expected:** Returns after 5 seconds delay

Use this to test how Opticon handles slower responses.

---

## Opticon EBS-50 Setup

### Step 1: Navigate to API CSV Configuration
Products → Set up new connection → Configure CSV from API connection

### Step 2: Enter Test Endpoint
**API CSV endpoint:**
```
https://eslproject.com/api/products/test-csv?count=50
```

### Step 3: Leave Headers Empty
No authentication needed for test endpoint

### Step 4: Set Complete Reload Interval
```
10
```

### Step 5: Click "Test Connection"
Should connect **instantly** (< 1 second)

---

## Sample Output

```csv
ProductId,TreezUUID,Barcode,Description,Brandname,Group,StandardPrice,SellPrice,Discount,DiscountTitle,Content,Unit,NotUsed
001,mock-uuid-1-1718686800000,1234567890001,Green Valley Flower #1,Green Valley,Flower,45.32,45.32,,,3.5,g,
002,mock-uuid-2-1718686800000,1234567890002,Happy Herbs Edibles #2,Happy Herbs,Edibles,28.91,20.23,30.00,Happy Hour Special,100.0,mg,
003,mock-uuid-3-1718686800000,1234567890003,Cloud Nine Concentrates #3,Cloud Nine,Concentrates,72.15,72.15,,,1.0,g,
...
```

---

## Troubleshooting

### ❌ Test endpoint times out
**Cause:** Network connectivity issue

**Solutions:**
1. Check if EBS-50 can reach the internet
2. Verify firewall isn't blocking EBS-50
3. Try local IP instead: `http://YOUR-PC-IP:3000/api/products/test-csv`
4. Check if domain is actually deployed (not just localhost)

### ✅ Test endpoint works, real API times out
**Cause:** Real API is too slow (Treez fetch + processing)

**Solutions:**
1. Deploy the caching changes I made
2. Use smaller location filters
3. Add `limit` parameter: `?location=X&format=csv&limit=500`
4. Increase EBS-50 timeout if possible (check Opticon settings)

### ✅ Both work in Postman, both fail in EBS-50
**Cause:** EBS-50 network configuration

**Solutions:**
1. Check EBS-50 can reach external HTTPS endpoints
2. Test with HTTP instead of HTTPS (local network)
3. Verify DNS resolution from EBS-50
4. Check EBS-50 proxy settings

---

## Quick Diagnosis Chart

```
Test endpoint works? → Real API works? → SOLUTION
      YES          →      YES         → All good! 🎉
      YES          →      NO          → Speed issue - use caching/limit
      NO           →      NO          → Network/connectivity issue
      NO           →      YES         → Something weird - check logs
```

---

## Next Steps

1. ✅ Test with `count=50` first
2. ✅ If works, try `count=500`
3. ✅ If works, try `count=3000`
4. ✅ If all work, switch back to real API with `limit` parameter
5. ✅ Monitor and adjust based on results

---

## Remove Test Endpoint (After Testing)

Once you've confirmed connectivity, you can optionally remove:
```bash
rm app/api/products/test-csv/route.ts
```

Or keep it for future testing!
