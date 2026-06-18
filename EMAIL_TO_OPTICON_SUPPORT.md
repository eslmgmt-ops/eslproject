# Email Template for Opticon Support

---

**Subject:** EBS-50 API CSV Connection Issue - Timeout After 100 Seconds (Working Endpoints Provided)

---

**Dear Opticon Support Team,**

I am experiencing an issue with the **"Configure CSV from API connection"** feature (Manual Section 8.4.1.1.3) on my EBS-50 base station. The connection was working correctly until a few days ago but has now stopped functioning.

## Issue Summary

**Error Message:**
```
Downloading CSV through API failed. Error: The request was canceled due to the configured HttpClient.Timeout of 100 seconds elapsing.
```

**Key Details:**
- The API endpoints work perfectly when tested from other devices (Postman, browser, curl)
- Multiple test endpoints all fail with the same 100-second timeout error on EBS-50
- No requests from the EBS-50 are appearing in server logs (Vercel), indicating the requests never leave the device
- The issue started approximately [X days ago] - the same configuration was working prior to this

## EBS-50 Configuration

**Model:** EBS-50  
**Firmware Version:** [Your version here]  
**Serial Number:** [Your serial number]  
**Network Configuration:**
- IP Address: [Your IP]
- Gateway: [Your gateway]
- DNS Servers: [Your DNS]
- Internet Connectivity: [Can/Cannot access external websites]

## API Endpoint Configuration (as per Manual Section 8.4.1.1.3)

I have configured the following in **Products → Set up new connection → Configure CSV from API connection:**

**API CSV Endpoint:**
```
https://eslproject.com/api/products/by-location?location=FRONT%20OF%20HOUSE&format=csv
```

**Request Headers:** None (for initial testing)  
**Complete Reload Interval:** 10

## Test Endpoints (All Verified Working)

To help with diagnostics, I have created several test endpoints that return data instantly (< 1 second):

### 1. Demo Endpoint (6 products)
```
https://eslproject.com/api/products/demo?format=csv
```
**Status:** ✅ Works in Postman/browser, ❌ Fails on EBS-50 (100s timeout)  
**Response Time (external test):** < 500ms  
**Data:** Returns valid CSV in exact format per manual specifications

### 2. Mock Data Endpoint (configurable size)
```
https://eslproject.com/api/products/test-csv?count=50
```
**Status:** ✅ Works in Postman/browser, ❌ Fails on EBS-50 (100s timeout)  
**Response Time (external test):** < 1 second  
**Data:** Returns 50 mock products in valid CSV format

### 3. Discounts Endpoint (small dataset)
```
https://eslproject.com/api/discounts?location=FRONT%20OF%20HOUSE&format=csv
```
**Status:** ✅ Works in Postman/browser, ❌ Fails on EBS-50 (100s timeout)  
**Response Time (external test):** < 2 seconds  
**Data:** Returns discount information in CSV format

## Verification Tests Performed

✅ **All endpoints tested in Postman:** Working, instant responses  
✅ **All endpoints tested in web browser:** Working, CSV downloads immediately  
✅ **All endpoints tested with curl:** Working, data received instantly  
✅ **Server logs checked (Vercel):** Zero requests from EBS-50 IP (requests never arrive)  
❌ **All endpoints fail on EBS-50:** 100-second timeout on every attempt  

**Conclusion:** The API server is functioning correctly. The issue appears to be with the EBS-50's ability to establish outbound HTTPS connections to the server.

## Network Diagnostics Performed

- [✓/✗] EBS-50 can ping gateway
- [✓/✗] EBS-50 can access https://google.com
- [✓/✗] EBS-50 can access other external websites
- [✓/✗] EBS-50 can resolve DNS for eslproject.com
- [✓/✗] No firewall changes on local network (confirmed with IT)
- [✓/✗] No proxy configured on EBS-50

## Questions for Support

1. **Are there any known issues with the HttpClient.Timeout of 100 seconds?**
   - Even endpoints that return data in < 1 second fail with this timeout
   - Can the timeout be increased or does this indicate a connection establishment failure?

2. **What network diagnostics are available on the EBS-50?**
   - Is there a way to test DNS resolution?
   - Can we verify SSL/TLS certificate validation?
   - Are there detailed connection logs available?

3. **Have there been any firmware updates that might affect outbound HTTPS connections?**
   - The issue started recently without configuration changes on my end
   - Could a firmware update have introduced stricter SSL validation or proxy requirements?

4. **Are there any specific firewall ports or domains that need to be whitelisted?**
   - We use Vercel's CDN (eslproject.com resolves to Vercel edge IPs)
   - Should we whitelist specific IP ranges?

5. **Can the EBS-50 work behind a corporate proxy?**
   - If so, how is proxy authentication configured?
   - Are there any known issues with SSL inspection proxies?

## Request for Assistance

I would appreciate your guidance on:

1. How to diagnose the root cause of this connection timeout
2. What EBS-50 logs or settings I should check
3. Whether this could be a firmware or configuration issue
4. If you can test the provided endpoints from your end to verify they work correctly

## Additional Information

**Manual Reference:**  
ESL Web Server - User Manual, Section 8.4.1.1.3 "API CSV connection" (Pages 62-63)

**Feature Description (from manual):**
> "The API CSV endpoint is an http or https address that can be reached by the ESL Web Server, and the endpoint should return data as text in a CSV-format. Request headers are optional. These are key-value pairs that are added to the request, and in an HTTPS connection they are encrypted."

**Current Setup:**
- Using HTTPS endpoint (eslproject.com)
- No request headers configured (for initial testing)
- CSV format verified and matches manual specifications
- Complete reload interval: 10 (as recommended)

## Timeline

- **Previously:** API CSV connection working correctly with same configuration
- **[Approximate date]:** Issue started - all API connections timeout after 100 seconds
- **Present:** Multiple test endpoints created (instant response times) but all fail on EBS-50
- **No changes made:** API configuration, endpoint URL, network settings all unchanged

## Server Details (for verification)

**Hosting:** Vercel (https://vercel.com)  
**Region:** Global CDN with edge functions  
**SSL:** Valid certificate from Vercel  
**Response Times:** Verified < 1 second for test endpoints  
**Availability:** 99.99% uptime, no outages reported  

Feel free to test the provided endpoints from your support location to verify they respond correctly.

## Next Steps

I am available for:
- Remote diagnostic session if needed
- Providing additional logs or configuration details
- Testing any diagnostic commands or settings you recommend
- Coordinating with our IT team if network changes are required

Please let me know what additional information you need or what troubleshooting steps you recommend.

Thank you for your assistance!

**Best regards,**  
[Your Name]  
[Your Company]  
[Your Contact Information]  
[Your Time Zone]

---

## Attachments to Include (if applicable)

- [ ] Screenshots of EBS-50 error messages
- [ ] Screenshots of EBS-50 network configuration
- [ ] Screenshots of API CSV configuration page
- [ ] Sample CSV output from working endpoint
- [ ] EBS-50 system logs (if accessible)

---

## CC/Include (if applicable)

- Your IT/Network Administrator
- Opticon Sales Representative (if applicable)
- Anyone else who worked on the original setup

---

## Follow-up Tracking

**Ticket Number:** ________________  
**Support Contact:** ________________  
**Date Sent:** ________________  
**Response Expected:** ________________  

---

## Quick Reference URLs for Support Team

```
Working Test Endpoints (< 1 second response):

1. Demo (6 products):
   https://eslproject.com/api/products/demo?format=csv

2. Mock (50 products):
   https://eslproject.com/api/products/test-csv?count=50

3. Mock (10 products for quick test):
   https://eslproject.com/api/products/test-csv?count=10

4. Discounts:
   https://eslproject.com/api/discounts?location=FRONT%20OF%20HOUSE&format=csv

All endpoints return valid CSV format.
All verified working in Postman, browser, curl.
All fail on EBS-50 with 100-second timeout.
```
