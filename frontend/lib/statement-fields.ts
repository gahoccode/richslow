/**
 * Field metadata for financial statement displays
 * Provides labels, groupings, and formatting hints
 */

interface FieldMetadata {
  label: string;
  format: 'billion' | 'yoy' | 'percent';
  bold?: boolean;
}

interface SectionMetadata {
  label: string;
  fields: Record<string, FieldMetadata>;
}

// ============================================================================
// INCOME STATEMENT FIELDS
// ============================================================================

export const INCOME_STATEMENT_FIELDS: Record<string, SectionMetadata> = {
  REVENUE_SALES: {
    label: 'Revenue & Sales',
    fields: {
      revenue: { label: 'Revenue', format: 'billion', bold: true },
      revenue_yoy: { label: 'Revenue YoY', format: 'yoy' },
      sales: { label: 'Gross Sales', format: 'billion' },
      sales_deductions: { label: 'Sales Deductions', format: 'billion' },
      net_sales: { label: 'Net Sales', format: 'billion' },
    },
  },
  COSTS_EXPENSES: {
    label: 'Costs & Expenses',
    fields: {
      cost_of_sales: { label: 'Cost of Sales', format: 'billion' },
      selling_expenses: { label: 'Selling Expenses', format: 'billion' },
      general_admin_expenses: { label: 'General & Admin Expenses', format: 'billion' },
    },
  },
  PROFIT_METRICS: {
    label: 'Profit Metrics',
    fields: {
      gross_profit: { label: 'Gross Profit', format: 'billion', bold: true },
      operating_profit: { label: 'Operating Profit', format: 'billion', bold: true },
      profit_before_tax: { label: 'Profit Before Tax', format: 'billion' },
      net_profit: { label: 'Net Profit', format: 'billion', bold: true },
    },
  },
  ATTRIBUTABLE_PROFITS: {
    label: 'Attributable Profits',
    fields: {
      attributable_to_parent: { label: 'Attributable to Parent', format: 'billion' },
      attributable_to_parent_vnd: { label: 'Attributable to Parent (VND)', format: 'billion' },
      attributable_to_parent_yoy: { label: 'Attributable to Parent YoY', format: 'yoy' },
      minority_interest: { label: 'Minority Interest', format: 'billion' },
    },
  },
  FINANCIAL_ITEMS: {
    label: 'Financial Income & Expenses',
    fields: {
      financial_income: { label: 'Financial Income', format: 'billion' },
      financial_expenses: { label: 'Financial Expenses', format: 'billion' },
      interest_expenses: { label: 'Interest Expenses', format: 'billion' },
    },
  },
  TAX_AND_OTHER: {
    label: 'Tax & Other Income',
    fields: {
      business_tax_current: { label: 'Current Tax', format: 'billion' },
      business_tax_deferred: { label: 'Deferred Tax', format: 'billion' },
      other_income: { label: 'Other Income', format: 'billion' },
      other_income_expenses: { label: 'Other Income/Expenses', format: 'billion' },
      net_other_income: { label: 'Net Other Income', format: 'billion' },
      gain_loss_joint_ventures: { label: 'Gain/Loss from JVs', format: 'billion' },
      net_income_associated_companies: { label: 'Income from Associates', format: 'billion' },
    },
  },
};

// ============================================================================
// BALANCE SHEET FIELDS
// ============================================================================

export const BALANCE_SHEET_FIELDS: Record<string, SectionMetadata> = {
  CURRENT_ASSETS: {
    label: 'Current Assets',
    fields: {
      cash_and_equivalents: { label: 'Cash & Equivalents', format: 'billion' },
      short_term_investments: { label: 'Short-term Investments', format: 'billion' },
      accounts_receivable: { label: 'Accounts Receivable', format: 'billion' },
      short_term_loans_receivable: { label: 'Short-term Loans Receivable', format: 'billion' },
      inventories_net: { label: 'Inventories (Net)', format: 'billion' },
      net_inventories: { label: 'Net Inventories', format: 'billion' },
      prepayments_to_suppliers: { label: 'Prepayments to Suppliers', format: 'billion' },
      other_current_assets: { label: 'Other Current Assets', format: 'billion' },
      current_assets: { label: 'Total Current Assets', format: 'billion', bold: true },
    },
  },
  LONG_TERM_ASSETS: {
    label: 'Long-term Assets',
    fields: {
      fixed_assets: { label: 'Fixed Assets', format: 'billion' },
      long_term_investments: { label: 'Long-term Investments', format: 'billion' },
      investment_properties: { label: 'Investment Properties', format: 'billion' },
      long_term_loans_receivable: { label: 'Long-term Loans Receivable', format: 'billion' },
      long_term_trade_receivables: { label: 'Long-term Trade Receivables', format: 'billion' },
      long_term_prepayments: { label: 'Long-term Prepayments', format: 'billion' },
      goodwill: { label: 'Goodwill', format: 'billion' },
      goodwill_alt: { label: 'Goodwill (Alt)', format: 'billion' },
      other_non_current_assets: { label: 'Other Non-current Assets', format: 'billion' },
      other_long_term_assets: { label: 'Other Long-term Assets', format: 'billion' },
      long_term_assets: { label: 'Total Long-term Assets', format: 'billion', bold: true },
    },
  },
  TOTAL_ASSETS: {
    label: 'Total Resources',
    fields: {
      total_assets: { label: 'Total Assets', format: 'billion', bold: true },
      total_resources: { label: 'Total Resources', format: 'billion', bold: true },
    },
  },
  LIABILITIES: {
    label: 'Liabilities',
    fields: {
      short_term_borrowings: { label: 'Short-term Borrowings', format: 'billion' },
      advances_from_customers: { label: 'Advances from Customers', format: 'billion' },
      current_liabilities: { label: 'Total Current Liabilities', format: 'billion', bold: true },
      long_term_borrowings: { label: 'Long-term Borrowings', format: 'billion' },
      convertible_bonds: { label: 'Convertible Bonds', format: 'billion' },
      long_term_liabilities: { label: 'Total Long-term Liabilities', format: 'billion', bold: true },
      total_liabilities: { label: 'Total Liabilities', format: 'billion', bold: true },
    },
  },
  EQUITY: {
    label: 'Equity',
    fields: {
      paid_in_capital: { label: 'Paid-in Capital', format: 'billion' },
      common_shares: { label: 'Common Shares', format: 'billion' },
      investment_development_funds: { label: 'Investment & Development Funds', format: 'billion' },
      other_reserves: { label: 'Other Reserves', format: 'billion' },
      undistributed_earnings: { label: 'Undistributed Earnings', format: 'billion' },
      minority_interests: { label: 'Minority Interests', format: 'billion' },
      capital_and_reserves: { label: 'Capital & Reserves', format: 'billion', bold: true },
      owners_equity: { label: 'Owners\' Equity', format: 'billion', bold: true },
    },
  },
};

// ============================================================================
// CASH FLOW STATEMENT FIELDS
// ============================================================================

export const CASH_FLOW_FIELDS: Record<string, SectionMetadata> = {
  OPERATING_ACTIVITIES: {
    label: 'Operating Activities',
    fields: {
      profit_before_tax: { label: 'Profit Before Tax', format: 'billion' },
      depreciation_amortisation: { label: 'Depreciation & Amortisation', format: 'billion' },
      provision_credit_losses: { label: 'Provision for Credit Losses', format: 'billion' },
      unrealized_fx_gain_loss: { label: 'Unrealized FX Gain/Loss', format: 'billion' },
      profit_loss_investing: { label: 'Profit/Loss from Investing', format: 'billion' },
      interest_expense: { label: 'Interest Expense', format: 'billion' },
      increase_decrease_receivables: { label: 'Change in Receivables', format: 'billion' },
      increase_decrease_inventories: { label: 'Change in Inventories', format: 'billion' },
      increase_decrease_payables: { label: 'Change in Payables', format: 'billion' },
      increase_decrease_prepaid: { label: 'Change in Prepaid', format: 'billion' },
      interest_paid: { label: 'Interest Paid', format: 'billion' },
      business_tax_paid: { label: 'Tax Paid', format: 'billion' },
      other_receipts_operating: { label: 'Other Operating Receipts', format: 'billion' },
      other_payments_operating: { label: 'Other Operating Payments', format: 'billion' },
      operating_cash_flow: { label: 'Operating Cash Flow', format: 'billion', bold: true },
    },
  },
  INVESTING_ACTIVITIES: {
    label: 'Investing Activities',
    fields: {
      purchase_fixed_assets: { label: 'Purchase of Fixed Assets', format: 'billion' },
      proceeds_disposal_assets: { label: 'Proceeds from Disposal', format: 'billion' },
      loans_granted: { label: 'Loans Granted', format: 'billion' },
      collection_loans: { label: 'Collection of Loans', format: 'billion' },
      investment_other_entities: { label: 'Investment in Other Entities', format: 'billion' },
      proceeds_divestment: { label: 'Proceeds from Divestment', format: 'billion' },
      dividends_received: { label: 'Dividends Received', format: 'billion' },
      interest_income_dividends: { label: 'Interest & Dividend Income', format: 'billion' },
      investing_cash_flow: { label: 'Investing Cash Flow', format: 'billion', bold: true },
    },
  },
  FINANCING_ACTIVITIES: {
    label: 'Financing Activities',
    fields: {
      increase_charter_capital: { label: 'Increase in Charter Capital', format: 'billion' },
      proceeds_borrowings: { label: 'Proceeds from Borrowings', format: 'billion' },
      repayment_borrowings: { label: 'Repayment of Borrowings', format: 'billion' },
      dividends_paid: { label: 'Dividends Paid', format: 'billion' },
      finance_lease_principal_payments: { label: 'Finance Lease Payments', format: 'billion' },
      financing_cash_flow: { label: 'Financing Cash Flow', format: 'billion', bold: true },
    },
  },
  NET_CHANGE: {
    label: 'Net Change in Cash',
    fields: {
      net_change_in_cash: { label: 'Net Change in Cash', format: 'billion', bold: true },
      cash_beginning: { label: 'Cash at Beginning', format: 'billion' },
      fx_adjustment: { label: 'FX Adjustment', format: 'billion' },
      cash_end_period: { label: 'Cash at End of Period', format: 'billion', bold: true },
    },
  },
};
