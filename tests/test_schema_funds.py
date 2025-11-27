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
            "name": "VCBF Balanced Charter Fund",
            "fund_type": "BALANCED",
            "fund_owner_name": "Vietcombank Fund Management",
            "management_fee": 0.015,
            "inception_date": "2020-01-01",
            "nav": 50000.0,
            "nav_change_previous": 0.01,
            "nav_change_last_year": 0.20,
            "nav_change_inception": 0.50,
            "nav_change_1m": 0.05,
            "nav_change_3m": 0.10,
            "nav_change_6m": 0.15,
            "nav_change_12m": 0.20,
            "nav_change_24m": 0.35,
            "nav_change_36m": 0.45,
            "nav_change_36m_annualized": 0.15,
            "nav_update_at": "2024-01-15T10:30:00",
            "fund_id_fmarket": 123,
            "fund_code": "VCBFBCF",
            "vsd_fee_id": "VSD123",
        }

        fund = FundListing(**data)

        assert fund.short_name == "VCBF-BCF"
        assert fund.name == "VCBF Balanced Charter Fund"
        assert fund.fund_type == "BALANCED"
        assert fund.fund_owner_name == "Vietcombank Fund Management"
        assert fund.nav == 50000.0
        assert fund.nav_change_1m == 0.05
        assert fund.fund_id_fmarket == 123

    def test_fund_listing_minimal_data(self):
        """Test FundListing with minimal required fields."""
        data = {
            "short_name": "TEST-FUND",
            "name": "Test Fund",
            "fund_type": "STOCK",
            "fund_owner_name": "Test Management",
            "management_fee": 0.02,
            "nav": 45000.0,
            "nav_change_previous": 0.00,
            "nav_change_inception": 0.10,
            "nav_update_at": "2024-01-15",
            "fund_id_fmarket": 456,
            "fund_code": "TESTFUND",
            "vsd_fee_id": "VSD456",
        }

        fund = FundListing(**data)

        assert fund.short_name == "TEST-FUND"
        assert fund.fund_type == "STOCK"
        assert fund.fund_id_fmarket == 456
        assert fund.nav_change_1m is None
        assert fund.inception_date is None

    def test_fund_listing_null_values(self):
        """Test FundListing handles None values for optional fields."""
        data = {
            "short_name": "NULL-FUND",
            "name": "Null Test Fund",
            "fund_type": "BOND",
            "fund_owner_name": "Null Management",
            "management_fee": 0.01,
            "inception_date": None,
            "nav": 40000.0,
            "nav_change_previous": 0.00,
            "nav_change_last_year": None,
            "nav_change_inception": 0.05,
            "nav_change_1m": None,
            "nav_change_36m_annualized": None,
            "nav_update_at": "2024-01-15",
            "fund_id_fmarket": 789,
            "fund_code": "NULLFUND",
            "vsd_fee_id": "VSD789",
        }

        fund = FundListing(**data)

        assert fund.short_name == "NULL-FUND"
        assert fund.nav_change_1m is None
        assert fund.nav_change_last_year is None
        assert fund.inception_date is None

    def test_fund_listing_missing_required_fields(self):
        """Test FundListing raises error when required fields are missing."""
        data = {
            "short_name": "INCOMPLETE",
            # Missing many required fields
        }

        with pytest.raises(ValidationError) as exc_info:
            FundListing(**data)

        errors = exc_info.value.errors()
        error_fields = {error["loc"][0] for error in errors}
        assert "name" in error_fields
        assert "fund_type" in error_fields
        assert "fund_owner_name" in error_fields
        assert "fund_id_fmarket" in error_fields

    def test_fund_listing_json_serialization(self):
        """Test FundListing can be serialized to JSON."""
        data = {
            "short_name": "JSON-TEST",
            "name": "JSON Test Fund",
            "fund_type": "STOCK",
            "fund_owner_name": "JSON Management",
            "management_fee": 0.02,
            "nav": 45000.0,
            "nav_change_previous": 0.01,
            "nav_change_inception": 0.15,
            "nav_update_at": "2024-01-15",
            "fund_id_fmarket": 111,
            "fund_code": "JSONTEST",
            "vsd_fee_id": "VSD111",
        }

        fund = FundListing(**data)
        json_data = fund.model_dump()

        assert json_data["short_name"] == "JSON-TEST"
        assert json_data["fund_type"] == "STOCK"
        assert json_data["nav"] == 45000.0
        assert json_data["fund_id_fmarket"] == 111


class TestFundSearchSchema:
    """Tests for FundSearch schema validation."""

    def test_fund_search_valid_data(self):
        """Test FundSearch with valid data."""
        data = {
            "id": 123,
            "short_name": "VCBF-BCF",
        }

        search_result = FundSearch(**data)

        assert search_result.id == 123
        assert search_result.short_name == "VCBF-BCF"

    def test_fund_search_missing_required_fields(self):
        """Test FundSearch raises error when required fields are missing."""
        data = {"id": 456}  # Missing short_name

        with pytest.raises(ValidationError) as exc_info:
            FundSearch(**data)

        errors = exc_info.value.errors()
        assert "short_name" in [error["loc"][0] for error in errors]


class TestFundNavReportSchema:
    """Tests for FundNavReport schema validation."""

    def test_fund_nav_report_valid_data(self):
        """Test FundNavReport with valid data."""
        data = {
            "date": "2024-01-15",
            "nav_per_unit": 50000.0,
            "short_name": "VCBF-BCF",
        }

        nav_report = FundNavReport(**data)

        assert nav_report.date == "2024-01-15"
        assert nav_report.nav_per_unit == 50000.0
        assert nav_report.short_name == "VCBF-BCF"

    def test_fund_nav_report_type_coercion(self):
        """Test FundNavReport coerces types correctly."""
        data = {
            "date": "2024-01-15",
            "nav_per_unit": "50000.5",  # String that can be coerced to float
            "short_name": "TEST-FUND",
        }

        nav_report = FundNavReport(**data)

        assert nav_report.nav_per_unit == 50000.5
        assert nav_report.short_name == "TEST-FUND"


class TestFundTopHoldingSchema:
    """Tests for FundTopHolding schema validation."""

    def test_fund_top_holding_valid_data(self):
        """Test FundTopHolding with valid data."""
        data = {
            "stock_code": "VCB",
            "industry": "Banking",
            "net_asset_percent": 5.25,
            "type_asset": "Cổ phiếu",
            "update_at": "2024-01-15T10:30:00",
            "fund_id": 123,
            "short_name": "VCBF-BCF",
        }

        holding = FundTopHolding(**data)

        assert holding.stock_code == "VCB"
        assert holding.industry == "Banking"
        assert holding.net_asset_percent == 5.25
        assert holding.type_asset == "Cổ phiếu"
        assert holding.update_at == "2024-01-15T10:30:00"
        assert holding.fund_id == 123
        assert holding.short_name == "VCBF-BCF"

    def test_fund_top_holding_missing_required_fields(self):
        """Test FundTopHolding raises error when required fields are missing."""
        data = {
            "stock_code": "VCB",
            "industry": "Banking",
            # Missing net_asset_percent, type_asset, update_at, fund_id, short_name
        }

        with pytest.raises(ValidationError) as exc_info:
            FundTopHolding(**data)

        errors = exc_info.value.errors()
        error_fields = {error["loc"][0] for error in errors}
        assert "net_asset_percent" in error_fields
        assert "type_asset" in error_fields
        assert "update_at" in error_fields
        assert "fund_id" in error_fields
        assert "short_name" in error_fields


class TestFundIndustryHoldingSchema:
    """Tests for FundIndustryHolding schema validation."""

    def test_fund_industry_holding_valid_data(self):
        """Test FundIndustryHolding with valid data."""
        data = {
            "industry": "Banking",
            "net_asset_percent": 25.5,
            "short_name": "VCBF-BCF",
        }

        holding = FundIndustryHolding(**data)

        assert holding.industry == "Banking"
        assert holding.net_asset_percent == 25.5
        assert holding.short_name == "VCBF-BCF"

    def test_fund_industry_holding_type_coercion(self):
        """Test FundIndustryHolding coerces types correctly."""
        data = {
            "industry": "Technology",
            "net_asset_percent": "15.75",  # String that can be coerced to float
            "short_name": "TECH-FUND",
        }

        holding = FundIndustryHolding(**data)

        assert holding.industry == "Technology"
        assert holding.net_asset_percent == 15.75
        assert holding.short_name == "TECH-FUND"


class TestFundAssetHoldingSchema:
    """Tests for FundAssetHolding schema validation."""

    def test_fund_asset_holding_valid_data(self):
        """Test FundAssetHolding with valid data."""
        data = {
            "asset_percent": 75.0,
            "asset_type": "Stocks",
            "short_name": "VCBF-BCF",
        }

        holding = FundAssetHolding(**data)

        assert holding.asset_percent == 75.0
        assert holding.asset_type == "Stocks"
        assert holding.short_name == "VCBF-BCF"

    def test_fund_asset_holding_vietnamese_asset_types(self):
        """Test FundAssetHolding with Vietnamese asset type names."""
        data = {
            "asset_percent": 60.0,
            "asset_type": "Cổ phiếu",  # Vietnamese for "Stocks"
            "short_name": "VN-FUND",
        }

        holding = FundAssetHolding(**data)

        assert holding.asset_type == "Cổ phiếu"
        assert holding.asset_percent == 60.0
        assert holding.short_name == "VN-FUND"

    def test_fund_asset_holding_missing_required_fields(self):
        """Test FundAssetHolding raises error when required fields are missing."""
        data = {"asset_type": "Bonds"}  # Missing asset_percent and short_name

        with pytest.raises(ValidationError) as exc_info:
            FundAssetHolding(**data)

        errors = exc_info.value.errors()
        error_fields = {error["loc"][0] for error in errors}
        assert "asset_percent" in error_fields
        assert "short_name" in error_fields


class TestSchemaIntegration:
    """Integration tests for multiple schemas."""

    def test_all_schemas_have_required_fields(self):
        """Test that all schemas have their documented required fields."""
        # This test ensures schema structure matches documentation

        # FundListing required: many fields
        with pytest.raises(ValidationError):
            FundListing()

        # FundSearch required: id, short_name
        with pytest.raises(ValidationError):
            FundSearch()

        # FundNavReport required: date, nav_per_unit, short_name
        with pytest.raises(ValidationError):
            FundNavReport()

        # FundTopHolding required: stock_code, industry, net_asset_percent, type_asset, update_at, fund_id, short_name
        with pytest.raises(ValidationError):
            FundTopHolding()

        # FundIndustryHolding required: industry, net_asset_percent, short_name
        with pytest.raises(ValidationError):
            FundIndustryHolding()

        # FundAssetHolding required: asset_percent, asset_type, short_name
        with pytest.raises(ValidationError):
            FundAssetHolding()

    def test_schemas_json_round_trip(self):
        """Test all schemas can be serialized and deserialized."""
        listing_data = {
            "short_name": "TEST",
            "name": "Test Fund",
            "fund_type": "STOCK",
            "fund_owner_name": "Test Management",
            "management_fee": 0.02,
            "nav": 50000.0,
            "nav_change_previous": 0.01,
            "nav_change_inception": 0.15,
            "nav_update_at": "2024-01-15",
            "fund_id_fmarket": 123,
            "fund_code": "TESTFUND",
            "vsd_fee_id": "VSD123",
        }
        listing = FundListing(**listing_data)
        listing_json = listing.model_dump_json()
        listing_restored = FundListing.model_validate_json(listing_json)
        assert listing_restored.short_name == listing.short_name

        search_data = {"id": 456, "short_name": "SEARCH-TEST"}
        search = FundSearch(**search_data)
        search_json = search.model_dump_json()
        search_restored = FundSearch.model_validate_json(search_json)
        assert search_restored.id == search.id
