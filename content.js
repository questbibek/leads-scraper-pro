// Enhanced Content script that runs on Google Maps pages
class GoogleMapsScraper {
  constructor() {
    this.sidebar = null;
    this.toggleButton = null;
    this.allResults = [];
    this.isScraperActive = false;
    this.isPaused = false;
    this.currentLocation = 0;
    this.totalLocations = 0;
    this.currentLocationName = '';
    this.saveTimeout = null;
    this.lastSaveTime = 0;
    
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
      } else if (request.action === 'toggleSidebar') {
        this.toggleSidebar();
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
        <div class="subtitle">Enhanced by questbibek</div>
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

        <div class="input-group">
          <label for="sidebar-max-results">Max Results per Location:</label>
          <input type="number" id="sidebar-max-results" class="scraper-input" placeholder="Leave empty for no limit" min="1" />
          <small>Empty = scrape all available results</small>
        </div>
        
        <div class="button-group">
          <button id="sidebar-start-scrape" class="scraper-button">
            Start Scraping
          </button>
          <button id="sidebar-pause-scrape" class="scraper-button secondary" style="display:none;">
            ⏸️ Pause
          </button>
        </div>
        
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
                  <th>Social</th>
                </tr>
              </thead>
              <tbody id="sidebar-results-body">
                <tr>
                  <td colspan="6" class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-text">No results yet. Start scraping!</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <button id="sidebar-download-csv" class="scraper-button secondary" disabled>
            📥 Download CSV
          </button>
          
          <button id="sidebar-clear-results" class="scraper-button secondary" disabled>
            🗑️ Clear Results
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    const startButton = document.getElementById('sidebar-start-scrape');
    const pauseButton = document.getElementById('sidebar-pause-scrape');
    const downloadButton = document.getElementById('sidebar-download-csv');
    const clearButton = document.getElementById('sidebar-clear-results');

    startButton.addEventListener('click', () => this.startScraping());
    pauseButton.addEventListener('click', () => this.togglePause());
    downloadButton.addEventListener('click', () => this.downloadCSV());
    clearButton.addEventListener('click', () => this.clearResults());
  }

  toggleSidebar() {
    const isOpen = this.sidebar.classList.toggle('open');
    this.toggleButton.classList.toggle('hidden', isOpen);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseButton = document.getElementById('sidebar-pause-scrape');
    
    if (this.isPaused) {
      pauseButton.innerHTML = '▶️ Resume';
      this.showProgress('⏸️ Paused - Click Resume to continue', 'warning');
    } else {
      pauseButton.innerHTML = '⏸️ Pause';
      this.showProgress('▶️ Resuming...', 'show');
    }
  }

  async startScraping() {
    const searchTerm = document.getElementById('sidebar-search-term').value.trim();
    const locationsText = document.getElementById('sidebar-locations').value.trim();

    if (!searchTerm) {
      this.showProgress('❌ Please enter a search term!', 'error');
      return;
    }

    if (!locationsText) {
      this.showProgress('❌ Please enter at least one location!', 'error');
      return;
    }

    const locations = locationsText.split(',').map(loc => loc.trim()).filter(loc => loc);

    if (locations.length === 0) {
      this.showProgress('❌ Please enter valid locations!', 'error');
      return;
    }

    // Start scraping
    this.isScraperActive = true;
    this.isPaused = false;
    this.totalLocations = locations.length;
    this.currentLocation = 0;

    const startButton = document.getElementById('sidebar-start-scrape');
    const pauseButton = document.getElementById('sidebar-pause-scrape');
    
    startButton.style.display = 'none';
    pauseButton.style.display = 'block';

    // Scrape each location
    for (let i = 0; i < locations.length; i++) {
      // Check for pause
      while (this.isPaused && this.isScraperActive) {
        await this.sleep(500);
      }
      
      if (!this.isScraperActive) break;

      this.currentLocation = i + 1;
      const location = locations[i];
      this.currentLocationName = location;
      
      this.showProgress(`🔄 Scraping ${i + 1}/${locations.length}: ${searchTerm} in ${location}...`, 'show');

      try {
        // Perform search
        const searchQuery = `${searchTerm} in ${location}`;
        await this.performSearch(searchQuery);
        
        // Wait longer for search results to load
        this.showProgress(`⏳ Waiting for results to load for ${location}...`, 'show');
        await this.sleep(5000); // Increased from 3000 to 5000
        
        // Wait for the results pane to be ready
        await this.waitForResultsPane();
        
        this.showProgress(`📊 Results loaded. Starting to scrape ${location}...`, 'show');
        await this.sleep(2000); // Extra buffer time

        // Scrape results with real-time updates
        const results = await this.scrapeCurrentPage();
        
        console.log(`✅ Scraped ${results.length} results from ${location}`);

      } catch (error) {
        console.error(`❌ Error scraping ${location}:`, error);
        this.showProgress(`❌ Error scraping ${location}: ${error.message}`, 'error');
      }

      // Delay between locations - increased for better stability
      if (i < locations.length - 1) {
        this.showProgress(`⏳ Preparing next location...`, 'show');
        await this.sleep(3000); // Increased from 2000 to 3000
      }
    }

    // Complete
    this.isScraperActive = false;
    this.isPaused = false;
    startButton.style.display = 'block';
    pauseButton.style.display = 'none';
    
    this.showProgress(`✅ Complete! Scraped ${this.allResults.length} total results from ${locations.length} location(s)`, 'success');

    // Enable download button
    document.getElementById('sidebar-download-csv').disabled = false;
    document.getElementById('sidebar-clear-results').disabled = false;

    // Auto-download CSV
    setTimeout(() => this.downloadCSV(), 1000);
  }

  async performSearch(searchQuery) {
    return new Promise(async (resolve) => {
      const searchInput = document.querySelector('input.UGojuc');
      if (searchInput) {
        // Focus and clear the input first
        searchInput.focus();
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Set the search query
        searchInput.value = searchQuery;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Small delay to let suggestions appear (we'll dismiss them)
        await this.sleep(300);
        
        // Dismiss the suggestions dropdown by pressing Escape first
        // This prevents accidentally clicking on a suggestion element
        const suggestionsGrid = document.querySelector('[role="grid"][aria-label="Suggestions"], .DAdBuc');
        if (suggestionsGrid) {
          console.log('⚠️ Suggestions dropdown detected - dismissing before search');
        }
        
        // Use Enter key to submit the search - this is more reliable than
        // clicking the search button and avoids interacting with suggestions
        searchInput.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        }));
        
        // Fallback: also try clicking the search button
        await this.sleep(200);
        const searchButton = document.querySelector('button.mL3xi');
        if (searchButton) {
          searchButton.click();
        }
      }
      resolve();
    });
  }

  async waitForResultsPane(maxAttempts = 20) {
    // Wait for results pane to appear and be populated
    for (let i = 0; i < maxAttempts; i++) {
      // Dismiss suggestions dropdown if it's still visible
      const suggestionsGrid = document.querySelector('[role="grid"][aria-label="Suggestions"], .DAdBuc');
      if (suggestionsGrid) {
        console.log('⚠️ Suggestions still visible during wait - dismissing');
        const searchInput = document.querySelector('input.UGojuc');
        if (searchInput) {
          searchInput.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Escape', code: 'Escape', keyCode: 27, which: 27,
            bubbles: true, cancelable: true
          }));
        }
      }
      
      const resultsPane = document.querySelector('[role="feed"]');
      const results = document.querySelectorAll('a.hfpxzc');
      
      if (resultsPane && results.length > 0) {
        console.log(`✅ Results pane ready with ${results.length} results`);
        return true;
      }
      
      console.log(`⏳ Waiting for results pane... attempt ${i + 1}/${maxAttempts}`);
      await this.sleep(500);
    }
    
    console.warn('⚠️ Results pane wait timed out');
    return false;
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
    
    const maxResultsInput = document.getElementById('sidebar-max-results')?.value?.trim();
    const maxResults = maxResultsInput ? Math.min(links.length, parseInt(maxResultsInput, 10)) : links.length;
    
    for (let i = 0; i < maxResults; i++) {
      // Check for pause
      while (this.isPaused && this.isScraperActive) {
        await this.sleep(500);
      }
      
      if (!this.isScraperActive) break;
      
      try {
        console.log(`Scraping ${i + 1}/${maxResults}...`);
        
        // Get expected business name from aria-label
        const expectedName = (links[i].getAttribute('aria-label') || '')
          .replace(/\s*·\s*Visited link\s*$/, '').replace(/\s*·\s*$/, '').trim();
        
        const data = await this.scrapeWithRetry(links[i], expectedName);
        data.href = links[i].href;
        data.location = this.currentLocationName;
        
        console.log('✅ Extracted:', data.title, '- Reviews:', data.reviewCount, '- Phone:', data.phone);
        results.push(data);
        this.allResults.push(data);
        
        // Update UI immediately after each result
        this.addSingleResultToTable(data);
        this.updateResultsCount();
        this.saveResults();
        
        // Update live progress
        this.updateLiveProgress(i + 1, maxResults, data.title, 'scraping');
        
        await this.sleep(300);
        
      } catch (error) {
        console.error(`❌ Error at ${i + 1}:`, error);
        const expectedName = (links[i]?.getAttribute('aria-label') || 'Error')
          .replace(/\s*·\s*Visited link\s*$/, '').replace(/\s*·\s*$/, '').trim();
        const errorData = {
          location: this.currentLocationName,
          title: expectedName,
          rating: '',
          reviewCount: '',
          phone: '',
          website: '',
          address: '',
          href: links[i]?.href || '',
          socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' },
          email: '',
          categories: '',
          hours: '',
          priceLevel: ''
        };
        results.push(errorData);
        this.allResults.push(errorData);
        this.addSingleResultToTable(errorData);
      }
    }
    
    console.log(`=== COMPLETE: ${results.length} results ===`);
    return results;
  }

  async scrapeWithRetry(linkElement, expectedName, maxRetries = 5) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Dismiss suggestions overlay if visible
        const suggestionsGrid = document.querySelector('[role="grid"][aria-label="Suggestions"], .DAdBuc');
        if (suggestionsGrid) {
          console.log('⚠️ Dismissing suggestions overlay');
          document.activeElement?.blur();
          const searchInput = document.querySelector('input.UGojuc');
          if (searchInput) {
            searchInput.dispatchEvent(new KeyboardEvent('keydown', {
              key: 'Escape', code: 'Escape', keyCode: 27, which: 27,
              bubbles: true, cancelable: true
            }));
          }
          await this.sleep(300);
        }

        // IMPORTANT: Scroll the link into view before clicking
        // Items far down the list may not respond to click if not visible
        linkElement.scrollIntoView({ behavior: 'instant', block: 'center' });
        await this.sleep(300);

        console.log(`🖱️ Click attempt ${attempt + 1}/${maxRetries}: "${expectedName}"`);
        linkElement.click();
        
        // Wait for detail panel to show the CORRECT business
        const verified = await this.waitForCorrectPanel(expectedName, attempt);
        
        if (verified) {
          const data = this.extractDetailPanelData();
          if (data.title && data.title !== 'Error') {
            return data;
          }
        }
        
        // Panel didn't match — wait longer before retrying
        if (attempt < maxRetries - 1) {
          const retryWait = 2000 + (attempt * 1000);
          console.log(`⚠️ Retry ${attempt + 1}: panel not verified, waiting ${retryWait}ms before re-click`);
          await this.sleep(retryWait);
        }
      } catch (error) {
        console.error(`❌ Attempt ${attempt + 1} failed:`, error);
        if (attempt === maxRetries - 1) throw error;
        await this.sleep(2000);
      }
    }
    
    // All retries failed — return empty data with correct title
    // Do NOT extract from panel as it contains the WRONG business's data
    console.warn(`⚠️ Could not verify panel for "${expectedName}" after ${maxRetries} attempts. Returning empty data.`);
    return {
      title: expectedName,
      rating: '',
      reviewCount: '',
      phone: '',
      website: '',
      address: '',
      socialLinks: { facebook: '', instagram: '', twitter: '', linkedin: '' },
      email: '',
      categories: '',
      hours: '',
      priceLevel: ''
    };
  }

  async waitForCorrectPanel(expectedName, attempt = 0, maxWait = 10000) {
    const startTime = Date.now();
    // First attempt waits at least 2s, subsequent attempts wait longer
    const minWait = 2000 + (attempt * 500);
    
    while (Date.now() - startTime < maxWait) {
      await this.sleep(400);
      
      const titleEl = document.querySelector('.DUwDvf');
      const currentTitle = titleEl?.textContent?.trim() || '';
      
      // Check if panel title matches the business we clicked
      if (currentTitle && currentTitle === expectedName && (Date.now() - startTime) >= minWait) {
        // Title matches! Now wait a bit more for secondary content to load
        await this.sleep(500);
        console.log(`✅ Panel verified: "${currentTitle}" in ${Date.now() - startTime}ms`);
        return true;
      }
      
      // If title changed to something else (not what we expect, not empty),
      // and enough time has passed, it might be a different business with similar timing
      if (currentTitle && currentTitle !== expectedName && (Date.now() - startTime) >= minWait + 2000) {
        console.warn(`⚠️ Panel shows "${currentTitle}" but expected "${expectedName}" after ${Date.now() - startTime}ms`);
        return false;
      }
    }
    
    const finalTitle = document.querySelector('.DUwDvf')?.textContent?.trim() || '';
    console.warn(`⚠️ Timed out waiting for "${expectedName}". Panel shows: "${finalTitle}"`);
    return false;
  }

  async scrollToLoadAll(resultsPane) {
    let previousHeight = resultsPane.scrollHeight;
    let attempts = 0;
    const maxScrolls = 30;

    console.log('🔄 Starting scroll to load all results...');

    for (let i = 0; i < maxScrolls; i++) {
      resultsPane.scrollTo(0, resultsPane.scrollHeight);
      console.log(`Scroll ${i + 1}/${maxScrolls} - Height: ${resultsPane.scrollHeight}px`);
      
      // Increased wait time from 1500ms to 2500ms
      await this.sleep(2500);

      const newHeight = resultsPane.scrollHeight;
      
      if (newHeight === previousHeight) {
        attempts++;
        console.log(`No height change - attempt ${attempts}/3`);
        if (attempts >= 3) {
          console.log('✅ No more content to load');
          break;
        }
      } else {
        attempts = 0;
        console.log(`✅ New content loaded - height increased by ${newHeight - previousHeight}px`);
      }
      previousHeight = newHeight;

      const endMessage = document.querySelector('[role="heading"][aria-level="3"]');
      if (endMessage?.textContent.includes("You've reached the end")) {
        console.log('✅ Reached end of results');
        break;
      }
    }
    
    // Final wait to ensure last batch is fully rendered
    console.log('⏳ Final wait for content to settle...');
    await this.sleep(2000);
    
    const finalCount = document.querySelectorAll('a.hfpxzc').length;
    console.log(`✅ Scroll complete - ${finalCount} results ready`);
  }

  extractDetailPanelData() {
    const data = {
      title: '',
      rating: '',
      reviewCount: '',
      phone: '',
      website: '',
      address: '',
      socialLinks: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      },
      email: '',
      categories: '',
      hours: '',
      priceLevel: ''
    };

    try {
      // Extract title
      const titleEl = document.querySelector('.DUwDvf');
      data.title = titleEl?.textContent?.trim() || '';

      // Extract rating
      const ratingDisplayEl = document.querySelector('.fontDisplayLarge');
      data.rating = ratingDisplayEl?.textContent?.trim() || '';
      
      if (!data.rating) {
        const ratingEl = document.querySelector('.F7nice span[aria-hidden="true"]');
        data.rating = ratingEl?.textContent?.trim() || '';
      }
      
      // Extract review count
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

      // Extract phone number - multiple fallback methods
      const phoneSelectors = [
        '[data-item-id*="phone"]',
        'button[data-tooltip*="Call"]',
        '[aria-label*="Phone"]',
        'a[href^="tel:"]'
      ];

      for (const selector of phoneSelectors) {
        const phoneEl = document.querySelector(selector);
        if (phoneEl) {
          // Try aria-label first
          const ariaLabel = phoneEl.getAttribute('aria-label');
          if (ariaLabel) {
            data.phone = ariaLabel.replace(/^(Phone:|Call:)\s*/i, '').trim();
          }
          // Try href attribute for tel: links
          if (!data.phone && phoneEl.href?.startsWith('tel:')) {
            data.phone = phoneEl.href.replace('tel:', '');
          }
          // Try text content
          if (!data.phone) {
            const phoneText = phoneEl.querySelector('.Io6YTe');
            data.phone = phoneText?.textContent?.trim() || '';
          }
          if (data.phone) break;
        }
      }

      // Extract website
      const websiteLink = document.querySelector('a[data-item-id*="authority"]');
      if (websiteLink) {
        let url = websiteLink.href || websiteLink.textContent?.trim() || '';
        
        // Extract base domain from URL
        if (url) {
          try {
            const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
            data.website = urlObj.hostname.replace(/^www\./, '');
          } catch (e) {
            // If URL parsing fails, use the original text
            data.website = url.replace(/^www\./, '');
          }
        }
      }
      // Extract social media links
      const allLinks = document.querySelectorAll('a[href]');
      allLinks.forEach(link => {
        const href = link.href.toLowerCase();
        if (href.includes('facebook.com') && !data.socialLinks.facebook) {
          data.socialLinks.facebook = link.href;
        } else if (href.includes('instagram.com') && !data.socialLinks.instagram) {
          data.socialLinks.instagram = link.href;
        } else if ((href.includes('twitter.com') || href.includes('x.com')) && !data.socialLinks.twitter) {
          data.socialLinks.twitter = link.href;
        } else if (href.includes('linkedin.com') && !data.socialLinks.linkedin) {
          data.socialLinks.linkedin = link.href;
        }
      });

      // Extract email from text content
      const textContent = document.body.innerText;
      const emailMatch = textContent.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
      if (emailMatch) {
        data.email = emailMatch[0];
      }

      // Extract business categories
      const categoryButton = document.querySelector('button[jsaction*="category"]');
      data.categories = categoryButton?.textContent?.trim() || '';

      // Extract price level ($ symbols)
      const priceElement = document.querySelector('[aria-label*="Price:"]');
      if (priceElement) {
        const priceMatch = priceElement.getAttribute('aria-label')?.match(/\$/g);
        data.priceLevel = priceMatch ? '$'.repeat(priceMatch.length) : '';
      }

      // Extract business hours
      const hoursButton = document.querySelector('[data-item-id*="oh"]');
      if (hoursButton) {
        const hoursText = hoursButton.querySelector('.Io6YTe');
        data.hours = hoursText?.textContent?.trim() || '';
      }

    } catch (error) {
      console.error('Extraction error:', error);
    }

    return data;
  }

  addSingleResultToTable(result) {
    const tbody = document.getElementById('sidebar-results-body');
    
    // Remove empty state if it exists
    const emptyState = tbody.querySelector('.empty-state');
    if (emptyState) {
      tbody.innerHTML = '';
    }
    
    // Count social links
    const socialCount = Object.values(result.socialLinks || {}).filter(link => link).length;
    const socialIndicator = socialCount > 0 ? `${socialCount} 🔗` : '';
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${result.location || ''}</td>
      <td><a href="${result.href}" target="_blank" title="${result.title}">${result.title || ''}</a></td>
      <td>${result.rating || ''}</td>
      <td>${result.reviewCount || ''}</td>
      <td>${result.phone || ''}</td>
      <td>${socialIndicator}</td>
    `;
    
    // Add with fade-in animation
    row.style.opacity = '0';
    tbody.appendChild(row);
    setTimeout(() => { row.style.opacity = '1'; }, 10);
    
    // Auto-scroll to bottom of table
    const tableContainer = document.querySelector('.results-table-container');
    if (tableContainer) {
      tableContainer.scrollTop = tableContainer.scrollHeight;
    }
  }

  updateResultsCount() {
    const resultsCount = document.getElementById('sidebar-results-count');
    resultsCount.textContent = this.allResults.length;
  }

  updateLiveProgress(current, total, currentName, status = 'scraping') {
    const progressDiv = document.getElementById('sidebar-progress');
    const percentage = Math.round((current / total) * 100);
    
    progressDiv.innerHTML = `
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${percentage}%"></div>
      </div>
      <div class="progress-details">
        <span class="progress-text">${status === 'scraping' ? '🔄' : '✓'} ${current}/${total} (${percentage}%)</span>
        <span class="progress-location" title="${currentName}">${currentName}</span>
      </div>
    `;
    progressDiv.className = `progress-info show ${status}`;
  }

  updateResultsTable() {
    const tbody = document.getElementById('sidebar-results-body');
    const resultsCount = document.getElementById('sidebar-results-count');
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    if (this.allResults.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-text">No results yet. Start scraping!</div>
          </td>
        </tr>
      `;
      resultsCount.textContent = '0';
      return;
    }
    
    // Add rows
    this.allResults.forEach((result) => {
      const socialCount = Object.values(result.socialLinks || {}).filter(link => link).length;
      const socialIndicator = socialCount > 0 ? `${socialCount} 🔗` : '';
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${result.location || ''}</td>
        <td><a href="${result.href}" target="_blank" title="${result.title}">${result.title || ''}</a></td>
        <td>${result.rating || ''}</td>
        <td>${result.reviewCount || ''}</td>
        <td>${result.phone || ''}</td>
        <td>${socialIndicator}</td>
      `;
      tbody.appendChild(row);
    });
    
    resultsCount.textContent = this.allResults.length;
  }

  downloadCSV() {
    if (this.allResults.length === 0) {
      this.showProgress('❌ No results to download!', 'error');
      return;
    }

    const searchTerm = document.getElementById('sidebar-search-term').value.trim() || 'data';
    
    // Enhanced headers with all new fields
    const headers = [
      'Location', 'Title', 'Rating', 'Reviews', 'Categories', 
      'Phone', 'Email', 'Website', 'Address', 
      'Facebook', 'Instagram', 'Twitter', 'LinkedIn',
      'Hours', 'Price Level', 'Google Maps Link'
    ];
    const rows = [headers];
    
    this.allResults.forEach(result => {
      rows.push([
        result.location || '',
        result.title || '',
        result.rating || '',
        result.reviewCount || '',
        result.categories || '',
        result.phone || '',
        result.email || '',
        result.website || '',
        result.address || '',
        result.socialLinks?.facebook || '',
        result.socialLinks?.instagram || '',
        result.socialLinks?.twitter || '',
        result.socialLinks?.linkedin || '',
        result.hours || '',
        result.priceLevel || '',
        result.href || ''
      ]);
    });
    
    const csvContent = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // Download with BOM for proper UTF-8 encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace(/[-:T]/g, '').replace(/\s/g, '_');
    const filename = `google-maps-${searchTerm.replace(/\s+/g, '-')}_${timestamp}.csv`;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    this.showProgress(`✅ CSV downloaded: ${filename}`, 'success');
  }

  clearResults() {
    if (confirm('Are you sure you want to clear all results? This cannot be undone.')) {
      this.allResults = [];
      this.updateResultsTable();
      this.saveResults();
      
      document.getElementById('sidebar-download-csv').disabled = true;
      document.getElementById('sidebar-clear-results').disabled = true;
      
      this.showProgress('🗑️ Results cleared', 'show');
    }
  }

  showProgress(message, type = 'show') {
    const progressDiv = document.getElementById('sidebar-progress');
    progressDiv.innerHTML = message;
    progressDiv.className = `progress-info ${type}`;
  }

  // Debounced save
  saveResults() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.performSave();
    }, 500);
  }

  performSave() {
    const now = Date.now();
    this.lastSaveTime = now;
    
    chrome.storage.local.set({ 
      scraperResults: this.allResults,
      lastUpdate: new Date().toISOString(),
      searchTerm: document.getElementById('sidebar-search-term')?.value || '',
      locations: document.getElementById('sidebar-locations')?.value || '',
      maxResults: document.getElementById('sidebar-max-results')?.value || ''
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('❌ Save failed:', chrome.runtime.lastError);
      } else {
        console.log('✅ Data saved:', this.allResults.length, 'results');
      }
    });
  }

  async loadSavedResults() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['scraperResults', 'searchTerm', 'locations', 'maxResults'], (data) => {
        if (data.scraperResults && Array.isArray(data.scraperResults)) {
          this.allResults = data.scraperResults;
          
          // Wait for UI to be ready
          const checkUI = setInterval(() => {
            const searchInput = document.getElementById('sidebar-search-term');
            const locationsInput = document.getElementById('sidebar-locations');
            const resultsBody = document.getElementById('sidebar-results-body');
            
            if (searchInput && locationsInput && resultsBody) {
              // Restore form values
              if (data.searchTerm) searchInput.value = data.searchTerm;
              if (data.locations) locationsInput.value = data.locations;
              const maxResultsInput = document.getElementById('sidebar-max-results');
              if (data.maxResults && maxResultsInput) maxResultsInput.value = data.maxResults;
              
              this.updateResultsTable();
              
              if (this.allResults.length > 0) {
                document.getElementById('sidebar-download-csv').disabled = false;
                document.getElementById('sidebar-clear-results').disabled = false;
                this.showProgress(`✅ Loaded ${this.allResults.length} saved results`, 'success');
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