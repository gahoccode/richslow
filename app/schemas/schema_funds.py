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
    name: str = Field(..., description="Full fund name")
    fund_type: str = Field(..., description="Fund type: STOCK, BOND, or BALANCED")
    fund_owner_name: str = Field(..., description="Fund management company name")
    management_fee: float = Field(..., description="Annual management fee percentage")
    inception_date: str | None = Field(None, description="Fund inception date")
    nav: float = Field(..., description="Current Net Asset Value")
    nav_change_previous: float = Field(..., description="NAV change from previous day")
    nav_change_last_year: float | None = Field(
        None, description="NAV change from last year"
    )
    nav_change_inception: float = Field(
        ..., description="NAV change since inception"
    )
    nav_change_1m: float | None = Field(None, description="1-month NAV change")
    nav_change_3m: float | None = Field(None, description="3-month NAV change")
    nav_change_6m: float | None = Field(None, description="6-month NAV change")
    nav_change_12m: float | None = Field(None, description="12-month NAV change")
    nav_change_24m: float | None = Field(None, description="24-month NAV change")
    nav_change_36m: float | None = Field(None, description="36-month NAV change")
    nav_change_36m_annualized: float | None = Field(
        None, description="36-month annualized return"
    )
    nav_update_at: str = Field(..., description="Last NAV update timestamp")
    fund_id_fmarket: int = Field(..., description="Unique fund identifier from fmarket")
    fund_code: str = Field(..., description="Official fund code")
    vsd_fee_id: str = Field(..., description="VSD fee identifier")


class FundSearch(BaseModel):
    """Fund search result model.

    Minimal fund information returned from vnstock fund.filter() API
    for quick search and autocomplete functionality.
    """

    id: int = Field(..., description="Unique fund identifier")
    short_name: str = Field(..., description="Fund abbreviation")


class FundNavReport(BaseModel):
    """Historical NAV data model.

    Time-series Net Asset Value data from vnstock fund.details.nav_report() API.
    Used for performance tracking and charting.
    """

    date: str = Field(..., description="Date in YYYY-MM-DD format")
    nav_per_unit: float = Field(..., description="NAV value per unit")
    short_name: str = Field(..., description="Fund abbreviation")


class FundTopHolding(BaseModel):
    """Top holdings data model.

    Portfolio composition data showing top 10 holdings from
    vnstock fund.details.top_holding() API.
    """

    stock_code: str = Field(..., description="Stock ticker symbol")
    industry: str = Field(..., description="Industry classification")
    net_asset_percent: float = Field(..., description="Percentage of total assets")
    type_asset: str = Field(..., description="Asset type classification")
    update_at: str = Field(..., description="Last update timestamp")
    fund_id: int = Field(..., description="Fund identifier")
    short_name: str = Field(..., description="Fund abbreviation")


class FundIndustryHolding(BaseModel):
    """Industry allocation model.

    Sector exposure breakdown from vnstock fund.details.industry_holding() API.
    Shows percentage allocation across different industries.
    """

    industry: str = Field(..., description="Industry name")
    net_asset_percent: float = Field(..., description="Percentage allocation")
    short_name: str = Field(..., description="Fund abbreviation")


class FundAssetHolding(BaseModel):
    """Asset allocation model.

    Asset class distribution from vnstock fund.details.asset_holding() API.
    Shows allocation across stocks, bonds, cash equivalents, etc.
    """

    asset_percent: float = Field(..., description="Percentage allocation")
    asset_type: str = Field(..., description="Asset class type")
    short_name: str = Field(..., description="Fund abbreviation")
