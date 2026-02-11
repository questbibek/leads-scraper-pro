document.addEventListener('DOMContentLoaded', async function () {
    const contentDiv = document.getElementById('content');
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on Google Maps
    if (tab && tab.url.includes("://www.google.com/maps")) {
        // Get sidebar state from content script
        chrome.tabs.sendMessage(tab.id, { action: 'getSidebarState' }, (response) => {
            if (chrome.runtime.lastError) {
                // Content script not loaded yet
                showLoading();
                return;
            }
            
            const resultsCount = response?.resultsCount || 0;
            const isOpen = response?.isOpen || false;
            
            contentDiv.innerHTML = `
                <div class="status-card">
                    <h3>Ready to Scrape</h3>
                    <p class="status-message">
                        The scraper sidebar is ${isOpen ? 'open' : 'ready'} on this Google Maps page.
                    </p>
                    
                    ${resultsCount > 0 ? `
                        <div class="stats">
                            <div class="stat">
                                <div class="stat-value">${resultsCount}</div>
                                <div class="stat-label">Results</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <button id="openSidebar" class="button">
                    ${isOpen ? 'Sidebar Open' : 'Open Scraper Sidebar'}
                </button>
                
                <button id="goToMaps" class="button secondary">
                    New Google Maps Tab
                </button>
            `;
            
            // Attach event listeners
            document.getElementById('openSidebar').addEventListener('click', () => {
                chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
                window.close();
            });
            
            document.getElementById('goToMaps').addEventListener('click', () => {
                chrome.tabs.create({ url: 'https://www.google.com/maps' });
                window.close();
            });
        });
    } else {
        // Not on Google Maps
        contentDiv.innerHTML = `
            <div class="status-card not-maps">
                <div class="not-maps-icon"🗺️</div>
                <p class="status-message">
                    Please navigate to Google Maps to use this extension.
                </p>
            </div>
            
            <button id="goToMaps" class="button">
                Open Google Maps
            </button>
        `;
        
        document.getElementById('goToMaps').addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://www.google.com/maps' });
            window.close();
        });
    }
});

function showLoading() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = `
        <div class="status-card">
            <h3>Loading...</h3>
            <p class="status-message">Initializing scraper...</p>
        </div>
    `;
}
