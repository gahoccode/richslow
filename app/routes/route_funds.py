"""API routes for funds endpoints.

This module provides RESTful API endpoints for Vietnamese mutual fund analysis,
including fund listings, search, NAV reports, and allocation data.
"""

from fastapi import APIRouter, HTTPException, Path, Query

from app.schemas.schema_funds import (
    FundAssetHolding,
    FundIndustryHolding,
    FundListing,
    FundNavReport,
    FundSearch,
    FundTopHolding,
)
from app.services.service_funds import (
    get_fund_asset_allocation,
    get_fund_industry_allocation,
    get_fund_listing,
    get_fund_nav_report,
    get_fund_top_holdings,
    search_funds,
)

router = APIRouter(
    prefix="/api/funds",
    tags=["funds"],
)


@router.get("/listing", response_model=list[FundListing])
async def get_funds_listing(
    fund_type: str | None = Query(
        None,
        description="Filter by fund type: STOCK, BOND, BALANCED, or omit for all",
    ),
) -> list[FundListing]:
    """Get list of all funds with optional type filtering.

    Retrieves comprehensive fund information including NAV, performance metrics,
    ownership, and management fees. Supports filtering by fund type.

    Args:
        fund_type: Optional filter - "STOCK", "BOND", "BALANCED", or None for all funds

    Returns:
        List of fund listings with performance data. Returns empty list if no funds found.

    Raises:
        HTTPException: 500 if API call fails

    Example:
        GET /api/funds/listing
        GET /api/funds/listing?fund_type=STOCK
    """
    try:
        return get_fund_listing(fund_type)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve fund listing: {str(e)}",
        ) from e


@router.get("/search", response_model=list[FundSearch])
async def search_funds_endpoint(
    symbol: str = Query(..., description="Fund name or abbreviation to search"),
) -> list[FundSearch]:
    """Search for funds by name or abbreviation.

    Provides quick search functionality for fund discovery and autocomplete.

    Args:
        symbol: Partial name or abbreviation to search (e.g., "VCBF", "BCF")

    Returns:
        List of matching funds with fund_id and short_name.
        Returns empty list if no matches found.

    Raises:
        HTTPException: 400 if symbol is invalid, 500 if API call fails

    Example:
        GET /api/funds/search?symbol=VCBF
    """
    try:
        return search_funds(symbol)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search funds: {str(e)}",
        ) from e


@router.get("/{symbol}/nav-report", response_model=list[FundNavReport])
async def get_nav_report_endpoint(
    symbol: str = Path(..., description="Fund abbreviation (e.g., 'VCBF-BCF')"),
) -> list[FundNavReport]:
    """Get historical NAV data for a fund.

    Retrieves time-series Net Asset Value data from fund inception
    for performance tracking and charting.

    Args:
        symbol: Fund abbreviation (e.g., "VCBF-BCF")

    Returns:
        List of historical NAV data points sorted by date (newest first).
        Returns empty list if no data available.

    Raises:
        HTTPException: 404 if fund not found, 500 if API call fails

    Example:
        GET /api/funds/VCBF-BCF/nav-report
    """
    try:
        result = get_fund_nav_report(symbol)
        if not result:
            raise ValueError(f"No NAV data found for fund: {symbol}")
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve NAV report: {str(e)}",
        ) from e


@router.get("/{symbol}/top-holdings", response_model=list[FundTopHolding])
async def get_top_holdings_endpoint(
    symbol: str = Path(..., description="Fund abbreviation (e.g., 'VCBF-BCF')"),
) -> list[FundTopHolding]:
    """Get top 10 holdings of a fund.

    Retrieves portfolio composition data showing the fund's largest positions.

    Args:
        symbol: Fund abbreviation (e.g., "VCBF-BCF")

    Returns:
        List of top holdings with stock codes, industries, and allocation percentages.
        Returns empty list if no holdings data available.

    Raises:
        HTTPException: 404 if fund not found, 500 if API call fails

    Example:
        GET /api/funds/VCBF-BCF/top-holdings
    """
    try:
        result = get_fund_top_holdings(symbol)
        if not result:
            raise ValueError(f"No holdings data found for fund: {symbol}")
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve top holdings: {str(e)}",
        ) from e


@router.get("/{symbol}/industry-allocation", response_model=list[FundIndustryHolding])
async def get_industry_allocation_endpoint(
    symbol: str = Path(..., description="Fund abbreviation (e.g., 'VCBF-BCF')"),
) -> list[FundIndustryHolding]:
    """Get industry allocation breakdown.

    Retrieves sector exposure data showing percentage allocation across industries.

    Args:
        symbol: Fund abbreviation (e.g., "VCBF-BCF")

    Returns:
        List of industry allocations with names and percentages.
        Returns empty list if no allocation data available.

    Raises:
        HTTPException: 404 if fund not found, 500 if API call fails

    Example:
        GET /api/funds/VCBF-BCF/industry-allocation
    """
    try:
        result = get_fund_industry_allocation(symbol)
        if not result:
            raise ValueError(f"No industry allocation data found for fund: {symbol}")
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve industry allocation: {str(e)}",
        ) from e


@router.get("/{symbol}/asset-allocation", response_model=list[FundAssetHolding])
async def get_asset_allocation_endpoint(
    symbol: str = Path(..., description="Fund abbreviation (e.g., 'VCBF-BCF')"),
) -> list[FundAssetHolding]:
    """Get asset class allocation.

    Retrieves asset class distribution showing allocation across stocks, bonds,
    cash equivalents, and other asset types.

    Args:
        symbol: Fund abbreviation (e.g., "VCBF-BCF")

    Returns:
        List of asset allocations with types and percentages.
        Returns empty list if no allocation data available.

    Raises:
        HTTPException: 404 if fund not found, 500 if API call fails

    Example:
        GET /api/funds/VCBF-BCF/asset-allocation
    """
    try:
        result = get_fund_asset_allocation(symbol)
        if not result:
            raise ValueError(f"No asset allocation data found for fund: {symbol}")
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve asset allocation: {str(e)}",
        ) from e
