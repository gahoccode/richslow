"""
Valuation API routes providing modular endpoints for beta, WACC, and complete valuation analysis.

These endpoints are designed for reusability across multiple applications and can be
consumed by external systems via REST API calls or imported directly.
"""

import logging
from typing import Any

import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from app.schemas.schema_valuation import (
    BetaResponse,
    ValuationResponse,
    WACCResponse,
)
from app.services.service_valuation import (
    calculate_beta,
    calculate_valuation_suite,
    calculate_wacc,
    get_market_assumptions,
    validate_ticker_data_availability,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Valuation Analysis"])


@router.get("/beta/{ticker}", response_model=BetaResponse)
async def get_beta_analysis(
    ticker: str,
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    market_symbol: str = Query(
        "VNINDEX", description="Market index for beta calculation"
    ),
) -> BetaResponse:
    """
    Calculate beta coefficient for a stock versus market index.

    Lightweight endpoint for beta-only analysis, designed for external applications
    that need just beta calculations without full valuation metrics.

    **Reusability Features:**
    - Standalone beta calculation independent of other metrics
    - Configurable market benchmark (defaults to VNINDEX)
    - Data quality metrics for validation
    - Can be consumed by portfolio analysis tools, risk management systems

    **Data Alignment Guarantees:**
    - Uses inner join to ensure perfect date alignment between stock and market
    - Returns actual trading days used in calculation
    - Provides correlation and R-squared for quality assessment
    """
    try:
        logger.info(
            f"Beta analysis request: {ticker} vs {market_symbol} ({start_date} to {end_date})"
        )

        # Calculate beta with data alignment
        beta_metrics = calculate_beta(ticker, start_date, end_date, market_symbol)

        # Data quality metrics for external applications
        data_quality = {
            "trading_days_analyzed": beta_metrics.data_points_used,
            "correlation_strength": "Strong"
            if abs(beta_metrics.correlation) > 0.7
            else "Moderate"
            if abs(beta_metrics.correlation) > 0.4
            else "Weak",
            "statistical_significance": "High"
            if beta_metrics.r_squared > 0.5
            else "Medium"
            if beta_metrics.r_squared > 0.25
            else "Low",
            "volatility_ratio": beta_metrics.volatility_stock
            / beta_metrics.volatility_market,
            "analysis_period_days": (
                pd.to_datetime(end_date) - pd.to_datetime(start_date)
            ).days
            if "pd" in globals()
            else "N/A",
        }

        return BetaResponse(
            ticker=ticker,
            period=f"{start_date} to {end_date}",
            beta_metrics=beta_metrics,
            data_quality=data_quality,
        )

    except ValueError as e:
        logger.error(f"Beta calculation validation error for {ticker}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.error(f"Beta calculation failed for {ticker}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Beta calculation failed: {str(e)}"
        ) from e


@router.get("/wacc/{ticker}", response_model=WACCResponse)
async def get_wacc_analysis(
    ticker: str,
    start_date: str = Query(..., description="Start date for beta calculation"),
    end_date: str = Query(..., description="End date for beta calculation"),
    period: str = Query("year", description="Financial data period (year or quarter)"),
    risk_free_rate: float | None = Query(
        None, description="Override default risk-free rate"
    ),
    market_risk_premium: float | None = Query(
        None, description="Override default market risk premium"
    ),
    credit_spread: float | None = Query(
        None, description="Override default credit spread"
    ),
) -> WACCResponse:
    """
    Calculate Weighted Average Cost of Capital (WACC) for a company.

    Comprehensive cost of capital analysis endpoint designed for financial analysis
    applications, valuation models, and investment decision tools.

    **Reusability Features:**
    - Standalone WACC calculation with customizable parameters
    - Market assumption overrides for sensitivity analysis
    - Detailed component breakdown for external modeling
    - Can be consumed by DCF models, investment tools, academic research

    **Vietnamese Market Specifics:**
    - Uses Vietnamese corporate tax rate (20%)
    - Defaults to Vietnamese government bond yield as risk-free rate
    - VNINDEX-based market risk premium
    - Book value of debt as market value proxy (standard practice)
    """
    try:
        logger.info(f"WACC analysis request: {ticker} (period: {period})")

        # Calculate WACC with optional parameter overrides
        wacc_metrics = calculate_wacc(
            ticker=ticker,
            start_date=start_date,
            end_date=end_date,
            period=period,
            risk_free_rate=risk_free_rate,
            market_risk_premium=market_risk_premium,
            credit_spread=credit_spread,
        )

        # Market assumptions used (helpful for external applications)
        assumptions = {
            "risk_free_rate": wacc_metrics.risk_free_rate,
            "market_risk_premium": wacc_metrics.market_risk_premium,
            "tax_rate": wacc_metrics.tax_rate,
            "beta": wacc_metrics.beta,
        }

        return WACCResponse(
            ticker=ticker,
            period=f"{period} data with beta from {start_date} to {end_date}",
            wacc_metrics=wacc_metrics,
            assumptions=assumptions,
        )

    except ValueError as e:
        logger.error(f"WACC calculation validation error for {ticker}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.error(f"WACC calculation failed for {ticker}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"WACC calculation failed: {str(e)}"
        ) from e


@router.get("/valuation/{ticker}", response_model=ValuationResponse)
async def get_complete_valuation(
    ticker: str,
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    period: str = Query("year", description="Financial data period (year or quarter)"),
    include_raw_data: bool = Query(False, description="Include raw calculation data"),
) -> ValuationResponse:
    """
    Complete valuation analysis combining beta, WACC, and additional financial metrics.

    Comprehensive endpoint designed for financial analysis applications that need
    complete valuation assessment with time series data.

    **Reusability Features:**
    - Complete valuation suite in single API call
    - Time series analysis across multiple periods
    - Summary metrics for dashboard applications
    - Raw data option for detailed analysis and debugging
    - Can be consumed by investment platforms, research tools, portfolio managers

    **Analysis Components:**
    - Beta analysis with statistical quality metrics
    - WACC calculation with component breakdown
    - Risk metrics (volatility, leverage, coverage ratios)
    - Market valuation metrics
    - Data quality assessments
    """
    try:
        logger.info(
            f"Complete valuation request: {ticker} ({start_date} to {end_date}, period: {period})"
        )

        # Calculate complete valuation suite
        valuation_metrics = calculate_valuation_suite(
            ticker, start_date, end_date, period
        )

        if not valuation_metrics:
            raise HTTPException(
                status_code=404, detail=f"No valuation data available for {ticker}"
            )

        # Extract years for time series analysis
        years = [
            metric.year_report for metric in valuation_metrics if metric.year_report
        ]
        years = sorted(set(years)) if years else []

        # Summary metrics from latest period
        latest_metric = valuation_metrics[0] if valuation_metrics else None
        summary = {}

        if latest_metric:
            summary = {
                "latest_wacc": latest_metric.wacc,
                "latest_beta": latest_metric.beta,
                "latest_market_cap": latest_metric.market_cap,
                "debt_to_total_capital": latest_metric.debt_weight,
                "equity_to_total_capital": latest_metric.equity_weight,
                "cost_of_equity": latest_metric.cost_of_equity,
                "cost_of_debt": latest_metric.cost_of_debt,
                "enterprise_value": latest_metric.enterprise_value,
            }

        # Data quality assessment
        data_quality = {}
        if latest_metric:
            data_quality = {
                "beta_data_points": latest_metric.data_points_used,
                "beta_correlation": latest_metric.correlation,
                "beta_r_squared": latest_metric.r_squared,
                "statistical_quality": "High"
                if latest_metric.r_squared > 0.5
                else "Medium"
                if latest_metric.r_squared > 0.25
                else "Low",
                "volatility_analysis": "Complete",
                "periods_analyzed": len(valuation_metrics),
            }

        # Market assumptions used (only numeric values for schema compatibility)
        market_assumptions = get_market_assumptions()
        numeric_assumptions = {
            k: v for k, v in market_assumptions.items() if isinstance(v, (int, float))
        }

        # Optional raw data for debugging/detailed analysis
        raw_data = None
        if include_raw_data:
            raw_data = {
                "valuation_periods": [
                    {
                        "year": metric.year_report,
                        "wacc_components": {
                            "cost_of_equity": metric.cost_of_equity,
                            "cost_of_debt": metric.cost_of_debt,
                            "equity_weight": metric.equity_weight,
                            "debt_weight": metric.debt_weight,
                        },
                        "market_values": {
                            "market_cap": metric.market_cap,
                            "total_debt": metric.total_debt,
                            "enterprise_value": metric.enterprise_value,
                        },
                        "risk_metrics": {
                            "beta": metric.beta,
                            "stock_volatility": metric.stock_volatility,
                            "market_volatility": metric.market_volatility,
                        },
                    }
                    for metric in valuation_metrics
                ]
            }

        return ValuationResponse(
            ticker=ticker,
            period=f"{period} analysis from {start_date} to {end_date}",
            valuation_metrics=valuation_metrics,
            summary=summary,
            data_quality=data_quality,
            assumptions=numeric_assumptions,
            years=years,
            raw_data=raw_data,
        )

    except ValueError as e:
        logger.error(f"Valuation validation error for {ticker}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.error(f"Complete valuation failed for {ticker}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Valuation analysis failed: {str(e)}"
        ) from e


@router.get("/market-assumptions")
async def get_market_assumptions_endpoint() -> dict[str, Any]:
    """
    Get current market assumptions used in valuation calculations.

    Utility endpoint for external applications to understand the market parameters
    and assumptions used in Vietnamese market valuation models.

    **Reusability Features:**
    - Transparent market assumptions for external modeling
    - Can be used by research tools to understand methodology
    - Helpful for sensitivity analysis and scenario modeling
    - Enables consistent assumptions across multiple applications
    """
    try:
        assumptions = get_market_assumptions()

        return {
            "assumptions": assumptions,
            "market": "Vietnam",
            "currency": "VND",
            "methodology": {
                "beta_calculation": "Covariance method vs VNINDEX",
                "cost_of_equity": "CAPM model",
                "cost_of_debt": "Risk-free rate + credit spread with tax shield",
                "market_value_debt": "Book value proxy",
                "data_alignment": "Inner join on trading dates",
            },
            "data_sources": {
                "stock_prices": "VCI via vnstock",
                "financial_statements": "VCI via vnstock",
                "market_index": "VNINDEX via vnstock",
            },
        }

    except Exception as e:
        logger.error(f"Market assumptions endpoint failed: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve market assumptions"
        ) from e


@router.get("/validate/{ticker}")
async def validate_data_availability(
    ticker: str,
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
) -> dict[str, Any]:
    """
    Validate data availability for valuation calculations.

    Pre-validation endpoint for external applications to check data completeness
    before running resource-intensive valuation calculations.

    **Reusability Features:**
    - Quick data availability check
    - Prevents failed API calls in batch processing
    - Useful for data pipeline validation
    - Can guide fallback strategies in external applications
    """
    try:
        validation_result = validate_ticker_data_availability(
            ticker, start_date, end_date
        )

        return {
            "ticker": ticker,
            "period": f"{start_date} to {end_date}",
            "validation": validation_result,
            "recommendations": {
                "min_trading_days_needed": 30,
                "min_financial_periods_needed": 1,
                "suggested_analysis_period": "1-3 years for stable beta calculation",
            }
            if validation_result.get("data_available")
            else {
                "issue": "Insufficient data available",
                "suggestions": [
                    "Try a different date range",
                    "Check if ticker symbol is correct",
                    "Verify market trading calendar",
                ],
            },
        }

    except Exception as e:
        logger.error(f"Data validation failed for {ticker}: {str(e)}")
        return {
            "ticker": ticker,
            "validation": {"data_available": False, "error": str(e)},
            "recommendations": {"issue": "Validation process failed"},
        }
