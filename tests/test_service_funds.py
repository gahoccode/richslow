"""Tests for funds service functions.

This module tests the business logic layer for funds data processing,
including vnstock API integration with mocked responses.
"""

from unittest.mock import Mock, patch

import pandas as pd
import pytest

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


class TestGetFundListing:
    """Tests for get_fund_listing service function."""

    @pytest.fixture
    def mock_listing_data(self):
        """Mock fund listing DataFrame from vnstock."""
        return pd.DataFrame(
            {
                "short_name": ["VCBF-BCF", "DCDS"],
                "fund_type": ["BALANCED", "STOCK"],
                "nav": [50000.0, 45000.0],
                "nav_change_1d": [0.01, 0.02],
                "nav_change_1w": [0.02, 0.03],
                "nav_change_1m": [0.05, 0.06],
                "nav_change_3m": [0.10, 0.12],
                "nav_change_6m": [0.15, 0.18],
                "nav_change_1y": [0.20, 0.25],
                "nav_change_2y": [0.35, None],  # Test null handling
                "nav_change_3y": [0.45, None],
                "nav_change_1y_annualized": [0.20, 0.25],
                "nav_change_2y_annualized": [0.175, None],
                "nav_change_3y_annualized": [0.15, None],
                "nav_change_12m_annualized": [0.20, 0.25],
                "nav_change_24m_annualized": [0.175, None],
                "nav_change_36m_annualized": [0.15, None],
                "fund_ownership": [0.10, 0.08],
                "management_fee": [0.015, 0.020],
                "issue_date": ["2020-01-01", "2021-06-15"],
                "fund_id": [123, 456],
            }
        )

    def test_get_fund_listing_success(self, mock_listing_data):
        """Test successful fund listing retrieval."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.listing.return_value = mock_listing_data
            mock_fund_class.return_value = mock_fund

            result = get_fund_listing()

            assert isinstance(result, list)
            assert len(result) == 2
            assert all(isinstance(item, FundListing) for item in result)
            assert result[0].short_name == "VCBF-BCF"
            assert result[0].fund_type == "BALANCED"
            assert result[0].nav == 50000.0
            assert result[1].short_name == "DCDS"

    def test_get_fund_listing_with_filter(self, mock_listing_data):
        """Test fund listing with type filter."""
        filtered_data = mock_listing_data[mock_listing_data["fund_type"] == "STOCK"]

        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.listing.return_value = filtered_data
            mock_fund_class.return_value = mock_fund

            result = get_fund_listing("STOCK")

            assert len(result) == 1
            assert result[0].fund_type == "STOCK"
            mock_fund.listing.assert_called_once_with(fund_type="STOCK")

    def test_get_fund_listing_empty_data(self):
        """Test fund listing with empty DataFrame."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.listing.return_value = pd.DataFrame()
            mock_fund_class.return_value = mock_fund

            result = get_fund_listing()

            assert result == []

    def test_get_fund_listing_null_handling(self, mock_listing_data):
        """Test fund listing handles null values correctly."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.listing.return_value = mock_listing_data
            mock_fund_class.return_value = mock_fund

            result = get_fund_listing()

            # Second fund has null values for 2y and 3y metrics
            assert result[1].nav_change_2y is None
            assert result[1].nav_change_3y is None
            assert result[1].nav_change_2y_annualized is None

    def test_get_fund_listing_api_error(self):
        """Test fund listing handles API errors."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund_class.side_effect = Exception("API connection failed")

            with pytest.raises(Exception) as exc_info:
                get_fund_listing()

            assert "Failed to retrieve fund listing" in str(exc_info.value)


class TestSearchFunds:
    """Tests for search_funds service function."""

    @pytest.fixture
    def mock_search_data(self):
        """Mock fund search DataFrame from vnstock."""
        return pd.DataFrame(
            {
                "fundId": [123, 456],
                "shortName": ["VCBF-BCF", "VCBF-TBF"],
            }
        )

    def test_search_funds_success(self, mock_search_data):
        """Test successful fund search."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.filter.return_value = mock_search_data
            mock_fund_class.return_value = mock_fund

            result = search_funds("VCBF")

            assert isinstance(result, list)
            assert len(result) == 2
            assert all(isinstance(item, FundSearch) for item in result)
            assert result[0].fund_id == 123
            assert result[0].short_name == "VCBF-BCF"

    def test_search_funds_empty_symbol(self):
        """Test search funds with empty symbol."""
        with pytest.raises(ValueError) as exc_info:
            search_funds("")

        assert "Symbol parameter cannot be empty" in str(exc_info.value)

    def test_search_funds_whitespace_symbol(self):
        """Test search funds with whitespace symbol."""
        with pytest.raises(ValueError) as exc_info:
            search_funds("   ")

        assert "Symbol parameter cannot be empty" in str(exc_info.value)

    def test_search_funds_no_results(self):
        """Test search funds with no matches."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.filter.return_value = pd.DataFrame()
            mock_fund_class.return_value = mock_fund

            result = search_funds("NONEXISTENT")

            assert result == []


class TestGetFundNavReport:
    """Tests for get_fund_nav_report service function."""

    @pytest.fixture
    def mock_nav_data(self):
        """Mock NAV report DataFrame from vnstock."""
        return pd.DataFrame(
            {
                "navDate": ["2024-01-15", "2024-01-14", "2024-01-13"],
                "navPerUnit": [50000.0, 49500.0, 49800.0],
                "fundId": [123, 123, 123],
            }
        )

    def test_get_fund_nav_report_success(self, mock_nav_data):
        """Test successful NAV report retrieval."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.details.nav_report.return_value = mock_nav_data
            mock_fund_class.return_value = mock_fund

            result = get_fund_nav_report("VCBF-BCF")

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, FundNavReport) for item in result)
            # Should be sorted by date descending
            assert result[0].nav_date == "2024-01-15"
            assert result[0].nav_per_unit == 50000.0

    def test_get_fund_nav_report_empty_symbol(self):
        """Test NAV report with empty symbol."""
        with pytest.raises(ValueError) as exc_info:
            get_fund_nav_report("")

        assert "Symbol parameter cannot be empty" in str(exc_info.value)

    def test_get_fund_nav_report_no_data(self):
        """Test NAV report with no data."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.details.nav_report.return_value = pd.DataFrame()
            mock_fund_class.return_value = mock_fund

            result = get_fund_nav_report("VCBF-BCF")

            assert result == []


class TestGetFundTopHoldings:
    """Tests for get_fund_top_holdings service function."""

    @pytest.fixture
    def mock_holdings_data(self):
        """Mock top holdings DataFrame from vnstock."""
        return pd.DataFrame(
            {
                "code": ["VCB", "FPT", "HPG"],
                "industry": ["Banking", "Technology", "Steel"],
                "percentAsset": [5.2, 4.8, 4.5],
                "updateDate": [
                    "2024-01-15T10:30:00",
                    "2024-01-15T10:30:00",
                    "2024-01-15T10:30:00",
                ],
                "fundId": [123, 123, 123],
            }
        )

    def test_get_fund_top_holdings_success(self, mock_holdings_data):
        """Test successful top holdings retrieval."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.details.top_holding.return_value = mock_holdings_data
            mock_fund_class.return_value = mock_fund

            result = get_fund_top_holdings("VCBF-BCF")

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, FundTopHolding) for item in result)
            assert result[0].code == "VCB"
            assert result[0].industry == "Banking"
            assert result[0].percent_asset == 5.2

    def test_get_fund_top_holdings_empty_symbol(self):
        """Test top holdings with empty symbol."""
        with pytest.raises(ValueError) as exc_info:
            get_fund_top_holdings("")

        assert "Symbol parameter cannot be empty" in str(exc_info.value)


class TestGetFundIndustryAllocation:
    """Tests for get_fund_industry_allocation service function."""

    @pytest.fixture
    def mock_industry_data(self):
        """Mock industry allocation DataFrame from vnstock."""
        return pd.DataFrame(
            {
                "industry": ["Banking", "Technology", "Real Estate"],
                "percentAsset": [25.5, 20.3, 15.8],
            }
        )

    def test_get_fund_industry_allocation_success(self, mock_industry_data):
        """Test successful industry allocation retrieval."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.details.industry_holding.return_value = mock_industry_data
            mock_fund_class.return_value = mock_fund

            result = get_fund_industry_allocation("VCBF-BCF")

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, FundIndustryHolding) for item in result)
            assert result[0].industry == "Banking"
            assert result[0].percent_asset == 25.5

    def test_get_fund_industry_allocation_empty_data(self):
        """Test industry allocation with empty data."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.details.industry_holding.return_value = pd.DataFrame()
            mock_fund_class.return_value = mock_fund

            result = get_fund_industry_allocation("VCBF-BCF")

            assert result == []


class TestGetFundAssetAllocation:
    """Tests for get_fund_asset_allocation service function."""

    @pytest.fixture
    def mock_asset_data(self):
        """Mock asset allocation DataFrame from vnstock."""
        return pd.DataFrame(
            {
                "assetType": ["Cổ phiếu", "Tiền và tương đương tiền", "Trái phiếu"],
                "percentAsset": [75.0, 20.0, 5.0],
            }
        )

    def test_get_fund_asset_allocation_success(self, mock_asset_data):
        """Test successful asset allocation retrieval."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.details.asset_holding.return_value = mock_asset_data
            mock_fund_class.return_value = mock_fund

            result = get_fund_asset_allocation("VCBF-BCF")

            assert isinstance(result, list)
            assert len(result) == 3
            assert all(isinstance(item, FundAssetHolding) for item in result)
            assert result[0].asset_type == "Cổ phiếu"
            assert result[0].percent_asset == 75.0

    def test_get_fund_asset_allocation_empty_symbol(self):
        """Test asset allocation with empty symbol."""
        with pytest.raises(ValueError) as exc_info:
            get_fund_asset_allocation("")

        assert "Symbol parameter cannot be empty" in str(exc_info.value)

    def test_get_fund_asset_allocation_api_error(self):
        """Test asset allocation handles API errors."""
        with patch("app.services.service_funds.Fund") as mock_fund_class:
            mock_fund = Mock()
            mock_fund.details.asset_holding.side_effect = Exception(
                "API connection failed"
            )
            mock_fund_class.return_value = mock_fund

            with pytest.raises(Exception) as exc_info:
                get_fund_asset_allocation("VCBF-BCF")

            assert "Failed to retrieve asset allocation" in str(exc_info.value)


class TestServiceFunctionsStandalone:
    """Test that service functions work standalone without FastAPI context."""

    def test_functions_can_be_imported_directly(self):
        """Test service functions can be imported without FastAPI."""
        # This ensures backend reusability
        from app.services.service_funds import (
            get_fund_asset_allocation,
            get_fund_industry_allocation,
            get_fund_listing,
            get_fund_nav_report,
            get_fund_top_holdings,
            search_funds,
        )

        # All functions should be callable
        assert callable(get_fund_listing)
        assert callable(search_funds)
        assert callable(get_fund_nav_report)
        assert callable(get_fund_top_holdings)
        assert callable(get_fund_industry_allocation)
        assert callable(get_fund_asset_allocation)

    def test_schemas_can_be_used_independently(self):
        """Test schemas work without FastAPI context."""
        from app.schemas.schema_funds import FundListing

        # Schema can be instantiated and validated
        fund = FundListing(
            short_name="TEST",
            fund_type="STOCK",
            nav=50000.0,
            fund_id=123,
        )

        assert fund.short_name == "TEST"
        assert fund.nav == 50000.0
