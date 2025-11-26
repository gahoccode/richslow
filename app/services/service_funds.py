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
                    fund_type=str(row.get("fund_type", "")),
                    nav=float(row["nav"]) if pd.notna(row.get("nav")) else None,
                    nav_change_1d=float(row["nav_change_1d"])
                    if pd.notna(row.get("nav_change_1d"))
                    else None,
                    nav_change_1w=float(row["nav_change_1w"])
                    if pd.notna(row.get("nav_change_1w"))
                    else None,
                    nav_change_1m=float(row["nav_change_1m"])
                    if pd.notna(row.get("nav_change_1m"))
                    else None,
                    nav_change_3m=float(row["nav_change_3m"])
                    if pd.notna(row.get("nav_change_3m"))
                    else None,
                    nav_change_6m=float(row["nav_change_6m"])
                    if pd.notna(row.get("nav_change_6m"))
                    else None,
                    nav_change_1y=float(row["nav_change_1y"])
                    if pd.notna(row.get("nav_change_1y"))
                    else None,
                    nav_change_2y=float(row["nav_change_2y"])
                    if pd.notna(row.get("nav_change_2y"))
                    else None,
                    nav_change_3y=float(row["nav_change_3y"])
                    if pd.notna(row.get("nav_change_3y"))
                    else None,
                    nav_change_1y_annualized=float(row["nav_change_1y_annualized"])
                    if pd.notna(row.get("nav_change_1y_annualized"))
                    else None,
                    nav_change_2y_annualized=float(row["nav_change_2y_annualized"])
                    if pd.notna(row.get("nav_change_2y_annualized"))
                    else None,
                    nav_change_3y_annualized=float(row["nav_change_3y_annualized"])
                    if pd.notna(row.get("nav_change_3y_annualized"))
                    else None,
                    nav_change_12m_annualized=float(row["nav_change_12m_annualized"])
                    if pd.notna(row.get("nav_change_12m_annualized"))
                    else None,
                    nav_change_24m_annualized=float(row["nav_change_24m_annualized"])
                    if pd.notna(row.get("nav_change_24m_annualized"))
                    else None,
                    nav_change_36m_annualized=float(row["nav_change_36m_annualized"])
                    if pd.notna(row.get("nav_change_36m_annualized"))
                    else None,
                    fund_ownership=float(row["fund_ownership"])
                    if pd.notna(row.get("fund_ownership"))
                    else None,
                    management_fee=float(row["management_fee"])
                    if pd.notna(row.get("management_fee"))
                    else None,
                    issue_date=str(row["issue_date"])
                    if pd.notna(row.get("issue_date"))
                    else None,
                    fund_id=int(row.get("fund_id_fmarket", 0)),
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
        List of FundSearch objects containing fund_id and short_name.
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
                    fund_id=0,  # API doesn't return fund_id for this endpoint
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
                    nav_date=str(row.get("date", "")),
                    nav_per_unit=float(row.get("nav_per_unit", 0.0)),
                    fund_id=0,  # API doesn't return fund_id for this endpoint
                )
            )

        # Sort by date descending (newest first)
        results.sort(key=lambda x: x.nav_date, reverse=True)

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
                    code=str(row.get("stock_code", "")),
                    industry=str(row.get("industry", "")),
                    percent_asset=float(row.get("net_asset_percent", 0.0)),
                    update_date=str(row.get("updateDate", "")),
                    fund_id=0,  # API doesn't return fund_id for this endpoint
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
                    percent_asset=float(row.get("net_asset_percent", 0.0)),
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
                    asset_type=str(row.get("asset_type", "")),
                    percent_asset=float(row.get("asset_percent", 0.0)),
                )
            )

        return results
    except ValueError:
        raise
    except Exception as e:
        raise Exception(
            f"Failed to retrieve asset allocation for {symbol}: {str(e)}"
        ) from e
