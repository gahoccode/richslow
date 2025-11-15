// Dashboard Main Controller

let dashboardData = {
    financialStatements: null,
    stockPrices: null,
    companyOverview: null,
    companyNews: null,
    companyEvents: null
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    // Check if we have valid parameters
    if (!hasValidParams()) {
        showError('No analysis parameters found. Please start from the home page.');
        return;
    }

    // Display ticker info in header
    displayTickerInfo();

    // Setup tab handlers
    setupStatementTabs();
    setupRatioTabs();

    // Setup change ticker button
    document.getElementById('changeTicker').addEventListener('click', function() {
        window.location.href = '/';
    });

    // Load all data
    await loadAllData();
}

function displayTickerInfo() {
    const params = getParams();
    if (params) {
        document.getElementById('currentTicker').textContent = params.ticker;
        document.getElementById('currentPeriod').textContent = `${params.period}ly | ${params.startDate} → ${params.endDate}`;
        document.getElementById('tickerDisplay').classList.remove('hidden');
    }
}

function setupStatementTabs() {
    const tabs = document.querySelectorAll('.statement-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchStatementTab(tabName);
        });
    });
}

function setupRatioTabs() {
    const tabs = document.querySelectorAll('.ratio-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchRatioTab(tabName);
        });
    });
}

function switchStatementTab(tabName) {
    // Update button states
    document.querySelectorAll('.statement-tab').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    const activeButton = document.querySelector(`.statement-tab[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
        activeButton.classList.remove('border-transparent', 'text-gray-500');
    }

    // Update content visibility
    document.querySelectorAll('.statement-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeContent = document.getElementById(`${tabName}Tab`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
}

function switchRatioTab(tabName) {
    // Update button states
    document.querySelectorAll('.ratio-tab').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    const activeButton = document.querySelector(`.ratio-tab[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
        activeButton.classList.remove('border-transparent', 'text-gray-500');
    }

    // Update content visibility
    document.querySelectorAll('.ratio-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeContent = document.getElementById(`${tabName}Tab`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
}

async function loadAllData() {
    const params = getParams();
    if (!params) return;

    try {
        // Show loading state
        document.getElementById('loadingDashboard').classList.remove('hidden');
        document.getElementById('errorDashboard').classList.add('hidden');
        document.getElementById('dashboardContent').classList.add('hidden');

        // Load all data in parallel
        await Promise.all([
            loadFinancialStatements(params),
            loadStockPrices(params),
            loadCompanyOverview(params.ticker),
            loadCompanyNews(params.ticker),
            loadCompanyEvents(params.ticker)
        ]);

        // Hide loading, show content
        document.getElementById('loadingDashboard').classList.add('hidden');
        document.getElementById('dashboardContent').classList.remove('hidden');

        // Populate all visualizations
        populateDashboard();

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError(error.message || 'Failed to load dashboard data');
    }
}

async function loadFinancialStatements(params) {
    try {
        const url = `/api/statements/${params.ticker}?start_date=${params.startDate}&end_date=${params.endDate}&period=${params.period}`;
        dashboardData.financialStatements = await apiCall(url);
    } catch (error) {
        console.error('Error loading financial statements:', error);
        throw new Error('Failed to load financial statements');
    }
}

async function loadStockPrices(params) {
    try {
        const url = `/api/stock-prices/${params.ticker}?start_date=${params.startDate}&end_date=${params.endDate}&interval=1D`;
        dashboardData.stockPrices = await apiCall(url);
    } catch (error) {
        console.warn('Stock prices not available:', error);
        dashboardData.stockPrices = [];
    }
}

async function loadCompanyOverview(ticker) {
    try {
        const url = `/api/company/${ticker}/overview`;
        dashboardData.companyOverview = await apiCall(url);
    } catch (error) {
        console.warn('Company overview not available:', error);
        dashboardData.companyOverview = null;
    }
}

async function loadCompanyNews(ticker) {
    try {
        const url = `/api/company/${ticker}/news`;
        dashboardData.companyNews = await apiCall(url);
    } catch (error) {
        console.warn('Company news not available:', error);
        dashboardData.companyNews = [];
    }
}

async function loadCompanyEvents(ticker) {
    try {
        const url = `/api/company/${ticker}/events`;
        dashboardData.companyEvents = await apiCall(url);
    } catch (error) {
        console.warn('Company events not available:', error);
        dashboardData.companyEvents = [];
    }
}

function populateDashboard() {
    // Populate company overview
    populateCompanyOverview();

    // Populate key metrics
    populateKeyMetrics();

    // Create stock price chart
    if (dashboardData.stockPrices && dashboardData.stockPrices.length > 0) {
        createPriceChart('priceChart', dashboardData.stockPrices);
    }

    // Create financial statement charts
    const statements = dashboardData.financialStatements;
    if (statements) {
        const years = statements.years || [];
        const incomeStatements = statements.income_statements || [];
        const ratios = statements.ratios || [];
        const cashFlows = statements.cash_flows || [];

        // Revenue chart
        createRevenueChart('revenueChart', incomeStatements, years);

        // Profitability chart
        createProfitabilityChart('profitabilityChart', ratios, years);

        // Cash flow waterfall (use latest year)
        const latestYear = years.length > 0 ? years[0] : new Date().getFullYear();
        createCashFlowWaterfallChart('cashflowWaterfallChart', cashFlows, latestYear);

        // Ratio charts
        const latestRatios = ratios.find(r => r.year_report === latestYear) || ratios[0] || {};

        // Valuation radar
        createValuationRadarChart('valuationRadarChart', latestRatios);

        // Profitability gauges
        createGaugeChart('roeGauge', latestRatios.roe, 'ROE');
        createGaugeChart('roaGauge', latestRatios.roa, 'ROA');
        createGaugeChart('roicGauge', latestRatios.roic, 'ROIC');

        // Liquidity bars
        populateLiquidityBars(latestRatios);

        // Efficiency chart
        createEfficiencyChart('efficiencyChart', ratios, years);

        // Leverage gauge
        createLeverageGauge('leverageGauge', latestRatios.debt_to_equity);
    }

    // Populate news and events
    populateNewsFeed();
    populateEventsTimeline();
}

function populateCompanyOverview() {
    const overview = dashboardData.companyOverview;
    if (!overview) return;

    document.getElementById('companyExchange').textContent = overview.exchange || 'N/A';
    document.getElementById('companyIndustry').textContent = overview.industry || 'N/A';
    document.getElementById('companyEmployees').textContent = overview.no_employees ? overview.no_employees.toLocaleString() : 'N/A';
    document.getElementById('companyForeignOwnership').textContent = overview.foreign_percent ? (overview.foreign_percent * 100).toFixed(2) + '%' : 'N/A';
    document.getElementById('companyRating').textContent = overview.stock_rating ? overview.stock_rating.toFixed(1) + '/10' : 'N/A';
}

function populateKeyMetrics() {
    const statements = dashboardData.financialStatements;
    if (!statements || !statements.ratios || statements.ratios.length === 0) return;

    const latestRatios = statements.ratios[0];

    // P/E Ratio
    const peRatio = latestRatios.pe_ratio;
    document.getElementById('metricPE').textContent = peRatio !== null && peRatio !== undefined ? peRatio.toFixed(2) : 'N/A';

    // ROE
    const roe = latestRatios.roe;
    document.getElementById('metricROE').textContent = roe !== null && roe !== undefined ? (roe * 100).toFixed(2) + '%' : 'N/A';

    // D/E Ratio
    const de = latestRatios.debt_to_equity;
    document.getElementById('metricDE').textContent = de !== null && de !== undefined ? de.toFixed(2) : 'N/A';

    // Current Ratio
    const current = latestRatios.current_ratio;
    document.getElementById('metricCurrent').textContent = current !== null && current !== undefined ? current.toFixed(2) : 'N/A';
}

function populateLiquidityBars(ratios) {
    // Current Ratio
    const currentRatio = ratios.current_ratio || 0;
    document.getElementById('currentRatioValue').textContent = currentRatio.toFixed(2);
    const currentPercentage = Math.min((currentRatio / 3) * 100, 100); // Max 3.0 for scale
    document.getElementById('currentRatioBar').style.width = currentPercentage + '%';

    // Quick Ratio
    const quickRatio = ratios.quick_ratio || 0;
    document.getElementById('quickRatioValue').textContent = quickRatio.toFixed(2);
    const quickPercentage = Math.min((quickRatio / 2) * 100, 100); // Max 2.0 for scale
    document.getElementById('quickRatioBar').style.width = quickPercentage + '%';

    // Cash Ratio
    const cashRatio = ratios.cash_ratio || 0;
    document.getElementById('cashRatioValue').textContent = cashRatio.toFixed(2);
    const cashPercentage = Math.min((cashRatio / 1) * 100, 100); // Max 1.0 for scale
    document.getElementById('cashRatioBar').style.width = cashPercentage + '%';
}

function populateNewsFeed() {
    const newsFeedContainer = document.getElementById('newsFeed');
    const news = dashboardData.companyNews;

    if (!news || news.length === 0) {
        newsFeedContainer.innerHTML = '<p class="text-sm text-gray-500">No news available</p>';
        return;
    }

    newsFeedContainer.innerHTML = news.slice(0, 10).map(article => `
        <div class="border-b border-gray-200 pb-3 last:border-b-0">
            <h3 class="text-sm font-medium text-gray-900 mb-1">${article.title || 'No title'}</h3>
            <div class="flex items-center justify-between text-xs text-gray-500">
                <span>${article.source || 'Unknown source'}</span>
                <span>${article.publish_date || 'Unknown date'}</span>
            </div>
            ${article.price_change_ratio !== null && article.price_change_ratio !== undefined ? `
                <span class="inline-block mt-1 px-2 py-1 text-xs rounded ${article.price_change_ratio >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${article.price_change_ratio >= 0 ? '+' : ''}${(article.price_change_ratio * 100).toFixed(2)}%
                </span>
            ` : ''}
        </div>
    `).join('');
}

function populateEventsTimeline() {
    const eventsContainer = document.getElementById('eventsTimeline');
    const events = dashboardData.companyEvents;

    if (!events || events.length === 0) {
        eventsContainer.innerHTML = '<p class="text-sm text-gray-500">No events available</p>';
        return;
    }

    eventsContainer.innerHTML = events.slice(0, 10).map(event => `
        <div class="border-l-4 border-blue-500 pl-4 pb-3">
            <div class="flex items-start justify-between">
                <h3 class="text-sm font-medium text-gray-900">${event.event_name || 'Event'}</h3>
                <span class="text-xs text-gray-500">${event.notify_date || 'N/A'}</span>
            </div>
            ${event.event_desc ? `<p class="text-xs text-gray-600 mt-1">${event.event_desc}</p>` : ''}
            ${event.exer_date ? `<p class="text-xs text-blue-600 mt-1">Exercise Date: ${event.exer_date}</p>` : ''}
        </div>
    `).join('');
}

function showError(message) {
    document.getElementById('loadingDashboard').classList.add('hidden');
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorDashboard').classList.remove('hidden');
    document.getElementById('dashboardContent').classList.add('hidden');
}

// Helper function to format currency
function formatVND(value) {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString('vi-VN') + ' VND';
}

// Helper function to format percentage
function formatPercent(value) {
    if (value === null || value === undefined) return 'N/A';
    return (value * 100).toFixed(2) + '%';
}
