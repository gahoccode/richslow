// Valuation Analysis Page JavaScript

let valuationData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await initializePage();
});

async function initializePage() {
    // Check if we have analysis parameters with financial data
    if (!hasValidParamsWithData()) {
        // Check if we have basic parameters but no data
        if (hasValidParams()) {
            // Try to download statements data first
            await downloadStatementsDataAndInitialize();
        } else {
            showNoParams();
            return;
        }
    } else {
        // Display analysis info
        displayAnalysisInfo();
        
        // Set up tabs
        setupTabs();
        
        // Load valuation data
        loadValuationData();
    }
}

async function downloadStatementsDataAndInitialize() {
    const params = getParams();
    if (!params) {
        showNoParams();
        return;
    }
    
    try {
        // Show loading state
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('noParamsState').classList.add('hidden');
        
        // Download statements data
        await downloadStatementsForValuation(
            params.ticker,
            params.startDate,
            params.endDate,
            params.period
        );
        
        // Now proceed with normal initialization
        displayAnalysisInfo();
        setupTabs();
        loadValuationData();
        
    } catch (error) {
        // Hide loading state and show error
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
        document.getElementById('errorMessage').textContent = 
            `Failed to download financial data: ${error.message}. Please start from the home page.`;
    }
}

function showNoParams() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('noParamsState').classList.remove('hidden');
}

function displayAnalysisInfo() {
    const params = getParams();
    if (params) {
        const info = `Valuation analysis for ${params.ticker} from ${params.startDate} to ${params.endDate} (${params.period}ly data)`;
        document.getElementById('analysisInfo').textContent = info;
        document.getElementById('stockInfo').classList.remove('hidden');
    }
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update button states
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'border-blue-500', 'text-blue-600');
        activeButton.classList.remove('border-transparent', 'text-gray-500');
    }
    
    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
}

async function loadValuationData() {
    const params = getParams();
    if (!params) return;
    
    try {
        showLoading();
        
        const url = `/api/valuation/${params.ticker}?start_date=${params.startDate}&end_date=${params.endDate}&period=${params.period}`;
        valuationData = await apiCall(url);
        
        hideLoading();
        populateValuation();
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

function showLoading() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('valuationContent').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingState').classList.add('hidden');
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('valuationContent').classList.add('hidden');
}

function populateValuation() {
    if (!valuationData) return;
    
    // Show content
    document.getElementById('valuationContent').classList.remove('hidden');
    
    // Populate summary cards
    populateSummaryCards();
    
    // Populate each analysis section
    populateWACCAnalysis();
    populateBetaAnalysis();
    populateCapitalStructure();
    populateMarketAssumptions();
    populateDataQuality();
    
    showToast('Valuation analysis loaded successfully!', 'success');
}

function populateSummaryCards() {
    const summary = valuationData.summary || {};
    
    // Format values for display
    document.getElementById('summaryWACC').textContent = 
        formatPercentage(summary.latest_wacc);
    
    document.getElementById('summaryBeta').textContent = 
        formatNumber(summary.latest_beta, 2);
    
    document.getElementById('summaryMarketCap').textContent = 
        formatCurrency(summary.latest_market_cap);
    
    document.getElementById('summaryEV').textContent = 
        formatCurrency(summary.enterprise_value);
}

function populateWACCAnalysis() {
    const metrics = valuationData.valuation_metrics || [];
    const years = valuationData.years || [];
    
    // Create table headers
    const headerRow = document.getElementById('waccTableHeader');
    headerRow.innerHTML = '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>';
    
    years.forEach(year => {
        headerRow.innerHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${year || 'Latest'}</th>`;
    });
    
    // Create table body
    const tbody = document.getElementById('waccTableBody');
    tbody.innerHTML = '';
    
    if (metrics.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="px-6 py-4 text-center text-gray-500">No WACC data available</td></tr>';
        return;
    }
    
    // Create year-indexed data
    const metricsByYear = {};
    metrics.forEach(metric => {
        const year = metric.year_report || 'Latest';
        metricsByYear[year] = metric;
    });
    
    // Define WACC metrics to display
    const waccMetrics = [
        { key: 'wacc', label: 'Weighted Average Cost of Capital (WACC)', isPercentage: true },
        { key: 'cost_of_equity', label: 'Cost of Equity (Re)', isPercentage: true },
        { key: 'cost_of_debt', label: 'After-tax Cost of Debt (Rd)', isPercentage: true },
        { key: 'equity_weight', label: 'Equity Weight (E/V)', isPercentage: true },
        { key: 'debt_weight', label: 'Debt Weight (D/V)', isPercentage: true },
        { key: 'market_cap', label: 'Market Value of Equity (Bn VND)', isCurrency: true },
        { key: 'total_debt', label: 'Market Value of Debt (Bn VND)', isCurrency: true },
        { key: 'enterprise_value', label: 'Enterprise Value (Bn VND)', isCurrency: true }
    ];
    
    waccMetrics.forEach(metric => {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${metric.label}</td>`;
        
        years.forEach(year => {
            const yearData = metricsByYear[year || 'Latest'];
            const value = yearData ? yearData[metric.key] : null;
            let displayValue = '-';
            
            if (value !== null && value !== undefined) {
                if (metric.isPercentage) {
                    displayValue = formatPercentage(value);
                } else if (metric.isCurrency) {
                    displayValue = formatCurrency(value);
                } else {
                    displayValue = formatNumber(value, 4);
                }
            }
            
            row.innerHTML += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${displayValue}</td>`;
        });
        
        tbody.appendChild(row);
    });
}

function populateBetaAnalysis() {
    const metrics = valuationData.valuation_metrics || [];
    const dataQuality = valuationData.data_quality || {};
    
    // Create table headers
    const headerRow = document.getElementById('betaTableHeader');
    headerRow.innerHTML = '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>';
    headerRow.innerHTML += '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>';
    
    // Create table body
    const tbody = document.getElementById('betaTableBody');
    tbody.innerHTML = '';
    
    if (metrics.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="px-6 py-4 text-center text-gray-500">No beta data available</td></tr>';
        return;
    }
    
    const latestMetric = metrics[0];
    
    // Define beta and risk metrics to display
    const betaMetrics = [
        { key: 'beta', label: 'Beta (vs VNINDEX)', value: latestMetric.beta },
        { key: 'correlation', label: 'Correlation with Market', value: latestMetric.correlation },
        { key: 'r_squared', label: 'R-squared (Statistical Quality)', value: latestMetric.r_squared },
        { key: 'stock_volatility', label: 'Stock Volatility (Annualized)', value: latestMetric.stock_volatility, isPercentage: true },
        { key: 'market_volatility', label: 'Market Volatility (Annualized)', value: latestMetric.market_volatility, isPercentage: true },
        { key: 'data_points', label: 'Trading Days Used', value: dataQuality.beta_data_points },
        { key: 'statistical_quality', label: 'Statistical Quality', value: dataQuality.statistical_quality, isText: true },
        { key: 'start_date', label: 'Analysis Period Start', value: latestMetric.start_date, isText: true },
        { key: 'end_date', label: 'Analysis Period End', value: latestMetric.end_date, isText: true }
    ];
    
    betaMetrics.forEach(metric => {
        const row = document.createElement('tr');
        let displayValue = '-';
        
        if (metric.value !== null && metric.value !== undefined) {
            if (metric.isPercentage) {
                displayValue = formatPercentage(metric.value);
            } else if (metric.isText) {
                displayValue = metric.value;
            } else {
                displayValue = formatNumber(metric.value, 4);
            }
        }
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${metric.label}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${displayValue}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function populateCapitalStructure() {
    const metrics = valuationData.valuation_metrics || [];
    const years = valuationData.years || [];
    
    // Create table headers
    const headerRow = document.getElementById('capitalTableHeader');
    headerRow.innerHTML = '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>';
    
    years.forEach(year => {
        headerRow.innerHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${year || 'Latest'}</th>`;
    });
    
    // Create table body
    const tbody = document.getElementById('capitalTableBody');
    tbody.innerHTML = '';
    
    if (metrics.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="px-6 py-4 text-center text-gray-500">No capital structure data available</td></tr>';
        return;
    }
    
    // Create year-indexed data
    const metricsByYear = {};
    metrics.forEach(metric => {
        const year = metric.year_report || 'Latest';
        metricsByYear[year] = metric;
    });
    
    // Define capital structure metrics
    const capitalMetrics = [
        { key: 'market_cap', label: 'Market Capitalization (Bn VND)', isCurrency: true },
        { key: 'total_debt', label: 'Total Debt (Bn VND)', isCurrency: true },
        { key: 'enterprise_value', label: 'Enterprise Value (Bn VND)', isCurrency: true },
        { key: 'equity_weight', label: 'Equity Weight (%)', isPercentage: true },
        { key: 'debt_weight', label: 'Debt Weight (%)', isPercentage: true },
        { key: 'financial_leverage', label: 'Financial Leverage Ratio', value: null },
        { key: 'interest_coverage', label: 'Interest Coverage Ratio', value: null }
    ];
    
    capitalMetrics.forEach(metric => {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${metric.label}</td>`;
        
        years.forEach(year => {
            const yearData = metricsByYear[year || 'Latest'];
            const value = yearData ? yearData[metric.key] : null;
            let displayValue = '-';
            
            if (value !== null && value !== undefined) {
                if (metric.isPercentage) {
                    displayValue = formatPercentage(value);
                } else if (metric.isCurrency) {
                    displayValue = formatCurrency(value);
                } else {
                    displayValue = formatNumber(value, 2);
                }
            }
            
            row.innerHTML += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${displayValue}</td>`;
        });
        
        tbody.appendChild(row);
    });
}

function populateMarketAssumptions() {
    const assumptions = valuationData.assumptions || {};
    const assumptionsGrid = document.getElementById('assumptionsGrid');
    
    assumptionsGrid.innerHTML = '';
    
    // Define assumption categories with descriptions
    const assumptionCategories = [
        {
            title: 'Vietnamese Market Parameters',
            items: [
                { key: 'vietnam_risk_free_rate', label: 'Risk-free Rate', description: 'Vietnamese government bond yield', isPercentage: true },
                { key: 'vietnam_market_risk_premium', label: 'Market Risk Premium', description: 'VNINDEX risk premium over risk-free rate', isPercentage: true },
                { key: 'vietnam_corporate_tax_rate', label: 'Corporate Tax Rate', description: 'Vietnamese statutory tax rate', isPercentage: true },
                { key: 'default_credit_spread', label: 'Default Credit Spread', description: 'Average corporate credit spread', isPercentage: true }
            ]
        },
        {
            title: 'Calculation Methodology',
            items: [
                { key: 'market_benchmark', label: 'Market Benchmark', description: 'Index used for beta calculation', isText: true },
                { key: 'trading_days_per_year', label: 'Trading Days/Year', description: 'For volatility annualization', isNumber: true }
            ]
        }
    ];
    
    assumptionCategories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'space-y-4';
        
        categoryDiv.innerHTML = `
            <h4 class="text-sm font-medium text-gray-900">${category.title}</h4>
            <div class="space-y-3"></div>
        `;
        
        const itemsContainer = categoryDiv.querySelector('.space-y-3');
        
        category.items.forEach(item => {
            const value = assumptions[item.key];
            let displayValue = 'N/A';
            
            if (value !== null && value !== undefined) {
                if (item.isPercentage) {
                    displayValue = formatPercentage(value);
                } else if (item.isText) {
                    displayValue = value;
                } else if (item.isNumber) {
                    displayValue = value.toString();
                } else {
                    displayValue = value.toString();
                }
            }
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bg-gray-50 p-3 rounded-lg';
            itemDiv.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">${item.label}</p>
                        <p class="text-xs text-gray-500 mt-1">${item.description}</p>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-semibold text-gray-900">${displayValue}</p>
                    </div>
                </div>
            `;
            
            itemsContainer.appendChild(itemDiv);
        });
        
        assumptionsGrid.appendChild(categoryDiv);
    });
}

function populateDataQuality() {
    const dataQuality = valuationData.data_quality || {};
    const qualityMetrics = document.getElementById('qualityMetrics');
    
    qualityMetrics.innerHTML = '';
    
    // Data Quality Categories
    const qualityCategories = [
        {
            title: 'Beta Calculation Quality',
            icon: 'chart',
            items: [
                { key: 'beta_data_points', label: 'Trading Days Used', value: dataQuality.beta_data_points, suffix: ' days' },
                { key: 'beta_correlation', label: 'Correlation with VNINDEX', value: dataQuality.beta_correlation, isDecimal: true },
                { key: 'beta_r_squared', label: 'R-squared (Goodness of Fit)', value: dataQuality.beta_r_squared, isDecimal: true },
                { key: 'statistical_quality', label: 'Overall Statistical Quality', value: dataQuality.statistical_quality, isText: true }
            ]
        },
        {
            title: 'Data Alignment & Coverage',
            icon: 'database',
            items: [
                { key: 'periods_analyzed', label: 'Financial Periods Analyzed', value: dataQuality.periods_analyzed, suffix: ' periods' },
                { key: 'volatility_analysis', label: 'Volatility Analysis', value: dataQuality.volatility_analysis, isText: true }
            ]
        }
    ];
    
    qualityCategories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'bg-white rounded-lg border border-gray-200 p-6';
        
        // Category header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'flex items-center mb-4';
        headerDiv.innerHTML = `
            <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    ${category.icon === 'chart' ? 
                        '<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path></svg>' :
                        '<svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path></svg>'
                    }
                </div>
            </div>
            <div class="ml-3">
                <h4 class="text-lg font-medium text-gray-900">${category.title}</h4>
            </div>
        `;
        
        categoryDiv.appendChild(headerDiv);
        
        // Category items
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
        
        category.items.forEach(item => {
            const value = item.value;
            let displayValue = 'N/A';
            let statusClass = 'text-gray-500';
            
            if (value !== null && value !== undefined) {
                if (item.isDecimal) {
                    displayValue = formatNumber(value, 3);
                    // Color code based on quality
                    if (item.key === 'beta_r_squared') {
                        if (value > 0.5) statusClass = 'text-green-600';
                        else if (value > 0.25) statusClass = 'text-yellow-600';
                        else statusClass = 'text-red-600';
                    } else if (item.key === 'beta_correlation') {
                        const absValue = Math.abs(value);
                        if (absValue > 0.7) statusClass = 'text-green-600';
                        else if (absValue > 0.4) statusClass = 'text-yellow-600';
                        else statusClass = 'text-red-600';
                    }
                } else if (item.isText) {
                    displayValue = value;
                    // Color code quality ratings
                    if (value === 'High') statusClass = 'text-green-600';
                    else if (value === 'Medium') statusClass = 'text-yellow-600';
                    else if (value === 'Low') statusClass = 'text-red-600';
                } else {
                    displayValue = value + (item.suffix || '');
                }
            }
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bg-gray-50 p-4 rounded-lg';
            itemDiv.innerHTML = `
                <div class="flex justify-between items-center">
                    <p class="text-sm font-medium text-gray-600">${item.label}</p>
                    <p class="text-lg font-semibold ${statusClass}">${displayValue}</p>
                </div>
            `;
            
            itemsGrid.appendChild(itemDiv);
        });
        
        categoryDiv.appendChild(itemsGrid);
        qualityMetrics.appendChild(categoryDiv);
    });
}

// Utility functions for formatting
function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatPercentage(value) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    return (value * 100).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + '%';
}

function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    if (value >= 1000) {
        return (value / 1000).toLocaleString('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }) + ' T VND';
    } else {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }) + ' B VND';
    }
}