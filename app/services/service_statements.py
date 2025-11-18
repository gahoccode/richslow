
import pandas as pd
from vnstock import Vnstock
from vnstock.core.utils.transform import flatten_hierarchical_index

from app.config.field_mappings import (
    BALANCE_SHEET_MAPPINGS,
    CASH_FLOW_MAPPINGS,
    FINANCIAL_RATIOS_MAPPINGS,
    INCOME_STATEMENT_MAPPINGS,
)
from app.schemas.schema_statements import (
    BalanceSheetData,
    CashFlowData,
    FinancialRatiosData,
    FinancialStatementsResponse,
    IncomeStatementData,
    StatementsRequest,
)
from app.utils.transform import (
    apply_field_mapping,
    safe_convert_float,
    safe_get_float,
    safe_get_int,
    safe_get_str,
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

        # Updated vnstock v3+ ratio API call - removed problematic drop_levels parameter
        try:
            ratio_df = stock.finance.ratio(
                period=period_param, lang="en", flatten_columns=True, dropna=True
            )
        except TypeError:
            # Fallback to basic call if flatten_columns parameter isn't supported
            ratio_df = stock.finance.ratio(period=period_param, lang="en", dropna=True)

        # Debug logging for ratio column names
        if not ratio_df.empty:
            print(f"DEBUG - Ratio DataFrame columns: {list(ratio_df.columns)}")
            print(f"DEBUG - Ratio DataFrame shape: {ratio_df.shape}")
            print("DEBUG - Sample ratio data (first row):")
            print(ratio_df.iloc[0].to_dict() if len(ratio_df) > 0 else "No data")

        # Handle MultiIndex columns if present
        if not ratio_df.empty and isinstance(ratio_df.columns, pd.MultiIndex):
            print("DEBUG - MultiIndex detected, applying flatten_hierarchical_index")
            ratio_df = flatten_hierarchical_index(
                ratio_df, separator="_", handle_duplicates=True, drop_levels=0
            )
            print(f"DEBUG - After flattening, columns: {list(ratio_df.columns)}")

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
    """
    Process raw income statement data into structured format.

    Args:
        df: Raw DataFrame from vnstock income statement API

    Returns:
        List of validated IncomeStatementData instances

    Side Effects:
        None

    Business Rules:
        - Uses centralized field mappings from INCOME_STATEMENT_MAPPINGS
        - Safely extracts all fields with null handling
        - Validates data through Pydantic schema
    """
    statements = []

    for _, row in df.iterrows():
        # Use centralized field mappings for data extraction
        statements.append(
            IncomeStatementData(
                # Meta fields
                ticker=safe_get_str(row, INCOME_STATEMENT_MAPPINGS["ticker"]),
                year_report=safe_get_int(row, INCOME_STATEMENT_MAPPINGS["year_report"]),
                # Revenue and Sales
                revenue=apply_field_mapping(row, "revenue", INCOME_STATEMENT_MAPPINGS),
                revenue_yoy=apply_field_mapping(
                    row, "revenue_yoy", INCOME_STATEMENT_MAPPINGS
                ),
                sales=apply_field_mapping(row, "sales", INCOME_STATEMENT_MAPPINGS),
                sales_deductions=apply_field_mapping(
                    row, "sales_deductions", INCOME_STATEMENT_MAPPINGS
                ),
                net_sales=apply_field_mapping(
                    row, "net_sales", INCOME_STATEMENT_MAPPINGS
                ),
                # Costs and Expenses
                cost_of_sales=apply_field_mapping(
                    row, "cost_of_sales", INCOME_STATEMENT_MAPPINGS
                ),
                selling_expenses=apply_field_mapping(
                    row, "selling_expenses", INCOME_STATEMENT_MAPPINGS
                ),
                general_admin_expenses=apply_field_mapping(
                    row, "general_admin_expenses", INCOME_STATEMENT_MAPPINGS
                ),
                # Profit Metrics
                gross_profit=apply_field_mapping(
                    row, "gross_profit", INCOME_STATEMENT_MAPPINGS
                ),
                operating_profit=apply_field_mapping(
                    row, "operating_profit", INCOME_STATEMENT_MAPPINGS
                ),
                profit_before_tax=apply_field_mapping(
                    row, "profit_before_tax", INCOME_STATEMENT_MAPPINGS
                ),
                net_profit=apply_field_mapping(
                    row, "net_profit", INCOME_STATEMENT_MAPPINGS
                ),
                # Attributable Profits
                attributable_to_parent=apply_field_mapping(
                    row, "attributable_to_parent", INCOME_STATEMENT_MAPPINGS
                ),
                attributable_to_parent_vnd=apply_field_mapping(
                    row, "attributable_to_parent_vnd", INCOME_STATEMENT_MAPPINGS
                ),
                attributable_to_parent_yoy=apply_field_mapping(
                    row, "attributable_to_parent_yoy", INCOME_STATEMENT_MAPPINGS
                ),
                minority_interest=apply_field_mapping(
                    row, "minority_interest", INCOME_STATEMENT_MAPPINGS
                ),
                # Financial Income/Expenses
                financial_income=apply_field_mapping(
                    row, "financial_income", INCOME_STATEMENT_MAPPINGS
                ),
                financial_expenses=apply_field_mapping(
                    row, "financial_expenses", INCOME_STATEMENT_MAPPINGS
                ),
                interest_expenses=apply_field_mapping(
                    row, "interest_expenses", INCOME_STATEMENT_MAPPINGS
                ),
                # Tax
                business_tax_current=apply_field_mapping(
                    row, "business_tax_current", INCOME_STATEMENT_MAPPINGS
                ),
                business_tax_deferred=apply_field_mapping(
                    row, "business_tax_deferred", INCOME_STATEMENT_MAPPINGS
                ),
                # Other Income
                other_income=apply_field_mapping(
                    row, "other_income", INCOME_STATEMENT_MAPPINGS
                ),
                other_income_expenses=apply_field_mapping(
                    row, "other_income_expenses", INCOME_STATEMENT_MAPPINGS
                ),
                net_other_income=apply_field_mapping(
                    row, "net_other_income", INCOME_STATEMENT_MAPPINGS
                ),
                # Investment Related
                gain_loss_joint_ventures=apply_field_mapping(
                    row, "gain_loss_joint_ventures", INCOME_STATEMENT_MAPPINGS
                ),
                net_income_associated_companies=apply_field_mapping(
                    row, "net_income_associated_companies", INCOME_STATEMENT_MAPPINGS
                ),
            )
        )

    return statements


def _process_balance_sheets(df: pd.DataFrame) -> list[BalanceSheetData]:
    """
    Process raw balance sheet data into structured format.

    Args:
        df: Raw DataFrame from vnstock balance sheet API

    Returns:
        List of validated BalanceSheetData instances

    Side Effects:
        None

    Business Rules:
        - Uses centralized field mappings from BALANCE_SHEET_MAPPINGS
        - Safely extracts all fields with null handling
        - Validates data through Pydantic schema
    """
    sheets = []

    for _, row in df.iterrows():
        # Use centralized field mappings for data extraction
        sheets.append(
            BalanceSheetData(
                # Meta fields
                ticker=safe_get_str(row, BALANCE_SHEET_MAPPINGS["ticker"]),
                year_report=safe_get_int(row, BALANCE_SHEET_MAPPINGS["year_report"]),
                # Assets - Current
                current_assets=apply_field_mapping(
                    row, "current_assets", BALANCE_SHEET_MAPPINGS
                ),
                cash_and_equivalents=apply_field_mapping(
                    row, "cash_and_equivalents", BALANCE_SHEET_MAPPINGS
                ),
                short_term_investments=apply_field_mapping(
                    row, "short_term_investments", BALANCE_SHEET_MAPPINGS
                ),
                accounts_receivable=apply_field_mapping(
                    row, "accounts_receivable", BALANCE_SHEET_MAPPINGS
                ),
                short_term_loans_receivable=apply_field_mapping(
                    row, "short_term_loans_receivable", BALANCE_SHEET_MAPPINGS
                ),
                inventories_net=apply_field_mapping(
                    row, "inventories_net", BALANCE_SHEET_MAPPINGS
                ),
                net_inventories=apply_field_mapping(
                    row, "net_inventories", BALANCE_SHEET_MAPPINGS
                ),
                prepayments_to_suppliers=apply_field_mapping(
                    row, "prepayments_to_suppliers", BALANCE_SHEET_MAPPINGS
                ),
                other_current_assets=apply_field_mapping(
                    row, "other_current_assets", BALANCE_SHEET_MAPPINGS
                ),
                other_current_assets_vnd=apply_field_mapping(
                    row, "other_current_assets_vnd", BALANCE_SHEET_MAPPINGS
                ),
                # Assets - Long-term
                long_term_assets=apply_field_mapping(
                    row, "long_term_assets", BALANCE_SHEET_MAPPINGS
                ),
                fixed_assets=apply_field_mapping(
                    row, "fixed_assets", BALANCE_SHEET_MAPPINGS
                ),
                long_term_investments=apply_field_mapping(
                    row, "long_term_investments", BALANCE_SHEET_MAPPINGS
                ),
                investment_properties=apply_field_mapping(
                    row, "investment_properties", BALANCE_SHEET_MAPPINGS
                ),
                long_term_loans_receivable=apply_field_mapping(
                    row, "long_term_loans_receivable", BALANCE_SHEET_MAPPINGS
                ),
                long_term_trade_receivables=apply_field_mapping(
                    row, "long_term_trade_receivables", BALANCE_SHEET_MAPPINGS
                ),
                long_term_prepayments=apply_field_mapping(
                    row, "long_term_prepayments", BALANCE_SHEET_MAPPINGS
                ),
                goodwill=apply_field_mapping(row, "goodwill", BALANCE_SHEET_MAPPINGS),
                goodwill_alt=apply_field_mapping(
                    row, "goodwill_alt", BALANCE_SHEET_MAPPINGS
                ),
                other_non_current_assets=apply_field_mapping(
                    row, "other_non_current_assets", BALANCE_SHEET_MAPPINGS
                ),
                other_long_term_assets=apply_field_mapping(
                    row, "other_long_term_assets", BALANCE_SHEET_MAPPINGS
                ),
                other_long_term_receivables=apply_field_mapping(
                    row, "other_long_term_receivables", BALANCE_SHEET_MAPPINGS
                ),
                # Total Assets
                total_assets=apply_field_mapping(
                    row, "total_assets", BALANCE_SHEET_MAPPINGS
                ),
                total_resources=apply_field_mapping(
                    row, "total_resources", BALANCE_SHEET_MAPPINGS
                ),
                # Liabilities
                total_liabilities=apply_field_mapping(
                    row, "total_liabilities", BALANCE_SHEET_MAPPINGS
                ),
                current_liabilities=apply_field_mapping(
                    row, "current_liabilities", BALANCE_SHEET_MAPPINGS
                ),
                short_term_borrowings=apply_field_mapping(
                    row, "short_term_borrowings", BALANCE_SHEET_MAPPINGS
                ),
                advances_from_customers=apply_field_mapping(
                    row, "advances_from_customers", BALANCE_SHEET_MAPPINGS
                ),
                long_term_liabilities=apply_field_mapping(
                    row, "long_term_liabilities", BALANCE_SHEET_MAPPINGS
                ),
                long_term_borrowings=apply_field_mapping(
                    row, "long_term_borrowings", BALANCE_SHEET_MAPPINGS
                ),
                convertible_bonds=apply_field_mapping(
                    row, "convertible_bonds", BALANCE_SHEET_MAPPINGS
                ),
                # Equity
                owners_equity=apply_field_mapping(
                    row, "owners_equity", BALANCE_SHEET_MAPPINGS
                ),
                capital_and_reserves=apply_field_mapping(
                    row, "capital_and_reserves", BALANCE_SHEET_MAPPINGS
                ),
                paid_in_capital=apply_field_mapping(
                    row, "paid_in_capital", BALANCE_SHEET_MAPPINGS
                ),
                common_shares=apply_field_mapping(
                    row, "common_shares", BALANCE_SHEET_MAPPINGS
                ),
                investment_development_funds=apply_field_mapping(
                    row, "investment_development_funds", BALANCE_SHEET_MAPPINGS
                ),
                other_reserves=apply_field_mapping(
                    row, "other_reserves", BALANCE_SHEET_MAPPINGS
                ),
                undistributed_earnings=apply_field_mapping(
                    row, "undistributed_earnings", BALANCE_SHEET_MAPPINGS
                ),
                minority_interests=apply_field_mapping(
                    row, "minority_interests", BALANCE_SHEET_MAPPINGS
                ),
                budget_sources_and_other_funds=apply_field_mapping(
                    row, "budget_sources_and_other_funds", BALANCE_SHEET_MAPPINGS
                ),
            )
        )

    return sheets


def _process_cash_flows(df: pd.DataFrame) -> list[CashFlowData]:
    """
    Process raw cash flow data into structured format.

    Args:
        df: Raw DataFrame from vnstock cash flow API

    Returns:
        List of validated CashFlowData instances

    Side Effects:
        None

    Business Rules:
        - Uses centralized field mappings from CASH_FLOW_MAPPINGS
        - Safely extracts all fields with null handling
        - Validates data through Pydantic schema
    """
    flows = []

    for _, row in df.iterrows():
        # Use centralized field mappings for data extraction
        flows.append(
            CashFlowData(
                # Meta fields
                ticker=safe_get_str(row, CASH_FLOW_MAPPINGS["ticker"]),
                year_report=safe_get_int(row, CASH_FLOW_MAPPINGS["year_report"]),
                # Starting Cash Flow Items
                profit_before_tax=apply_field_mapping(
                    row, "profit_before_tax", CASH_FLOW_MAPPINGS
                ),
                depreciation_amortisation=apply_field_mapping(
                    row, "depreciation_amortisation", CASH_FLOW_MAPPINGS
                ),
                provision_credit_losses=apply_field_mapping(
                    row, "provision_credit_losses", CASH_FLOW_MAPPINGS
                ),
                unrealized_fx_gain_loss=apply_field_mapping(
                    row, "unrealized_fx_gain_loss", CASH_FLOW_MAPPINGS
                ),
                profit_loss_investing=apply_field_mapping(
                    row, "profit_loss_investing", CASH_FLOW_MAPPINGS
                ),
                interest_expense=apply_field_mapping(
                    row, "interest_expense", CASH_FLOW_MAPPINGS
                ),
                operating_profit_before_wc_changes=apply_field_mapping(
                    row, "operating_profit_before_wc_changes", CASH_FLOW_MAPPINGS
                ),
                # Working Capital Changes
                increase_decrease_receivables=apply_field_mapping(
                    row, "increase_decrease_receivables", CASH_FLOW_MAPPINGS
                ),
                increase_decrease_inventories=apply_field_mapping(
                    row, "increase_decrease_inventories", CASH_FLOW_MAPPINGS
                ),
                increase_decrease_payables=apply_field_mapping(
                    row, "increase_decrease_payables", CASH_FLOW_MAPPINGS
                ),
                increase_decrease_prepaid=apply_field_mapping(
                    row, "increase_decrease_prepaid", CASH_FLOW_MAPPINGS
                ),
                # Operating Cash Flow
                interest_paid=apply_field_mapping(
                    row, "interest_paid", CASH_FLOW_MAPPINGS
                ),
                business_tax_paid=apply_field_mapping(
                    row, "business_tax_paid", CASH_FLOW_MAPPINGS
                ),
                other_receipts_operating=apply_field_mapping(
                    row, "other_receipts_operating", CASH_FLOW_MAPPINGS
                ),
                other_payments_operating=apply_field_mapping(
                    row, "other_payments_operating", CASH_FLOW_MAPPINGS
                ),
                operating_cash_flow=apply_field_mapping(
                    row, "operating_cash_flow", CASH_FLOW_MAPPINGS
                ),
                # Investing Activities
                purchase_fixed_assets=apply_field_mapping(
                    row, "purchase_fixed_assets", CASH_FLOW_MAPPINGS
                ),
                proceeds_disposal_assets=apply_field_mapping(
                    row, "proceeds_disposal_assets", CASH_FLOW_MAPPINGS
                ),
                profit_loss_disposal_assets=apply_field_mapping(
                    row, "profit_loss_disposal_assets", CASH_FLOW_MAPPINGS
                ),
                loans_granted=apply_field_mapping(
                    row, "loans_granted", CASH_FLOW_MAPPINGS
                ),
                collection_loans=apply_field_mapping(
                    row, "collection_loans", CASH_FLOW_MAPPINGS
                ),
                investment_other_entities=apply_field_mapping(
                    row, "investment_other_entities", CASH_FLOW_MAPPINGS
                ),
                proceeds_divestment=apply_field_mapping(
                    row, "proceeds_divestment", CASH_FLOW_MAPPINGS
                ),
                gain_dividend=apply_field_mapping(
                    row, "gain_dividend", CASH_FLOW_MAPPINGS
                ),
                dividends_received=apply_field_mapping(
                    row, "dividends_received", CASH_FLOW_MAPPINGS
                ),
                interest_income_dividends=apply_field_mapping(
                    row, "interest_income_dividends", CASH_FLOW_MAPPINGS
                ),
                investing_cash_flow=apply_field_mapping(
                    row, "investing_cash_flow", CASH_FLOW_MAPPINGS
                ),
                # Financing Activities
                increase_charter_capital=apply_field_mapping(
                    row, "increase_charter_capital", CASH_FLOW_MAPPINGS
                ),
                share_repurchases=apply_field_mapping(
                    row, "share_repurchases", CASH_FLOW_MAPPINGS
                ),
                proceeds_borrowings=apply_field_mapping(
                    row, "proceeds_borrowings", CASH_FLOW_MAPPINGS
                ),
                repayment_borrowings=apply_field_mapping(
                    row, "repayment_borrowings", CASH_FLOW_MAPPINGS
                ),
                dividends_paid=apply_field_mapping(
                    row, "dividends_paid", CASH_FLOW_MAPPINGS
                ),
                finance_lease_principal_payments=apply_field_mapping(
                    row, "finance_lease_principal_payments", CASH_FLOW_MAPPINGS
                ),
                financing_cash_flow=apply_field_mapping(
                    row, "financing_cash_flow", CASH_FLOW_MAPPINGS
                ),
                # Net Cash Flow
                net_change_in_cash=apply_field_mapping(
                    row, "net_change_in_cash", CASH_FLOW_MAPPINGS
                ),
                cash_beginning=apply_field_mapping(
                    row, "cash_beginning", CASH_FLOW_MAPPINGS
                ),
                fx_adjustment=apply_field_mapping(
                    row, "fx_adjustment", CASH_FLOW_MAPPINGS
                ),
                cash_end_period=apply_field_mapping(
                    row, "cash_end_period", CASH_FLOW_MAPPINGS
                ),
            )
        )

    return flows


# Utility functions moved to app.utils.transform module


def _process_ratios(df: pd.DataFrame) -> list[FinancialRatiosData]:
    """
    Process raw financial ratios data into structured format.

    Args:
        df: Raw DataFrame from vnstock ratio API (after flattening MultiIndex)

    Returns:
        List of validated FinancialRatiosData instances

    Side Effects:
        None

    Business Rules:
        - Uses centralized field mappings from FINANCIAL_RATIOS_MAPPINGS
        - Expects DataFrame to be flattened (no MultiIndex columns)
        - Safely extracts all fields with null handling
        - Validates data through Pydantic schema
    """
    ratios = []

    for _, row in df.iterrows():
        # Use centralized field mappings for data extraction
        ratios.append(
            FinancialRatiosData(
                # Meta fields
                ticker=safe_get_str(row, FINANCIAL_RATIOS_MAPPINGS.get("ticker")),
                year_report=safe_get_int(row, FINANCIAL_RATIOS_MAPPINGS["year_report"]),
                length_report=safe_get_int(
                    row, FINANCIAL_RATIOS_MAPPINGS.get("length_report")
                ),
                # Valuation Ratios
                pe_ratio=apply_field_mapping(
                    row, "pe_ratio", FINANCIAL_RATIOS_MAPPINGS
                ),
                pb_ratio=apply_field_mapping(
                    row, "pb_ratio", FINANCIAL_RATIOS_MAPPINGS
                ),
                ps_ratio=apply_field_mapping(
                    row, "ps_ratio", FINANCIAL_RATIOS_MAPPINGS
                ),
                p_cash_flow=apply_field_mapping(
                    row, "p_cash_flow", FINANCIAL_RATIOS_MAPPINGS
                ),
                ev_ebitda=apply_field_mapping(
                    row, "ev_ebitda", FINANCIAL_RATIOS_MAPPINGS
                ),
                market_cap=apply_field_mapping(
                    row, "market_cap", FINANCIAL_RATIOS_MAPPINGS
                ),
                outstanding_shares=apply_field_mapping(
                    row, "outstanding_shares", FINANCIAL_RATIOS_MAPPINGS
                ),
                earnings_per_share=apply_field_mapping(
                    row, "earnings_per_share", FINANCIAL_RATIOS_MAPPINGS
                ),
                book_value_per_share=apply_field_mapping(
                    row, "book_value_per_share", FINANCIAL_RATIOS_MAPPINGS
                ),
                dividend_yield=apply_field_mapping(
                    row, "dividend_yield", FINANCIAL_RATIOS_MAPPINGS
                ),
                # Profitability Ratios
                roe=apply_field_mapping(row, "roe", FINANCIAL_RATIOS_MAPPINGS),
                roa=apply_field_mapping(row, "roa", FINANCIAL_RATIOS_MAPPINGS),
                roic=apply_field_mapping(row, "roic", FINANCIAL_RATIOS_MAPPINGS),
                gross_profit_margin=apply_field_mapping(
                    row, "gross_profit_margin", FINANCIAL_RATIOS_MAPPINGS
                ),
                net_profit_margin=apply_field_mapping(
                    row, "net_profit_margin", FINANCIAL_RATIOS_MAPPINGS
                ),
                ebit_margin=apply_field_mapping(
                    row, "ebit_margin", FINANCIAL_RATIOS_MAPPINGS
                ),
                ebitda=apply_field_mapping(row, "ebitda", FINANCIAL_RATIOS_MAPPINGS),
                ebit=apply_field_mapping(row, "ebit", FINANCIAL_RATIOS_MAPPINGS),
                # Liquidity Ratios
                current_ratio=apply_field_mapping(
                    row, "current_ratio", FINANCIAL_RATIOS_MAPPINGS
                ),
                quick_ratio=apply_field_mapping(
                    row, "quick_ratio", FINANCIAL_RATIOS_MAPPINGS
                ),
                cash_ratio=apply_field_mapping(
                    row, "cash_ratio", FINANCIAL_RATIOS_MAPPINGS
                ),
                interest_coverage_ratio=apply_field_mapping(
                    row, "interest_coverage_ratio", FINANCIAL_RATIOS_MAPPINGS
                ),
                # Leverage/Capital Structure Ratios
                debt_to_equity=apply_field_mapping(
                    row, "debt_to_equity", FINANCIAL_RATIOS_MAPPINGS
                ),
                bank_loans_long_term_debt_to_equity=apply_field_mapping(
                    row,
                    "bank_loans_long_term_debt_to_equity",
                    FINANCIAL_RATIOS_MAPPINGS,
                ),
                fixed_assets_to_equity=apply_field_mapping(
                    row, "fixed_assets_to_equity", FINANCIAL_RATIOS_MAPPINGS
                ),
                equity_to_registered_capital=apply_field_mapping(
                    row, "equity_to_registered_capital", FINANCIAL_RATIOS_MAPPINGS
                ),
                financial_leverage=apply_field_mapping(
                    row, "financial_leverage", FINANCIAL_RATIOS_MAPPINGS
                ),
                # Efficiency/Activity Ratios
                asset_turnover=apply_field_mapping(
                    row, "asset_turnover", FINANCIAL_RATIOS_MAPPINGS
                ),
                fixed_asset_turnover=apply_field_mapping(
                    row, "fixed_asset_turnover", FINANCIAL_RATIOS_MAPPINGS
                ),
                inventory_turnover=apply_field_mapping(
                    row, "inventory_turnover", FINANCIAL_RATIOS_MAPPINGS
                ),
                average_collection_days=apply_field_mapping(
                    row, "average_collection_days", FINANCIAL_RATIOS_MAPPINGS
                ),
                average_inventory_days=apply_field_mapping(
                    row, "average_inventory_days", FINANCIAL_RATIOS_MAPPINGS
                ),
                average_payment_days=apply_field_mapping(
                    row, "average_payment_days", FINANCIAL_RATIOS_MAPPINGS
                ),
                cash_conversion_cycle=apply_field_mapping(
                    row, "cash_conversion_cycle", FINANCIAL_RATIOS_MAPPINGS
                ),
            )
        )

    return ratios
