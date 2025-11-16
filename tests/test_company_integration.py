"""Integration tests for company information API endpoints.

These tests focus on end-to-end API behavior, error handling,
and realistic usage scenarios with proper mocking.
"""

from unittest.mock import Mock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app


class TestCompanyAPIIntegration:
    """Test company API integration with realistic scenarios."""

    @pytest.fixture
    def client(self):
        """Create test client for FastAPI application."""
        return TestClient(app)

    @patch("app.services.service_company.TCBSCompany")
    def test_complete_company_overview_flow(self, mock_company_class, client):
        """Test complete flow for company overview with realistic data."""
        # Setup realistic mock response
        mock_company = Mock()
        mock_company.overview.return_value = self._get_realistic_overview_data()
        mock_company_class.return_value = mock_company

        # Make API request
        response = client.get("/api/company/FPT/overview")

        # Assertions
        assert response.status_code == 200
        data = response.json()

        # Verify key fields are present and properly formatted
        assert data["exchange"] == "HOSE"
        assert data["industry"] == "Technology"
        assert isinstance(data["no_shareholders"], int)
        assert isinstance(data["foreign_percent"], (int, float))
        assert isinstance(data["outstanding_share"], (int, float))
        assert "website" in data
        assert (
            "@" in data["website"] if data["website"] else True
        )  # Valid email format if present

    @patch("app.services.service_company.VCICompany")
    def test_financial_ratios_data_completeness(self, mock_company_class, client):
        """Test that financial ratios endpoint returns complete, valid data."""
        mock_company = Mock()
        mock_company.ratio_summary.return_value = self._get_realistic_ratio_data()
        mock_company_class.return_value = mock_company

        response = client.get("/api/company/VCB/ratio")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0

        # Validate structure of ratio data
        for ratio_data in data:
            assert "symbol" in ratio_data
            assert "year_report" in ratio_data
            assert isinstance(ratio_data["year_report"], int)
            assert "revenue" in ratio_data
            assert "net_profit" in ratio_data
            assert "roe" in ratio_data
            assert isinstance(ratio_data["roe"], (int, float, str))

    @patch("app.services.service_company.TCBSCompany")
    def test_company_news_data_structure(self, mock_company_class, client):
        """Test company news endpoint returns properly structured data."""
        mock_company = Mock()
        mock_company.news.return_value = self._get_realistic_news_data()
        mock_company_class.return_value = mock_company

        response = client.get("/api/company/FPT/news")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

        # Validate news item structure
        for news_item in data:
            assert "title" in news_item
            assert "source" in news_item
            assert "publish_date" in news_item
            assert "id" in news_item
            assert isinstance(news_item["id"], int)
            assert len(news_item["title"]) > 0
            assert len(news_item["source"]) > 0

    @patch("app.services.service_company.TCBSCompany")
    @patch("app.services.service_company.VCICompany")
    def test_multiple_data_sources_consistency(
        self, mock_vci_class, mock_tcbs_class, client
    ):
        """Test data consistency between TCBS and VCI sources."""
        # Setup TCBS mock
        mock_tcbs = Mock()
        mock_tcbs.overview.return_value = self._get_realistic_overview_data()
        mock_tcbs_class.return_value = mock_tcbs

        # Setup VCI mock
        mock_vci = Mock()
        mock_vci.ratio_summary.return_value = self._get_realistic_ratio_data()
        mock_vci_class.return_value = mock_vci

        # Test both endpoints with same ticker
        overview_response = client.get("/api/company/FPT/overview")
        ratio_response = client.get("/api/company/FPT/ratio")

        assert overview_response.status_code == 200
        assert ratio_response.status_code == 200

        # Basic consistency checks
        overview_data = overview_response.json()
        ratio_data = ratio_response.json()

        # Both should have valid ticker symbols
        assert (
            len(overview_data["short_name"]) > 0
            if overview_data.get("short_name")
            else True
        )
        assert all(item["symbol"] == "FPT" for item in ratio_data)

    def test_error_handling_invalid_ticker(self, client):
        """Test API behavior with invalid ticker symbols."""
        # Test with empty ticker
        response = client.get("/api/company//overview")
        assert response.status_code == 404

        # Test with special characters
        response = client.get("/api/company/INV@LID/overview")
        # This might return 404 or 200 depending on routing, should not crash

        # Test with very long ticker
        long_ticker = "VERYLONGTICKERNAMETHATEXCEEDSLIMITS"
        response = client.get(f"/api/company/{long_ticker}/overview")
        # Should handle gracefully

    @patch("app.services.service_company.TCBSCompany")
    def test_api_error_propagation(self, mock_company_class, client):
        """Test that vnstock API errors are properly handled."""
        mock_company = Mock()
        mock_company.overview.side_effect = Exception("API connection timeout")
        mock_company_class.return_value = mock_company

        response = client.get("/api/company/ERROR/overview")

        # Should return server error, not crash
        assert response.status_code == 500
        error_data = response.json()
        assert "detail" in error_data
        assert "Failed to retrieve company overview" in error_data["detail"]

    @patch("app.services.service_company.TCBSCompany")
    def test_empty_data_handling(self, mock_company_class, client):
        """Test handling of empty datasets from vnstock."""
        import pandas as pd

        mock_company = Mock()
        mock_company.shareholders.return_value = pd.DataFrame()  # Empty DataFrame
        mock_company_class.return_value = mock_company

        response = client.get("/api/company/EMPTY/shareholders")

        # Should return empty list, not error
        assert response.status_code == 200
        data = response.json()
        assert data == []

    @patch("app.services.service_company.TCBSCompany")
    def test_api_endpoint_health_check(self, mock_company_class, client):
        """Test that API endpoints are reachable and return proper responses."""
        mock_company = Mock()
        mock_company.overview.return_value = self._get_realistic_overview_data()
        mock_company_class.return_value = mock_company

        response = client.get("/api/company/FPT/overview")

        # Should return successful response
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/json"
        data = response.json()
        assert isinstance(data, dict)

    def test_response_time_acceptable(self, client):
        """Test that API responses return in acceptable time."""
        import time

        # This test uses mocked data so should be fast
        with patch("app.services.service_company.TCBSCompany") as mock_class:
            mock_company = Mock()
            mock_company.overview.return_value = self._get_realistic_overview_data()
            mock_class.return_value = mock_company

            start_time = time.time()
            response = client.get("/api/company/FPT/overview")
            end_time = time.time()

            assert response.status_code == 200
            # Should respond within 1 second (generous for mocked data)
            assert (end_time - start_time) < 1.0

    def _get_realistic_overview_data(self):
        """Create realistic mock overview DataFrame."""
        import pandas as pd

        return pd.DataFrame(
            {
                "exchange": ["HOSE"],
                "industry": ["Technology"],
                "company_type": ["CTCP"],
                "no_shareholders": [45000],
                "foreign_percent": [0.48],
                "outstanding_share": [1250.5],
                "issue_share": [1250.5],
                "established_year": ["2007"],
                "no_employees": [15000],
                "stock_rating": [7.2],
                "delta_in_week": [0.025],
                "delta_in_month": [0.087],
                "delta_in_year": [0.156],
                "short_name": ["FPT Corporation"],
                "website": ["investor@fpt.com.vn"],
                "industry_id": [320],
                "industry_id_v2": ["9521"],
            }
        )

    def _get_realistic_ratio_data(self):
        """Create realistic mock financial ratio DataFrame."""
        import pandas as pd

        return pd.DataFrame(
            {
                "symbol": ["FPT", "FPT"],
                "year_report": [2024, 2023],
                "length_report": [12, 12],
                "update_date": [1719792000000, 1688256000000],
                "revenue": [85000000000000, 78000000000000],
                "revenue_growth": [0.089, 0.076],
                "net_profit": [25000000000000, 22000000000000],
                "net_profit_growth": [0.136, 0.112],
                "ebit_margin": [0, 0],
                "roe": [0.185, 0.168],
                "roic": [0, 0],
                "roa": [0.092, 0.085],
                "pe": [12.5, 13.2],
                "pb": [1.4, 1.3],
                "eps": [2240.5, 1985.2],
                "current_ratio": [1.8, 1.7],
                "cash_ratio": [0.9, 0.8],
                "quick_ratio": [1.5, 1.4],
                "interest_coverage": ["8.5", "7.2"],
                "ae": [1.25, 1.18],
                "fae": [0.85, 0.78],
                "net_profit_margin": [0.294, 0.282],
                "gross_margin": [0, 0],
                "ev": [1200000000000000, 1050000000000000],
                "issue_share": [1116248600, 1108765400],
                "ps": [2.1, 2.0],
                "pcf": [11.8, 12.1],
                "bvps": [23450.0, 21500.0],
                "ev_per_ebitda": [6.5, 7.0],
                "at": [1500000000000, 1400000000000],
                "fat": [1200000000000, 1100000000000],
                "acp": [None, None],
                "dso": [45, 48],
                "dpo": [60, 58],
                "eps_ttm": [2200.0, 2000.0],
                "charter_capital": [27000000000, 26000000000],
                "rtq4": [88000, 85000],
                "charter_capital_ratio": [0.18, 0.17],
                "rtq10": [91000, 88000],
                "dividend": [3000, 2800],
                "ebitda": [35000000000000, 32000000000000],
                "ebit": [28000000000000, 25000000000000],
                "le": [800000000000000, 750000000000000],
                "de": [400000000000000, 380000000000000],
                "ccc": [None, None],
                "rtq17": [83000, 80000],
            }
        )

    def _get_realistic_news_data(self):
        """Create realistic mock news DataFrame."""
        import pandas as pd

        return pd.DataFrame(
            {
                "rsi": [35.2, 42.1, 38.7],
                "rs": [25.0, 30.0, 28.0],
                "price": [95000.0, 97000.0, 96000.0],
                "price_change": [1000.0, 2000.0, -500.0],
                "price_change_ratio": [0.011, 0.021, -0.005],
                "price_change_ratio_1m": [0.045, 0.052, 0.048],
                "id": [12345678, 12345679, 12345680],
                "title": [
                    "FPT: Q4 2024 Earnings Release Conference Call",
                    "FPT: Announcement of Strategic Partnership",
                    "FPT: Update on Digital Transformation Services",
                ],
                "source": ["TCBS", "TCBS", "TCBS"],
                "publish_date": [
                    "2024-11-15 10:30:00",
                    "2024-11-14 15:45:00",
                    "2024-11-13 09:15:00",
                ],
            }
        )


class TestCompanyAPIContract:
    """Test API contract and response format compliance."""

    @pytest.fixture
    def client(self):
        """Create test client for FastAPI application."""
        return TestClient(app)

    @patch("app.services.service_company.TCBSCompany")
    def test_response_format_compliance(self, mock_company_class, client):
        """Test that API responses match expected format."""
        mock_company = Mock()
        mock_company.overview.return_value = self._get_realistic_overview_data()
        mock_company_class.return_value = mock_company

        response = client.get("/api/company/FPT/overview")

        assert response.status_code == 200

        # Verify content type
        assert response.headers["content-type"] == "application/json"

        # Verify can parse as JSON
        data = response.json()
        assert isinstance(data, dict)

        # Verify required fields are present
        required_fields = [
            "exchange",
            "industry",
            "company_type",
            "no_shareholders",
            "foreign_percent",
            "outstanding_share",
            "established_year",
            "short_name",
        ]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def _get_realistic_overview_data(self):
        """Create realistic mock overview DataFrame."""
        import pandas as pd

        return pd.DataFrame(
            {
                "exchange": ["HOSE"],
                "industry": ["Technology"],
                "company_type": ["CTCP"],
                "no_shareholders": [45000],
                "foreign_percent": [0.48],
                "outstanding_share": [1250.5],
                "issue_share": [1250.5],
                "established_year": ["2007"],
                "no_employees": [15000],
                "stock_rating": [7.2],
                "delta_in_week": [0.025],
                "delta_in_month": [0.087],
                "delta_in_year": [0.156],
                "short_name": ["FPT Corporation"],
                "website": ["investor@fpt.com.vn"],
                "industry_id": [320],
                "industry_id_v2": ["9521"],
            }
        )
