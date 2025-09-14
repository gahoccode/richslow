"""
Valuation service functions for financial analysis.

This module provides standalone valuation calculations that can be reused
across multiple applications without web framework dependencies.
"""

import logging
from datetime import datetime
from typing import Any

import numpy as np
import pandas as pd
from vnstock import Finance, Quote
from vnstock.core.utils.transform import flatten_hierarchical_index

from app.schemas.schema_valuation import BetaMetrics, ValuationMetrics, WACCMetrics

logger = logging.getLogger(__name__)


# Vietnamese market constants
VIETNAM_CORPORATE_TAX_RATE = 0.20
VIETNAM_RISK_FREE_RATE = 0.035  # Vietnamese government bond yield estimate
VIETNAM_MARKET_RISK_PREMIUM = 0.05  # Vietnamese market risk premium estimate
DEFAULT_CREDIT_SPREAD = 0.025  # Default credit spread for Vietnamese corporates


def _safe_get(data: Any, key: str, default: Any = None) -> Any:
    """Safely extract values from nested data structures with null handling."""
    if data is None:
        return default

    if isinstance(data, dict):
        return data.get(key, default)

    if hasattr(data, key):
        value = getattr(data, key, default)
        return default if pd.isna(value) else value

    return default


def _safe_get_float(data: Any, key: str, default: float = 0.0) -> float:
    """Safely extract float values with comprehensive null handling."""
    value = _safe_get(data, key, default)

    if value is None or pd.isna(value):
        return default

    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def calculate_beta(
    ticker: str, start_date: str, end_date: str, market_symbol: str = "VNINDEX"
) -> BetaMetrics:
    """
    Calculate beta coefficient with proper timeline alignment.

    Standalone function that can be imported by external applications
    for beta analysis without web framework dependencies.

    Args:
        ticker: Stock ticker symbol (e.g., 'VCB', 'FPT')
        start_date: Start date in 'YYYY-MM-DD' format
        end_date: End date in 'YYYY-MM-DD' format
        market_symbol: Market index symbol (default: 'VNINDEX')

    Returns:
        BetaMetrics object containing beta calculation results

    Raises:
        ValueError: If insufficient data points or alignment issues
        Exception: For vnstock API errors with context

    Business Rules:
        - Minimum 30 trading days required for statistical significance
        - Uses inner join for perfect date alignment between stock and market
        - Handles Vietnamese market trading calendar and holidays
        - Calculates annualized volatilities using 252 trading days
    """
    try:
        logger.info(
            f"Calculating beta for {ticker} vs {market_symbol} from {start_date} to {end_date}"
        )

        # Fetch historical price data with identical parameters
        stock_quote = Quote(symbol=ticker, source="VCI")
        market_quote = Quote(symbol=market_symbol, source="VCI")

        stock_data = stock_quote.history(start=start_date, end=end_date, interval="1D")
        market_data = market_quote.history(
            start=start_date, end=end_date, interval="1D"
        )

        logger.info(
            f"Retrieved {len(stock_data)} stock data points and {len(market_data)} market data points"
        )

        # Align data on common trading dates only (critical for accurate beta)
        aligned = (
            stock_data[["time", "close"]]
            .rename(columns={"close": "stock_close"})
            .merge(
                market_data[["time", "close"]].rename(
                    columns={"close": "market_close"}
                ),
                on="time",
                how="inner",  # Only dates where both have data
            )
            .sort_values("time")
        )

        # Validate sufficient data points
        if len(aligned) < 30:
            raise ValueError(
                f"Insufficient aligned data points: {len(aligned)}. "
                f"Need minimum 30 trading days for meaningful beta calculation."
            )

        # Calculate daily returns on perfectly aligned data
        aligned["stock_ret"] = aligned["stock_close"].pct_change()
        aligned["market_ret"] = aligned["market_close"].pct_change()

        # Remove first row (NaN from pct_change)
        returns = aligned.dropna(subset=["stock_ret", "market_ret"])

        if len(returns) < 30:
            raise ValueError(f"Insufficient valid return observations: {len(returns)}")

        # Beta calculation using covariance method
        stock_returns = returns["stock_ret"].values
        market_returns = returns["market_ret"].values

        cov_matrix = np.cov(stock_returns, market_returns)
        beta = cov_matrix[0, 1] / cov_matrix[1, 1]

        # Statistical quality metrics
        correlation = np.corrcoef(stock_returns, market_returns)[0, 1]

        # R-squared from linear regression
        slope, intercept = np.polyfit(market_returns, stock_returns, 1)
        predicted = slope * market_returns + intercept
        ss_res = np.sum((stock_returns - predicted) ** 2)
        ss_tot = np.sum((stock_returns - np.mean(stock_returns)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0

        # Annualized volatilities (252 trading days)
        stock_volatility = np.std(stock_returns) * np.sqrt(252)
        market_volatility = np.std(market_returns) * np.sqrt(252)

        logger.info(
            f"Beta calculation completed: β={beta:.4f}, correlation={correlation:.4f}, R²={r_squared:.4f}"
        )

        return BetaMetrics(
            ticker=ticker,
            beta=beta,
            correlation=correlation,
            r_squared=r_squared,
            volatility_stock=stock_volatility,
            volatility_market=market_volatility,
            data_points_used=len(returns),
            start_date=start_date,
            end_date=end_date,
        )

    except Exception as e:
        logger.error(f"Beta calculation failed for {ticker}: {str(e)}")
        raise Exception(f"Beta calculation failed for {ticker}") from e


def calculate_wacc(
    ticker: str,
    start_date: str,
    end_date: str,
    period: str = "year",
    risk_free_rate: float | None = None,
    market_risk_premium: float | None = None,
    credit_spread: float | None = None,
) -> WACCMetrics:
    """
    Calculate Weighted Average Cost of Capital (WACC).

    Standalone function for WACC analysis that can be imported by external
    applications without web framework dependencies.

    Args:
        ticker: Stock ticker symbol
        start_date: Analysis start date
        end_date: Analysis end date
        period: Financial data period ('year' or 'quarter')
        risk_free_rate: Override default Vietnamese risk-free rate
        market_risk_premium: Override default market risk premium
        credit_spread: Override default credit spread

    Returns:
        WACCMetrics object containing WACC calculation results

    Side Effects:
        - Makes API calls to vnstock for financial data
        - Calculates beta using separate beta calculation function

    Business Rules:
        - Uses market value of equity from ratio data
        - Uses book value of debt as proxy for market value
        - Applies Vietnamese corporate tax rate (20%)
        - Uses CAPM model for cost of equity calculation
    """
    try:
        logger.info(f"Calculating WACC for {ticker}")

        # Use default Vietnamese market parameters if not provided
        rf = risk_free_rate or VIETNAM_RISK_FREE_RATE
        mrp = market_risk_premium or VIETNAM_MARKET_RISK_PREMIUM
        spread = credit_spread or DEFAULT_CREDIT_SPREAD

        # Get financial data
        finance = Finance(symbol=ticker, source="VCI")

        # Get market capitalization from ratio data
        ratio_data = finance.ratio(period=period, lang="en", dropna=True)
        balance_data = finance.balance_sheet(period=period, lang="en", dropna=True)

        if ratio_data.empty or balance_data.empty:
            raise ValueError(f"No financial data available for {ticker}")

        # Handle MultiIndex columns if present
        if isinstance(ratio_data.columns, pd.MultiIndex):
            ratio_data = flatten_hierarchical_index(
                ratio_data, separator="_", handle_duplicates=True, drop_levels=0
            )

        # Extract latest period data
        latest_ratio = ratio_data.iloc[0] if not ratio_data.empty else {}
        latest_balance = balance_data.iloc[0] if not balance_data.empty else {}

        # Market value of equity (market cap)
        market_cap = _safe_get_float(latest_ratio, "market_cap", 0)
        if market_cap == 0:
            # Try alternative field names
            market_cap = _safe_get_float(latest_ratio, "Market Capital (Bn. VND)", 0)

        if market_cap == 0:
            raise ValueError(f"Market capitalization not available for {ticker}")

        # Total debt (book value as proxy for market value)
        short_term_debt = _safe_get_float(latest_balance, "short_term_borrowings", 0)
        long_term_debt = _safe_get_float(latest_balance, "long_term_borrowings", 0)
        total_debt = short_term_debt + long_term_debt

        # Total firm value
        total_value = market_cap + total_debt

        if total_value == 0:
            raise ValueError(f"Cannot determine firm value for {ticker}")

        # Capital structure weights
        equity_weight = market_cap / total_value
        debt_weight = total_debt / total_value

        # Calculate beta for cost of equity
        beta_result = calculate_beta(ticker, start_date, end_date)
        beta = beta_result.beta

        # Cost of equity using CAPM: Re = Rf + β(Rm - Rf)
        cost_of_equity = rf + beta * mrp

        # Cost of debt (with tax shield)
        pre_tax_cost_of_debt = rf + spread
        after_tax_cost_of_debt = pre_tax_cost_of_debt * (1 - VIETNAM_CORPORATE_TAX_RATE)

        # WACC calculation: WACC = (E/V × Re) + (D/V × Rd × (1-T))
        wacc = (equity_weight * cost_of_equity) + (debt_weight * after_tax_cost_of_debt)

        logger.info(f"WACC calculation completed: {wacc:.4f} ({wacc * 100:.2f}%)")

        return WACCMetrics(
            ticker=ticker,
            wacc=wacc,
            cost_of_equity=cost_of_equity,
            cost_of_debt=after_tax_cost_of_debt,
            market_value_equity=market_cap,
            market_value_debt=total_debt,
            total_value=total_value,
            equity_weight=equity_weight,
            debt_weight=debt_weight,
            tax_rate=VIETNAM_CORPORATE_TAX_RATE,
            risk_free_rate=rf,
            market_risk_premium=mrp,
            beta=beta,
        )

    except Exception as e:
        logger.error(f"WACC calculation failed for {ticker}: {str(e)}")
        raise Exception(f"WACC calculation failed for {ticker}") from e


def calculate_valuation_suite(
    ticker: str, start_date: str, end_date: str, period: str = "year"
) -> list[ValuationMetrics]:
    """
    Calculate complete valuation analysis combining beta, WACC, and additional metrics.

    Comprehensive valuation function that can be imported by external applications
    for complete financial analysis without web framework dependencies.

    Args:
        ticker: Stock ticker symbol
        start_date: Analysis start date
        end_date: Analysis end date
        period: Financial data period ('year' or 'quarter')

    Returns:
        List of ValuationMetrics objects for available time periods

    Business Rules:
        - Combines beta analysis with WACC calculation
        - Includes additional risk and leverage metrics
        - Returns time series data when multiple periods available
        - Uses consistent market assumptions across all calculations
    """
    try:
        logger.info(f"Calculating complete valuation suite for {ticker}")

        # Calculate beta and WACC
        beta_metrics = calculate_beta(ticker, start_date, end_date)
        wacc_metrics = calculate_wacc(ticker, start_date, end_date, period)

        # Get additional financial data for risk metrics
        finance = Finance(symbol=ticker, source="VCI")
        ratio_data = finance.ratio(period=period, lang="en", dropna=True)

        valuation_results = []

        # Process available periods (typically multiple years/quarters)
        for _idx, row in ratio_data.iterrows():
            year_report = _safe_get(row, "yearReport")
            if not year_report:
                year_report = _safe_get(row, "year_report")

            # Additional risk metrics
            interest_coverage = _safe_get_float(row, "interest_coverage_ratio", None)
            financial_leverage = _safe_get_float(row, "debt_to_equity", None)

            # Enterprise Value = Market Cap + Total Debt - Cash
            enterprise_value = (
                wacc_metrics.market_value_equity + wacc_metrics.market_value_debt
            )

            valuation_metric = ValuationMetrics(
                ticker=ticker,
                year_report=int(year_report) if year_report else None,
                # Beta metrics
                beta=beta_metrics.beta,
                correlation=beta_metrics.correlation,
                r_squared=beta_metrics.r_squared,
                stock_volatility=beta_metrics.volatility_stock,
                market_volatility=beta_metrics.volatility_market,
                # WACC metrics
                wacc=wacc_metrics.wacc,
                cost_of_equity=wacc_metrics.cost_of_equity,
                cost_of_debt=wacc_metrics.cost_of_debt,
                # Market values
                market_cap=wacc_metrics.market_value_equity,
                total_debt=wacc_metrics.market_value_debt,
                enterprise_value=enterprise_value,
                # Capital structure
                equity_weight=wacc_metrics.equity_weight,
                debt_weight=wacc_metrics.debt_weight,
                # Risk metrics
                financial_leverage=financial_leverage,
                interest_coverage=interest_coverage,
                # Market assumptions
                risk_free_rate=wacc_metrics.risk_free_rate,
                market_risk_premium=wacc_metrics.market_risk_premium,
                tax_rate=wacc_metrics.tax_rate,
                # Data quality
                data_points_used=beta_metrics.data_points_used,
                start_date=start_date,
                end_date=end_date,
            )

            valuation_results.append(valuation_metric)

        logger.info(
            f"Valuation suite completed for {ticker}: {len(valuation_results)} periods analyzed"
        )
        return valuation_results

    except Exception as e:
        logger.error(f"Valuation suite calculation failed for {ticker}: {str(e)}")
        raise Exception(f"Valuation suite calculation failed for {ticker}") from e


def get_market_assumptions() -> dict[str, float]:
    """
    Get current market assumptions used in valuation calculations.

    Utility function for external applications to understand the assumptions
    used in Vietnamese market valuation models.

    Returns:
        Dictionary of market assumptions and parameters
    """
    return {
        "vietnam_corporate_tax_rate": VIETNAM_CORPORATE_TAX_RATE,
        "vietnam_risk_free_rate": VIETNAM_RISK_FREE_RATE,
        "vietnam_market_risk_premium": VIETNAM_MARKET_RISK_PREMIUM,
        "default_credit_spread": DEFAULT_CREDIT_SPREAD,
        "market_benchmark": "VNINDEX",
        "trading_days_per_year": 252,
    }


def validate_ticker_data_availability(
    ticker: str, start_date: str, end_date: str
) -> dict[str, Any]:
    """
    Validate data availability for valuation calculations.

    Utility function to check data completeness before running full valuation
    analysis. Useful for external applications to pre-validate inputs.

    Args:
        ticker: Stock ticker symbol
        start_date: Analysis start date
        end_date: Analysis end date

    Returns:
        Dictionary with data availability status and metrics
    """
    try:
        # Check price data availability
        stock_quote = Quote(symbol=ticker, source="VCI")
        price_data = stock_quote.history(start=start_date, end=end_date, interval="1D")

        # Check financial data availability
        finance = Finance(symbol=ticker, source="VCI")
        ratio_data = finance.ratio(period="year", lang="en", dropna=True)
        balance_data = finance.balance_sheet(period="year", lang="en", dropna=True)

        return {
            "ticker": ticker,
            "data_available": True,
            "price_data_points": len(price_data),
            "financial_periods_available": len(ratio_data),
            "balance_sheet_periods": len(balance_data),
            "earliest_price_date": price_data["time"].min()
            if not price_data.empty
            else None,
            "latest_price_date": price_data["time"].max()
            if not price_data.empty
            else None,
            "validation_date": datetime.now().isoformat(),
        }

    except Exception as e:
        return {
            "ticker": ticker,
            "data_available": False,
            "error": str(e),
            "validation_date": datetime.now().isoformat(),
        }
