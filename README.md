# Google Maps Easy Scrape - Enhanced Edition

A powerful Chrome extension for scraping Google Maps search results with advanced features, real-time progress tracking, and comprehensive data extraction.

## ✨ New Features (v2.1)

### 🎯 Enhanced Data Extraction
- **Social Media Links**: Automatically extracts Facebook, Instagram, Twitter, and LinkedIn profiles
- **Email Addresses**: Detects and captures email addresses from business listings
- **Business Categories**: Extracts business type/category information
- **Operating Hours**: Captures business hours when available
- **Price Level**: Records price range indicators ($ symbols)
- **Improved Phone Detection**: Multiple fallback methods for better phone number extraction

### ⚡ Real-Time Experience
- **Live Progress Bar**: Visual progress indicator with percentage completion
- **Incremental Updates**: Results appear in the table as they're scraped (no waiting)
- **Pause/Resume**: Control scraping with pause and resume functionality
- **Auto-Scroll**: Table automatically scrolls to show latest results
- **Fade-In Animations**: Smooth animations for new entries

### 💾 Smart Data Persistence
- **Auto-Save**: Results automatically saved with debouncing (500ms)
- **Form State Memory**: Search terms and locations restored on page reload
- **Instant Recovery**: Previous results load immediately when reopening sidebar
- **Crash-Resistant**: Data persists even if browser crashes

### 🎨 UI Improvements
- **Social Link Counter**: Shows number of social media links found (e.g., "3 🔗")
- **Enhanced Progress Display**: Shows current item being scraped
- **Better Error Messages**: Clear, emoji-based status indicators
- **Responsive Animations**: Smooth transitions and hover effects

## 📊 Complete Data Fields

The scraper now collects **16 data points** for each business:

1. **Location** - Search location
2. **Title** - Business name
3. **Rating** - Star rating
4. **Reviews** - Number of reviews
5. **Categories** - Business type/category
6. **Phone** - Phone number
7. **Email** - Email address (when available)
8. **Website** - Website URL
9. **Address** - Full address
10. **Facebook** - Facebook profile link
11. **Instagram** - Instagram profile link
12. **Twitter** - Twitter/X profile link
13. **LinkedIn** - LinkedIn profile link
14. **Hours** - Business hours
15. **Price Level** - Price range ($, $$, $$$)
16. **Google Maps Link** - Direct link to listing

## 🚀 Installation

1. **Download the Extension**
   - Download all files from this repository
   - Or clone: `git clone https://github.com/questbibek/google-maps-scraper.git`

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files
   - Extension icon will appear in your toolbar

## 📖 How to Use

### Quick Start

1. **Go to Google Maps**
   - Visit https://www.google.com/maps

2. **Open Scraper**
   - Click the "🗺️ Scraper" button on the right edge
   - Or click the extension icon → "Open Scraper Sidebar"

3. **Configure Search**
   - **Search Term**: What you're looking for (e.g., "coffee shop", "dentist")
   - **Locations**: Multiple locations separated by commas
   - Example: `Kathmandu, Pokhara, Lalitpur`

4. **Start Scraping**
   - Click "Start Scraping"
   - Watch real-time progress and results
   - Use "⏸️ Pause" to pause anytime
   - Use "▶️ Resume" to continue

5. **Download Results**
   - CSV auto-downloads when complete
   - Or click "📥 Download CSV" manually
   - Click "🗑️ Clear Results" to start fresh

### Advanced Tips

**Pause/Resume Scraping**
- Click "⏸️ Pause" during scraping to pause
- Click "▶️ Resume" to continue from where you left off
- Useful for large scraping jobs or if you need to use Google Maps

**Data Persistence**
- Results are automatically saved every 500ms
- Close and reopen browser - your data is still there
- Search terms and locations are also remembered
- Only cleared when you click "🗑️ Clear Results"

**Real-Time Monitoring**
- Watch the progress bar fill up
- See each business name as it's scraped
- Results appear immediately in the table
- Social media links counted and displayed (e.g., "3 🔗")

**Multiple Locations**
- Use commas to separate locations
- Example: `Thamel, Kathmandu, Patan, Bhaktapur`
- Scraper will search each location sequentially
- Each result tagged with its location

## 🎯 Use Cases

### Business Research
```
Search: "digital marketing agency"
Locations: New York, Los Angeles, Chicago
Result: Comprehensive list with contact info and social profiles
```

### Lead Generation
```
Search: "real estate agent"
Locations: Miami, Orlando, Tampa
Result: Phone numbers, emails, and social media for outreach
```

### Market Analysis
```
Search: "italian restaurant"
Locations: Manhattan, Brooklyn, Queens
Result: Ratings, reviews, and pricing data for analysis
```

### Competitor Research
```
Search: "fitness gym"
Locations: Boston, Cambridge, Somerville
Result: Complete competitor profiles with social presence
```

## ⚙️ Configuration

### Adjust Scraping Speed

Edit `content.js` to modify delays:

```javascript
// Line ~220: Delay after search
await this.sleep(3000);  // 3 seconds

// Line ~225: Delay after clicking result
await this.sleep(2500);  // 2.5 seconds

// Line ~240: Delay between locations
await this.sleep(2000);  // 2 seconds
```

### Change Maximum Results

```javascript
// Line ~213: Maximum results per location
const maxResults = Math.min(links.length, 50);
```

### Modify Auto-Save Interval

```javascript
// Line ~615: Debounce delay
this.saveTimeout = setTimeout(() => {
  this.performSave();
}, 500);  // 500ms - increase for less frequent saves
```

## 📁 File Structure

```
google-maps-scraper/
├── manifest.json       # Extension configuration
├── content.js          # Main scraper logic (enhanced)
├── sidebar.css         # Styling (enhanced)
├── popup.html          # Extension popup interface
├── popup.js            # Popup logic
├── map.png             # Extension icon
└── README.md           # This file
```

## 🔧 Technical Details

### Chrome Storage API
- Uses `chrome.storage.local` for data persistence
- Automatically saves every 500ms (debounced)
- No size limit concerns for typical use cases

### DOM Selectors
The scraper uses multiple fallback selectors for reliability:
- Phone: 4 different selector strategies
- Rating: 2 different selector strategies
- Reviews: 2 different selector strategies
- Social Links: Scans all `<a>` tags on page

### Error Handling
- Retry logic: Up to 2 retries per result
- Graceful degradation: If one field fails, others still work
- Error logging: All errors logged to console for debugging

### Performance
- Results appear instantly (no batch waiting)
- Debounced saving reduces storage calls
- Efficient DOM queries with caching

## 🛠️ Troubleshooting

### Sidebar Not Appearing
- **Solution**: Refresh the Google Maps page
- Make sure you're on `google.com/maps`
- Check that extension is enabled in `chrome://extensions/`

### Social Links Not Found
- **Reason**: Not all businesses have social media links on Google Maps
- Some businesses only link social media from their website
- The scraper only extracts what's visible in the Google Maps listing

### Phone Numbers Missing
- **Reason**: Some businesses don't display phone numbers publicly
- Try the website field - often has phone number
- Check the actual Google Maps listing manually

### Scraping Stops/Fails
- **Solution**: Google Maps may have changed their HTML structure
- Try refreshing and starting again
- Check browser console (F12) for error messages
- Report issues on GitHub

### Data Not Persisting
- Check Chrome storage permissions
- Clear extension data: Chrome Extensions → Remove → Reinstall
- Check available storage: `chrome://quota-internals/`

### Slow Performance
- Reduce number of locations
- Increase delays in configuration
- Close other tabs to free up memory
- Check your internet connection

## 📊 CSV Export Format

The downloaded CSV includes these columns:

| Column | Description | Example |
|--------|-------------|---------|
| Location | Search location | "Kathmandu" |
| Title | Business name | "Blue Bottle Coffee" |
| Rating | Star rating | "4.5" |
| Reviews | Review count | "1234" |
| Categories | Business type | "Coffee shop" |
| Phone | Phone number | "+1-555-123-4567" |
| Email | Email address | "info@business.com" |
| Website | Website URL | "www.business.com" |
| Address | Full address | "123 Main St, City, State" |
| Facebook | Facebook URL | "facebook.com/business" |
| Instagram | Instagram URL | "instagram.com/business" |
| Twitter | Twitter URL | "twitter.com/business" |
| LinkedIn | LinkedIn URL | "linkedin.com/company/business" |
| Hours | Business hours | "Mon-Fri: 9AM-5PM" |
| Price Level | Price range | "$$$" |
| Google Maps Link | Direct link | "https://maps.google.com/..." |

## 🎓 Best Practices

### For Best Results

1. **Be Specific**: Use specific search terms ("vegan restaurant" not just "restaurant")
2. **Limit Locations**: Start with 3-5 locations, then scale up
3. **Use Pause**: Pause scraping if you need to use Google Maps
4. **Check Results**: Verify a few results before relying on full dataset
5. **Respect Rate Limits**: Don't run multiple scrapers simultaneously

### For Lead Generation

1. **Multiple Searches**: Run different search terms for same location
2. **Export Regularly**: Download CSV after each successful scrape
3. **Combine Data**: Merge multiple CSV files in Excel/Google Sheets
4. **Verify Contacts**: Always verify emails/phones before outreach
5. **Follow GDPR**: Respect privacy laws when collecting business data

### For Market Research

1. **Compare Locations**: Use same search term across different cities
2. **Track Ratings**: Sort by rating to find top performers
3. **Analyze Reviews**: High review count = popular business
4. **Check Price Levels**: Understand market pricing
5. **Social Presence**: Businesses with social links often more active

## ⚖️ Legal & Ethical Use

### Please Remember

- ✅ **Educational purposes**: Learning web scraping and automation
- ✅ **Personal research**: Finding businesses for your own use
- ✅ **Market analysis**: Understanding business landscapes
- ✅ **Public data**: Only collecting publicly visible information

- ❌ **Spam/Harassment**: Don't use for unsolicited mass outreach
- ❌ **Terms Violation**: Respect Google's Terms of Service
- ❌ **Data Reselling**: Don't sell scraped data commercially
- ❌ **Overloading Servers**: Don't run excessive concurrent scrapes

### Best Practices

- Use reasonable delays between requests
- Don't scrape more than you need
- Respect robots.txt and rate limits
- Follow GDPR and data protection laws
- Only use data for legitimate purposes

## 🙏 Credits & Support

**Created by**: Quest Bibek (Subedi Bibek)
- 🔗 [LinkedIn](https://www.linkedin.com/in/questbibek)
- 🐙 [GitHub](https://github.com/questbibek)

**Support the Project**
- ⭐ Star the repository
- 🐛 Report bugs via GitHub Issues
- 💡 Suggest features via GitHub Discussions
- 🤝 Contribute via Pull Requests

## 📜 License

This project is open source and available for personal and educational use.

**Disclaimer**: This tool is provided as-is for educational purposes. Users are responsible for ensuring their use complies with Google's Terms of Service and applicable laws.

---

## 🆕 Version History

### v2.1 (Enhanced Edition) - Current
- ✨ Social media link extraction (Facebook, Instagram, Twitter, LinkedIn)
- ✨ Email address detection
- ✨ Business categories and hours
- ✨ Price level indicators
- ⚡ Real-time progress bar with percentage
- ⚡ Incremental table updates
- ⚡ Pause/resume functionality
- 💾 Enhanced data persistence with auto-save
- 💾 Form state restoration
- 🎨 Improved UI with animations
- 🎨 Social link counter in table
- 🐛 Better error handling with retry logic
- 📊 16-field CSV export

### v2.0 (Original)
- 🎯 Persistent sidebar interface
- 📊 Multi-location scraping
- 💾 Data persistence
- 📥 CSV export
- 🎨 Modern UI design

---

**Made with ❤️ by Quest Bibek | Enhanced for the community**

For questions, issues, or feature requests, visit the [GitHub repository](https://github.com/questbibek/google-maps-scraper)
