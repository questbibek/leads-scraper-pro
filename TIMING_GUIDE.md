# ⏱️ Timing Configuration Guide

This guide explains all the timing settings in the scraper and how to adjust them for your needs.

## 🎯 Quick Summary of Changes (v2.1.1)

### Fixed Multiple Location Issues
- ✅ **After Search Wait**: Increased from 3s to 5s
- ✅ **Results Pane Wait**: New function that waits for results to appear
- ✅ **Between Locations**: Increased from 2s to 3s
- ✅ **Scroll Wait**: Increased from 1.5s to 2.5s per scroll
- ✅ **After Click Wait**: Increased from 2.5s to 3.5s
- ✅ **Final Scroll Wait**: Added 2s wait after scrolling completes

## 📍 All Timing Settings Explained

### 1. After Search Submit (Line ~167)
**Current**: 5000ms (5 seconds)
```javascript
await this.sleep(5000);
```
**What it does**: Waits after submitting search for Google Maps to load results

**When to increase**:
- Slow internet connection
- Search returns many results (100+)
- Getting "no results" errors

**Recommended values**:
- Fast internet: 3000ms (3s)
- Normal internet: 5000ms (5s) ✅ Current
- Slow internet: 7000ms (7s)
- Very slow: 10000ms (10s)

---

### 2. Wait for Results Pane (Line ~173 - New Function)
**Current**: 20 attempts × 500ms = 10 seconds max
```javascript
async waitForResultsPane(maxAttempts = 20) {
  await this.sleep(500); // Check every 500ms
}
```
**What it does**: Actively waits for results to appear on the page

**When to increase**:
- Results take long to appear
- Seeing "results pane not found" errors

**Recommended values**:
- Fast: 10 attempts (5s max)
- Normal: 20 attempts (10s max) ✅ Current
- Slow: 30 attempts (15s max)

---

### 3. Before Scraping Buffer (Line ~176)
**Current**: 2000ms (2 seconds)
```javascript
await this.sleep(2000);
```
**What it does**: Extra buffer after results appear before starting to scrape

**When to increase**:
- Results appear but aren't clickable yet
- First few results fail to scrape

**Recommended values**:
- Fast internet: 1000ms (1s)
- Normal internet: 2000ms (2s) ✅ Current
- Slow internet: 3000ms (3s)

---

### 4. Scroll Wait Time (Line ~251)
**Current**: 2500ms (2.5 seconds)
```javascript
await this.sleep(2500);
```
**What it does**: Waits after each scroll for new results to load

**When to increase**:
- Not loading all available results
- Results cut off at 10-15 instead of 50
- Scroll is too fast for internet speed

**Recommended values**:
- Fast internet, few results: 1500ms (1.5s)
- Normal internet: 2500ms (2.5s) ✅ Current
- Slow internet: 3500ms (3.5s)
- Very slow or 100+ results: 5000ms (5s)

---

### 5. Final Scroll Wait (Line ~275)
**Current**: 2000ms (2 seconds)
```javascript
await this.sleep(2000);
```
**What it does**: Final wait after scrolling completes for content to settle

**When to increase**:
- Missing last few results
- Results at the end are incomplete

**Recommended values**:
- Fast: 1000ms (1s)
- Normal: 2000ms (2s) ✅ Current
- Slow: 3000ms (3s)

---

### 6. Between Results Click (Line ~298)
**Current**: 3500ms (3.5 seconds)
```javascript
await this.sleep(3500);
```
**What it does**: Waits after clicking a result for details panel to load

**When to increase**:
- Getting "Error" entries in results
- Missing phone numbers, addresses
- Incomplete data

**Recommended values**:
- Fast internet: 2500ms (2.5s)
- Normal internet: 3500ms (3.5s) ✅ Current
- Slow internet: 5000ms (5s)
- Very slow: 7000ms (7s)

---

### 7. Between Locations (Line ~187)
**Current**: 3000ms (3 seconds)
```javascript
await this.sleep(3000);
```
**What it does**: Pause between finishing one location and starting next

**When to increase**:
- Google Maps rate limiting (errors on 2nd+ location)
- Need to be more polite to servers

**Recommended values**:
- Fast scraping: 2000ms (2s)
- Normal: 3000ms (3s) ✅ Current
- Conservative: 5000ms (5s)
- Very conservative: 10000ms (10s)

---

### 8. After Result Extraction (Line ~228)
**Current**: 300ms
```javascript
await this.sleep(300);
```
**What it does**: Small delay after extracting data before next click

**When to increase**:
- UI feels too fast/jumpy
- Want to slow down overall pace

**Recommended values**:
- Fast: 200ms
- Normal: 300ms ✅ Current
- Slow: 500ms

---

## 🎛️ Preset Configurations

### ⚡ Fast Internet (Aggressive)
```javascript
// After search
await this.sleep(3000);  // Line ~167

// Scroll wait
await this.sleep(1500);  // Line ~251

// Click wait
await this.sleep(2500);  // Line ~298

// Between locations
await this.sleep(2000);  // Line ~187
```
**Best for**: Fast connection, small searches (1-3 locations)

---

### 🌐 Normal Internet (Balanced) ✅ Current
```javascript
// After search
await this.sleep(5000);  // Line ~167

// Scroll wait
await this.sleep(2500);  // Line ~251

// Click wait
await this.sleep(3500);  // Line ~298

// Between locations
await this.sleep(3000);  // Line ~187
```
**Best for**: Most users, 5-10 locations

---

### 🐌 Slow Internet (Conservative)
```javascript
// After search
await this.sleep(7000);  // Line ~167

// Scroll wait
await this.sleep(3500);  // Line ~251

// Click wait
await this.sleep(5000);  // Line ~298

// Between locations
await this.sleep(5000);  // Line ~187
```
**Best for**: Slow connection, large searches (10+ locations)

---

### 🛡️ Rate Limit Safe (Very Conservative)
```javascript
// After search
await this.sleep(10000);  // Line ~167

// Scroll wait
await this.sleep(5000);  // Line ~251

// Click wait
await this.sleep(7000);  // Line ~298

// Between locations
await this.sleep(10000);  // Line ~187
```
**Best for**: Avoiding rate limits, very large scrapes

---

## 🔧 How to Change Settings

### Step 1: Open content.js
1. Navigate to extension folder
2. Open `content.js` in text editor

### Step 2: Find the Lines
Use Ctrl+F (Windows) or Cmd+F (Mac) to search for:
- "await this.sleep(5000)" - After search
- "await this.sleep(2500)" - Scroll wait
- "await this.sleep(3500)" - Click wait
- "await this.sleep(3000)" - Between locations

### Step 3: Change the Values
Replace the number with your desired milliseconds:
- 1000 = 1 second
- 2500 = 2.5 seconds
- 5000 = 5 seconds
- 10000 = 10 seconds

### Step 4: Reload Extension
1. Go to `chrome://extensions/`
2. Find "Google Maps Easy Scrape"
3. Click reload button 🔄
4. Refresh Google Maps page
5. Test your changes!

---

## 📊 Timing Impact on Performance

| Setting | Speed | Data Quality | Server Load |
|---------|-------|--------------|-------------|
| Fast (Aggressive) | 20/min | Good | High |
| Normal (Balanced) | 12-15/min | Excellent | Medium |
| Slow (Conservative) | 8-10/min | Excellent | Low |
| Rate Limit Safe | 5-7/min | Excellent | Very Low |

---

## 🎯 Common Issues & Solutions

### Issue: Multiple locations skip results
**Solution**: Increase "After search" wait from 5s to 7s or 10s

### Issue: Getting "Error" in results table
**Solution**: Increase "Click wait" from 3.5s to 5s or 7s

### Issue: Only getting 10-15 results instead of 50
**Solution**: Increase "Scroll wait" from 2.5s to 3.5s or 5s

### Issue: Rate limited by Google
**Solution**: 
- Increase "Between locations" from 3s to 5s or 10s
- Increase all timings by 50-100%
- Use pause/resume to break up scraping

### Issue: Missing phone/email/social links
**Solution**: Increase "Click wait" to give more time for full details to load

### Issue: Scraper too slow
**Solution**: Use "Fast" preset, but may reduce data quality

---

## 💡 Pro Tips

### Tip 1: Test First Location
Set just 1 location first and test timings. Once working well, add more locations.

### Tip 2: Start Conservative
Begin with "Slow" preset, then gradually decrease if stable.

### Tip 3: Watch Console
Open browser console (F12) to see timing logs and adjust accordingly.

### Tip 4: Internet Speed Matters
Your internet speed is the biggest factor. Test and adjust for your connection.

### Tip 5: Use Pause/Resume
For large scrapes, use pause/resume instead of just increasing all timings.

### Tip 6: Time of Day
Google Maps may be slower during peak hours. Adjust timings accordingly.

---

## 🔍 Debug Mode

To see detailed timing logs, open browser console (F12) and watch for:
```
⏳ Waiting for results to load for Seattle...
✅ Results pane ready with 47 results
📊 Results loaded. Starting to scrape Seattle...
🔄 Starting scroll to load all results...
Scroll 1/30 - Height: 2000px
✅ New content loaded - height increased by 500px
```

These logs help you understand if timings are appropriate.

---

## 📞 Need Help?

If you're still having issues after adjusting timings:
1. Check browser console for errors
2. Try the "Rate Limit Safe" preset
3. Reduce number of locations
4. Report issue on GitHub with console logs

---

**Version**: 2.1.1
**Last Updated**: February 2024
**Created by**: Quest Bibek
