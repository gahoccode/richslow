"""Pydantic schemas for funds data.

This module defines the data models for Vietnamese mutual fund analysis,
including fund listings, search results, NAV reports, and allocation data.
"""

from pydantic import BaseModel, Field


class FundListing(BaseModel):
    """Fund listing data model.

    Represents comprehensive fund information including performance metrics,
    ownership, and management fees from vnstock fund.listing() API.
    """

    short_name: str = Field(..., description="Fund abbreviation (e.g., 'VCBF-BCF')")
    fund_type: str = Field(..., description="Fund type: STOCK, BOND, or BALANCED")
    nav: float | None = Field(None, description="Current Net Asset Value")
    nav_change_1d: float | None = Field(None, description="1-day NAV change")
    nav_change_1w: float | None = Field(None, description="1-week NAV change")
    nav_change_1m: float | None = Field(None, description="1-month NAV change")
    nav_change_3m: float | None = Field(None, description="3-month NAV change")
    nav_change_6m: float | None = Field(None, description="6-month NAV change")
    nav_change_1y: float | None = Field(None, description="1-year NAV change")
    nav_change_2y: float | None = Field(None, description="2-year NAV change")
    nav_change_3y: float | None = Field(None, description="3-year NAV change")
    nav_change_1y_annualized: float | None = Field(
        None, description="1-year annualized return"
    )
    nav_change_2y_annualized: float | None = Field(
        None, description="2-year annualized return"
    )
    nav_change_3y_annualized: float | None = Field(
        None, description="3-year annualized return"
    )
    nav_change_12m_annualized: float | None = Field(
        None, description="12-month annualized return"
    )
    nav_change_24m_annualized: float | None = Field(
        None, description="24-month annualized return"
    )
    nav_change_36m_annualized: float | None = Field(
        None, description="36-month annualized return"
    )
    fund_ownership: float | None = Field(None, description="Fund ownership percentage")
    management_fee: float | None = Field(None, description="Annual management fee")
    issue_date: str | None = Field(None, description="Fund inception date")
    fund_id: int = Field(..., description="Unique fund identifier")


class FundSearch(BaseModel):
    """Fund search result model.

    Minimal fund information returned from vnstock fund.filter() API
    for quick search and autocomplete functionality.
    """

    fund_id: int = Field(..., description="Unique fund identifier")
    short_name: str = Field(..., description="Fund abbreviation")


class FundNavReport(BaseModel):
    """Historical NAV data model.

    Time-series Net Asset Value data from vnstock fund.details.nav_report() API.
    Used for performance tracking and charting.
    """

    nav_date: str = Field(..., description="Date in YYYY-MM-DD format")
    nav_per_unit: float = Field(..., description="NAV value per unit")
    fund_id: int = Field(..., description="Fund identifier")


class FundTopHolding(BaseModel):
    """Top holdings data model.

    Portfolio composition data showing top 10 holdings from
    vnstock fund.details.top_holding() API.
    """

    code: str = Field(..., description="Stock ticker symbol")
    industry: str = Field(..., description="Industry classification")
    percent_asset: float = Field(..., description="Percentage of total assets")
    update_date: str = Field(..., description="Last update timestamp")
    fund_id: int = Field(..., description="Fund identifier")


class FundIndustryHolding(BaseModel):
    """Industry allocation model.

    Sector exposure breakdown from vnstock fund.details.industry_holding() API.
    Shows percentage allocation across different industries.
    """

    industry: str = Field(..., description="Industry name")
    percent_asset: float = Field(..., description="Percentage allocation")


class FundAssetHolding(BaseModel):
    """Asset allocation model.

    Asset class distribution from vnstock fund.details.asset_holding() API.
    Shows allocation across stocks, bonds, cash equivalents, etc.
    """

    asset_type: str = Field(..., description="Asset class type")
    percent_asset: float = Field(..., description="Percentage allocation")
