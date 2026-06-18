# Immediate Checks on EBS-50 Portal 🔍

## Before Contacting Support - Check These First

---

## ✅ CHECK 1: Internet Connectivity (2 minutes)

### Can EBS-50 reach external websites AT ALL?

**Try this public test API in Opticon:**

Navigate to: **Products → Set up new connection → Configure CSV from API connection**

Use this URL:
```
https://jsonplaceholder.typicode.com/users
```

**Result:**
- ✅ **Works:** EBS-50 has internet, issue is with YOUR domain specifically
- ❌ **Fails:** EBS-50 has NO internet or general connection issues

---

## ✅ CHECK 2: DNS Resolution (1 minute)

### Can EBS-50 reach your domain using IP instead of domain name?

This is tricky with Vercel (CDN), but check if EBS-50 has DNS settings in:
**Settings → Network → DNS Servers**

**Current DNS:** ________________

**Try changing to:**
- Primary: `8.8.8.8` (Google DNS)
- Secondary: `8.8.4.4` (Google DNS backup)

Then retry your API connection.

---

## ✅ CHECK 3: Proxy Settings (1 minute)

### Is there a proxy configured?

Navigate to: **Settings → Network → Proxy** (or similar)

**Look for:**
- [ ] HTTP Proxy: ________________
- [ ] HTTPS Proxy: ________________
- [ ] Proxy Authentication: ________________
- [ ] Bypass proxy for: ________________

**If proxy is configured:**
- This might be blocking your domain
- Try adding `eslproject.com` to bypass list
- Or temporarily disable proxy to test

---

## ✅ CHECK 4: Firewall/Security Settings (2 minutes)

Navigate to: **Settings → Security** or **Firewall**

**Look for:**
- [ ] Outbound HTTPS (port 443) blocked/allowed
- [ ] Domain whitelist/blacklist
- [ ] URL filtering enabled
- [ ] SSL inspection enabled

**If domain whitelist exists:**
- Add `eslproject.com` to whitelist
- Add `*.vercel.app` to whitelist (backup Vercel domains)

---

## ✅ CHECK 5: Date & Time (30 seconds)

Navigate to: **Settings → System → Date & Time**

**Verify:**
- [ ] Date: ________________
- [ ] Time: ________________
- [ ] Timezone: ________________
- [ ] NTP Sync: Enabled/Disabled

**Why this matters:** Incorrect time causes SSL certificate validation to fail!

If time is wrong:
- Enable NTP sync
- Set correct timezone
- Restart EBS-50

---

## ✅ CHECK 6: System Logs (5 minutes)

Navigate to: **Settings → System → Logs** (or Dashboard → Logs)

**Search for recent errors containing:**
- "timeout"
- "DNS"
- "certificate"
- "SSL"
- "connection"
- "failed"

**Look for timestamp:** Around when you tried to configure API CSV

**Copy any relevant errors:** ________________

---

## ✅ CHECK 7: Firmware Version (1 minute)

Navigate to: **Settings → System → About** or **Firmware**

**Current firmware:** ________________

**Questions:**
- [ ] When was last firmware update?
- [ ] Did issue start after firmware update?
- [ ] Is firmware update available?

**Note:** Don't update firmware yet - might make troubleshooting harder. Document current version first.

---

## ✅ CHECK 8: Network Status (2 minutes)

Navigate to: **Dashboard** or **Settings → Network → Status**

**Check:**
- [ ] IP Address: ________________
- [ ] Connection Status: Connected / Disconnected
- [ ] Gateway Reachable: Yes / No
- [ ] DNS Working: Yes / No
- [ ] Internet Access: Yes / No

**If EBS-50 has diagnostic tools:**
- Try ping gateway
- Try ping google.com
- Try nslookup eslproject.com

---

## ✅ CHECK 9: Recent Changes (5 minutes)

Navigate to: **Settings → System → Change Log** (if available)

**Look for:**
- Configuration changes in past week
- Network settings changed
- Security policies updated
- Firmware updates applied

**Ask yourself:**
- [ ] Did IT make any network changes?
- [ ] Was EBS-50 moved to different network?
- [ ] Were any cables unplugged/replugged?
- [ ] Did power outage occur?

---

## ✅ CHECK 10: Compare Settings (if you have access to another working EBS-50)

If you have another EBS-50 that CAN access internet:

**Compare:**
- Network settings
- DNS settings
- Proxy settings  
- Firewall settings
- Firmware version

**Look for differences that might explain the issue**

---

## 📊 Results Summary

Fill this out after checking:

```
Internet Connectivity Test: PASS / FAIL / UNTESTED
DNS Resolution: WORKING / BROKEN / UNTESTED
Proxy Configured: YES / NO
Firewall Blocking: YES / NO / UNKNOWN
Date/Time Correct: YES / NO
Relevant Logs Found: YES / NO
Recent Changes: YES / NO

Key Findings:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🚨 Most Likely Issues (Based on Symptoms)

### If public test API (jsonplaceholder) ALSO fails:
**→ General internet connectivity issue**
- Check gateway, DNS, routing
- Contact IT/network team
- Check physical connections

### If public test API works, but yours fails:
**→ Your domain specifically is blocked/unreachable**
- DNS can't resolve your domain
- Firewall blocking your domain
- Proxy blocking your domain
- SSL certificate issue with your domain

### If everything looks normal:
**→ Possible EBS-50 firmware/software bug**
- Contact Opticon support
- Reference all test results
- Provide working test endpoints

---

## 📧 After Checking - Next Steps

1. **Fill out the checklist above**
2. **Document all findings**
3. **If IT issue found:** Contact your network team
4. **If no IT issue found:** Use the email template to contact Opticon Support
5. **Include all diagnostic results** in your support request

---

## ⚡ Quick Decision Tree

```
Can EBS-50 access google.com?
├─ NO → Contact IT (general network issue)
└─ YES → Can EBS-50 access jsonplaceholder test API?
    ├─ NO → Contact IT (HTTPS/external access blocked)
    └─ YES → Your domain specifically blocked
        ├─ DNS issue → Change DNS to 8.8.8.8
        ├─ Firewall → Whitelist eslproject.com
        ├─ Proxy → Add to bypass or disable
        └─ Still fails → Contact Opticon Support with test results
```

---

## 💡 If You Find the Issue

**Document what fixed it!** This helps others with same issue.

**Common fixes:**
- Changed DNS to 8.8.8.8
- Added domain to firewall whitelist  
- Disabled/bypassed proxy
- Fixed date/time settings
- Restarted EBS-50
- [Your fix here]: ________________

---

## Need Help Interpreting Results?

After completing these checks, you'll have clear evidence of:
1. Whether it's a network issue (general)
2. Whether it's specific to your domain
3. What settings might be blocking connection
4. What to tell Opticon support

Use the email template with your findings!
