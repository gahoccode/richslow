// Financial Statements Page JavaScript

let financialData = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    // Check if we have analysis parameters
    if (!hasValidParams()) {
        showNoParams();
        return;
    }
    
    // Display analysis info
    displayAnalysisInfo();
    
    // Set up tabs
    setupTabs();
    
    // Load financial data
    loadFinancialData();
}

function showNoParams() {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('noParamsState').classList.remove('hidden');
}

function displayAnalysisInfo() {
    const params = getParams();
    if (params) {
        const info = `Analyzing ${params.ticker} from ${params.startDate} to ${params.endDate} (${params.period}ly reports)`;
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

async function loadFinancialData() {
    const params = getParams();
    if (!params) return;
    
    try {
        showLoading();
        
        const url = `/api/statements/${params.ticker}?start_date=${params.startDate}&end_date=${params.endDate}&period=${params.period}`;
        financialData = await apiCall(url);
        
        hideLoading();
        populateStatements();
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

function showLoading() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('statementsContent').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loadingState').classList.add('hidden');
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('statementsContent').classList.add('hidden');
}

function populateStatements() {
    if (!financialData) return;
    
    // Show content
    document.getElementById('statementsContent').classList.remove('hidden');
    
    // Populate each statement type
    populateIncomeStatement();
    populateBalanceSheet();
    populateCashFlow();
    populateRawData();
    
    showToast('Financial statements loaded successfully!', 'success');
}

function populateIncomeStatement() {
    const incomes = financialData.income_statements || [];
    const years = financialData.years || [];
    
    // Create table headers
    const headerRow = document.getElementById('incomeTableHeader');
    headerRow.innerHTML = '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>';
    
    years.forEach(year => {
        headerRow.innerHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${year}</th>`;
    });
    
    // Create table body
    const tbody = document.getElementById('incomeTableBody');
    tbody.innerHTML = '';
    
    if (incomes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="px-6 py-4 text-center text-gray-500">No income statement data available</td></tr>';
        return;
    }
    
    // Define metrics to display
    const metrics = [
        { key: 'revenue', label: 'Revenue' },
        { key: 'revenue_yoy', label: 'Revenue YoY Growth', isPercentage: true },
        { key: 'net_sales', label: 'Net Sales' },
        { key: 'cost_of_sales', label: 'Cost of Sales' },
        { key: 'gross_profit', label: 'Gross Profit' },
        { key: 'operating_profit', label: 'Operating Profit' },
        { key: 'net_profit', label: 'Net Profit' },
        { key: 'attributable_to_parent', label: 'Attributable to Parent' }
    ];
    
    metrics.forEach(metric => {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${metric.label}</td>`;
        
        incomes.forEach(income => {
            const value = income[metric.key];
            const formattedValue = metric.isPercentage ? formatPercentage(value) : formatNumber(value);
            row.innerHTML += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formattedValue}</td>`;
        });
        
        tbody.appendChild(row);
    });
}

function populateBalanceSheet() {
    const balances = financialData.balance_sheets || [];
    const years = financialData.years || [];
    
    // Create table headers
    const headerRow = document.getElementById('balanceTableHeader');
    headerRow.innerHTML = '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>';
    
    years.forEach(year => {
        headerRow.innerHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${year}</th>`;
    });
    
    // Create table body
    const tbody = document.getElementById('balanceTableBody');
    tbody.innerHTML = '';
    
    if (balances.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="px-6 py-4 text-center text-gray-500">No balance sheet data available</td></tr>';
        return;
    }
    
    // Define metrics to display
    const metrics = [
        { key: 'total_assets', label: 'Total Assets' },
        { key: 'current_assets', label: 'Current Assets' },
        { key: 'long_term_assets', label: 'Long-term Assets' },
        { key: 'cash_and_equivalents', label: 'Cash & Equivalents' },
        { key: 'total_liabilities', label: 'Total Liabilities' },
        { key: 'current_liabilities', label: 'Current Liabilities' },
        { key: 'long_term_liabilities', label: 'Long-term Liabilities' },
        { key: 'owners_equity', label: 'Owner\'s Equity' }
    ];
    
    metrics.forEach(metric => {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${metric.label}</td>`;
        
        balances.forEach(balance => {
            const value = balance[metric.key];
            const formattedValue = formatNumber(value);
            row.innerHTML += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formattedValue}</td>`;
        });
        
        tbody.appendChild(row);
    });
}

function populateCashFlow() {
    const cashFlows = financialData.cash_flows || [];
    const years = financialData.years || [];
    
    // Create table headers
    const headerRow = document.getElementById('cashflowTableHeader');
    headerRow.innerHTML = '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>';
    
    years.forEach(year => {
        headerRow.innerHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${year}</th>`;
    });
    
    // Create table body
    const tbody = document.getElementById('cashflowTableBody');
    tbody.innerHTML = '';
    
    if (cashFlows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="px-6 py-4 text-center text-gray-500">No cash flow data available</td></tr>';
        return;
    }
    
    // Define metrics to display
    const metrics = [
        { key: 'operating_cash_flow', label: 'Operating Cash Flow' },
        { key: 'investing_cash_flow', label: 'Investing Cash Flow' },
        { key: 'financing_cash_flow', label: 'Financing Cash Flow' },
        { key: 'net_change_in_cash', label: 'Net Change in Cash' },
        { key: 'profit_before_tax', label: 'Profit Before Tax' }
    ];
    
    metrics.forEach(metric => {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${metric.label}</td>`;
        
        cashFlows.forEach(flow => {
            const value = flow[metric.key];
            const formattedValue = formatNumber(value);
            row.innerHTML += `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formattedValue}</td>`;
        });
        
        tbody.appendChild(row);
    });
}

function populateRawData() {
    const rawDataDisplay = document.getElementById('rawDataDisplay');
    if (financialData && financialData.raw_data) {
        rawDataDisplay.textContent = JSON.stringify(financialData.raw_data, null, 2);
    } else {
        rawDataDisplay.textContent = 'No raw data available';
    }
}