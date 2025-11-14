"""Company information API routes.

This module provides REST API endpoints for retrieving company information
from Vietnamese stock market data using vnstock integration.
Endpoints follow the existing patterns and provide comprehensive
company data including overview, profile, financials, and market data.
"""

from typing import Any

from fastapi import APIRouter, HTTPException, Path

from app.schemas.schema_company import (
    CompanyEventsTCBS,
    CompanyInsiderDeals,
    CompanyNews,
    CompanyOfficer,
    CompanyOverviewTCBS,
    CompanyProfile,
    CompanyRatioVCI,
    CompanyReportsVCI,
    CompanyShareholders,
    CompanySubsidiaries,
    DividendHistory,
    TradingStatsVCI,
)
from app.services.service_company import (
    get_company_dividends,
    get_company_events,
    get_company_insider_deals,
    get_company_news,
    get_company_officers,
    get_company_overview,
    get_company_profile,
    get_company_ratio_vci,
    get_company_reports_vci,
    get_company_shareholders,
    get_company_subsidiaries,
    get_company_trading_stats_vci,
)

router = APIRouter(
    prefix="/api/company",
    tags=["company"],
)


@router.get("/{ticker}/overview", response_model=CompanyOverviewTCBS)
async def get_company_overview_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> CompanyOverviewTCBS:
    """Get company overview information from TCBS.

    Retrieves basic company information including industry classification,
    shareholder details, trading statistics, and company metadata.

    Args:
        ticker: Stock ticker symbol

    Returns:
        CompanyOverviewTCBS: Company overview data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_overview(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/profile", response_model=CompanyProfile)
async def get_company_profile_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> CompanyProfile:
    """Get company profile information from TCBS.

    Retrieves detailed company profile including business description,
    company history, development strategies, and risk factors.

    Args:
        ticker: Stock ticker symbol

    Returns:
        CompanyProfile: Company profile data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_profile(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/shareholders", response_model=list[CompanyShareholders])
async def get_company_shareholders_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> list[CompanyShareholders]:
    """Get company shareholder information from TCBS.

    Retrieves list of major shareholders and their ownership percentages.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyShareholders: Shareholder data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_shareholders(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/officers", response_model=list[CompanyOfficer])
async def get_company_officers_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> list[CompanyOfficer]:
    """Get company officer information from TCBS.

    Retrieves list of company officers, management team, and their positions.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyOfficer: Officer data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_officers(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/subsidiaries", response_model=list[CompanySubsidiaries])
async def get_company_subsidiaries_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> list[CompanySubsidiaries]:
    """Get company subsidiary information from TCBS.

    Retrieves list of subsidiary companies and ownership percentages.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanySubsidiaries: Subsidiary data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_subsidiaries(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/dividends", response_model=list[DividendHistory])
async def get_company_dividends_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> list[DividendHistory]:
    """Get company dividend history from TCBS.

    Retrieves historical dividend payments and corporate actions.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of DividendHistory: Dividend data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_dividends(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/insider-deals", response_model=list[CompanyInsiderDeals])
async def get_company_insider_deals_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> list[CompanyInsiderDeals]:
    """Get company insider trading information from TCBS.

    Retrieves insider trading activities by company officers and major shareholders.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyInsiderDeals: Insider deal data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_insider_deals(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/events", response_model=list[CompanyEventsTCBS])
async def get_company_events_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> list[CompanyEventsTCBS]:
    """Get company corporate events from TCBS.

    Retrieves upcoming and past corporate events including shareholder meetings,
    dividend payments, and other corporate actions.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyEventsTCBS: Corporate event data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_events(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/news", response_model=list[CompanyNews])
async def get_company_news_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> list[CompanyNews]:
    """Get company news from TCBS.

    Retrieves recent news articles and announcements related to the company.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyNews: Company news data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_news(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/ratio", response_model=list[CompanyRatioVCI])
async def get_company_ratio_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> list[CompanyRatioVCI]:
    """Get company financial ratios from VCI.

    Retrieves comprehensive financial ratios including profitability,
    liquidity, efficiency, and valuation metrics across multiple periods.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyRatioVCI: Financial ratio data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_ratio_vci(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/reports", response_model=list[CompanyReportsVCI])
async def get_company_reports_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> list[CompanyReportsVCI]:
    """Get company financial reports from VCI.

    Retrieves available financial reports with download links and metadata.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyReportsVCI: Financial report data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_reports_vci(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e


@router.get("/{ticker}/trading-stats", response_model=TradingStatsVCI)
async def get_company_trading_stats_endpoint(
    ticker: str = Path(..., description="Stock ticker symbol (e.g., 'VCB', 'FPT')")
) -> TradingStatsVCI:
    """Get company trading statistics from VCI.

    Retrieves trading statistics including foreign ownership limits,
    price bands, and trading volume information.

    Args:
        ticker: Stock ticker symbol

    Returns:
        TradingStatsVCI: Trading statistics data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        return get_company_trading_stats_vci(ticker)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}") from e