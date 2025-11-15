"""
Field mappings from vnstock API column names to RichSlow standardized field names.

This module centralizes all field name mappings based on ACTUAL vnstock API v3.2.6 responses.
All column names are deterministic from real API calls (FPT stock, year period, lang='en').

Source: vnstock v3.2.6 API responses
Last verified: 2025-11-13
"""

# Income Statement Field Mappings
# Based on actual API response from stock.finance.income_statement(period='year', lang='en')
INCOME_STATEMENT_MAPPINGS: dict[str, str] = {
    # Meta fields
    "ticker": "ticker",
    "year_report": "yearReport",
    # Revenue and Sales
    "revenue": "Revenue (Bn. VND)",
    "revenue_yoy": "Revenue YoY (%)",
    "sales": "Sales",
    "sales_deductions": "Sales deductions",
    "net_sales": "Net Sales",
    # Costs and Expenses
    "cost_of_sales": "Cost of Sales",
    "selling_expenses": "Selling Expenses",
    "general_admin_expenses": "General & Admin Expenses",
    # Profit Metrics
    "gross_profit": "Gross Profit",
    "operating_profit": "Operating Profit/Loss",
    "profit_before_tax": "Profit before tax",
    "net_profit": "Net Profit For the Year",
    # Attributable Profits
    "attributable_to_parent": "Attributable to parent company",
    "attributable_to_parent_vnd": "Attribute to parent company (Bn. VND)",
    "attributable_to_parent_yoy": "Attribute to parent company YoY (%)",
    "minority_interest": "Minority Interest",
    # Financial Income/Expenses
    "financial_income": "Financial Income",
    "financial_expenses": "Financial Expenses",
    "interest_expenses": "Interest Expenses",
    # Tax
    "business_tax_current": "Business income tax - current",
    "business_tax_deferred": "Business income tax - deferred",
    # Other Income
    "other_income": "Other income",
    "other_income_expenses": "Other Income/Expenses",
    "net_other_income": "Net other income/expenses",
    # Investment Related
    "gain_loss_joint_ventures": "Gain/(loss) from joint ventures",
    "net_income_associated_companies": "Net income from associated companies",
}

# Balance Sheet Field Mappings
# Based on actual API response from stock.finance.balance_sheet(period='year', lang='en')
BALANCE_SHEET_MAPPINGS: dict[str, str] = {
    # Meta fields
    "ticker": "ticker",
    "year_report": "yearReport",
    # Assets - Current
    "current_assets": "CURRENT ASSETS (Bn. VND)",
    "cash_and_equivalents": "Cash and cash equivalents (Bn. VND)",
    "short_term_investments": "Short-term investments (Bn. VND)",
    "accounts_receivable": "Accounts receivable (Bn. VND)",
    "short_term_loans_receivable": "Short-term loans receivables (Bn. VND)",
    "inventories_net": "Inventories, Net (Bn. VND)",
    "net_inventories": "Net Inventories",
    "prepayments_to_suppliers": "Prepayments to suppliers (Bn. VND)",
    "other_current_assets": "Other current assets",
    "other_current_assets_vnd": "Other current assets (Bn. VND)",
    # Assets - Long-term
    "long_term_assets": "LONG-TERM ASSETS (Bn. VND)",
    "fixed_assets": "Fixed assets (Bn. VND)",
    "long_term_investments": "Long-term investments (Bn. VND)",
    "investment_properties": "Investment in properties",
    "long_term_loans_receivable": "Long-term loans receivables (Bn. VND)",
    "long_term_trade_receivables": "Long-term trade receivables (Bn. VND)",
    "long_term_prepayments": "Long-term prepayments (Bn. VND)",
    "goodwill": "Good will (Bn. VND)",
    "goodwill_alt": "Goodwill",
    "other_non_current_assets": "Other non-current assets",
    "other_long_term_assets": "Other long-term assets (Bn. VND)",
    "other_long_term_receivables": "Other long-term receivables (Bn. VND)",
    # Total Assets
    "total_assets": "TOTAL ASSETS (Bn. VND)",
    "total_resources": "TOTAL RESOURCES (Bn. VND)",
    # Liabilities
    "total_liabilities": "LIABILITIES (Bn. VND)",
    "current_liabilities": "Current liabilities (Bn. VND)",
    "short_term_borrowings": "Short-term borrowings (Bn. VND)",
    "advances_from_customers": "Advances from customers (Bn. VND)",
    "long_term_liabilities": "Long-term liabilities (Bn. VND)",
    "long_term_borrowings": "Long-term borrowings (Bn. VND)",
    "convertible_bonds": "Convertible bonds (Bn. VND)",
    # Equity
    "owners_equity": "OWNER'S EQUITY(Bn.VND)",
    "capital_and_reserves": "Capital and reserves (Bn. VND)",
    "paid_in_capital": "Paid-in capital (Bn. VND)",
    "common_shares": "Common shares (Bn. VND)",
    "investment_development_funds": "Investment and development funds (Bn. VND)",
    "other_reserves": "Other Reserves",
    "undistributed_earnings": "Undistributed earnings (Bn. VND)",
    "minority_interests": "MINORITY INTERESTS",
    # Additional fields found in API
    "budget_sources_and_other_funds": "Budget sources and other funds",
}

# Cash Flow Field Mappings
# Based on actual API response from stock.finance.cash_flow(period='year')
CASH_FLOW_MAPPINGS: dict[str, str] = {
    # Meta fields
    "ticker": "ticker",
    "year_report": "yearReport",
    # Starting Cash Flow Items
    "profit_before_tax": "Net Profit/Loss before tax",
    "depreciation_amortisation": "Depreciation and Amortisation",
    "provision_credit_losses": "Provision for credit losses",
    "unrealized_fx_gain_loss": "Unrealized foreign exchange gain/loss",
    "profit_loss_investing": "Profit/Loss from investing activities",
    "interest_expense": "Interest Expense",
    "operating_profit_before_wc_changes": "Operating profit before changes in working capital",
    # Working Capital Changes
    "increase_decrease_receivables": "Increase/Decrease in receivables",
    "increase_decrease_inventories": "Increase/Decrease in inventories",
    "increase_decrease_payables": "Increase/Decrease in payables",
    "increase_decrease_prepaid": "Increase/Decrease in prepaid expenses",
    # Operating Cash Flow
    "interest_paid": "Interest paid",
    "business_tax_paid": "Business Income Tax paid",
    "other_receipts_operating": "Other receipts from operating activities",
    "other_payments_operating": "Other payments on operating activities",
    "operating_cash_flow": "Net cash inflows/outflows from operating activities",
    # Investing Activities
    "purchase_fixed_assets": "Purchase of fixed assets",
    "proceeds_disposal_assets": "Proceeds from disposal of fixed assets",
    "profit_loss_disposal_assets": "Profit/Loss from disposal of fixed assets",
    "loans_granted": "Loans granted, purchases of debt instruments (Bn. VND)",
    "collection_loans": "Collection of loans, proceeds from sales of debts instruments (Bn. VND)",
    "investment_other_entities": "Investment in other entities",
    "proceeds_divestment": "Proceeds from divestment in other entities",
    "gain_dividend": "Gain on Dividend",
    "dividends_received": "Dividends received",
    "interest_income_dividends": "Interest income and dividends",
    "investing_cash_flow": "Net Cash Flows from Investing Activities",
    # Financing Activities
    "increase_charter_capital": "Increase in charter captial",
    "share_repurchases": "Payments for share repurchases",
    "proceeds_borrowings": "Proceeds from borrowings",
    "repayment_borrowings": "Repayment of borrowings",
    "dividends_paid": "Dividends paid",
    "financing_cash_flow": "Cash flows from financial activities",
    # Additional field found in API
    "finance_lease_principal_payments": "Finance lease principal payments",
    # Net Cash Flow
    "net_change_in_cash": "Net increase/decrease in cash and cash equivalents",
    "cash_beginning": "Cash and cash equivalents",
    "fx_adjustment": "Foreign exchange differences Adjustment",
    "cash_end_period": "Cash and Cash Equivalents at the end of period",
}

# Financial Ratios Field Mappings
# Based on actual API response from stock.finance.ratio(period='year', lang='en')
# After flattening with flatten_hierarchical_index()
FINANCIAL_RATIOS_MAPPINGS: dict[str, str] = {
    # Meta fields
    "ticker": "ticker",
    "year_report": "yearReport",
    "length_report": "lengthReport",
    # Valuation Ratios
    "pe_ratio": "P/E",
    "pb_ratio": "P/B",
    "ps_ratio": "P/S",
    "p_cash_flow": "P/Cash Flow",
    "ev_ebitda": "EV/EBITDA",
    "market_cap": "Market Capital (Bn. VND)",
    "outstanding_shares": "Outstanding Share (Mil. Shares)",
    "earnings_per_share": "EPS (VND)",
    "book_value_per_share": "BVPS (VND)",
    "dividend_yield": "Dividend yield (%)",
    # Profitability Ratios
    "roe": "ROE (%)",
    "roa": "ROA (%)",
    "roic": "ROIC (%)",
    "gross_profit_margin": "Gross Profit Margin (%)",
    "net_profit_margin": "Net Profit Margin (%)",
    "ebit_margin": "EBIT Margin (%)",
    "ebitda": "EBITDA (Bn. VND)",
    "ebit": "EBIT (Bn. VND)",
    # Liquidity Ratios
    "current_ratio": "Current Ratio",
    "quick_ratio": "Quick Ratio",
    "cash_ratio": "Cash Ratio",
    "interest_coverage_ratio": "Interest Coverage",
    # Leverage/Capital Structure Ratios
    "debt_to_equity": "Debt/Equity",
    "bank_loans_long_term_debt_to_equity": "(ST+LT borrowings)/Equity",
    "fixed_assets_to_equity": "Fixed Asset-To-Equity",
    "equity_to_registered_capital": "Owners' Equity/Charter Capital",
    # Additional leverage field found in API
    "financial_leverage": "Financial Leverage",
    # Efficiency/Activity Ratios
    "asset_turnover": "Asset Turnover",
    "fixed_asset_turnover": "Fixed Asset Turnover",
    "inventory_turnover": "Inventory Turnover",
    "average_collection_days": "Days Sales Outstanding",
    "average_inventory_days": "Days Inventory Outstanding",
    "average_payment_days": "Days Payable Outstanding",
    "cash_conversion_cycle": "Cash Cycle",
}

# Historical Prices Field Mappings
# Based on actual API response from forex/search(fx_sym='USD', source='VCB')
HISTORICAL_PRICE_MAPPINGS: dict[str, str] = {
    # Exchange Rate fields with space-containing API column names
    "buy_cash": "buy _cash",
    "buy_transfer": "buy _transfer",
    # Add other historical price field mappings as needed
    # Note: Most fields like 'sell', 'currency_code', 'currency_name' already use conventional names
}
