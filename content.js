// Content script that runs on Google Maps pages
class GoogleMapsScraper {
  constructor() {
    this.sidebar = null;
    this.toggleButton = null;
    this.allResults = [];
    this.isScraperActive = false;
    this.currentLocation = 0;
    this.totalLocations = 0;
    
    this.init();
  }

  init() {
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createUI());
    } else {
      this.createUI();
    }
    
    // Load saved results from storage
    this.loadSavedResults();
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'getSidebarState') {
        sendResponse({ 
          isOpen: this.sidebar?.classList.contains('open'),
          resultsCount: this.allResults.length 
        });
      }
    });
  }

  createUI() {
    // Create toggle button
    this.toggleButton = document.createElement('button');
    this.toggleButton.id = 'gmaps-scraper-toggle';
    this.toggleButton.innerHTML = '🗺️ Scraper';
    this.toggleButton.addEventListener('click', () => this.toggleSidebar());
    document.body.appendChild(this.toggleButton);

    // Create sidebar
    this.sidebar = document.createElement('div');
    this.sidebar.id = 'gmaps-scraper-sidebar';
    this.sidebar.innerHTML = this.getSidebarHTML();
    document.body.appendChild(this.sidebar);

    // Attach event listeners
    this.attachEventListeners();
  }

  getSidebarHTML() {
    return `
      <div class="scraper-header">
        <h1>🗺️ Google Maps Scraper</h1>
        <div class="subtitle">by Mike Powers</div>
      </div>
      
      <div class="scraper-body">
        <div class="input-group">
          <label for="sidebar-search-term">Search Term:</label>
          <input type="text" id="sidebar-search-term" class="scraper-input" placeholder="e.g., beauty salon" />
          <small>What are you searching for?</small>
        </div>
        
        <div class="input-group">
          <label for="sidebar-locations">Locations (comma-separated):</label>
          <input type="text" id="sidebar-locations" class="scraper-input" placeholder="e.g., Kathmandu, Bhaktapur, Lalitpur" />
          <small>Enter multiple locations separated by commas</small>
        </div>
        
        <button id="sidebar-start-scrape" class="scraper-button">
          Start Scraping
        </button>
        
        <div id="sidebar-progress" class="progress-info">
          Ready to scrape...
        </div>
        
        <div class="results-section">
          <div class="results-header">
            <h3>Results</h3>
            <span class="results-count" id="sidebar-results-count">0</span>
          </div>
          
          <div class="results-table-container">
            <table class="results-table" id="sidebar-results-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Title</th>
                  <th>Rating</th>
                  <th>Reviews</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody id="sidebar-results-body">
                <tr>
                  <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">📍</div>
                    <div class="empty-state-text">No results yet. Start scraping!</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <button id="sidebar-download-csv" class="scraper-button secondary" disabled>
            Download CSV
          </button>
          
          <button id="sidebar-clear-results" class="scraper-button secondary" disabled>
            Clear Results
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const startButton = document.getElementById('sidebar-start-scrape');
    const downloadButton = document.getElementById('sidebar-download-csv');
    const clearButton = document.getElementById('sidebar-clear-results');

    startButton.addEventListener('click', () => this.startScraping());
    downloadButton.addEventListener('click', () => this.downloadCSV());
    clearButton.addEventListener('click', () => this.clearResults());
  }

  toggleSidebar() {
    const isOpen = this.sidebar.classList.toggle('open');
    this.toggleButton.classList.toggle('hidden', isOpen);
  }

  async startScraping() {
    const searchTerm = document.getElementById('sidebar-search-term').value.trim();
    const locationsText = document.getElementById('sidebar-locations').value.trim();

    if (!searchTerm) {
      this.showProgress('Please enter a search term!', 'error');
      return;
    }

    if (!locationsText) {
      this.showProgress('Please enter at least one location!', 'error');
      return;
    }

    const locations = locationsText.split(',').map(loc => loc.trim()).filter(loc => loc);

    if (locations.length === 0) {
      this.showProgress('Please enter valid locations!', 'error');
      return;
    }

    // Start scraping
    this.isScraperActive = true;
    this.totalLocations = locations.length;
    this.currentLocation = 0;

    const startButton = document.getElementById('sidebar-start-scrape');
    startButton.disabled = true;
    startButton.innerHTML = '<span class="spinner"></span> Scraping...';

    // Scrape each location
    for (let i = 0; i < locations.length; i++) {
      if (!this.isScraperActive) break;

      this.currentLocation = i + 1;
      const location = locations[i];
      
      this.showProgress(`Scraping ${i + 1}/${locations.length}: ${searchTerm} in ${location}...`, 'show');

      try {
        // Perform search
        const searchQuery = `${searchTerm} in ${location}`;
        await this.performSearch(searchQuery);
        await this.sleep(3000);

        // Scrape results
        const results = await this.scrapeCurrentPage();
        
        // Add location to each result
        results.forEach(result => {
          result.location = location;
          this.allResults.push(result);
        });

        // Update UI
        this.updateResultsTable();
        this.saveResults();

        console.log(`Scraped ${results.length} results from ${location}`);

      } catch (error) {
        console.error(`Error scraping ${location}:`, error);
        this.showProgress(`Error scraping ${location}: ${error.message}`, 'error');
      }

      // Delay between locations
      if (i < locations.length - 1) {
        await this.sleep(2000);
      }
    }

    // Complete
    this.isScraperActive = false;
    startButton.disabled = false;
    startButton.innerHTML = 'Start Scraping';
    
    this.showProgress(`✓ Complete! Scraped ${this.allResults.length} total results from ${locations.length} location(s)`, 'success');

    // Enable download button
    document.getElementById('sidebar-download-csv').disabled = false;
    document.getElementById('sidebar-clear-results').disabled = false;

    // Auto-download CSV
    this.downloadCSV();
  }

  async performSearch(searchQuery) {
    return new Promise((resolve) => {
      const searchInput = document.querySelector('input.UGojuc');
      if (searchInput) {
        searchInput.value = searchQuery;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        const searchButton = document.querySelector('button.mL3xi');
        if (searchButton) {
          searchButton.click();
        } else {
          const form = document.querySelector('form.NhWQq');
          if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        }
      }
      resolve();
    });
  }

  async scrapeCurrentPage() {
    console.log('=== SCRAPING STARTED ===');
    const results = [];
    
    const resultsPane = document.querySelector('[role="feed"]');
    
    if (!resultsPane) {
      console.error('Results pane not found');
      return [];
    }

    console.log('Scrolling to load all results...');
    await this.scrollToLoadAll(resultsPane);
    
    const links = Array.from(document.querySelectorAll('a.hfpxzc'));
    console.log(`Found ${links.length} results`);
    
    if (links.length === 0) {
      console.error('No result links found');
      return [];
    }
    
    const maxResults = Math.min(links.length, 50);
    
    for (let i = 0; i < maxResults; i++) {
      try {
        console.log(`Scraping ${i + 1}/${maxResults}...`);
        
        links[i].click();
        await this.sleep(2500);
        
        const data = this.extractDetailPanelData();
        data.href = links[i].href;
        
        console.log('Extracted:', data.title, '- Reviews:', data.reviewCount);
        results.push(data);
        
        await this.sleep(300);
        
      } catch (error) {
        console.error(`Error at ${i + 1}:`, error);
        results.push({
          title: 'Error',
          rating: '',
          reviewCount: '',
          phone: '',
          website: '',
          address: '',
          href: links[i]?.href || ''
        });
      }
    }
    
    console.log(`=== COMPLETE: ${results.length} results ===`);
    return results;
  }

  async scrollToLoadAll(resultsPane) {
    let previousHeight = resultsPane.scrollHeight;
    let attempts = 0;
    const maxScrolls = 30;

    for (let i = 0; i < maxScrolls; i++) {
      resultsPane.scrollTo(0, resultsPane.scrollHeight);
      await this.sleep(1500);

      const newHeight = resultsPane.scrollHeight;
      
      if (newHeight === previousHeight) {
        attempts++;
        if (attempts >= 3) break;
      } else {
        attempts = 0;
      }
      previousHeight = newHeight;

      const endMessage = document.querySelector('[role="heading"][aria-level="3"]');
      if (endMessage?.textContent.includes("You've reached the end")) {
        console.log('Reached end');
        break;
      }
    }
  }

  extractDetailPanelData() {
    const data = {
      title: '',
      rating: '',
      reviewCount: '',
      phone: '',
      website: '',
      address: ''
    };

    try {
      const titleEl = document.querySelector('.DUwDvf');
      data.title = titleEl?.textContent?.trim() || '';

      const ratingDisplayEl = document.querySelector('.fontDisplayLarge');
      data.rating = ratingDisplayEl?.textContent?.trim() || '';
      
      if (!data.rating) {
        const ratingEl = document.querySelector('.F7nice span[aria-hidden="true"]');
        data.rating = ratingEl?.textContent?.trim() || '';
      }
      
      const reviewButtonEl = document.querySelector('button.GQjSyb .HHrUdb span');
      if (reviewButtonEl) {
        const reviewText = reviewButtonEl.textContent?.trim() || '';
        const match = reviewText.match(/(\d+)\s+review/i);
        data.reviewCount = match ? match[1] : '';
      }
      
      if (!data.reviewCount) {
        const reviewEl = document.querySelector('.F7nice span[role="img"]');
        if (reviewEl) {
          const ariaLabel = reviewEl.getAttribute('aria-label');
          const match = ariaLabel?.match(/(\d+)\s+review/i);
          data.reviewCount = match ? match[1] : '';
        }
      }

      const phoneBtn = document.querySelector('[data-item-id*="phone"]');
      if (phoneBtn) {
        const ariaLabel = phoneBtn.getAttribute('aria-label');
        data.phone = ariaLabel?.replace(/^Phone:\s*/i, '').trim() || '';
        
        if (!data.phone) {
          const phoneText = phoneBtn.querySelector('.Io6YTe');
          data.phone = phoneText?.textContent?.trim() || '';
        }
      }

      const websiteLink = document.querySelector('a[data-item-id*="authority"]');
      if (websiteLink) {
        data.website = websiteLink.textContent?.trim() || websiteLink.href || '';
      }

      const addressBtn = document.querySelector('[data-item-id="address"]');
      if (addressBtn) {
        const addressText = addressBtn.querySelector('.Io6YTe');
        data.address = addressText?.textContent?.trim() || '';
      }

    } catch (error) {
      console.error('Extraction error:', error);
    }

    return data;
  }

  updateResultsTable() {
    const tbody = document.getElementById('sidebar-results-body');
    const resultsCount = document.getElementById('sidebar-results-count');
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (this.allResults.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-state">
            <div class="empty-state-icon">📍</div>
            <div class="empty-state-text">No results yet. Start scraping!</div>
          </td>
        </tr>
      `;
      resultsCount.textContent = '0';
      return;
    }
    
    // Add rows
    this.allResults.forEach((result, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${result.location || ''}</td>
        <td><a href="${result.href}" target="_blank">${result.title || ''}</a></td>
        <td>${result.rating || ''}</td>
        <td>${result.reviewCount || ''}</td>
        <td>${result.phone || ''}</td>
      `;
      tbody.appendChild(row);
    });
    
    resultsCount.textContent = this.allResults.length;
  }

  downloadCSV() {
    if (this.allResults.length === 0) {
      this.showProgress('No results to download!', 'error');
      return;
    }

    const searchTerm = document.getElementById('sidebar-search-term').value.trim() || 'data';
    
    // Create CSV
    const headers = ['Location', 'Title', 'Rating', 'Reviews', 'Phone', 'Website', 'Address', 'Google Maps Link'];
    const rows = [headers];
    
    this.allResults.forEach(result => {
      rows.push([
        result.location || '',
        result.title || '',
        result.rating || '',
        result.reviewCount || '',
        result.phone || '',
        result.website || '',
        result.address || '',
        result.href || ''
      ]);
    });
    
    const csvContent = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // Download
    const now = new Date();
    const timestamp = now.getFullYear() + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0') + '_' +
                    String(now.getHours()).padStart(2, '0') + 
                    String(now.getMinutes()).padStart(2, '0');
    const filename = `google-maps-${searchTerm.replace(/\s+/g, '-')}_${timestamp}.csv`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    this.showProgress(`✓ CSV downloaded: ${filename}`, 'success');
  }

  clearResults() {
    if (confirm('Are you sure you want to clear all results?')) {
      this.allResults = [];
      this.updateResultsTable();
      this.saveResults();
      
      document.getElementById('sidebar-download-csv').disabled = true;
      document.getElementById('sidebar-clear-results').disabled = true;
      
      this.showProgress('Results cleared', 'show');
    }
  }

  showProgress(message, type = 'show') {
    const progressDiv = document.getElementById('sidebar-progress');
    progressDiv.textContent = message;
    progressDiv.className = `progress-info ${type}`;
  }

  saveResults() {
    chrome.storage.local.set({ 
      scraperResults: this.allResults,
      lastUpdate: new Date().toISOString()
    });
  }

  async loadSavedResults() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['scraperResults'], (data) => {
        if (data.scraperResults && Array.isArray(data.scraperResults)) {
          this.allResults = data.scraperResults;
          
          // Wait for UI to be ready
          const checkUI = setInterval(() => {
            if (document.getElementById('sidebar-results-body')) {
              this.updateResultsTable();
              
              if (this.allResults.length > 0) {
                document.getElementById('sidebar-download-csv').disabled = false;
                document.getElementById('sidebar-clear-results').disabled = false;
              }
              
              clearInterval(checkUI);
              resolve();
            }
          }, 100);
        } else {
          resolve();
        }
      });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize the scraper
const scraper = new GoogleMapsScraper();
