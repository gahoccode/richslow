"""Tests for funds API route endpoints.

This module tests all funds API endpoints with mocked service layer,
including success, error, and edge cases.
"""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.schema_funds import (
    FundAssetHolding,
    FundIndustryHolding,
    FundListing,
    FundNavReport,
    FundSearch,
    FundTopHolding,
)

client = TestClient(app)


class TestFundsListingEndpoint:
    """Tests for GET /api/funds/listing endpoint."""

    @pytest.fixture
    def mock_fund_listing(self):
        """Mock fund listing data."""
        return [
            FundListing(
                short_name="VCBF-BCF",
                fund_type="BALANCED",
                nav=50000.0,
                nav_change_1m=0.05,
                nav_change_1y=0.20,
                fund_id=123,
            ),
            FundListing(
                short_name="DCDS",
                fund_type="STOCK",
                nav=45000.0,
                nav_change_1m=0.06,
                nav_change_1y=0.25,
                fund_id=456,
            ),
        ]

    def test_get_funds_listing_success(self, mock_fund_listing):
        """Test successful fund listing endpoint."""
        with patch(
            "app.routes.route_funds.get_fund_listing"
        ) as mock_get_listing:
            mock_get_listing.return_value = mock_fund_listing

            response = client.get("/api/funds/listing")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["short_name"] == "VCBF-BCF"
            assert data[0]["fund_type"] == "BALANCED"
            assert data[1]["short_name"] == "DCDS"

    def test_get_funds_listing_with_filter(self, mock_fund_listing):
        """Test fund listing with type filter."""
        filtered_listing = [mock_fund_listing[1]]  # Only STOCK fund

        with patch(
            "app.routes.route_funds.get_fund_listing"
        ) as mock_get_listing:
            mock_get_listing.return_value = filtered_listing

            response = client.get("/api/funds/listing?fund_type=STOCK")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["fund_type"] == "STOCK"
            mock_get_listing.assert_called_once_with("STOCK")

    def test_get_funds_listing_empty(self):
        """Test fund listing with no data."""
        with patch(
            "app.routes.route_funds.get_fund_listing"
        ) as mock_get_listing:
            mock_get_listing.return_value = []

            response = client.get("/api/funds/listing")

            assert response.status_code == 200
            assert response.json() == []

    def test_get_funds_listing_server_error(self):
        """Test fund listing with server error."""
        with patch(
            "app.routes.route_funds.get_fund_listing"
        ) as mock_get_listing:
            mock_get_listing.side_effect = Exception("API connection failed")

            response = client.get("/api/funds/listing")

            assert response.status_code == 500
            assert "Failed to retrieve fund listing" in response.json()["detail"]


class TestSearchFundsEndpoint:
    """Tests for GET /api/funds/search endpoint."""

    @pytest.fixture
    def mock_search_results(self):
        """Mock search results data."""
        return [
            FundSearch(fund_id=123, short_name="VCBF-BCF"),
            FundSearch(fund_id=456, short_name="VCBF-TBF"),
        ]

    def test_search_funds_success(self, mock_search_results):
        """Test successful fund search."""
        with patch("app.routes.route_funds.search_funds") as mock_search:
            mock_search.return_value = mock_search_results

            response = client.get("/api/funds/search?symbol=VCBF")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["short_name"] == "VCBF-BCF"
            mock_search.assert_called_once_with("VCBF")

    def test_search_funds_no_results(self):
        """Test fund search with no matches."""
        with patch("app.routes.route_funds.search_funds") as mock_search:
            mock_search.return_value = []

            response = client.get("/api/funds/search?symbol=NONEXISTENT")

            assert response.status_code == 200
            assert response.json() == []

    def test_search_funds_invalid_symbol(self):
        """Test fund search with invalid symbol."""
        with patch("app.routes.route_funds.search_funds") as mock_search:
            mock_search.side_effect = ValueError("Symbol parameter cannot be empty")

            response = client.get("/api/funds/search?symbol=")

            assert response.status_code == 400
            assert "Symbol parameter cannot be empty" in response.json()["detail"]

    def test_search_funds_missing_symbol_parameter(self):
        """Test fund search without symbol parameter."""
        response = client.get("/api/funds/search")

        assert response.status_code == 422  # FastAPI validation error


class TestNavReportEndpoint:
    """Tests for GET /api/funds/{symbol}/nav-report endpoint."""

    @pytest.fixture
    def mock_nav_data(self):
        """Mock NAV report data."""
        return [
            FundNavReport(nav_date="2024-01-15", nav_per_unit=50000.0, fund_id=123),
            FundNavReport(nav_date="2024-01-14", nav_per_unit=49500.0, fund_id=123),
        ]

    def test_get_nav_report_success(self, mock_nav_data):
        """Test successful NAV report retrieval."""
        with patch(
            "app.routes.route_funds.get_fund_nav_report"
        ) as mock_get_nav:
            mock_get_nav.return_value = mock_nav_data

            response = client.get("/api/funds/VCBF-BCF/nav-report")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["nav_date"] == "2024-01-15"
            assert data[0]["nav_per_unit"] == 50000.0

    def test_get_nav_report_not_found(self):
        """Test NAV report for non-existent fund."""
        with patch(
            "app.routes.route_funds.get_fund_nav_report"
        ) as mock_get_nav:
            mock_get_nav.return_value = []

            response = client.get("/api/funds/INVALID-FUND/nav-report")

            assert response.status_code == 404
            assert "No NAV data found" in response.json()["detail"]

    def test_get_nav_report_server_error(self):
        """Test NAV report with server error."""
        with patch(
            "app.routes.route_funds.get_fund_nav_report"
        ) as mock_get_nav:
            mock_get_nav.side_effect = Exception("API connection failed")

            response = client.get("/api/funds/VCBF-BCF/nav-report")

            assert response.status_code == 500
            assert "Failed to retrieve NAV report" in response.json()["detail"]


class TestTopHoldingsEndpoint:
    """Tests for GET /api/funds/{symbol}/top-holdings endpoint."""

    @pytest.fixture
    def mock_holdings_data(self):
        """Mock top holdings data."""
        return [
            FundTopHolding(
                code="VCB",
                industry="Banking",
                percent_asset=5.2,
                update_date="2024-01-15T10:30:00",
                fund_id=123,
            ),
            FundTopHolding(
                code="FPT",
                industry="Technology",
                percent_asset=4.8,
                update_date="2024-01-15T10:30:00",
                fund_id=123,
            ),
        ]

    def test_get_top_holdings_success(self, mock_holdings_data):
        """Test successful top holdings retrieval."""
        with patch(
            "app.routes.route_funds.get_fund_top_holdings"
        ) as mock_get_holdings:
            mock_get_holdings.return_value = mock_holdings_data

            response = client.get("/api/funds/VCBF-BCF/top-holdings")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["code"] == "VCB"
            assert data[0]["industry"] == "Banking"
            assert data[0]["percent_asset"] == 5.2

    def test_get_top_holdings_not_found(self):
        """Test top holdings for non-existent fund."""
        with patch(
            "app.routes.route_funds.get_fund_top_holdings"
        ) as mock_get_holdings:
            mock_get_holdings.return_value = []

            response = client.get("/api/funds/INVALID-FUND/top-holdings")

            assert response.status_code == 404
            assert "No holdings data found" in response.json()["detail"]


class TestIndustryAllocationEndpoint:
    """Tests for GET /api/funds/{symbol}/industry-allocation endpoint."""

    @pytest.fixture
    def mock_industry_data(self):
        """Mock industry allocation data."""
        return [
            FundIndustryHolding(industry="Banking", percent_asset=25.5),
            FundIndustryHolding(industry="Technology", percent_asset=20.3),
        ]

    def test_get_industry_allocation_success(self, mock_industry_data):
        """Test successful industry allocation retrieval."""
        with patch(
            "app.routes.route_funds.get_fund_industry_allocation"
        ) as mock_get_industry:
            mock_get_industry.return_value = mock_industry_data

            response = client.get("/api/funds/VCBF-BCF/industry-allocation")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["industry"] == "Banking"
            assert data[0]["percent_asset"] == 25.5

    def test_get_industry_allocation_not_found(self):
        """Test industry allocation for non-existent fund."""
        with patch(
            "app.routes.route_funds.get_fund_industry_allocation"
        ) as mock_get_industry:
            mock_get_industry.return_value = []

            response = client.get("/api/funds/INVALID-FUND/industry-allocation")

            assert response.status_code == 404
            assert "No industry allocation data found" in response.json()["detail"]


class TestAssetAllocationEndpoint:
    """Tests for GET /api/funds/{symbol}/asset-allocation endpoint."""

    @pytest.fixture
    def mock_asset_data(self):
        """Mock asset allocation data."""
        return [
            FundAssetHolding(asset_type="Cổ phiếu", percent_asset=75.0),
            FundAssetHolding(asset_type="Tiền và tương đương tiền", percent_asset=20.0),
        ]

    def test_get_asset_allocation_success(self, mock_asset_data):
        """Test successful asset allocation retrieval."""
        with patch(
            "app.routes.route_funds.get_fund_asset_allocation"
        ) as mock_get_asset:
            mock_get_asset.return_value = mock_asset_data

            response = client.get("/api/funds/VCBF-BCF/asset-allocation")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["asset_type"] == "Cổ phiếu"
            assert data[0]["percent_asset"] == 75.0

    def test_get_asset_allocation_not_found(self):
        """Test asset allocation for non-existent fund."""
        with patch(
            "app.routes.route_funds.get_fund_asset_allocation"
        ) as mock_get_asset:
            mock_get_asset.return_value = []

            response = client.get("/api/funds/INVALID-FUND/asset-allocation")

            assert response.status_code == 404
            assert "No asset allocation data found" in response.json()["detail"]

    def test_get_asset_allocation_server_error(self):
        """Test asset allocation with server error."""
        with patch(
            "app.routes.route_funds.get_fund_asset_allocation"
        ) as mock_get_asset:
            mock_get_asset.side_effect = Exception("API connection failed")

            response = client.get("/api/funds/VCBF-BCF/asset-allocation")

            assert response.status_code == 500
            assert "Failed to retrieve asset allocation" in response.json()["detail"]


class TestEndpointIntegration:
    """Integration tests for funds endpoints."""

    def test_endpoints_return_correct_content_type(self):
        """Test that all endpoints return JSON content type."""
        with patch("app.routes.route_funds.get_fund_listing", return_value=[]):
            response = client.get("/api/funds/listing")
            assert "application/json" in response.headers["content-type"]

    def test_all_endpoints_accessible(self):
        """Test that all funds endpoints are accessible."""
        with patch("app.routes.route_funds.get_fund_listing", return_value=[]):
            with patch("app.routes.route_funds.search_funds", return_value=[]):
                with patch("app.routes.route_funds.get_fund_nav_report", return_value=[]):
                    with patch("app.routes.route_funds.get_fund_top_holdings", return_value=[]):
                        with patch("app.routes.route_funds.get_fund_industry_allocation", return_value=[]):
                            with patch("app.routes.route_funds.get_fund_asset_allocation", return_value=[]):
                                # All endpoints should return 200 or 404, not 500
                                assert client.get("/api/funds/listing").status_code == 200
                                assert client.get("/api/funds/search?symbol=TEST").status_code == 200
                                # These return 404 because service returns empty list
                                assert client.get("/api/funds/TEST/nav-report").status_code == 404
                                assert client.get("/api/funds/TEST/top-holdings").status_code == 404
                                assert client.get("/api/funds/TEST/industry-allocation").status_code == 404
                                assert client.get("/api/funds/TEST/asset-allocation").status_code == 404
