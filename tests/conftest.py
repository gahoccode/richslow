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
