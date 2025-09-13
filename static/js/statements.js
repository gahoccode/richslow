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
    populateRatios();
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
    
    // Define metrics to display - comprehensive income statement line items
    const metrics = [
        // Revenue and Sales
        { key: 'revenue', label: 'Revenue (Bn. VND)' },
        { key: 'revenue_yoy', label: 'Revenue YoY Growth (%)', isPercentage: true },
        { key: 'sales', label: 'Gross Sales' },
        { key: 'sales_deductions', label: 'Sales Deductions' },
        { key: 'net_sales', label: 'Net Sales' },
        
        // Costs and Expenses
        { key: 'cost_of_sales', label: 'Cost of Sales' },
        { key: 'selling_expenses', label: 'Selling Expenses' },
        { key: 'general_admin_expenses', label: 'General & Admin Expenses' },
        
        // Profit Metrics
        { key: 'gross_profit', label: 'Gross Profit' },
        { key: 'operating_profit', label: 'Operating Profit/Loss' },
        { key: 'profit_before_tax', label: 'Profit Before Tax' },
        { key: 'net_profit', label: 'Net Profit For the Year' },
        
        // Attributable Profits
        { key: 'attributable_to_parent', label: 'Attributable to Parent Company' },
        { key: 'attributable_to_parent_vnd', label: 'Attributable to Parent (Bn. VND)' },
        { key: 'attributable_to_parent_yoy', label: 'Attributable to Parent YoY (%)', isPercentage: true },
        { key: 'minority_interest', label: 'Minority Interest' },
        
        // Financial Income/Expenses
        { key: 'financial_income', label: 'Financial Income' },
        { key: 'financial_expenses', label: 'Financial Expenses' },
        { key: 'interest_expenses', label: 'Interest Expenses' },
        
        // Tax
        { key: 'business_tax_current', label: 'Business Income Tax - Current' },
        { key: 'business_tax_deferred', label: 'Business Income Tax - Deferred' },
        
        // Other Income
        { key: 'other_income', label: 'Other Income' },
        { key: 'other_income_expenses', label: 'Other Income/Expenses' },
        { key: 'net_other_income', label: 'Net Other Income/Expenses' },
        
        // Investment Related
        { key: 'gain_loss_joint_ventures', label: 'Gain/(Loss) from Joint Ventures' },
        { key: 'net_income_associated_companies', label: 'Net Income from Associated Companies' }
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
    
    // Define metrics to display - comprehensive balance sheet line items
    const metrics = [
        // Assets - Current
        { key: 'current_assets', label: 'Current Assets (Bn. VND)' },
        { key: 'cash_and_equivalents', label: 'Cash and Cash Equivalents' },
        { key: 'short_term_investments', label: 'Short-term Investments' },
        { key: 'accounts_receivable', label: 'Accounts Receivable' },
        { key: 'short_term_loans_receivable', label: 'Short-term Loans Receivable' },
        { key: 'inventories_net', label: 'Net Inventories' },
        { key: 'prepayments_to_suppliers', label: 'Prepayments to Suppliers' },
        { key: 'other_current_assets', label: 'Other Current Assets' },
        
        // Assets - Long-term
        { key: 'long_term_assets', label: 'Long-term Assets (Bn. VND)' },
        { key: 'fixed_assets', label: 'Fixed Assets' },
        { key: 'long_term_investments', label: 'Long-term Investments' },
        { key: 'investment_properties', label: 'Investment in Properties' },
        { key: 'long_term_loans_receivable', label: 'Long-term Loans Receivable' },
        { key: 'long_term_trade_receivables', label: 'Long-term Trade Receivables' },
        { key: 'long_term_prepayments', label: 'Long-term Prepayments' },
        { key: 'goodwill', label: 'Goodwill' },
        { key: 'other_non_current_assets', label: 'Other Non-current Assets' },
        { key: 'other_long_term_assets', label: 'Other Long-term Assets' },
        
        // Total Assets
        { key: 'total_assets', label: 'Total Assets' },
        { key: 'total_resources', label: 'Total Resources' },
        
        // Liabilities
        { key: 'total_liabilities', label: 'Total Liabilities (Bn. VND)' },
        { key: 'current_liabilities', label: 'Current Liabilities' },
        { key: 'short_term_borrowings', label: 'Short-term Borrowings' },
        { key: 'advances_from_customers', label: 'Advances from Customers' },
        { key: 'long_term_liabilities', label: 'Long-term Liabilities' },
        { key: 'long_term_borrowings', label: 'Long-term Borrowings' },
        
        // Equity
        { key: 'owners_equity', label: 'Owner\'s Equity (Bn. VND)' },
        { key: 'capital_and_reserves', label: 'Capital and Reserves' },
        { key: 'paid_in_capital', label: 'Paid-in Capital' },
        { key: 'common_shares', label: 'Common Shares' },
        { key: 'investment_development_funds', label: 'Investment and Development Funds' },
        { key: 'other_reserves', label: 'Other Reserves' },
        { key: 'undistributed_earnings', label: 'Undistributed Earnings' },
        { key: 'minority_interests', label: 'Minority Interests' }
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
    
    // Define metrics to display - comprehensive cash flow line items
    const metrics = [
        // Starting Cash Flow Items
        { key: 'profit_before_tax', label: 'Net Profit/Loss Before Tax' },
        { key: 'depreciation_amortisation', label: 'Depreciation and Amortisation' },
        { key: 'provision_credit_losses', label: 'Provision for Credit Losses' },
        { key: 'unrealized_fx_gain_loss', label: 'Unrealized Foreign Exchange Gain/Loss' },
        { key: 'profit_loss_investing', label: 'Profit/Loss from Investing Activities' },
        { key: 'interest_expense', label: 'Interest Expense' },
        { key: 'operating_profit_before_wc_changes', label: 'Operating Profit Before WC Changes' },
        
        // Working Capital Changes
        { key: 'increase_decrease_receivables', label: 'Increase/Decrease in Receivables' },
        { key: 'increase_decrease_inventories', label: 'Increase/Decrease in Inventories' },
        { key: 'increase_decrease_payables', label: 'Increase/Decrease in Payables' },
        { key: 'increase_decrease_prepaid', label: 'Increase/Decrease in Prepaid Expenses' },
        
        // Operating Cash Flow
        { key: 'interest_paid', label: 'Interest Paid' },
        { key: 'business_tax_paid', label: 'Business Income Tax Paid' },
        { key: 'other_receipts_operating', label: 'Other Receipts from Operating Activities' },
        { key: 'other_payments_operating', label: 'Other Payments on Operating Activities' },
        { key: 'operating_cash_flow', label: 'Net Cash from Operating Activities' },
        
        // Investing Activities
        { key: 'purchase_fixed_assets', label: 'Purchase of Fixed Assets' },
        { key: 'proceeds_disposal_assets', label: 'Proceeds from Disposal of Fixed Assets' },
        { key: 'loans_granted', label: 'Loans Granted, Debt Instrument Purchases' },
        { key: 'collection_loans', label: 'Collection of Loans, Debt Sales Proceeds' },
        { key: 'investment_other_entities', label: 'Investment in Other Entities' },
        { key: 'proceeds_divestment', label: 'Proceeds from Divestment in Other Entities' },
        { key: 'gain_dividend', label: 'Gain on Dividend' },
        { key: 'investing_cash_flow', label: 'Net Cash from Investing Activities' },
        
        // Financing Activities
        { key: 'increase_charter_capital', label: 'Increase in Charter Capital' },
        { key: 'share_repurchases', label: 'Payments for Share Repurchases' },
        { key: 'proceeds_borrowings', label: 'Proceeds from Borrowings' },
        { key: 'repayment_borrowings', label: 'Repayment of Borrowings' },
        { key: 'dividends_paid', label: 'Dividends Paid' },
        { key: 'financing_cash_flow', label: 'Cash Flows from Financial Activities' },
        
        // Net Cash Flow
        { key: 'net_change_in_cash', label: 'Net Increase/Decrease in Cash' },
        { key: 'cash_beginning', label: 'Cash and Cash Equivalents at Beginning' },
        { key: 'fx_adjustment', label: 'Foreign Exchange Differences Adjustment' },
        { key: 'cash_end_period', label: 'Cash at End of Period' }
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

function populateRatios() {
    const ratiosData = financialData?.raw_data?.ratios || [];
    const years = financialData?.years || [];
    
    // Create table headers
    const headerRow = document.getElementById('ratiosTableHeader');
    headerRow.innerHTML = '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>';
    
    years.forEach(year => {
        headerRow.innerHTML += `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${year}</th>`;
    });
    
    // Create table body
    const tbody = document.getElementById('ratiosTableBody');
    tbody.innerHTML = '';
    
    if (ratiosData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="px-6 py-4 text-center text-gray-500">No financial ratios data available</td></tr>';
        return;
    }
    
    // Define key financial ratios to display using actual API field names
    const ratioMetrics = [
        // Valuation Ratios
        { key: 'P/E', label: 'Price-to-Earnings Ratio' },
        { key: 'P/B', label: 'Price-to-Book Ratio' },
        { key: 'P/S', label: 'Price-to-Sales Ratio' },
        { key: 'EV/EBITDA', label: 'EV/EBITDA Ratio' },
        { key: 'BVPS (VND)', label: 'Book Value per Share (VND)' },
        
        // Profitability Ratios
        { key: 'ROE (%)', label: 'Return on Equity (%)', isPercentage: true },
        { key: 'ROA (%)', label: 'Return on Assets (%)', isPercentage: true },
        { key: 'ROIC (%)', label: 'Return on Invested Capital (%)', isPercentage: true },
        { key: 'Net Profit Margin (%)', label: 'Net Profit Margin (%)', isPercentage: true },
        { key: 'Gross Profit Margin (%)', label: 'Gross Profit Margin (%)', isPercentage: true },
        { key: 'EBIT Margin (%)', label: 'EBIT Margin (%)', isPercentage: true },
        
        // Liquidity Ratios
        { key: 'Current Ratio', label: 'Current Ratio' },
        { key: 'Quick Ratio', label: 'Quick Ratio' },
        { key: 'Cash Ratio', label: 'Cash Ratio' },
        
        // Leverage Ratios
        { key: 'Debt/Equity', label: 'Debt-to-Equity Ratio' },
        { key: '(ST+LT borrowings)/Equity', label: 'Total Borrowings to Equity' },
        { key: 'Interest Coverage Ratio', label: 'Interest Coverage Ratio' },
        
        // Efficiency Ratios
        { key: 'Asset Turnover', label: 'Asset Turnover' },
        { key: 'Inventory Turnover', label: 'Inventory Turnover' },
        { key: 'Fixed Asset Turnover', label: 'Fixed Asset Turnover' },
        { key: 'Days Sales Outstanding', label: 'Days Sales Outstanding' },
        { key: 'Days Inventory Outstanding', label: 'Days Inventory Outstanding' },
        { key: 'Days Payable Outstanding', label: 'Days Payable Outstanding' },
        { key: 'Cash Cycle', label: 'Cash Conversion Cycle' }
    ];
    
    // Create year-indexed data for easier access
    const ratiosByYear = {};
    ratiosData.forEach(ratio => {
        ratiosByYear[ratio.Year] = ratio;
    });
    
    ratioMetrics.forEach(metric => {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${metric.label}</td>`;
        
        years.forEach(year => {
            const yearData = ratiosByYear[year];
            const value = yearData ? yearData[metric.key] : null;
            const formattedValue = metric.isPercentage ? formatPercentage(value) : formatNumber(value);
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