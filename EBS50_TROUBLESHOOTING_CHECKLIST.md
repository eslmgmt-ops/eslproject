# EBS-50 Network Troubleshooting Checklist

## Issue Summary
All API CSV endpoints timeout after 100 seconds when configured in EBS-50, but work perfectly in Postman, browser, and curl. Zero logs appear in server, indicating requests never leave EBS-50.

---

## ✅ Things to Check in EBS-50 Portal

### 1. Network Settings
**Location:** Settings → Network Configuration

Check these settings:
- [ ] **IP Address**: Is it valid and on correct subnet?
- [ ] **Gateway**: Is gateway IP correct?
- [ ] **DNS Servers**: Are DNS servers configured?
  - Primary: ____________
  - Secondary: ____________
- [ ] **Subnet Mask**: Correct subnet mask?
- [ ] **Proxy Settings**: Is a proxy configured?
  - If YES, this might be blocking HTTPS traffic

### 2. Internet Connectivity Test
**Try accessing from EBS-50 web interface:**
- [ ] Can you browse to https://google.com ?
- [ ] Can you access https://vercel.com ?
- [ ] Try this test API: https://jsonplaceholder.typicode.com/users

**Result:**
- If ALL fail → EBS-50 has no internet
- If public sites work but YOUR domain fails → Firewall/DNS blocking your domain

### 3. Firewall Settings
**Location:** Settings → Firewall / Security

Check if:
- [ ] Outbound HTTPS (port 443) is allowed
- [ ] Any domain blacklist/whitelist configured?
- [ ] Is eslproject.com blocked or not whitelisted?
- [ ] Any recent firewall rule changes?

### 4. Certificate/SSL Settings
**Location:** Settings → Security / Certificates

Check:
- [ ] Can EBS-50 verify SSL certificates?
- [ ] Are root certificates up to date?
- [ ] SSL/TLS version supported? (Should support TLS 1.2+)
- [ ] Any SSL validation errors in logs?

### 5. System Logs
**Location:** Settings → System → Logs

Look for:
- [ ] DNS resolution failures
- [ ] Connection timeout errors
- [ ] SSL/certificate errors
- [ ] Firewall blocking messages
- [ ] Proxy connection failures

**Search for errors around the time you tried connecting**

### 6. Date/Time Settings
**Location:** Settings → System → Date & Time

Verify:
- [ ] Date and time are correct
- [ ] Timezone is correct
- [ ] NTP sync is working

**Why:** Incorrect time causes SSL certificate validation failures

### 7. DNS Resolution Test
**If EBS-50 has a terminal/diagnostic tool:**

Try to resolve domain:
```bash
nslookup eslproject.com
ping eslproject.com
```

Expected result: Should resolve to Vercel edge IPs

### 8. Recent Changes
**Check system change log:**
- [ ] Any firmware updates in past few days?
- [ ] Network settings changed?
- [ ] Security policies updated?
- [ ] New firewall rules added?

### 9. Connection Timeout Settings
**Location:** Settings → API Configuration / Timeouts

Check:
- [ ] HTTP Client Timeout (currently showing 100 seconds)
- [ ] Can this be increased? (Though shouldn't be needed for test endpoints)
- [ ] Connection timeout vs read timeout settings

### 10. Compare Working vs Non-Working
**What changed between when it worked and now?**
- [ ] Firmware version
- [ ] Network configuration
- [ ] Firewall rules
- [ ] DNS servers
- [ ] Proxy settings
- [ ] Location on network (different VLAN?)

---

## 🔍 Diagnostic Results to Collect

Before contacting support, gather this info:

### EBS-50 System Information
```
Firmware Version: ________________
Model: EBS-50
Serial Number: ________________
Current IP: ________________
Gateway: ________________
DNS Servers: ________________
```

### Network Test Results
```
Can ping gateway: YES / NO
Can reach google.com: YES / NO
Can reach vercel.com: YES / NO
Can reach eslproject.com: YES / NO
Can resolve DNS for eslproject.com: YES / NO
```

### Error Messages
```
Exact error from EBS-50:
"Downloading CSV through API failed. Error: The request was canceled due to the configured HttpClient.Timeout of 100 seconds elapsing."

Timestamp of error: ________________
```

### Working Endpoints (for testing)
```
1. https://eslproject.com/api/products/demo?format=csv
   - Works in Postman: YES
   - Works in EBS-50: NO
   - Time to respond in Postman: < 1 second

2. https://eslproject.com/api/products/test-csv?count=50
   - Works in Postman: YES
   - Works in EBS-50: NO
   - Time to respond in Postman: < 1 second

3. https://jsonplaceholder.typicode.com/users (public test API)
   - Works in EBS-50: YES / NO / UNTESTED
```

---

## 🚨 Most Likely Root Causes

Based on symptoms (works everywhere except EBS-50):

### 1. **Proxy Blocking** (Most Common)
- Corporate proxy added recently
- Proxy credentials expired
- Proxy blocking specific domains

**Check:** Settings → Network → Proxy

### 2. **Firewall Changes**
- IT department added new rules
- Domain whitelist doesn't include your domain
- HTTPS inspection blocking connection

**Check:** Contact network admin

### 3. **DNS Issues**
- DNS server can't resolve eslproject.com
- DNS cache corrupted
- Using internal DNS that doesn't have external access

**Check:** Try changing DNS to 8.8.8.8 (Google DNS)

### 4. **VLAN/Network Segmentation**
- EBS-50 moved to isolated network
- No route to internet from current VLAN

**Check:** Can other devices on same network access internet?

### 5. **SSL Certificate Issues**
- Root certificates outdated
- SSL inspection proxy breaking chain
- Time sync issue causing cert validation failure

**Check:** Date/time settings, certificate store

---

## 📧 Information for Opticon Support Email

Include this in your support request:
- ✅ Exact error message
- ✅ EBS-50 firmware version
- ✅ Network configuration (IP, gateway, DNS)
- ✅ Test results (can access google.com? test APIs?)
- ✅ Timeline (was working X days ago, stopped suddenly)
- ✅ Working test URLs for them to verify
- ✅ Confirmation endpoints work from other devices

---

## ⚡ Quick Tests to Run RIGHT NOW

### Test 1: Simple Public API
Configure this in EBS-50:
```
https://jsonplaceholder.typicode.com/users
```
If this works → Your endpoints are specifically blocked
If this fails → General internet connectivity issue

### Test 2: Different Protocol
If you can run local server on same LAN, try HTTP instead of HTTPS:
```
http://YOUR-LOCAL-IP:3000/api/products/test-csv?count=50
```
If this works → SSL/HTTPS issue
If this fails → All outbound connections blocked

### Test 3: Trace Route (if available)
If EBS-50 has diagnostic tools:
```
traceroute eslproject.com
```
See where connection stops

---

## 📞 Who to Contact

1. **Your IT/Network Team** (FIRST!)
   - Ask if firewall rules changed
   - Ask if proxy added/changed
   - Request outbound HTTPS access to eslproject.com

2. **Opticon Support** (if not network issue)
   - Use email template provided
   - Include all diagnostic info above
   - Reference this "API CSV Connection" feature

---

## ✅ Temporary Workaround

While investigating, if you need immediate solution:

### Option: Run Local Proxy/Bridge
If your computer and EBS-50 are on same LAN:

1. Install ngrok: `npm install -g ngrok`
2. Run: `ngrok http https://eslproject.com`
3. Use ngrok URL in EBS-50 (acts as local proxy)

This proves if it's an outbound connection issue from EBS-50's network.
