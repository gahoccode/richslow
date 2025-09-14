"""Pytest configuration and shared fixtures."""

import json
from pathlib import Path
from typing import Any, Dict

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_vnstock_income_data() -> pd.DataFrame:
    """Create sample vnstock income statement data for testing."""
    data = {
        "yearReport": [2023, 2022, 2021],
        "revenue": [1000000, 950000, 900000],
        "grossProfit": [400000, 380000, 360000],
        "operatingProfit": [250000, 240000, 230000],
        "netProfit": [180000, 170000, 160000],
        "eps": [1800, 1700, 1600],
    }
    return pd.DataFrame(data)


@pytest.fixture
def sample_vnstock_balance_data() -> pd.DataFrame:
    """Create sample vnstock balance sheet data for testing."""
    data = {
        "yearReport": [2023, 2022, 2021],
        "totalAssets": [2000000, 1900000, 1800000],
        "currentAssets": [800000, 760000, 720000],
        "totalLiabilities": [1200000, 1140000, 1080000],
        "ownersEquity": [800000, 760000, 720000],
        "cash": [200000, 190000, 180000],
    }
    return pd.DataFrame(data)


@pytest.fixture
def sample_vnstock_cashflow_data() -> pd.DataFrame:
    """Create sample vnstock cash flow data for testing."""
    data = {
        "yearReport": [2023, 2022, 2021],
        "operatingCashFlow": [300000, 290000, 280000],
        "investingCashFlow": [-50000, -45000, -40000],
        "financingCashFlow": [-100000, -95000, -90000],
        "netCashFlow": [150000, 150000, 150000],
    }
    return pd.DataFrame(data)


@pytest.fixture
def sample_vnstock_ratios_data() -> pd.DataFrame:
    """Create sample vnstock financial ratios data with correct column names."""
    data = {
        "yearReport": [2023, 2022, 2021],
        # Valuation Ratios
        "P/E": [15.5, 16.2, 17.0],
        "P/B": [2.1, 2.3, 2.5],
        "P/S": [3.2, 3.4, 3.6],
        "EV/EBITDA": [12.5, 13.0, 13.5],
        "BVPS (VND)": [8000, 7600, 7200],
        "Dividend yield (%)": [0.025, 0.023, 0.021],
        # Profitability Ratios
        "ROE (%)": [0.225, 0.224, 0.222],
        "ROA (%)": [0.090, 0.089, 0.089],
        "ROIC (%)": [0.125, 0.124, 0.123],
        "Gross Profit Margin (%)": [0.40, 0.40, 0.40],
        "Net Profit Margin (%)": [0.18, 0.179, 0.178],
        "EBIT Margin (%)": [0.25, 0.253, 0.256],
        # Liquidity Ratios
        "Current Ratio": [1.8, 1.9, 2.0],
        "Quick Ratio": [1.2, 1.3, 1.4],
        "Cash Ratio": [0.5, 0.6, 0.7],
        "Interest Coverage": [8.5, 8.2, 7.9],
        # Leverage Ratios
        "Debt/Equity": [0.6, 0.65, 0.7],
        "(ST+LT borrowings)/Equity": [0.45, 0.48, 0.52],
        # Activity Ratios
        "Asset Turnover": [1.2, 1.15, 1.1],
        "Fixed Asset Turnover": [2.5, 2.4, 2.3],
        "Inventory Turnover": [6.0, 5.8, 5.6],
        "Days Sales Outstanding": [45.0, 47.0, 49.0],
        "Days Inventory Outstanding": [60.0, 63.0, 65.0],
        "Days Payable Outstanding": [30.0, 32.0, 34.0],
        "Cash Cycle": [75.0, 78.0, 80.0],
    }
    return pd.DataFrame(data)


@pytest.fixture
def expected_frontend_fields() -> Dict[str, str]:
    """Expected frontend field mappings from statements.js."""
    return {
        # Valuation Ratios
        "pe_ratio": "Price-to-Earnings Ratio",
        "pb_ratio": "Price-to-Book Ratio",
        "ps_ratio": "Price-to-Sales Ratio",
        "ev_ebitda": "EV/EBITDA Ratio",
        "book_value_per_share": "Book Value per Share (VND)",
        "dividend_yield": "Dividend Yield (%)",
        # Profitability Ratios
        "roe": "Return on Equity (%)",
        "roa": "Return on Assets (%)",
        "roic": "Return on Invested Capital (%)",
        "net_profit_margin": "Net Profit Margin (%)",
        "gross_profit_margin": "Gross Profit Margin (%)",
        "ebit_margin": "EBIT Margin (%)",
        # Liquidity Ratios
        "current_ratio": "Current Ratio",
        "quick_ratio": "Quick Ratio",
        "cash_ratio": "Cash Ratio",
        "interest_coverage_ratio": "Interest Coverage Ratio",
        # Leverage Ratios
        "debt_to_equity": "Debt-to-Equity Ratio",
        "bank_loans_long_term_debt_to_equity": "Total Borrowings to Equity",
        # Efficiency Ratios
        "asset_turnover": "Asset Turnover",
        "inventory_turnover": "Inventory Turnover",
        "fixed_asset_turnover": "Fixed Asset Turnover",
        "average_collection_days": "Days Sales Outstanding",
        "average_inventory_days": "Days Inventory Outstanding",
        "average_payment_days": "Days Payable Outstanding",
        "cash_conversion_cycle": "Cash Conversion Cycle",
    }


@pytest.fixture
def sample_api_response() -> Dict[str, Any]:
    """Sample API response structure for testing."""
    return {
        "ticker": "FPT",
        "period": "year",
        "income_statements": [
            {
                "year_report": 2023,
                "revenue": 1000000,
                "gross_profit": 400000,
                "net_profit": 180000,
            }
        ],
        "balance_sheets": [
            {
                "year_report": 2023,
                "total_assets": 2000000,
                "owners_equity": 800000,
                "current_assets": 800000,
            }
        ],
        "cash_flows": [
            {
                "year_report": 2023,
                "operating_cash_flow": 300000,
                "investing_cash_flow": -50000,
                "financing_cash_flow": -100000,
            }
        ],
        "ratios": [
            {
                "year_report": 2023,
                "pe_ratio": 15.5,
                "roe": 0.225,
                "debt_to_equity": 0.6,
                "average_collection_days": 45.0,
                "cash_conversion_cycle": 75.0,
            }
        ],
        "years": [2023, 2022, 2021],
        "raw_data": {
            "income_statements": [],
            "balance_sheets": [],
            "cash_flows": [],
            "ratios": [],
        },
    }


@pytest.fixture
def sample_stock_price_data() -> pd.DataFrame:
    """Create sample stock price data for beta calculation testing."""
    dates = pd.date_range("2023-01-01", "2023-12-31", freq="D")
    # Filter to only weekdays (Monday=0 to Friday=4)
    weekdays = dates[dates.weekday < 5]
    
    data = {
        "time": weekdays,
        "close": [100 + i * 0.1 + (i % 10) * 0.5 for i in range(len(weekdays))],  # Trending with volatility
        "volume": [1000000 + i * 1000 for i in range(len(weekdays))],
    }
    df = pd.DataFrame(data)
    df.name = "FPT"
    df.category = "stock"
    return df


@pytest.fixture
def sample_vnindex_price_data() -> pd.DataFrame:
    """Create sample VNINDEX price data for beta calculation testing."""
    dates = pd.date_range("2023-01-01", "2023-12-31", freq="D")
    # Filter to only weekdays (Monday=0 to Friday=4)
    weekdays = dates[dates.weekday < 5]
    
    data = {
        "time": weekdays,
        "close": [1200 + i * 0.05 + (i % 15) * 0.3 for i in range(len(weekdays))],  # Market trend
        "volume": [50000000 + i * 10000 for i in range(len(weekdays))],
    }
    df = pd.DataFrame(data)
    df.name = "VNINDEX"
    df.category = "index"
    return df


@pytest.fixture
def sample_valuation_ratios_data() -> pd.DataFrame:
    """Create sample ratio data with market capitalization for WACC testing."""
    data = {
        "yearReport": [2023, 2022, 2021],
        "market_cap": [15000000, 14500000, 14000000],  # Market cap in millions VND
        "Market Capital (Bn. VND)": [15000, 14500, 14000],  # Alternative field name
        "pe_ratio": [15.5, 16.2, 17.0],
        "pb_ratio": [2.1, 2.3, 2.5],
        "roe": [0.225, 0.224, 0.222],
        "debt_to_equity": [0.6, 0.65, 0.7],
        "interest_coverage_ratio": [8.5, 8.2, 7.9],
    }
    return pd.DataFrame(data)


@pytest.fixture
def sample_valuation_balance_data() -> pd.DataFrame:
    """Create sample balance sheet data for WACC debt calculation."""
    data = {
        "yearReport": [2023, 2022, 2021],
        "short_term_borrowings": [2000000, 1950000, 1900000],  # Short-term debt
        "long_term_borrowings": [3000000, 2900000, 2800000],   # Long-term debt
        "owners_equity": [8000000, 7600000, 7200000],          # Book equity
        "total_assets": [15000000, 14500000, 14000000],
    }
    return pd.DataFrame(data)


@pytest.fixture
def sample_beta_metrics():
    """Create sample BetaMetrics object for testing."""
    from app.schemas.schema_valuation import BetaMetrics
    return BetaMetrics(
        ticker="FPT",
        beta=1.25,
        correlation=0.75,
        r_squared=0.56,
        volatility_stock=0.25,
        volatility_market=0.20,
        data_points_used=252,
        start_date="2023-01-01",
        end_date="2023-12-31"
    )


@pytest.fixture
def sample_wacc_metrics():
    """Create sample WACCMetrics object for testing."""
    from app.schemas.schema_valuation import WACCMetrics
    return WACCMetrics(
        ticker="FPT",
        wacc=0.085,
        cost_of_equity=0.095,
        cost_of_debt=0.056,
        market_value_equity=15000000,
        market_value_debt=5000000,
        total_value=20000000,
        equity_weight=0.75,
        debt_weight=0.25,
        tax_rate=0.20,
        risk_free_rate=0.035,
        market_risk_premium=0.05,
        beta=1.25
    )


@pytest.fixture
def expected_valuation_frontend_fields() -> Dict[str, str]:
    """Expected frontend field mappings from valuation.js."""
    return {
        # WACC Analysis
        "wacc": "Weighted Average Cost of Capital (WACC)",
        "cost_of_equity": "Cost of Equity (Re)",
        "cost_of_debt": "After-tax Cost of Debt (Rd)",
        "equity_weight": "Equity Weight (E/V)",
        "debt_weight": "Debt Weight (D/V)",
        "market_cap": "Market Value of Equity (Bn VND)",
        "total_debt": "Market Value of Debt (Bn VND)",
        "enterprise_value": "Enterprise Value (Bn VND)",
        
        # Beta Analysis
        "beta": "Beta (vs VNINDEX)",
        "correlation": "Correlation with Market",
        "r_squared": "R-squared (Statistical Quality)",
        "stock_volatility": "Stock Volatility (Annualized)",
        "market_volatility": "Market Volatility (Annualized)",
        
        # Capital Structure
        "financial_leverage": "Financial Leverage Ratio",
        "interest_coverage": "Interest Coverage Ratio",
        
        # Market Assumptions
        "risk_free_rate": "Risk-free Rate",
        "market_risk_premium": "Market Risk Premium",
        "tax_rate": "Corporate Tax Rate",
        "vietnam_corporate_tax_rate": "Vietnamese Corporate Tax Rate",
        "vietnam_risk_free_rate": "Vietnamese Risk-free Rate",
        "vietnam_market_risk_premium": "Vietnamese Market Risk Premium",
        "default_credit_spread": "Default Credit Spread",
    }


@pytest.fixture
def mock_vnstock_responses(sample_stock_price_data, sample_vnindex_price_data, 
                          sample_valuation_ratios_data, sample_valuation_balance_data):
    """Mock vnstock API responses for testing."""
    return {
        "stock_history": sample_stock_price_data,
        "market_history": sample_vnindex_price_data,
        "ratios": sample_valuation_ratios_data,
        "balance_sheet": sample_valuation_balance_data,
    }