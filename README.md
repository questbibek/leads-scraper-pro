# Google Maps Easy Scrape - Persistent Sidebar Edition

A modern Chrome extension for scraping Google Maps search results with a persistent sidebar interface.

## ✨ Features

- **Persistent Sidebar**: Scraper interface slides in from the right side of Google Maps
- **Data Persistence**: Results are saved even when switching tabs or closing/reopening the browser
- **Multi-Location Support**: Scrape multiple locations in a single operation
- **Auto-Download**: Automatically downloads CSV after scraping completes
- **Clean UI**: Modern, responsive interface with smooth animations
- **Progress Tracking**: Real-time progress updates during scraping

## 🚀 Installation

1. **Download/Clone** this repository to your local machine

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing these files
   - The extension icon should appear in your toolbar

## 📖 How to Use

### Method 1: Using the Sidebar (Recommended)

1. **Navigate to Google Maps**
   - Go to https://www.google.com/maps

2. **Open the Scraper**
   - Click the "🗺️ Scraper" button on the right edge of the screen
   - The sidebar will slide in from the right

3. **Configure Your Search**
   - **Search Term**: What you're looking for (e.g., "beauty salon", "restaurant", "dentist")
   - **Locations**: Enter multiple locations separated by commas (e.g., "Kathmandu, Bhaktapur, Lalitpur")

4. **Start Scraping**
   - Click "Start Scraping"
   - Watch the progress in real-time
   - Results appear in the table as they're collected

5. **Download Results**
   - CSV automatically downloads when scraping completes
   - Or click "Download CSV" anytime to manually download
   - Click "Clear Results" to start fresh

### Method 2: Using the Extension Popup

1. **Click the Extension Icon** in your Chrome toolbar
2. **Click "Open Scraper Sidebar"** to launch the sidebar interface
3. Follow steps 3-5 from Method 1 above

## 📊 Data Collected

The scraper collects the following information for each result:

- **Location** - The search location
- **Title** - Business/place name
- **Rating** - Star rating (if available)
- **Reviews** - Number of reviews
- **Phone** - Phone number (if available)
- **Website** - Website URL (if available)
- **Address** - Full address
- **Google Maps Link** - Direct link to the place on Google Maps

## 💾 Data Persistence

- Results are automatically saved to Chrome's local storage
- Data persists across:
  - Tab switches
  - Browser restarts
  - Page refreshes
- Use "Clear Results" button to remove saved data

## 🎨 Features Breakdown

### Persistent Interface
- Sidebar stays accessible while browsing Google Maps
- Toggle button always visible on the right edge
- Smooth slide-in/out animations

### Smart Scraping
- Automatically scrolls to load all results
- Clicks through each result to get detailed information
- Handles errors gracefully
- Maximum 50 results per location (configurable in code)

### CSV Export
- Auto-generated filename with timestamp
- Properly formatted with headers
- Handles special characters in data
- One-click download

## ⚙️ Configuration

You can modify these settings in `content.js`:

```javascript
// Maximum results per location (line ~149)
const maxResults = Math.min(links.length, 50);

// Scroll attempts (line ~183)
const maxScrolls = 30;

// Delays between actions
await this.sleep(3000);  // After search
await this.sleep(2500);  // After clicking result
await this.sleep(2000);  // Between locations
```

## 🔧 Technical Details

### Files Structure
```
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup interface
├── popup.js           # Popup logic
├── content.js         # Main scraper logic (injected into Google Maps)
├── sidebar.css        # Sidebar styling
├── map.png            # Extension icon
└── README.md          # This file
```

### Permissions Used
- `activeTab` - Access current tab
- `scripting` - Inject content script
- `storage` - Save results locally

### Browser Compatibility
- Chrome (recommended)
- Edge (Chromium-based)
- Brave
- Other Chromium-based browsers

## 🐛 Troubleshooting

**Sidebar doesn't appear**
- Refresh the Google Maps page
- Make sure you're on google.com/maps
- Check that the extension is enabled

**Scraping fails or stops**
- Google Maps may have changed their HTML structure
- Try refreshing the page
- Check browser console for errors (F12)

**Results not saving**
- Check Chrome's storage permissions
- Clear browser cache and reload extension

**CSV download doesn't work**
- Check your download folder
- Disable popup blockers
- Check Chrome download settings

## 🙏 Credits

Created by **Mike Powers**
- [YouTube Channel](https://www.youtube.com/@itsmikepowers)
- [Buy Me a Coffee](https://www.buymeacoffee.com/itsmikepowers)

## ⚖️ Disclaimer

This tool is for educational purposes. Please:
- Respect Google's Terms of Service
- Don't overload their servers
- Use responsibly and ethically
- Consider rate limiting for large scrapes

## 📝 License

This project is open source and available for personal and educational use.

---

**Version**: 2.0  
**Last Updated**: February 2024  
**Maintained by**: Mike Powers
