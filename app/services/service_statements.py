from typing import Any

import pandas as pd
from vnstock import Vnstock
from vnstock.core.utils.transform import flatten_hierarchical_index

from app.schemas.schema_statements import (
    BalanceSheetData,
    CashFlowData,
    FinancialRatiosData,
    FinancialStatementsResponse,
    IncomeStatementData,
    StatementsRequest,
)


def get_financial_statements(request: StatementsRequest) -> FinancialStatementsResponse:
    """
    Fetch financial statements for a given ticker using vnstock library.

    Args:
        request: StatementsRequest containing ticker, date range, and period

    Returns:
        FinancialStatementsResponse containing processed financial data

    Side Effects:
        - Makes API calls to fetch financial data from Vietnamese stock market
        - Processes raw data into structured format

    Business Rules:
        - Supports both quarterly and yearly periods
        - Returns data in English when available
        - Handles missing or invalid ticker symbols gracefully
    """
    try:
        # Initialize vnstock connection
        stock = Vnstock().stock(symbol=request.ticker.upper(), source="VCI")

        # Fetch financial data
        period_param = request.period.value

        cash_flow_df = stock.finance.cash_flow(period=period_param)
        balance_sheet_df = stock.finance.balance_sheet(
            period=period_param, lang="en", dropna=True
        )
        income_statement_df = stock.finance.income_statement(
            period=period_param, lang="en", dropna=True
        )
        ratio_df = stock.finance.ratio(period=period_param, lang="en", dropna=True)

        # Flatten MultiIndex columns in ratios DataFrame
        if not ratio_df.empty and isinstance(ratio_df.columns, pd.MultiIndex):
            ratio_df = flatten_hierarchical_index(
                ratio_df, separator="_", handle_duplicates=True, drop_levels=0
            )

        # Process income statements
        income_statements = _process_income_statements(income_statement_df)

        # Process balance sheets
        balance_sheets = _process_balance_sheets(balance_sheet_df)

        # Process cash flows
        cash_flows = _process_cash_flows(cash_flow_df)

        # Process financial ratios
        ratios = _process_ratios(ratio_df) if not ratio_df.empty else []

        # Get available years
        years = sorted(
            income_statement_df["yearReport"].unique().tolist(), reverse=True
        )

        # Prepare raw data for frontend
        raw_data = {
            "income_statements": income_statement_df.to_dict("records"),
            "balance_sheets": balance_sheet_df.to_dict("records"),
            "cash_flows": cash_flow_df.to_dict("records"),
            "ratios": ratio_df.to_dict("records") if not ratio_df.empty else [],
        }

        return FinancialStatementsResponse(
            ticker=request.ticker.upper(),
            period=request.period.value,
            income_statements=income_statements,
            balance_sheets=balance_sheets,
            cash_flows=cash_flows,
            ratios=ratios,
            years=years,
            raw_data=raw_data,
        )

    except Exception as e:
        raise ValueError(
            f"Failed to fetch financial data for {request.ticker}: {str(e)}"
        ) from e


def _process_income_statements(df: pd.DataFrame) -> list[IncomeStatementData]:
    """Process raw income statement data into structured format."""
    statements = []

    for _, row in df.iterrows():
        # Manual mapping from DataFrame columns to Pydantic fields
        statements.append(
            IncomeStatementData(
                # Meta fields
                ticker=_safe_get_str(row, "ticker"),
                year_report=_safe_get_int(row, "yearReport"),
                # Revenue and Sales
                revenue=_safe_get(row, "Revenue (Bn. VND)"),
                revenue_yoy=_safe_get(row, "Revenue YoY (%)"),
                sales=_safe_get(row, "Sales"),
                sales_deductions=_safe_get(row, "Sales deductions"),
                net_sales=_safe_get(row, "Net Sales"),
                # Costs and Expenses
                cost_of_sales=_safe_get(row, "Cost of Sales"),
                selling_expenses=_safe_get(row, "Selling Expenses"),
                general_admin_expenses=_safe_get(row, "General & Admin Expenses"),
                # Profit Metrics
                gross_profit=_safe_get(row, "Gross Profit"),
                operating_profit=_safe_get(row, "Operating Profit/Loss"),
                profit_before_tax=_safe_get(row, "Profit before tax"),
                net_profit=_safe_get(row, "Net Profit For the Year"),
                # Attributable Profits
                attributable_to_parent=_safe_get(row, "Attributable to parent company"),
                attributable_to_parent_vnd=_safe_get(
                    row, "Attribute to parent company (Bn. VND)"
                ),
                attributable_to_parent_yoy=_safe_get(
                    row, "Attribute to parent company YoY (%)"
                ),
                minority_interest=_safe_get(row, "Minority Interest"),
                # Financial Income/Expenses
                financial_income=_safe_get(row, "Financial Income"),
                financial_expenses=_safe_get(row, "Financial Expenses"),
                interest_expenses=_safe_get(row, "Interest Expenses"),
                # Tax
                business_tax_current=_safe_get(row, "Business income tax - current"),
                business_tax_deferred=_safe_get(row, "Business income tax - deferred"),
                # Other Income
                other_income=_safe_get(row, "Other income"),
                other_income_expenses=_safe_get(row, "Other Income/Expenses"),
                net_other_income=_safe_get(row, "Net other income/expenses"),
                # Investment Related
                gain_loss_joint_ventures=_safe_get(
                    row, "Gain/(loss) from joint ventures"
                ),
                net_income_associated_companies=_safe_get(
                    row, "Net income from associated companies"
                ),
            )
        )

    return statements


def _process_balance_sheets(df: pd.DataFrame) -> list[BalanceSheetData]:
    """Process raw balance sheet data into structured format."""
    sheets = []

    for _, row in df.iterrows():
        # Manual mapping from DataFrame columns to Pydantic fields
        sheets.append(
            BalanceSheetData(
                # Meta fields
                ticker=_safe_get_str(row, "ticker"),
                year_report=_safe_get_int(row, "yearReport"),
                # Assets - Current
                current_assets=_safe_get(row, "CURRENT ASSETS (Bn. VND)"),
                cash_and_equivalents=_safe_get(
                    row, "Cash and cash equivalents (Bn. VND)"
                ),
                short_term_investments=_safe_get(
                    row, "Short-term investments (Bn. VND)"
                ),
                accounts_receivable=_safe_get(row, "Accounts receivable (Bn. VND)"),
                short_term_loans_receivable=_safe_get(
                    row, "Short-term loans receivables (Bn. VND)"
                ),
                inventories_net=_safe_get(row, "Inventories, Net (Bn. VND)"),
                net_inventories=_safe_get(row, "Net Inventories"),
                prepayments_to_suppliers=_safe_get(
                    row, "Prepayments to suppliers (Bn. VND)"
                ),
                other_current_assets=_safe_get(row, "Other current assets"),
                other_current_assets_vnd=_safe_get(
                    row, "Other current assets (Bn. VND)"
                ),
                # Assets - Long-term
                long_term_assets=_safe_get(row, "LONG-TERM ASSETS (Bn. VND)"),
                fixed_assets=_safe_get(row, "Fixed assets (Bn. VND)"),
                long_term_investments=_safe_get(row, "Long-term investments (Bn. VND)"),
                investment_properties=_safe_get(row, "Investment in properties"),
                long_term_loans_receivable=_safe_get(
                    row, "Long-term loans receivables (Bn. VND)"
                ),
                long_term_trade_receivables=_safe_get(
                    row, "Long-term trade receivables (Bn. VND)"
                ),
                long_term_prepayments=_safe_get(row, "Long-term prepayments (Bn. VND)"),
                goodwill=_safe_get(row, "Good will (Bn. VND)"),
                other_non_current_assets=_safe_get(row, "Other non-current assets"),
                other_long_term_assets=_safe_get(
                    row, "Other long-term assets (Bn. VND)"
                ),
                other_long_term_receivables=_safe_get(
                    row, "Other long-term receivables (Bn. VND)"
                ),
                # Total Assets
                total_assets=_safe_get(row, "TOTAL ASSETS (Bn. VND)"),
                total_resources=_safe_get(row, "TOTAL RESOURCES (Bn. VND)"),
                # Liabilities
                total_liabilities=_safe_get(row, "LIABILITIES (Bn. VND)"),
                current_liabilities=_safe_get(row, "Current liabilities (Bn. VND)"),
                short_term_borrowings=_safe_get(row, "Short-term borrowings (Bn. VND)"),
                advances_from_customers=_safe_get(
                    row, "Advances from customers (Bn. VND)"
                ),
                long_term_liabilities=_safe_get(row, "Long-term liabilities (Bn. VND)"),
                long_term_borrowings=_safe_get(row, "Long-term borrowings (Bn. VND)"),
                # Equity
                owners_equity=_safe_get(row, "OWNER'S EQUITY(Bn.VND)"),
                capital_and_reserves=_safe_get(row, "Capital and reserves (Bn. VND)"),
                paid_in_capital=_safe_get(row, "Paid-in capital (Bn. VND)"),
                common_shares=_safe_get(row, "Common shares (Bn. VND)"),
                investment_development_funds=_safe_get(
                    row, "Investment and development funds (Bn. VND)"
                ),
                other_reserves=_safe_get(row, "Other Reserves"),
                undistributed_earnings=_safe_get(
                    row, "Undistributed earnings (Bn. VND)"
                ),
                minority_interests=_safe_get(row, "MINORITY INTERESTS"),
            )
        )

    return sheets


def _process_cash_flows(df: pd.DataFrame) -> list[CashFlowData]:
    """Process raw cash flow data into structured format."""
    flows = []

    for _, row in df.iterrows():
        # Manual mapping from DataFrame columns to Pydantic fields
        flows.append(
            CashFlowData(
                # Meta fields
                ticker=_safe_get_str(row, "ticker"),
                year_report=_safe_get_int(row, "yearReport"),
                # Starting Cash Flow Items
                profit_before_tax=_safe_get(row, "Net Profit/Loss before tax"),
                depreciation_amortisation=_safe_get(
                    row, "Depreciation and Amortisation"
                ),
                provision_credit_losses=_safe_get(row, "Provision for credit losses"),
                unrealized_fx_gain_loss=_safe_get(
                    row, "Unrealized foreign exchange gain/loss"
                ),
                profit_loss_investing=_safe_get(
                    row, "Profit/Loss from investing activities"
                ),
                interest_expense=_safe_get(row, "Interest Expense"),
                operating_profit_before_wc_changes=_safe_get(
                    row, "Operating profit before changes in working capital"
                ),
                # Working Capital Changes
                increase_decrease_receivables=_safe_get(
                    row, "Increase/Decrease in receivables"
                ),
                increase_decrease_inventories=_safe_get(
                    row, "Increase/Decrease in inventories"
                ),
                increase_decrease_payables=_safe_get(
                    row, "Increase/Decrease in payables"
                ),
                increase_decrease_prepaid=_safe_get(
                    row, "Increase/Decrease in prepaid expenses"
                ),
                # Operating Cash Flow
                interest_paid=_safe_get(row, "Interest paid"),
                business_tax_paid=_safe_get(row, "Business Income Tax paid"),
                other_receipts_operating=_safe_get(
                    row, "Other receipts from operating activities"
                ),
                other_payments_operating=_safe_get(
                    row, "Other payments on operating activities"
                ),
                operating_cash_flow=_safe_get(
                    row, "Net cash inflows/outflows from operating activities"
                ),
                # Investing Activities
                purchase_fixed_assets=_safe_get(row, "Purchase of fixed assets"),
                proceeds_disposal_assets=_safe_get(
                    row, "Proceeds from disposal of fixed assets"
                ),
                loans_granted=_safe_get(
                    row, "Loans granted, purchases of debt instruments (Bn. VND)"
                ),
                collection_loans=_safe_get(
                    row,
                    "Collection of loans, proceeds from sales of debts instruments (Bn. VND)",
                ),
                investment_other_entities=_safe_get(
                    row, "Investment in other entities"
                ),
                proceeds_divestment=_safe_get(
                    row, "Proceeds from divestment in other entities"
                ),
                gain_dividend=_safe_get(row, "Gain on Dividend"),
                investing_cash_flow=_safe_get(
                    row, "Net Cash Flows from Investing Activities"
                ),
                # Financing Activities
                increase_charter_capital=_safe_get(row, "Increase in charter captial"),
                share_repurchases=_safe_get(row, "Payments for share repurchases"),
                proceeds_borrowings=_safe_get(row, "Proceeds from borrowings"),
                repayment_borrowings=_safe_get(row, "Repayment of borrowings"),
                dividends_paid=_safe_get(row, "Dividends paid"),
                financing_cash_flow=_safe_get(
                    row, "Cash flows from financial activities"
                ),
                # Net Cash Flow
                net_change_in_cash=_safe_get(
                    row, "Net increase/decrease in cash and cash equivalents"
                ),
                cash_beginning=_safe_get(row, "Cash and cash equivalents"),
                fx_adjustment=_safe_get(row, "Foreign exchange differences Adjustment"),
                cash_end_period=_safe_get(
                    row, "Cash and Cash Equivalents at the end of period"
                ),
            )
        )

    return flows


def _safe_get(row: pd.Series, column_name: str) -> float | None:
    """Safely get a float value from pandas Series, handling NaN and missing columns."""
    try:
        value = row.get(column_name)
        if value is None or pd.isna(value):
            return None
        return float(value)
    except (ValueError, TypeError, KeyError):
        return None


def _safe_get_str(row: pd.Series, column_name: str) -> str | None:
    """Safely get a string value from pandas Series."""
    try:
        value = row.get(column_name)
        if value is None or pd.isna(value):
            return None
        return str(value)
    except (ValueError, TypeError, KeyError):
        return None


def _safe_get_int(row: pd.Series, column_name: str) -> int | None:
    """Safely get an int value from pandas Series."""
    try:
        value = row.get(column_name)
        if value is None or pd.isna(value):
            return None
        return int(value)
    except (ValueError, TypeError, KeyError):
        return None


def _safe_float(value: Any) -> float | None:
    """Safely convert value to float, return None if conversion fails."""
    if value is None or pd.isna(value):
        return None
    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def _process_ratios(df: pd.DataFrame) -> list[FinancialRatiosData]:
    """Process raw financial ratios data into structured format."""
    ratios = []

    for _, row in df.iterrows():
        # Map vnstock ratio fields to Pydantic model fields
        ratios.append(
            FinancialRatiosData(
                # Meta fields
                year_report=_safe_get_int(row, "yearReport"),
                # Valuation Ratios
                pe_ratio=_safe_get(row, "P/E"),
                pb_ratio=_safe_get(row, "P/B"),
                ps_ratio=_safe_get(row, "P/S"),
                p_cash_flow=_safe_get(row, "P/CF"),
                ev_ebitda=_safe_get(row, "EV/EBITDA"),
                market_cap=_safe_get(row, "Market Cap (Bn. VND)"),
                outstanding_shares=_safe_get(row, "Shares Outstanding (M)"),
                earnings_per_share=_safe_get(row, "EPS (VND)"),
                book_value_per_share=_safe_get(row, "BVPS (VND)"),
                dividend_yield=_safe_get(row, "Dividend Yield (%)"),
                # Profitability Ratios
                roe=_safe_get(row, "ROE (%)"),
                roa=_safe_get(row, "ROA (%)"),
                roic=_safe_get(row, "ROIC (%)"),
                gross_profit_margin=_safe_get(row, "Gross Margin (%)"),
                net_profit_margin=_safe_get(row, "Net Margin (%)"),
                ebit_margin=_safe_get(row, "EBIT Margin (%)"),
                ebitda=_safe_get(row, "EBITDA (Bn. VND)"),
                ebit=_safe_get(row, "EBIT (Bn. VND)"),
                # Liquidity Ratios
                current_ratio=_safe_get(row, "Current Ratio"),
                quick_ratio=_safe_get(row, "Quick Ratio"),
                cash_ratio=_safe_get(row, "Cash Ratio"),
                interest_coverage_ratio=_safe_get(row, "Interest Coverage"),
                # Leverage/Capital Structure Ratios
                debt_to_equity=_safe_get(row, "D/E"),
                bank_loans_long_term_debt_to_equity=_safe_get(
                    row, "(Bank Loans + Long-term Debt) / Equity"
                ),
                fixed_assets_to_equity=_safe_get(row, "Fixed Assets / Equity Capital"),
                equity_to_registered_capital=_safe_get(
                    row, "Equity Capital / Registered Capital"
                ),
                # Efficiency/Activity Ratios
                asset_turnover=_safe_get(row, "Asset Turnover"),
                fixed_asset_turnover=_safe_get(row, "Fixed Asset Turnover"),
                inventory_turnover=_safe_get(row, "Inventory Turnover"),
                average_collection_days=_safe_get(row, "Average Collection Days"),
                average_inventory_days=_safe_get(row, "Average Inventory Days"),
                average_payment_days=_safe_get(row, "Average Payment Days"),
                cash_conversion_cycle=_safe_get(row, "Cash Conversion Cycle"),
            )
        )

    return ratios
