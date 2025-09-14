// Session storage utilities for RichSlow application

/**
 * Save analysis parameters to sessionStorage
 * @param {string} ticker - Stock ticker symbol
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} period - Analysis period (year/quarter)
 */
function saveParams(ticker, startDate, endDate, period) {
    const params = {
        ticker: ticker.toUpperCase(),
        startDate: startDate,
        endDate: endDate,
        period: period
    };
    sessionStorage.setItem("analysisParams", JSON.stringify(params));
    console.log("Saved analysis parameters:", params);
}

/**
 * Save analysis parameters with financial data for valuation
 * @param {string} ticker - Stock ticker symbol
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} period - Analysis period (year/quarter)
 * @param {object} financialData - Financial statements data
 */
function saveParamsWithData(ticker, startDate, endDate, period, financialData) {
    const params = {
        ticker: ticker.toUpperCase(),
        startDate: startDate,
        endDate: endDate,
        period: period,
        dataLoaded: true,
        loadedAt: new Date().toISOString(),
        financialData: {
            ratios: financialData.ratios || [],
            years: financialData.years || []
        }
    };
    sessionStorage.setItem("analysisParams", JSON.stringify(params));
    console.log("Saved analysis parameters with financial data:", params);
}

/**
 * Retrieve analysis parameters from sessionStorage
 * @returns {object|null} Analysis parameters or null if not found
 */
function getParams() {
    const data = sessionStorage.getItem("analysisParams");
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error parsing stored parameters:", e);
            return null;
        }
    }
    return null;
}

/**
 * Clear stored analysis parameters
 */
function clearParams() {
    sessionStorage.removeItem("analysisParams");
    console.log("Cleared analysis parameters");
}

/**
 * Validate that required parameters exist
 * @returns {boolean} True if valid parameters exist
 */
function hasValidParams() {
    const params = getParams();
    return params && params.ticker && params.startDate && params.endDate && params.period;
}

/**
 * Validate that required parameters and financial data exist for valuation
 * @returns {boolean} True if valid parameters and financial data exist
 */
function hasValidParamsWithData() {
    const params = getParams();
    return params && params.ticker && params.startDate && params.endDate && params.period && params.dataLoaded;
}

/**
 * Show loading state for buttons
 * @param {HTMLElement} button - Button element
 * @param {string} loadingText - Text to show while loading
 */
function showLoading(button, loadingText = "Loading...") {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        ${loadingText}
    `;
}

/**
 * Hide loading state for buttons
 * @param {HTMLElement} button - Button element
 */
function hideLoading(button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || "Submit";
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 mb-4 text-sm rounded-lg shadow-lg max-w-xs ${getToastClasses(type)}`;
    toast.innerHTML = `
        <div class="flex items-center">
            <div class="ml-3 text-sm font-normal">${message}</div>
            <button type="button" class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-900 hover:bg-gray-100" onclick="this.parentElement.parentElement.remove()">
                <span class="sr-only">Close</span>
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

/**
 * Get CSS classes for toast types
 * @param {string} type - Toast type
 * @returns {string} CSS classes
 */
function getToastClasses(type) {
    switch (type) {
        case 'success':
            return 'text-green-800 bg-green-50 border border-green-200';
        case 'error':
            return 'text-red-800 bg-red-50 border border-red-200';
        case 'warning':
            return 'text-yellow-800 bg-yellow-50 border border-yellow-200';
        default:
            return 'text-blue-800 bg-blue-50 border border-blue-200';
    }
}

/**
 * Format large numbers for display
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) {
        return 'N/A';
    }
    
    // Convert to billions for Vietnamese currency
    if (Math.abs(num) >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T VND';
    } else if (Math.abs(num) >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B VND';
    } else if (Math.abs(num) >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M VND';
    } else {
        return num.toLocaleString() + ' VND';
    }
}

/**
 * Format percentage values
 * @param {number} num - Number to format as percentage
 * @returns {string} Formatted percentage string
 */
function formatPercentage(num) {
    if (num === null || num === undefined || isNaN(num)) {
        return 'N/A';
    }
    return (num * 100).toFixed(2) + '%';
}

/**
 * API call wrapper with error handling
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise} API response
 */
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showToast(`API Error: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Show analysis options after form submission
 * @param {string} ticker - Stock ticker symbol
 * @param {HTMLElement} submitButton - Form submit button
 * @param {HTMLElement} submitText - Submit button text element
 * @param {HTMLElement} loadingSpinner - Loading spinner element
 */
function showAnalysisOptions(ticker, submitButton, submitText, loadingSpinner) {
    // Reset loading state
    submitButton.disabled = false;
    submitText.textContent = 'Analyze Financial Statements';
    loadingSpinner.classList.add('hidden');
    
    // Create options modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3 text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 class="text-lg leading-6 font-medium text-gray-900 mt-4">Financial Data Loaded</h3>
                <p class="text-sm text-gray-500 mt-2">Financial statements downloaded for <strong>${ticker}</strong>. Choose your analysis:</p>
                <div class="mt-6 space-y-3">
                    <button id="statementsOption" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        Financial Statements
                    </button>
                    <button id="valuationOption" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                        Valuation Analysis
                    </button>
                </div>
                <div class="mt-4">
                    <button id="closeModal" class="text-gray-500 hover:text-gray-700 text-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('statementsOption').addEventListener('click', () => {
        window.location.href = '/statements';
    });
    
    document.getElementById('valuationOption').addEventListener('click', () => {
        window.location.href = '/valuation';
    });
    
    document.getElementById('closeModal').addEventListener('click', () => {
        modal.remove();
    });
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}