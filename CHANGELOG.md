# Changelog

All notable changes to the Google Maps Easy Scrape extension.

## [2.1.0] - Enhanced Edition - 2024-02-11

### 🎯 Enhanced Data Extraction

#### Added
- **Social Media Links Extraction**
  - Facebook profile detection
  - Instagram profile detection
  - Twitter/X profile detection
  - LinkedIn company page detection
  - Smart filtering to avoid duplicate links

- **Email Address Detection**
  - Automatic email extraction from page content
  - Regex-based email pattern matching
  - Validation to ensure proper email format

- **Business Information**
  - Business categories/types extraction
  - Operating hours detection
  - Price level indicators ($, $$, $$$)
  - Multiple fallback methods for each field

- **Improved Phone Detection**
  - 4 different selector strategies
  - tel: link parsing
  - aria-label extraction
  - Text content fallback
  - Cleaned formatting

### ⚡ Real-Time Progress & UX

#### Added
- **Live Progress Bar**
  - Visual percentage-based progress indicator
  - Animated shimmer effect
  - Shows current/total items
  - Real-time percentage display

- **Incremental Table Updates**
  - Results appear immediately as scraped
  - No waiting for batch completion
  - Smooth fade-in animations for new rows
  - Auto-scroll to latest result

- **Pause/Resume Functionality**
  - Pause button during active scraping
  - Resume from exact position
  - State management for pause status
  - Visual feedback (⏸️/▶️ icons)

- **Enhanced Progress Messages**
  - Emoji-based status indicators (🔄, ✅, ❌, ⏸️)
  - Current item name display
  - Progress percentage
  - Location context

- **UI Animations**
  - Fade-in for new table rows
  - Pulse animation for results counter
  - Hover effects with scale transform
  - Smooth transitions throughout

#### Changed
- Progress display now shows live status instead of batch updates
- Table updates incrementally instead of at completion
- Button states change dynamically (Start/Pause/Resume)
- Social links shown as count indicator (e.g., "3 🔗")

### 💾 Data Persistence Improvements

#### Added
- **Debounced Auto-Save**
  - 500ms debounce on save operations
  - Prevents excessive storage calls
  - Smooth performance during scraping
  - Timestamp tracking for last save

- **Form State Persistence**
  - Search term restoration on reload
  - Locations field restoration
  - Maintains user input across sessions

- **Enhanced Load Process**
  - Instant results display on sidebar open
  - Proper UI initialization checks
  - Status message for loaded data
  - Button state restoration

#### Changed
- Save operation now debounced instead of immediate
- Added performSave() method for actual storage
- Improved error handling with chrome.runtime.lastError checks
- Better logging for save/load operations

### 🎨 UI/UX Enhancements

#### Added
- **Table Enhancements**
  - Social link counter column
  - Tooltips on hover for full text
  - Smooth row hover effects
  - Better column sizing

- **Button Groups**
  - Start/Pause buttons in unified group
  - Responsive button layout
  - Dynamic display management

- **Progress Indicators**
  - Detailed progress bar component
  - Progress details section
  - Color-coded status (success, error, warning)
  - Location name truncation with ellipsis

- **Visual Feedback**
  - Success animation on downloads
  - Float animation for empty state icon
  - Shimmer effect on progress bar
  - Pulse effect on results counter

#### Changed
- Results table now has 6 columns instead of 5
- Progress info supports "warning" status type
- Enhanced scrollbar styling
- Improved mobile responsiveness

### 🐛 Bug Fixes & Improvements

#### Added
- **Retry Logic**
  - Up to 2 retry attempts per result
  - Configurable retry count
  - Better error recovery
  - Validation of extracted data

- **Error Handling**
  - Try-catch blocks around critical operations
  - Graceful degradation on extraction failures
  - Console logging for debugging
  - User-friendly error messages

#### Fixed
- Race condition on initial data load
- Storage quota handling
- Undefined data field handling
- Selector fallback chain
- Progress bar width calculation

### 📊 CSV Export Enhancements

#### Added
- **Extended Fields**
  - Categories column
  - Email column
  - Individual social media columns (Facebook, Instagram, Twitter, LinkedIn)
  - Hours column
  - Price Level column

- **Better Formatting**
  - UTF-8 BOM for proper encoding
  - Improved timestamp format (ISO-based)
  - CSV escaping for special characters
  - Double-quote handling

#### Changed
- CSV now exports 16 columns instead of 8
- Filename includes ISO timestamp
- Better sanitization of cell content

### 🔧 Technical Improvements

#### Added
- `togglePause()` method
- `updateLiveProgress()` method
- `addSingleResultToTable()` method
- `updateResultsCount()` method
- `scrapeWithRetry()` method
- `performSave()` method
- Pause state management
- Save timeout handling
- Last save time tracking

#### Changed
- Refactored `scrapeCurrentPage()` for incremental updates
- Enhanced `extractDetailPanelData()` with 10+ new fields
- Improved `saveResults()` with debouncing
- Better `loadSavedResults()` with form restoration
- Optimized `downloadCSV()` with more fields

#### Removed
- N/A

### 📝 Documentation

#### Added
- Comprehensive README with all new features
- Use case examples
- Configuration guide
- Troubleshooting section
- Best practices guide
- Legal & ethical use section
- Complete data fields table
- Version history
- This CHANGELOG

#### Changed
- Updated installation instructions
- Enhanced usage guide with pause/resume
- Added advanced tips section
- Expanded troubleshooting guide

---

## [2.0.0] - Original Release

### Added
- Initial release with persistent sidebar
- Multi-location scraping
- Basic data extraction (title, rating, reviews, phone, website, address)
- CSV export functionality
- Chrome storage integration
- Modern UI with Poppins font
- Toggle button for sidebar
- Real-time scraping status

### Features
- 8 data fields per business
- Up to 50 results per location
- Automatic CSV download
- Data persistence across sessions
- Smooth animations
- Responsive design

---

## Key Improvements Summary (v2.0 → v2.1)

| Category | v2.0 | v2.1 |
|----------|------|------|
| Data Fields | 8 | 16 (+100%) |
| Social Media | ❌ | ✅ (4 platforms) |
| Email Detection | ❌ | ✅ |
| Real-time Progress | ❌ | ✅ (with %) |
| Pause/Resume | ❌ | ✅ |
| Incremental Updates | ❌ | ✅ |
| Auto-Save | Basic | Debounced |
| Form Persistence | ❌ | ✅ |
| Retry Logic | ❌ | ✅ (2 attempts) |
| Error Handling | Basic | Enhanced |
| UI Animations | Basic | Advanced |
| CSV Fields | 8 | 16 |
| Phone Detection | 1 method | 4 methods |

---

## Migration Guide (v2.0 → v2.1)

No manual migration needed! Just replace the files and reload the extension.

### What's Preserved
- ✅ Existing scraped data
- ✅ Extension settings
- ✅ Chrome storage data

### What's New
- ✅ Auto-pause/resume capability
- ✅ Form field memory
- ✅ Social media in exports
- ✅ Enhanced CSV with 16 fields
- ✅ Real-time progress bar

### Breaking Changes
- None! Fully backward compatible with v2.0 data.

---

**Note**: All changes maintain backward compatibility with v2.0 stored data.
