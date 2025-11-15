// Dashboard Main Controller

let dashboardData = {
    financialStatements: null,
    stockPrices: null,
    companyOverview: null,
    companyNews: null,
    companyEvents: null,
    insiderDeals: null,
    companyDividends: null,
    companySubsidiaries: null
};

let cashConversionCycleChartCreated = false;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupKeyboardShortcuts();
});

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Alt + H: Go to home
        if (e.altKey && e.key === 'h') {
            e.preventDefault();
            window.location.href = '/';
        }

        // Alt + S: Go to statements
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            window.location.href = '/statements';
        }

        // Alt + M: Go to market data
        if (e.altKey && e.key === 'm') {
            e.preventDefault();
            window.location.href = '/market';
        }

        // Alt + C: Change ticker (focus on change button)
        if (e.altKey && e.key === 'c') {
            e.preventDefault();
            document.getElementById('changeTicker')?.click();
        }

        // Alt + 1-5: Switch ratio tabs
        if (e.altKey && ['1', '2', '3', '4', '5'].includes(e.key)) {
            e.preventDefault();
            const tabs = ['valuation', 'profitability-ratios', 'liquidity', 'efficiency', 'leverage'];
            const index = parseInt(e.key) - 1;
            if (tabs[index]) {
                switchRatioTab(tabs[index]);
            }
        }

        // Alt + ?: Show keyboard shortcuts help
        if (e.altKey && (e.key === '?' || e.key === '/')) {
            e.preventDefault();
            document.getElementById('keyboardHelpModal')?.classList.remove('hidden');
        }

        // Escape: Close modals
        if (e.key === 'Escape') {
            document.getElementById('keyboardHelpModal')?.classList.add('hidden');
        }
    });
}

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

    // Setup keyboard help button
    document.getElementById('showKeyboardHelp')?.addEventListener('click', function() {
        document.getElementById('keyboardHelpModal').classList.remove('hidden');
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

    // Create cash conversion cycle chart when efficiency tab is activated
    if (tabName === 'efficiency' && !cashConversionCycleChartCreated) {
        const statements = dashboardData.financialStatements;
        if (statements) {
            const years = statements.years || [];
            const ratios = statements.ratios || [];

            if (years.length > 0 && ratios.length > 0) {
                createCashConversionCycleChart('cashConversionCycleChart', ratios, years);
                cashConversionCycleChartCreated = true;
            }
        }
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
            loadCompanyEvents(params.ticker),
            loadInsiderDeals(params.ticker),
            loadCompanyDividends(params.ticker),
            loadCompanySubsidiaries(params.ticker)
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

async function loadInsiderDeals(ticker) {
    try {
        const url = `/api/company/${ticker}/insider-deals`;
        dashboardData.insiderDeals = await apiCall(url);
    } catch (error) {
        console.warn('Insider deals not available:', error);
        dashboardData.insiderDeals = [];
    }
}

async function loadCompanyDividends(ticker) {
    try {
        const url = `/api/company/${ticker}/dividends`;
        dashboardData.companyDividends = await apiCall(url);
    } catch (error) {
        console.warn('Company dividends not available:', error);
        dashboardData.companyDividends = [];
    }
}

async function loadCompanySubsidiaries(ticker) {
    try {
        const url = `/api/company/${ticker}/subsidiaries`;
        dashboardData.companySubsidiaries = await apiCall(url);
    } catch (error) {
        console.warn('Company subsidiaries not available:', error);
        dashboardData.companySubsidiaries = [];
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

    // Create dividend timeline chart
    if (dashboardData.stockPrices && dashboardData.stockPrices.length > 0) {
        createDividendTimelineChart('dividendTimelineChart', dashboardData.stockPrices, dashboardData.companyDividends);
    }
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

    // Create ownership structure sunburst
    createOwnershipSunburst(dashboardData.companySubsidiaries);

    // Create insider trading chart
    console.log('Insider deals data:', dashboardData.insiderDeals?.length || 0, 'deals');
    if (dashboardData.insiderDeals && dashboardData.insiderDeals.length > 0) {
        console.log('Calling createInsiderTradingChart...');
        createInsiderTradingChart('insiderTradingChart', dashboardData.insiderDeals);
        // Hide the "no data" message and show the canvas
        document.getElementById('insiderTradingChart').classList.remove('hidden');
        document.getElementById('noInsiderDataMessage').classList.add('hidden');
    } else {
        console.log('No insider deals data available to create chart');
        // Show the "no data" message and hide the canvas
        document.getElementById('insiderTradingChart').classList.add('hidden');
        document.getElementById('noInsiderDataMessage').classList.remove('hidden');
    }
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

// Create ownership structure sunburst visualization
function createOwnershipSunburst(subsidiaries) {
    const container = document.getElementById('ownershipSunburst');
    const noDataMessage = document.getElementById('noOwnershipDataMessage');

    if (!container) return;

    // Clear previous visualization
    container.innerHTML = '';

    if (!subsidiaries || subsidiaries.length === 0) {
        container.innerHTML = `
            <div class="h-full flex items-center justify-center">
                <div class="text-center">
                    <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <p class="text-gray-500 text-lg font-medium mb-2">No Ownership Data</p>
                    <p class="text-gray-400 text-sm">Ownership structure information is not available for this company</p>
                </div>
            </div>
        `;
        return;
    }

    // Get current ticker from session storage
    const params = getParams();
    const ticker = params?.ticker || 'Company';

    // Prepare hierarchical data for sunburst
    const data = {
        name: ticker,
        children: subsidiaries.map(sub => ({
            name: sub.sub_company_name,
            value: sub.sub_own_percent * 100, // Convert 0-1 range to 0-100 for proper scaling
            ownership: sub.sub_own_percent * 100 // Store actual percentage for display
        }))
    };

    const width = container.clientWidth;
    const height = 384; // h-96 = 24rem = 384px
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Color scheme
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create partition
    const partition = d3.partition()
        .size([2 * Math.PI, radius])
        .padding(0.01);

    // Create hierarchy
    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    partition(root);

    // Create arc generator
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1);

    // Create paths
    const path = g.selectAll('path')
        .data(root.descendants())
        .enter()
        .append('path')
        .attr('d', arc)
        .style('fill', d => {
            if (d.depth === 0) return '#e5e7eb'; // Gray for parent
            return color(d.data.name);
        })
        .style('stroke', '#fff')
        .style('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
            d3.select(this)
                .style('opacity', 0.8);

            // Show tooltip
            const tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('position', 'absolute')
                .style('background', 'rgba(0, 0, 0, 0.9)')
                .style('color', 'white')
                .style('padding', '8px 12px')
                .style('border-radius', '4px')
                .style('font-size', '12px')
                .style('pointer-events', 'none')
                .style('z-index', '1000');

            if (d.depth === 0) {
                tooltip.html(`
                    <strong>${d.data.name}</strong><br>
                    Parent Company<br>
                    ${d.children ? d.children.length : 0} subsidiaries
                `);
            } else {
                tooltip.html(`
                    <strong>${d.data.name}</strong><br>
                    Ownership: ${d.data.ownership.toFixed(2)}%<br>
                    ${d.parent ? `Parent: ${d.parent.data.name}` : ''}
                `);
            }

            tooltip
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .style('opacity', 1);
            d3.selectAll('.tooltip').remove();
        });

    // Add labels for larger segments
    const text = g.selectAll('text')
        .data(root.descendants().filter(d => d.depth > 0 && (d.x1 - d.x0) > 0.2))
        .enter()
        .append('text')
        .attr('transform', function(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2;
            return `rotate(${x - 90}) translate(${y}, 0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', '500')
        .attr('fill', 'white')
        .attr('pointer-events', 'none')
        .text(d => {
            const text = d.data.name;
            const maxLength = 15;
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        });

    // Add center label
    const centerLabel = g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#374151')
        .text(ticker);
}
