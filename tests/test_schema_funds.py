"""Tests for funds schema validation.

This module tests Pydantic model validation, type coercion, and serialization
for all funds-related schemas.
"""

import pytest
from pydantic import ValidationError

from app.schemas.schema_funds import (
    FundAssetHolding,
    FundIndustryHolding,
    FundListing,
    FundNavReport,
    FundSearch,
    FundTopHolding,
)


class TestFundListingSchema:
    """Tests for FundListing schema validation."""

    def test_fund_listing_complete_data(self):
        """Test FundListing with complete valid data."""
        data = {
            "short_name": "VCBF-BCF",
            "fund_type": "BALANCED",
            "nav": 50000.0,
            "nav_change_1d": 0.01,
            "nav_change_1w": 0.02,
            "nav_change_1m": 0.05,
            "nav_change_3m": 0.10,
            "nav_change_6m": 0.15,
            "nav_change_1y": 0.20,
            "nav_change_2y": 0.35,
            "nav_change_3y": 0.45,
            "nav_change_1y_annualized": 0.20,
            "nav_change_2y_annualized": 0.175,
            "nav_change_3y_annualized": 0.15,
            "nav_change_12m_annualized": 0.20,
            "nav_change_24m_annualized": 0.175,
            "nav_change_36m_annualized": 0.15,
            "fund_ownership": 0.10,
            "management_fee": 0.015,
            "issue_date": "2020-01-01",
            "fund_id": 123,
        }

        fund = FundListing(**data)

        assert fund.short_name == "VCBF-BCF"
        assert fund.fund_type == "BALANCED"
        assert fund.nav == 50000.0
        assert fund.nav_change_1m == 0.05
        assert fund.fund_id == 123

    def test_fund_listing_minimal_data(self):
        """Test FundListing with minimal required fields."""
        data = {
            "short_name": "TEST-FUND",
            "fund_type": "STOCK",
            "fund_id": 456,
        }

        fund = FundListing(**data)

        assert fund.short_name == "TEST-FUND"
        assert fund.fund_type == "STOCK"
        assert fund.fund_id == 456
        assert fund.nav is None
        assert fund.nav_change_1m is None
        assert fund.issue_date is None

    def test_fund_listing_null_values(self):
        """Test FundListing handles None values for optional fields."""
        data = {
            "short_name": "NULL-FUND",
            "fund_type": "BOND",
            "nav": None,
            "nav_change_1y": None,
            "nav_change_3y_annualized": None,
            "management_fee": None,
            "issue_date": None,
            "fund_id": 789,
        }

        fund = FundListing(**data)

        assert fund.short_name == "NULL-FUND"
        assert fund.nav is None
        assert fund.nav_change_1y is None
        assert fund.issue_date is None

    def test_fund_listing_missing_required_fields(self):
        """Test FundListing raises error when required fields are missing."""
        data = {
            "short_name": "INCOMPLETE",
            # Missing fund_type and fund_id
        }

        with pytest.raises(ValidationError) as exc_info:
            FundListing(**data)

        errors = exc_info.value.errors()
        error_fields = {error["loc"][0] for error in errors}
        assert "fund_type" in error_fields
        assert "fund_id" in error_fields

    def test_fund_listing_json_serialization(self):
        """Test FundListing can be serialized to JSON."""
        data = {
            "short_name": "JSON-TEST",
            "fund_type": "STOCK",
            "nav": 45000.0,
            "fund_id": 111,
        }

        fund = FundListing(**data)
        json_data = fund.model_dump()

        assert json_data["short_name"] == "JSON-TEST"
        assert json_data["fund_type"] == "STOCK"
        assert json_data["nav"] == 45000.0
        assert json_data["fund_id"] == 111


class TestFundSearchSchema:
    """Tests for FundSearch schema validation."""

    def test_fund_search_valid_data(self):
        """Test FundSearch with valid data."""
        data = {
            "fund_id": 123,
            "short_name": "VCBF-BCF",
        }

        search_result = FundSearch(**data)

        assert search_result.fund_id == 123
        assert search_result.short_name == "VCBF-BCF"

    def test_fund_search_missing_required_fields(self):
        """Test FundSearch raises error when required fields are missing."""
        data = {"fund_id": 456}  # Missing short_name

        with pytest.raises(ValidationError) as exc_info:
            FundSearch(**data)

        errors = exc_info.value.errors()
        assert "short_name" in [error["loc"][0] for error in errors]


class TestFundNavReportSchema:
    """Tests for FundNavReport schema validation."""

    def test_fund_nav_report_valid_data(self):
        """Test FundNavReport with valid data."""
        data = {
            "nav_date": "2024-01-15",
            "nav_per_unit": 50000.0,
            "fund_id": 123,
        }

        nav_report = FundNavReport(**data)

        assert nav_report.nav_date == "2024-01-15"
        assert nav_report.nav_per_unit == 50000.0
        assert nav_report.fund_id == 123

    def test_fund_nav_report_type_coercion(self):
        """Test FundNavReport coerces types correctly."""
        data = {
            "nav_date": "2024-01-15",
            "nav_per_unit": "50000.5",  # String that can be coerced to float
            "fund_id": "123",  # String that can be coerced to int
        }

        nav_report = FundNavReport(**data)

        assert nav_report.nav_per_unit == 50000.5
        assert nav_report.fund_id == 123


class TestFundTopHoldingSchema:
    """Tests for FundTopHolding schema validation."""

    def test_fund_top_holding_valid_data(self):
        """Test FundTopHolding with valid data."""
        data = {
            "code": "VCB",
            "industry": "Banking",
            "percent_asset": 5.25,
            "update_date": "2024-01-15T10:30:00",
            "fund_id": 123,
        }

        holding = FundTopHolding(**data)

        assert holding.code == "VCB"
        assert holding.industry == "Banking"
        assert holding.percent_asset == 5.25
        assert holding.update_date == "2024-01-15T10:30:00"
        assert holding.fund_id == 123

    def test_fund_top_holding_missing_required_fields(self):
        """Test FundTopHolding raises error when required fields are missing."""
        data = {
            "code": "VCB",
            "industry": "Banking",
            # Missing percent_asset, update_date, fund_id
        }

        with pytest.raises(ValidationError) as exc_info:
            FundTopHolding(**data)

        errors = exc_info.value.errors()
        error_fields = {error["loc"][0] for error in errors}
        assert "percent_asset" in error_fields
        assert "update_date" in error_fields
        assert "fund_id" in error_fields


class TestFundIndustryHoldingSchema:
    """Tests for FundIndustryHolding schema validation."""

    def test_fund_industry_holding_valid_data(self):
        """Test FundIndustryHolding with valid data."""
        data = {
            "industry": "Banking",
            "percent_asset": 25.5,
        }

        holding = FundIndustryHolding(**data)

        assert holding.industry == "Banking"
        assert holding.percent_asset == 25.5

    def test_fund_industry_holding_type_coercion(self):
        """Test FundIndustryHolding coerces types correctly."""
        data = {
            "industry": "Technology",
            "percent_asset": "15.75",  # String that can be coerced to float
        }

        holding = FundIndustryHolding(**data)

        assert holding.industry == "Technology"
        assert holding.percent_asset == 15.75


class TestFundAssetHoldingSchema:
    """Tests for FundAssetHolding schema validation."""

    def test_fund_asset_holding_valid_data(self):
        """Test FundAssetHolding with valid data."""
        data = {
            "asset_type": "Stocks",
            "percent_asset": 75.0,
        }

        holding = FundAssetHolding(**data)

        assert holding.asset_type == "Stocks"
        assert holding.percent_asset == 75.0

    def test_fund_asset_holding_vietnamese_asset_types(self):
        """Test FundAssetHolding with Vietnamese asset type names."""
        data = {
            "asset_type": "Cổ phiếu",  # Vietnamese for "Stocks"
            "percent_asset": 60.0,
        }

        holding = FundAssetHolding(**data)

        assert holding.asset_type == "Cổ phiếu"
        assert holding.percent_asset == 60.0

    def test_fund_asset_holding_missing_required_fields(self):
        """Test FundAssetHolding raises error when required fields are missing."""
        data = {"asset_type": "Bonds"}  # Missing percent_asset

        with pytest.raises(ValidationError) as exc_info:
            FundAssetHolding(**data)

        errors = exc_info.value.errors()
        assert "percent_asset" in [error["loc"][0] for error in errors]


class TestSchemaIntegration:
    """Integration tests for multiple schemas."""

    def test_all_schemas_have_required_fields(self):
        """Test that all schemas have their documented required fields."""
        # This test ensures schema structure matches documentation

        # FundListing required: short_name, fund_type, fund_id
        with pytest.raises(ValidationError):
            FundListing()

        # FundSearch required: fund_id, short_name
        with pytest.raises(ValidationError):
            FundSearch()

        # FundNavReport required: nav_date, nav_per_unit, fund_id
        with pytest.raises(ValidationError):
            FundNavReport()

        # FundTopHolding required: code, industry, percent_asset, update_date, fund_id
        with pytest.raises(ValidationError):
            FundTopHolding()

        # FundIndustryHolding required: industry, percent_asset
        with pytest.raises(ValidationError):
            FundIndustryHolding()

        # FundAssetHolding required: asset_type, percent_asset
        with pytest.raises(ValidationError):
            FundAssetHolding()

    def test_schemas_json_round_trip(self):
        """Test all schemas can be serialized and deserialized."""
        listing_data = {
            "short_name": "TEST",
            "fund_type": "STOCK",
            "nav": 50000.0,
            "fund_id": 123,
        }
        listing = FundListing(**listing_data)
        listing_json = listing.model_dump_json()
        listing_restored = FundListing.model_validate_json(listing_json)
        assert listing_restored.short_name == listing.short_name

        search_data = {"fund_id": 456, "short_name": "SEARCH-TEST"}
        search = FundSearch(**search_data)
        search_json = search.model_dump_json()
        search_restored = FundSearch.model_validate_json(search_json)
        assert search_restored.fund_id == search.fund_id
