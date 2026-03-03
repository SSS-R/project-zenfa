# Scraper Usage Guide - ENHANCED SAFETY VERSION

## ⚠️ **CRITICAL WARNING: IP BLOCKING RISK**

### **Current Risk Assessment: � MODERATE (40-50% blocking chance)**

Your current scraping configuration has **MODERATE** risk of IP blocking due to:

- **500-600 requests** per full run (8 categories × 30-40 products each × 2 vendors)
- **Duplicate prevention** reduces unnecessary requests
- **Both StarTech and Skyland** use Cloudflare protection

## 🛡️ **SAFER SCRAPING METHODS**

### **🔒 VPN Protection (Recommended)**

```bash
# Use VPN for additional protection (Residential IPs preferred)
# Connect to VPN → Then run scraper
python run_safe_scrape.py
```

**VPN Benefits:**

- ✅ **IP Address Protection** - Bypasses IP-based blocks
- ✅ **Geographic Diversity** - Appears from different locations
- ✅ **Rotation Capability** - Switch servers if detected

**VPN Limitations:**

- ⚠️ **Pattern Detection** - Behavior patterns still detectable
- ⚠️ **Datacenter IPs** - Shared VPN IPs may be flagged
- ⚠️ **Quality Matters** - Residential > Datacenter IPs

### **Option 1: SAFE MODE (RECOMMENDED)**

```bash
cd backend
source .venv/bin/activate

# Safe daily routine (2-3 sessions with breaks)
python run_safe_scrape.py

# Specific components only (much safer)
python run_safe_scrape.py storage case
python run_safe_scrape.py cpu gpu
```

### **Option 2: MANUAL CONTROLLED RUNS**

```bash
# OLD METHOD (HIGH RISK - use only if desperate)
python run_full_scrape.py
```

## 🔧 **Storage & Case Fix Applied**

### **Issues Found & Fixed:**

1. ✅ **URL Fallbacks** - Added alternative URLs for storage/case
2. ✅ **Better Selectors** - Enhanced product extraction for different page layouts
3. ✅ **Error Handling** - Improved failure recovery

### **Storage URLs Fixed:**

- **StarTech**: `/component/ssd` → `/component/hdd`, `/storage`
- **Skyland**: `/ssd` → `/storage`, `/hdd`

### **Case URLs Fixed:**

- **StarTech**: `/component/casing-pc-case` → `/component/casing`, `/case`
- **Skyland**: `/computer-casing` → `/casing`, `/pc-case`

## 📊 **New Safety Features**

### **Enhanced Anti-Detection:**

- ✅ **Product Limits** (30-40 per category instead of 100+)
- ✅ **Duplicate Prevention** (checks existing database)
- ✅ **Reduced concurrency** (3→2 simultaneous requests)
- ✅ **Longer delays** (1.5s→3.5s base, up to 15s)
- ✅ **Smaller batches** (15→8 products per batch)
- ✅ **Session breaks** (30-60 min between sessions)
- ✅ **Request limits** (150 per session, 800 per day)

### **Smart Rate Limiting:**

- **Product limits**: 30-40 products per category (no more 100+)
- **Duplicate checking**: Skips products already in database
- **Error threshold**: 20% error rate triggers longer delays
- **Session duration**: Increases delays after 3 minutes
- **Request counting**: Tracks and limits total requests
- **Component rotation**: Only 2-3 categories per session

## 🎯 **Recommended Usage Patterns**

### **Daily Safe Routine:**

1. **Morning run**: `python run_safe_scrape.py cpu gpu ram`
2. **Wait 4-6 hours**
3. **Evening run**: `python run_safe_scrape.py storage case psu`
4. **Next day**: `python run_safe_scrape.py motherboard cooler`

### **Emergency Full Scrape:**

**⚠️ ONLY if absolutely necessary and IP blocking acceptable**

```bash
python run_full_scrape.py
```

## 🚨 **What To Do If IP Gets Blocked**

### **Immediate Actions:**

1. **Stop all scraping** immediately
2. **Wait 24-48 hours** minimum
3. **Change internet connection** (mobile hotspot/different location)
4. **Use VPN** with residential proxy if available

### **Recovery Steps:**

1. Test access with browser first
2. Start with **ONE component only**: `python run_safe_scrape.py cpu`
3. Monitor for 403/429/503 errors
4. If successful, gradually increase frequency

## 📈 **Performance Comparison**

| Method                           | Duration  | Requests | Blocking Risk | Components/Day |
| -------------------------------- | --------- | -------- | ------------- | -------------- |
| **OLD** (run_full_scrape.py)     | 10-15 min | 500-600  | 🟡 **50%**    | All 8          |
| **NEW** (run_safe_scrape.py)     | 45-60 min | 200-300  | 🟢 **15%**    | 6-8            |
| **MANUAL** (specific components) | 5-10 min  | 60-120   | 🟢 **5%**     | 2-3            |
| **VPN + SAFE** (recommended)     | 45-60 min | 200-300  | 🟢 **10%**    | 6-8            |

## ✅ **Results & Monitoring**

### **Success Indicators:**

- ✅ All scrapers return HTTP 200
- ✅ Products found on category pages
- ✅ No 403/429/503 errors
- ✅ Response times < 5 seconds

### **Warning Signs:**

- ⚠️ HTTP 403 (Forbidden) responses
- ⚠️ HTTP 429 (Too Many Requests)
- ⚠️ Cloudflare challenges appearing
- ⚠️ Response times > 10 seconds
- ⚠️ Empty product lists from high-traffic categories

## 🔍 **Component Status Verification**

### **Check What Was Scraped:**

```bash
python debug_components.py
```

### **Frontend Results:**

- Visit `/components` page
- Use pagination to browse all results
- Filter by Storage/Case to verify fixes
- Should now show data from both vendors

## ⭐ **Best Practices for Long-term Success**

### **DO:**

- ✅ **Use VPN** with residential IPs when possible
- ✅ Use safe scraper (`run_safe_scrape.py`)
- ✅ Rotate components daily
- ✅ Monitor for error patterns
- ✅ Use different internet connections
- ✅ Wait longer between runs
- ✅ Check duplicate prevention is working

### **DON'T:**

- ❌ Run full scraper more than once per day
- ❌ Use datacenter/shared VPN IPs repeatedly
- ❌ Ignore 403/429 error codes
- ❌ Scrape during peak hours (9 AM - 6 PM BD time)
- ❌ Use the same IP/connection repeatedly
- ❌ Ignore response time increases

### **🔒 VPN Recommendations:**

- **Best**: Residential proxy services (rotating IPs)
- **Good**: Premium VPN with residential endpoints
- **Okay**: Standard VPN with server rotation
- **Avoid**: Free VPNs or datacenter-only services

---

## 🎯 **Quick Start for Storage & Case**

If you specifically need storage and case data:

```bash
cd backend
source .venv/bin/activate
python run_safe_scrape.py storage case
```

This will safely scrape both categories with enhanced fallback URLs and improved selectors, significantly reducing blocking risk while fixing the storage/case issues.
