"""Service functions for funds data processing.

This module provides business logic for retrieving and processing Vietnamese
mutual fund data from vnstock API, including fund listings, search, NAV reports,
and allocation analysis.
"""

import pandas as pd
from vnstock import Fund

from app.schemas.schema_funds import (
    FundAssetHolding,
    FundIndustryHolding,
    FundListing,
    FundNavReport,
    FundSearch,
    FundTopHolding,
)


def get_fund_listing(fund_type: str | None = None) -> list[FundListing]:
    """Get list of all funds with optional type filtering.

    Retrieves comprehensive fund information including NAV, performance metrics,
    ownership, and management fees from vnstock fund.listing() API.

    Args:
        fund_type: Optional filter - "STOCK", "BOND", "BALANCED", or None for all funds

    Returns:
        List of FundListing objects containing fund information.
        Returns empty list if no funds found.

    Raises:
        Exception: If vnstock API call fails or data processing encounters errors

    Example:
        >>> funds = get_fund_listing()  # Get all funds
        >>> stock_funds = get_fund_listing("STOCK")  # Get only stock funds
    """
    try:
        fund = Fund()
        df = fund.listing(fund_type=fund_type or "")

        if df.empty:
            return []

        results = []
        for _, row in df.iterrows():
            results.append(
                FundListing(
                    short_name=str(row.get("short_name", "")),
                    name=str(row.get("name", "")),
                    fund_type=str(row.get("fund_type", "")),
                    fund_owner_name=str(row.get("fund_owner_name", "")),
                    management_fee=float(row.get("management_fee", 0.0)),
                    inception_date=str(row["inception_date"])
                    if pd.notna(row.get("inception_date"))
                    else None,
                    nav=float(row.get("nav", 0.0)),
                    nav_change_previous=float(row.get("nav_change_previous", 0.0)),
                    nav_change_last_year=float(row["nav_change_last_year"])
                    if pd.notna(row.get("nav_change_last_year"))
                    else None,
                    nav_change_inception=float(row.get("nav_change_inception", 0.0)),
                    nav_change_1m=float(row["nav_change_1m"])
                    if pd.notna(row.get("nav_change_1m"))
                    else None,
                    nav_change_3m=float(row["nav_change_3m"])
                    if pd.notna(row.get("nav_change_3m"))
                    else None,
                    nav_change_6m=float(row["nav_change_6m"])
                    if pd.notna(row.get("nav_change_6m"))
                    else None,
                    nav_change_12m=float(row["nav_change_12m"])
                    if pd.notna(row.get("nav_change_12m"))
                    else None,
                    nav_change_24m=float(row["nav_change_24m"])
                    if pd.notna(row.get("nav_change_24m"))
                    else None,
                    nav_change_36m=float(row["nav_change_36m"])
                    if pd.notna(row.get("nav_change_36m"))
                    else None,
                    nav_change_36m_annualized=float(row["nav_change_36m_annualized"])
                    if pd.notna(row.get("nav_change_36m_annualized"))
                    else None,
                    nav_update_at=str(row.get("nav_update_at", "")),
                    fund_id_fmarket=int(row.get("fund_id_fmarket", 0)),
                    fund_code=str(row.get("fund_code", "")),
                    vsd_fee_id=str(row.get("vsd_fee_id", "")),
                )
            )

        return results
    except Exception as e:
        raise Exception(f"Failed to retrieve fund listing: {str(e)}") from e


def search_funds(symbol: str) -> list[FundSearch]:
    """Search for funds by name or abbreviation.

    Provides quick search functionality using vnstock fund.filter() API
    for autocomplete and fund discovery.

    Args:
        symbol: Partial name or abbreviation to search (e.g., "VCBF", "BCF")

    Returns:
        List of FundSearch objects containing id and short_name.
        Returns empty list if no matches found.

    Raises:
        ValueError: If symbol is empty or invalid
        Exception: If vnstock API call fails

    Example:
        >>> results = search_funds("VCBF")
        >>> # Returns funds with "VCBF" in their name
    """
    if not symbol or not symbol.strip():
        raise ValueError("Symbol parameter cannot be empty")

    try:
        fund = Fund()
        df = fund.filter(symbol=symbol)

        if df.empty:
            return []

        results = []
        for _, row in df.iterrows():
            results.append(
                FundSearch(
                    id=int(row.get("id", 0)),
                    short_name=str(row.get("shortName", "")),
                )
            )

        return results
    except ValueError:
        raise
    except Exception as e:
        raise Exception(f"Failed to search funds: {str(e)}") from e


def get_fund_nav_report(symbol: str) -> list[FundNavReport]:
    """Get historical NAV data for a fund.

    Retrieves time-series Net Asset Value data from fund inception
    using vnstock fund.details.nav_report() API for performance tracking.

    Args:
        symbol: Fund abbreviation (e.g., "VCBF-BCF")

    Returns:
        List of FundNavReport objects sorted by date (newest first).
        Returns empty list if no data available.

    Raises:
        ValueError: If symbol is invalid or fund not found
        Exception: If vnstock API call fails

    Example:
        >>> nav_data = get_fund_nav_report("VCBF-BCF")
        >>> # Returns historical NAV data with dates and values
    """
    if not symbol or not symbol.strip():
        raise ValueError("Symbol parameter cannot be empty")

    try:
        fund = Fund()
        df = fund.details.nav_report(symbol=symbol)

        if df.empty:
            return []

        results = []
        for _, row in df.iterrows():
            results.append(
                FundNavReport(
                    date=str(row.get("date", "")),
                    nav_per_unit=float(row.get("nav_per_unit", 0.0)),
                    short_name=str(row.get("short_name", "")),
                )
            )

        # Sort by date descending (newest first)
        results.sort(key=lambda x: x.date, reverse=True)

        return results
    except ValueError:
        raise
    except Exception as e:
        raise Exception(f"Failed to retrieve NAV report for {symbol}: {str(e)}") from e


def get_fund_top_holdings(symbol: str) -> list[FundTopHolding]:
    """Get top 10 holdings of a fund.

    Retrieves portfolio composition data showing the fund's largest positions
    using vnstock fund.details.top_holding() API.

    Args:
        symbol: Fund abbreviation (e.g., "VCBF-BCF")

    Returns:
        List of FundTopHolding objects with stock codes, industries, and percentages.
        Returns empty list if no holdings data available.

    Raises:
        ValueError: If symbol is invalid or fund not found
        Exception: If vnstock API call fails

    Example:
        >>> holdings = get_fund_top_holdings("VCBF-BCF")
        >>> # Returns top 10 stock holdings with allocation percentages
    """
    if not symbol or not symbol.strip():
        raise ValueError("Symbol parameter cannot be empty")

    try:
        fund = Fund()
        df = fund.details.top_holding(symbol=symbol)

        if df.empty:
            return []

        results = []
        for _, row in df.iterrows():
            results.append(
                FundTopHolding(
                    stock_code=str(row.get("stock_code", "")),
                    industry=str(row.get("industry", "")),
                    net_asset_percent=float(row.get("net_asset_percent", 0.0)),
                    type_asset=str(row.get("type_asset", "")),
                    update_at=str(row.get("update_at", "")),
                    fund_id=int(row.get("fundId", 0)),
                    short_name=str(row.get("short_name", "")),
                )
            )

        return results
    except ValueError:
        raise
    except Exception as e:
        raise Exception(
            f"Failed to retrieve top holdings for {symbol}: {str(e)}"
        ) from e


def get_fund_industry_allocation(symbol: str) -> list[FundIndustryHolding]:
    """Get industry allocation breakdown.

    Retrieves sector exposure data showing percentage allocation across
    different industries using vnstock fund.details.industry_holding() API.

    Args:
        symbol: Fund abbreviation (e.g., "VCBF-BCF")

    Returns:
        List of FundIndustryHolding objects with industry names and percentages.
        Returns empty list if no allocation data available.

    Raises:
        ValueError: If symbol is invalid or fund not found
        Exception: If vnstock API call fails

    Example:
        >>> allocation = get_fund_industry_allocation("VCBF-BCF")
        >>> # Returns industry breakdown (e.g., Banking: 25%, Technology: 15%)
    """
    if not symbol or not symbol.strip():
        raise ValueError("Symbol parameter cannot be empty")

    try:
        fund = Fund()
        df = fund.details.industry_holding(symbol=symbol)

        if df.empty:
            return []

        results = []
        for _, row in df.iterrows():
            results.append(
                FundIndustryHolding(
                    industry=str(row.get("industry", "")),
                    net_asset_percent=float(row.get("net_asset_percent", 0.0)),
                    short_name=str(row.get("short_name", "")),
                )
            )

        return results
    except ValueError:
        raise
    except Exception as e:
        raise Exception(
            f"Failed to retrieve industry allocation for {symbol}: {str(e)}"
        ) from e


def get_fund_asset_allocation(symbol: str) -> list[FundAssetHolding]:
    """Get asset class allocation.

    Retrieves asset class distribution showing allocation across stocks, bonds,
    cash equivalents, etc. using vnstock fund.details.asset_holding() API.

    Args:
        symbol: Fund abbreviation (e.g., "VCBF-BCF")

    Returns:
        List of FundAssetHolding objects with asset types and percentages.
        Returns empty list if no allocation data available.

    Raises:
        ValueError: If symbol is invalid or fund not found
        Exception: If vnstock API call fails

    Example:
        >>> allocation = get_fund_asset_allocation("VCBF-BCF")
        >>> # Returns asset breakdown (e.g., Stocks: 75%, Cash: 25%)
    """
    if not symbol or not symbol.strip():
        raise ValueError("Symbol parameter cannot be empty")

    try:
        fund = Fund()
        df = fund.details.asset_holding(symbol=symbol)

        if df.empty:
            return []

        results = []
        for _, row in df.iterrows():
            results.append(
                FundAssetHolding(
                    asset_percent=float(row.get("asset_percent", 0.0)),
                    asset_type=str(row.get("asset_type", "")),
                    short_name=str(row.get("short_name", "")),
                )
            )

        return results
    except ValueError:
        raise
    except Exception as e:
        raise Exception(
            f"Failed to retrieve asset allocation for {symbol}: {str(e)}"
        ) from e
