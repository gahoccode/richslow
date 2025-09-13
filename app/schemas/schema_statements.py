from typing import Any

from pydantic import BaseModel, Field

from app.schemas.schema_common import AnalysisRequest


class StatementsRequest(AnalysisRequest):
    pass


class FinancialStatement(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol")
    year_report: int = Field(..., description="Report year")
    data: dict[str, Any] = Field(..., description="Financial statement data")


class IncomeStatementData(BaseModel):
    # Meta fields
    ticker: str | None = Field(None, description="Stock ticker symbol")
    year_report: int | None = Field(None, description="Report year")

    # Revenue and Sales
    revenue: float | None = Field(None, description="Total revenue in billions VND")
    revenue_yoy: float | None = Field(
        None, description="Revenue year-over-year growth %"
    )
    sales: float | None = Field(None, description="Gross sales")
    sales_deductions: float | None = Field(None, description="Sales deductions")
    net_sales: float | None = Field(None, description="Net sales")

    # Costs and Expenses
    cost_of_sales: float | None = Field(None, description="Cost of sales")
    selling_expenses: float | None = Field(None, description="Selling expenses")
    general_admin_expenses: float | None = Field(
        None, description="General & administrative expenses"
    )

    # Profit Metrics
    gross_profit: float | None = Field(None, description="Gross profit")
    operating_profit: float | None = Field(None, description="Operating profit/loss")
    profit_before_tax: float | None = Field(None, description="Profit before tax")
    net_profit: float | None = Field(None, description="Net profit for the year")

    # Attributable Profits
    attributable_to_parent: float | None = Field(
        None, description="Profit attributable to parent company"
    )
    attributable_to_parent_vnd: float | None = Field(
        None, description="Attributable to parent (Bn. VND)"
    )
    attributable_to_parent_yoy: float | None = Field(
        None, description="Attributable to parent YoY %"
    )
    minority_interest: float | None = Field(None, description="Minority interest")

    # Financial Income/Expenses
    financial_income: float | None = Field(None, description="Financial income")
    financial_expenses: float | None = Field(None, description="Financial expenses")
    interest_expenses: float | None = Field(None, description="Interest expenses")

    # Tax
    business_tax_current: float | None = Field(
        None, description="Current business income tax"
    )
    business_tax_deferred: float | None = Field(
        None, description="Deferred business income tax"
    )

    # Other Income
    other_income: float | None = Field(None, description="Other income")
    other_income_expenses: float | None = Field(
        None, description="Other income/expenses"
    )
    net_other_income: float | None = Field(
        None, description="Net other income/expenses"
    )

    # Investment Related
    gain_loss_joint_ventures: float | None = Field(
        None, description="Gain/(loss) from joint ventures"
    )
    net_income_associated_companies: float | None = Field(
        None, description="Net income from associated companies"
    )


class BalanceSheetData(BaseModel):
    # Meta fields
    ticker: str | None = Field(None, description="Stock ticker symbol")
    year_report: int | None = Field(None, description="Report year")

    # Assets - Current
    current_assets: float | None = Field(None, description="Total current assets")
    cash_and_equivalents: float | None = Field(
        None, description="Cash and cash equivalents"
    )
    short_term_investments: float | None = Field(
        None, description="Short-term investments"
    )
    accounts_receivable: float | None = Field(
        None, description="Accounts receivable"
    )
    short_term_loans_receivable: float | None = Field(
        None, description="Short-term loans receivable"
    )
    inventories_net: float | None = Field(None, description="Net inventories")
    net_inventories: float | None = Field(None, description="Net inventories alt")
    prepayments_to_suppliers: float | None = Field(
        None, description="Prepayments to suppliers"
    )
    other_current_assets: float | None = Field(
        None, description="Other current assets"
    )
    other_current_assets_vnd: float | None = Field(
        None, description="Other current assets (VND)"
    )

    # Assets - Long-term
    long_term_assets: float | None = Field(
        None, description="Total long-term assets"
    )
    fixed_assets: float | None = Field(None, description="Fixed assets")
    long_term_investments: float | None = Field(
        None, description="Long-term investments"
    )
    investment_properties: float | None = Field(
        None, description="Investment in properties"
    )
    long_term_loans_receivable: float | None = Field(
        None, description="Long-term loans receivable"
    )
    long_term_trade_receivables: float | None = Field(
        None, description="Long-term trade receivables"
    )
    long_term_prepayments: float | None = Field(
        None, description="Long-term prepayments"
    )
    goodwill: float | None = Field(None, description="Goodwill")
    other_non_current_assets: float | None = Field(
        None, description="Other non-current assets"
    )
    other_long_term_assets: float | None = Field(
        None, description="Other long-term assets"
    )
    other_long_term_receivables: float | None = Field(
        None, description="Other long-term receivables"
    )

    # Total Assets
    total_assets: float | None = Field(None, description="Total assets")
    total_resources: float | None = Field(None, description="Total resources")

    # Liabilities
    total_liabilities: float | None = Field(None, description="Total liabilities")
    current_liabilities: float | None = Field(
        None, description="Current liabilities"
    )
    short_term_borrowings: float | None = Field(
        None, description="Short-term borrowings"
    )
    advances_from_customers: float | None = Field(
        None, description="Advances from customers"
    )
    long_term_liabilities: float | None = Field(
        None, description="Long-term liabilities"
    )
    long_term_borrowings: float | None = Field(
        None, description="Long-term borrowings"
    )

    # Equity
    owners_equity: float | None = Field(None, description="Owner's equity")
    capital_and_reserves: float | None = Field(
        None, description="Capital and reserves"
    )
    paid_in_capital: float | None = Field(None, description="Paid-in capital")
    common_shares: float | None = Field(None, description="Common shares")
    investment_development_funds: float | None = Field(
        None, description="Investment and development funds"
    )
    other_reserves: float | None = Field(None, description="Other reserves")
    undistributed_earnings: float | None = Field(
        None, description="Undistributed earnings"
    )
    minority_interests: float | None = Field(None, description="Minority interests")


class CashFlowData(BaseModel):
    # Meta fields
    ticker: str | None = Field(None, description="Stock ticker symbol")
    year_report: int | None = Field(None, description="Report year")

    # Starting Cash Flow Items
    profit_before_tax: float | None = Field(
        None, description="Net profit/loss before tax"
    )
    depreciation_amortisation: float | None = Field(
        None, description="Depreciation and amortisation"
    )
    provision_credit_losses: float | None = Field(
        None, description="Provision for credit losses"
    )
    unrealized_fx_gain_loss: float | None = Field(
        None, description="Unrealized foreign exchange gain/loss"
    )
    profit_loss_investing: float | None = Field(
        None, description="Profit/loss from investing activities"
    )
    interest_expense: float | None = Field(None, description="Interest expense")
    operating_profit_before_wc_changes: float | None = Field(
        None, description="Operating profit before working capital changes"
    )

    # Working Capital Changes
    increase_decrease_receivables: float | None = Field(
        None, description="Increase/decrease in receivables"
    )
    increase_decrease_inventories: float | None = Field(
        None, description="Increase/decrease in inventories"
    )
    increase_decrease_payables: float | None = Field(
        None, description="Increase/decrease in payables"
    )
    increase_decrease_prepaid: float | None = Field(
        None, description="Increase/decrease in prepaid expenses"
    )

    # Operating Cash Flow
    interest_paid: float | None = Field(None, description="Interest paid")
    business_tax_paid: float | None = Field(
        None, description="Business income tax paid"
    )
    other_receipts_operating: float | None = Field(
        None, description="Other receipts from operating activities"
    )
    other_payments_operating: float | None = Field(
        None, description="Other payments on operating activities"
    )
    operating_cash_flow: float | None = Field(
        None, description="Net cash from operating activities"
    )

    # Investing Activities
    purchase_fixed_assets: float | None = Field(
        None, description="Purchase of fixed assets"
    )
    proceeds_disposal_assets: float | None = Field(
        None, description="Proceeds from disposal of fixed assets"
    )
    loans_granted: float | None = Field(
        None, description="Loans granted, debt instrument purchases"
    )
    collection_loans: float | None = Field(
        None, description="Collection of loans, debt sales proceeds"
    )
    investment_other_entities: float | None = Field(
        None, description="Investment in other entities"
    )
    proceeds_divestment: float | None = Field(
        None, description="Proceeds from divestment in other entities"
    )
    gain_dividend: float | None = Field(None, description="Gain on dividend")
    investing_cash_flow: float | None = Field(
        None, description="Net cash from investing activities"
    )

    # Financing Activities
    increase_charter_capital: float | None = Field(
        None, description="Increase in charter capital"
    )
    share_repurchases: float | None = Field(
        None, description="Payments for share repurchases"
    )
    proceeds_borrowings: float | None = Field(
        None, description="Proceeds from borrowings"
    )
    repayment_borrowings: float | None = Field(
        None, description="Repayment of borrowings"
    )
    dividends_paid: float | None = Field(None, description="Dividends paid")
    financing_cash_flow: float | None = Field(
        None, description="Cash flows from financial activities"
    )

    # Net Cash Flow
    net_change_in_cash: float | None = Field(
        None, description="Net increase/decrease in cash"
    )
    cash_beginning: float | None = Field(
        None, description="Cash and cash equivalents at beginning"
    )
    fx_adjustment: float | None = Field(
        None, description="Foreign exchange differences adjustment"
    )
    cash_end_period: float | None = Field(None, description="Cash at end of period")


class FinancialStatementsResponse(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol")
    period: str = Field(..., description="Report period")
    income_statements: list[IncomeStatementData] = Field(
        ..., description="Income statement data by year"
    )
    balance_sheets: list[BalanceSheetData] = Field(
        ..., description="Balance sheet data by year"
    )
    cash_flows: list[CashFlowData] = Field(..., description="Cash flow data by year")
    years: list[int] = Field(..., description="Available years")
    raw_data: dict[str, list[dict[str, Any]]] | None = Field(
        None, description="Raw financial data"
    )


class FinancialRatiosData(BaseModel):
    year_report: int = Field(..., description="Report year")
    pe_ratio: float | None = Field(None, description="Price-to-earnings ratio")
    pb_ratio: float | None = Field(None, description="Price-to-book ratio")
    roe: float | None = Field(None, description="Return on equity")
    roa: float | None = Field(None, description="Return on assets")
    debt_to_equity: float | None = Field(None, description="Debt-to-equity ratio")
    current_ratio: float | None = Field(None, description="Current ratio")
