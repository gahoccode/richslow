"""Test company API endpoints with mocked vnstock responses.

This module provides comprehensive testing for all company-related API endpoints,
including proper error handling, validation, and response structure verification.
"""

from datetime import datetime
from unittest.mock import Mock, patch

import pytest
from fastapi.testclient import TestClient
from pandas import DataFrame

from app.main import app

client = TestClient(app)


class TestCompanyEndpoints:
    """Test company information API endpoints."""

    @pytest.fixture
    def mock_company_overview_data(self):
        """Mock company overview data from vnstock."""
        return DataFrame(
            {
                "exchange": ["HOSE"],
                "industry": ["Ngân hàng"],
                "company_type": ["NH"],
                "no_shareholders": [25183],
                "foreign_percent": [0.235],
                "outstanding_share": [5589.1],
                "issue_share": [0.0],
                "established_year": ["2008"],
                "no_employees": [40000],
                "stock_rating": [8.5],
                "delta_in_week": [-0.071],
                "delta_in_month": [-0.036],
                "delta_in_year": [0.15],
                "short_name": ["Vietcombank"],
                "website": ["https://vietcombank.com.vn"],
                "industry_id": [289],
                "industry_id_v2": ["8355"],
            }
        )

    @pytest.fixture
    def mock_company_profile_data(self):
        """Mock company profile data from vnstock."""
        return DataFrame(
            {
                "company_name": ["Ngân hàng Thương mại Cổ phần Ngoại thương Việt Nam"],
                "company_profile": [
                    "Ngân hàng Thương mại Cổ phần Ngoại thương Việt Nam là một trong những ngân hàng lớn nhất Việt Nam."
                ],
                "history_dev": ["Lịch sử phát triển của ngân hàng..."],
                "company_promise": [None],
                "business_risk": ["Rủi ro kinh doanh..."],
                "key_developments": ["Các phát triển chính..."],
                "business_strategies": ["Chiến lược kinh doanh..."],
            }
        )

    @pytest.fixture
    def mock_shareholders_data(self):
        """Mock company shareholders data from vnstock."""
        return DataFrame(
            {
                "share_holder": [
                    "Ngân Hàng Nhà Nước Việt Nam",
                    "Mizuho Bank Limited",
                    "Khác",
                ],
                "share_own_percent": [0.7480, 0.1500, 0.0295],
            }
        )

    @pytest.fixture
    def mock_officers_data(self):
        """Mock company officers data from vnstock."""
        return DataFrame(
            {
                "officer_name": ["Nguyễn Thanh Tùng", "Đàm Lam Thanh"],
                "officer_position": ["Tổng Giám đốc", None],
                "officer_own_percent": [0.0, 0.0],
            }
        )

    @pytest.fixture
    def mock_dividends_data(self):
        """Mock company dividends data from vnstock."""
        return DataFrame(
            {
                "exercise_date": ["25/07/23", "22/12/21"],
                "cash_year": [2023, 2022],
                "cash_dividend_percentage": [0.181, 0.276],
                "issue_method": ["share", "share"],
            }
        )

    @pytest.fixture
    def mock_company_news_data(self):
        """Mock company news data from vnstock."""
        return DataFrame(
            {
                "rsi": [41.4, 40.1],
                "rs": [50.0, 49.0],
                "price": [91900.0, 91200.0],
                "price_change": [700.0, 200.0],
                "price_change_ratio": [0.008, 0.002],
                "price_change_ratio_1m": [-0.028, -0.053],
                "id": [11170634, 11168477],
                "title": [
                    "VCB: Công bố đường dẫn BCTC riêng và HN Q1/2024",
                    "VCB: Cập nhật, bổ sung tài liệu họp ĐHĐCĐ",
                ],
                "source": ["TCBS", "TCBS"],
                "publish_date": ["2024-05-02 15:53:00", "2024-04-26 16:56:00"],
            }
        )

    def test_company_overview_endpoint_success(self, mock_company_overview_data):
        """Test successful company overview endpoint response."""
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.overview.return_value = mock_company_overview_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/overview")

            assert response.status_code == 200
            data = response.json()
            assert data["exchange"] == "HOSE"
            assert data["industry"] == "Ngân hàng"
            assert "ticker" not in data  # ticker not in schema
            assert data["short_name"] == "Vietcombank"
            assert data["established_year"] == "2008"

    def test_company_overview_endpoint_not_found(self):
        """Test company overview endpoint with invalid ticker."""
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.overview.return_value = DataFrame()  # Empty DataFrame
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/INVALID/overview")

            assert response.status_code == 404
            assert "No overview data found" in response.json()["detail"]

    def test_company_overview_endpoint_server_error(self):
        """Test company overview endpoint with server error."""
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.overview.side_effect = Exception("API connection failed")
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/overview")

            assert response.status_code == 500
            assert "Internal server error" in response.json()["detail"]

    def test_company_profile_endpoint_success(self, mock_company_profile_data):
        """Test successful company profile endpoint response."""
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.profile.return_value = mock_company_profile_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/profile")

            assert response.status_code == 200
            data = response.json()
            assert "Ngân hàng Thương mại Cổ phần" in data["company_name"]
            assert data["company_promise"] is None

    def test_company_shareholders_endpoint_success(self, mock_shareholders_data):
        """Test successful company shareholders endpoint response."""
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.shareholders.return_value = mock_shareholders_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/shareholders")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 3
            assert data[0]["share_holder"] == "Ngân Hàng Nhà Nước Việt Nam"
            assert data[0]["share_own_percent"] == 0.7480

    def test_company_shareholders_endpoint_empty(self):
        """Test company shareholders endpoint with no data."""
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.shareholders.return_value = DataFrame()  # Empty DataFrame
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/NEW/shareholders")

            assert response.status_code == 200
            data = response.json()
            assert data == []  # Should return empty list

    def test_company_officers_endpoint_success(self, mock_officers_data):
        """Test successful company officers endpoint response."""
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.officers.return_value = mock_officers_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/officers")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["officer_name"] == "Nguyễn Thanh Tùng"
            assert data[0]["officer_position"] == "Tổng Giám đốc"
            assert data[1]["officer_position"] is None

    def test_company_dividends_endpoint_success(self, mock_dividends_data):
        """Test successful company dividends endpoint response."""
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.dividends.return_value = mock_dividends_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/dividends")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["exercise_date"] == "25/07/23"
            assert data[0]["cash_year"] == 2023
            assert data[0]["cash_dividend_percentage"] == 0.181

    def test_company_news_endpoint_success(self, mock_company_news_data):
        """Test successful company news endpoint response."""
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.news.return_value = mock_company_news_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/news")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert "VCB:" in data[0]["title"]
            assert data[0]["source"] == "TCBS"
            assert data[0]["price"] == 91900.0

    def test_company_subsidiaries_endpoint_success(self):
        """Test successful company subsidiaries endpoint response."""
        mock_data = DataFrame(
            {
                "sub_company_name": [
                    "Công ty TNHH Chứng khoán Ngân hàng Thương mại Ngoại thương Việt Nam"
                ],
                "sub_own_percent": [1.000],
            }
        )

        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.subsidiaries.return_value = mock_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/subsidiaries")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert "Chứng khoán" in data[0]["sub_company_name"]
            assert data[0]["sub_own_percent"] == 1.000

    def test_company_insider_deals_endpoint_success(self):
        """Test successful company insider deals endpoint response."""
        mock_data = DataFrame(
            {
                "deal_announce_date": [datetime(2023, 12, 21)],
                "deal_method": [None],
                "deal_action": ["Mua"],
                "deal_quantity": [5000.0],
                "deal_price": [80900.0],
                "deal_ratio": [0.115],
            }
        )

        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.insider_deals.return_value = mock_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/insider-deals")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["deal_action"] == "Mua"
            assert data[0]["deal_method"] is None

    def test_company_events_endpoint_success(self):
        """Test successful company events endpoint response."""
        mock_data = DataFrame(
            {
                "rsi": [56.4],
                "rs": [54.0],
                "id": [2566332],
                "price": [94400],
                "price_change": [300],
                "price_change_ratio": [0.003],
                "price_change_ratio_1m": [-0.028],
                "event_name": ["Đại hội đồng cổ đông"],
                "event_code": ["DHCĐ"],
                "notify_date": ["2024-03-12 00:00:00"],
                "exer_date": ["2024-04-27 00:00:00"],
                "reg_final_date": ["2024-03-27 00:00:00"],
                "exer_right_date": ["2024-03-26 00:00:00"],
                "event_desc": ["Ngân hàng Thương mại Cổ phần Ngoại thương Việt Nam..."],
            }
        )

        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.events.return_value = mock_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/events")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["event_name"] == "Đại hội đồng cổ đông"
            assert data[0]["rsi"] == 56.4

    def test_company_ratio_endpoint_success(self):
        """Test successful company ratio endpoint response."""
        mock_data = DataFrame(
            {
                "symbol": ["VCB"],
                "year_report": [2023],
                "length_report": [12],
                "update_date": [20240315],
                "revenue": [150000000],
                "revenue_growth": [0.15],
                "net_profit": [50000000],
                "net_profit_growth": [0.12],
                "ebit_margin": [30],
                "roe": [0.18],
                "roic": [25],
                "roa": [0.12],
                "pe": [15.5],
                "pb": [1.8],
                "eps": [3500.0],
                "current_ratio": [1.5],
                "cash_ratio": [0.8],
                "quick_ratio": [1.2],
                "interest_coverage": [None],
                "ae": [20000000],
                "fae": [18000000],
                "net_profit_margin": [0.33],
                "gross_margin": [45],
                "ev": [5000000000],
                "issue_share": [1000000],
                "ps": [2.5],
                "pcf": [12.0],
                "bvps": [20000.0],
                "ev_per_ebitda": [8],
                "at": [400000000],
                "fat": [350000000],
                "acp": [None],
                "dso": [45],
                "dpo": [60],
                "eps_ttm": [3400.0],
                "charter_capital": [30000000],
                "rtq4": [85000],
                "charter_capital_ratio": [0.2],
                "rtq10": [88000],
                "dividend": [1500],
                "ebitda": [80000000],
                "ebit": [60000000],
                "le": [200000000],
                "de": [100000000],
                "ccc": [None],
                "rtq17": [82000],
            }
        )

        with patch("app.services.service_company.VCICompany") as mock_company_class:
            mock_company = Mock()
            mock_company.ratio_summary.return_value = mock_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/ratio")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["symbol"] == "VCB"
            assert data[0]["year_report"] == 2023
            assert data[0]["roe"] == 0.18
            assert data[0]["interest_coverage"] is None

    def test_company_reports_endpoint_success(self):
        """Test successful company reports endpoint response."""
        mock_data = DataFrame(
            {
                "date": ["2024-03-15"],
                "description": ["Báo cáo tài chính quý 1/2024"],
                "link": ["https://example.com/report.pdf"],
                "name": ["Q1_2024_Financial_Report.pdf"],
            }
        )

        with patch("app.services.service_company.VCICompany") as mock_company_class:
            mock_company = Mock()
            mock_company.reports.return_value = mock_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/reports")

            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["description"] == "Báo cáo tài chính quý 1/2024"
            assert data[0]["link"] == "https://example.com/report.pdf"

    def test_company_trading_stats_endpoint_success(self):
        """Test successful company trading stats endpoint response."""
        mock_data = DataFrame(
            {
                "symbol": ["VCB"],
                "exchange": ["HOSE"],
                "ev": [5000000000],
                "ceiling": [95000],
                "floor": [85000],
                "foreign_room": [1000000],
                "avg_match_volume_2w": [5000000],
                "foreign_holding_room": [300000],
                "current_holding_ratio": [0.25],
                "max_holding_ratio": [0.49],
            }
        )

        with patch("app.services.service_company.VCICompany") as mock_company_class:
            mock_company = Mock()
            mock_company.trading_stats.return_value = mock_data
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/VCB/trading-stats")

            assert response.status_code == 200
            data = response.json()
            assert data["symbol"] == "VCB"
            assert data["exchange"] == "HOSE"
            assert data["ceiling"] == 95000
            assert data["current_holding_ratio"] == 0.25

    def test_company_trading_stats_endpoint_not_found(self):
        """Test company trading stats endpoint with invalid ticker."""
        with patch("app.services.service_company.VCICompany") as mock_company_class:
            mock_company = Mock()
            mock_company.trading_stats.return_value = DataFrame()  # Empty DataFrame
            mock_company_class.return_value = mock_company

            response = client.get("/api/company/INVALID/trading-stats")

            assert response.status_code == 404
            assert "No trading statistics found" in response.json()["detail"]

    def test_api_docs_includes_company_endpoints(self):
        """Test that API documentation includes company endpoints."""
        response = client.get("/api/docs")

        assert response.status_code == 200
        # Check that this is the Swagger UI page for our API
        assert "RichSlow Financial Analysis API" in response.text
        # Check that Swagger UI is properly loaded
        assert "swagger-ui" in response.text

    def test_openapi_schema_includes_company_models(self):
        """Test that OpenAPI schema includes company response models."""
        response = client.get("/openapi.json")

        assert response.status_code == 200
        schema = response.json()

        # Check that company endpoints are in the schema
        assert "/api/company/{ticker}/overview" in schema["paths"]
        assert "/api/company/{ticker}/profile" in schema["paths"]
        assert "/api/company/{ticker}/shareholders" in schema["paths"]
        assert "/api/company/{ticker}/officers" in schema["paths"]
        assert "/api/company/{ticker}/dividends" in schema["paths"]
        assert "/api/company/{ticker}/news" in schema["paths"]
        assert "/api/company/{ticker}/ratio" in schema["paths"]
        assert "/api/company/{ticker}/trading-stats" in schema["paths"]

        # Check that company models are defined
        assert "CompanyOverviewTCBS" in schema["components"]["schemas"]
        assert "CompanyProfile" in schema["components"]["schemas"]
        assert "CompanyShareholders" in schema["components"]["schemas"]
        assert "CompanyOfficer" in schema["components"]["schemas"]
        assert "DividendHistory" in schema["components"]["schemas"]
        assert "CompanyNews" in schema["components"]["schemas"]
        assert "CompanyRatioVCI" in schema["components"]["schemas"]
        assert "TradingStatsVCI" in schema["components"]["schemas"]

    @pytest.mark.parametrize("ticker", ["VCB", "FPT", "HPG", "ACB"])
    def test_multiple_tickers_success(self, ticker, mock_company_overview_data):
        """Test company endpoints with different valid tickers."""
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.overview.return_value = mock_company_overview_data
            mock_company_class.return_value = mock_company

            response = client.get(f"/api/company/{ticker}/overview")

            assert response.status_code == 200
            data = response.json()
            assert data["exchange"] == "HOSE"

    @pytest.mark.parametrize(
        "invalid_ticker", ["", "123", "TOOLONGTICKERNAME", "inv@lid"]
    )
    def test_invalid_ticker_formats(self, invalid_ticker):
        """Test company endpoints with invalid ticker formats."""
        # Most endpoints should still accept path parameters and return proper errors
        with patch("app.services.service_company.TCBSCompany") as mock_company_class:
            mock_company = Mock()
            mock_company.overview.return_value = DataFrame()
            mock_company_class.return_value = mock_company

            response = client.get(f"/api/company/{invalid_ticker}/overview")

            # Should return 404 for invalid tickers (empty DataFrame from vnstock)
            assert response.status_code == 404
