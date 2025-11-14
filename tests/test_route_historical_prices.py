"""Integration tests for historical prices API endpoints."""

from datetime import datetime
from unittest.mock import MagicMock, patch

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestStockPricesEndpoint:
    """Test /api/stock-prices/{ticker} endpoint."""

    @patch("app.routes.route_historical_prices.Vnstock")
    def test_fetch_stock_prices_success(self, mock_vnstock):
        """Test successful stock price fetch."""
        # Mock vnstock response
        mock_df = pd.DataFrame(
            {
                "time": [datetime(2024, 1, 1), datetime(2024, 1, 2)],
                "open": [100.0, 101.0],
                "high": [105.0, 106.0],
                "low": [99.0, 100.0],
                "close": [104.0, 105.0],
                "volume": [1000000.0, 1100000.0],
            }
        )

        mock_stock = MagicMock()
        mock_stock.quote.history.return_value = mock_df
        mock_vnstock.return_value.stock.return_value = mock_stock

        response = client.get(
            "/api/stock-prices/FPT?start_date=2024-01-01&end_date=2024-01-31&interval=1D"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["open"] == 100.0
        assert data[0]["close"] == 104.0
        assert data[1]["volume"] == 1100000.0

    @patch("app.routes.route_historical_prices.Vnstock")
    def test_fetch_stock_prices_no_data(self, mock_vnstock):
        """Test stock price fetch with no data available."""
        mock_stock = MagicMock()
        mock_stock.quote.history.return_value = pd.DataFrame()
        mock_vnstock.return_value.stock.return_value = mock_stock

        response = client.get(
            "/api/stock-prices/INVALID?start_date=2024-01-01&end_date=2024-01-31"
        )

        assert response.status_code == 404
        assert "No price data found" in response.json()["detail"]

    def test_fetch_stock_prices_missing_params(self):
        """Test stock price fetch with missing required parameters."""
        response = client.get("/api/stock-prices/FPT")
        assert response.status_code == 422  # Unprocessable Entity

    @patch("app.routes.route_historical_prices.Vnstock")
    def test_fetch_stock_prices_api_error(self, mock_vnstock):
        """Test stock price fetch when vnstock API fails."""
        mock_vnstock.return_value.stock.side_effect = Exception("API Error")

        response = client.get(
            "/api/stock-prices/FPT?start_date=2024-01-01&end_date=2024-01-31"
        )

        assert response.status_code == 500
        assert "Failed to fetch stock prices" in response.json()["detail"]


class TestExchangeRatesEndpoint:
    """Test /api/exchange-rates endpoint."""

    @patch("app.routes.route_historical_prices.vcb_exchange_rate")
    def test_fetch_exchange_rates_success(self, mock_vcb):
        """Test successful exchange rates fetch."""
        mock_df = pd.DataFrame(
            {
                "currency_code": ["USD", "EUR"],
                "currency_name": ["US DOLLAR", "EURO"],
                "buy _cash": ["25,154.00", "26,739.75"],
                "buy _transfer": ["25,184.00", "27,009.85"],
                "sell": ["25,484.00", "28,205.84"],
                "date": ["2024-05-10", "2024-05-10"],
            }
        )
        mock_vcb.return_value = mock_df

        response = client.get("/api/exchange-rates?date=2024-05-10")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["currency_code"] == "USD"
        # Note: Pydantic uses aliases in JSON output, so field name has space
        assert data[0]["buy _cash"] == 25154.0
        assert data[1]["currency_code"] == "EUR"

    @patch("app.routes.route_historical_prices.vcb_exchange_rate")
    def test_fetch_exchange_rates_default_date(self, mock_vcb):
        """Test exchange rates fetch with default date (today)."""
        mock_df = pd.DataFrame(
            {
                "currency_code": ["USD"],
                "currency_name": ["US DOLLAR"],
                "buy _cash": ["25,154.00"],
                "buy _transfer": ["25,184.00"],
                "sell": ["25,484.00"],
                "date": [datetime.now().strftime("%Y-%m-%d")],
            }
        )
        mock_vcb.return_value = mock_df

        response = client.get("/api/exchange-rates")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1

    @patch("app.routes.route_historical_prices.vcb_exchange_rate")
    def test_fetch_exchange_rates_missing_values(self, mock_vcb):
        """Test exchange rates with missing values (dashes converted to None)."""
        mock_df = pd.DataFrame(
            {
                "currency_code": ["DKK"],
                "currency_name": ["DANISH KRONE"],
                "buy _cash": ["-"],
                "buy _transfer": ["3,611.55"],
                "sell": ["3,749.84"],
                "date": ["2024-05-10"],
            }
        )
        mock_vcb.return_value = mock_df

        response = client.get("/api/exchange-rates?date=2024-05-10")

        # Should succeed - buy_cash field is now optional (None when dash)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["currency_code"] == "DKK"
        assert data[0]["buy _cash"] is None  # Dash converted to None
        assert data[0]["buy _transfer"] == 3611.55

    @patch("app.routes.route_historical_prices.vcb_exchange_rate")
    def test_fetch_exchange_rates_no_data(self, mock_vcb):
        """Test exchange rates fetch with no data."""
        mock_vcb.return_value = pd.DataFrame()

        response = client.get("/api/exchange-rates?date=2024-01-01")

        assert response.status_code == 404
        assert "No exchange rate data found" in response.json()["detail"]


class TestGoldSJCEndpoint:
    """Test /api/gold/sjc endpoint."""

    @patch("app.routes.route_historical_prices.sjc_gold_price")
    def test_fetch_gold_sjc_success(self, mock_sjc):
        """Test successful SJC gold price fetch."""
        mock_df = pd.DataFrame(
            {
                "name": ["SJC 1L, 10L, 1KG", "Vàng nhẫn SJC 99,99"],
                "buy_price": ["88,500,000", "74,950,000"],
                "sell_price": ["90,500,000", "76,550,000"],
            }
        )
        mock_sjc.return_value = mock_df

        response = client.get("/api/gold/sjc")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "SJC 1L, 10L, 1KG"
        assert data[0]["buy_price"] == 88500000.0
        assert data[0]["sell_price"] == 90500000.0

    @patch("app.routes.route_historical_prices.sjc_gold_price")
    def test_fetch_gold_sjc_no_data(self, mock_sjc):
        """Test SJC gold price fetch with no data."""
        mock_sjc.return_value = pd.DataFrame()

        response = client.get("/api/gold/sjc")

        assert response.status_code == 404
        assert "No SJC gold price data available" in response.json()["detail"]

    @patch("app.routes.route_historical_prices.sjc_gold_price")
    def test_fetch_gold_sjc_api_error(self, mock_sjc):
        """Test SJC gold price fetch when API fails."""
        mock_sjc.side_effect = Exception("API connection failed")

        response = client.get("/api/gold/sjc")

        assert response.status_code == 500
        assert "Failed to fetch SJC gold prices" in response.json()["detail"]


class TestGoldBTMCEndpoint:
    """Test /api/gold/btmc endpoint."""

    @patch("app.routes.route_historical_prices.btmc_goldprice")
    def test_fetch_gold_btmc_success(self, mock_btmc):
        """Test successful BTMC gold price fetch."""
        mock_df = pd.DataFrame(
            {
                "name": ["VÀNG MIẾNG SJC", "VÀNG MIẾNG VRTL"],
                "karat": ["24k", "24k"],
                "gold_content": ["999.9", "999.9"],
                "buy_price": ["8,845,000", "7,542,000"],
                "sell_price": ["9,000,000", "7,682,000"],
                "world_price": ["7,338,000", "7,319,000"],
                "time": ["28/05/2024 08:52", "28/05/2024 13:50"],
            }
        )
        mock_btmc.return_value = mock_df

        response = client.get("/api/gold/btmc")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "VÀNG MIẾNG SJC"
        assert data[0]["karat"] == "24k"
        assert data[0]["buy_price"] == 8845000
        assert data[0]["world_price"] == 7338000

    @patch("app.routes.route_historical_prices.btmc_goldprice")
    def test_fetch_gold_btmc_datetime_parsing(self, mock_btmc):
        """Test BTMC gold price datetime parsing."""
        mock_df = pd.DataFrame(
            {
                "name": ["VÀNG MIẾNG"],
                "karat": ["24k"],
                "gold_content": ["999.9"],
                "buy_price": ["8,845,000"],
                "sell_price": ["9,000,000"],
                "world_price": ["7,338,000"],
                "time": ["28/05/2024 08:52"],
            }
        )
        mock_btmc.return_value = mock_df

        response = client.get("/api/gold/btmc")

        assert response.status_code == 200
        data = response.json()
        assert "2024-05-28" in data[0]["time"]
        assert "08:52" in data[0]["time"]

    @patch("app.routes.route_historical_prices.btmc_goldprice")
    def test_fetch_gold_btmc_no_data(self, mock_btmc):
        """Test BTMC gold price fetch with no data."""
        mock_btmc.return_value = pd.DataFrame()

        response = client.get("/api/gold/btmc")

        assert response.status_code == 404
        assert "No BTMC gold price data available" in response.json()["detail"]


class TestEndpointIntegration:
    """Test endpoint integration and API documentation."""

    def test_api_docs_accessible(self):
        """Test that API documentation is accessible."""
        response = client.get("/api/docs")
        assert response.status_code == 200

    def test_openapi_schema_includes_endpoints(self):
        """Test that OpenAPI schema includes all historical price endpoints."""
        response = client.get("/openapi.json")
        assert response.status_code == 200

        schema = response.json()
        paths = schema["paths"]

        # Check all endpoints are documented
        assert "/api/stock-prices/{ticker}" in paths
        assert "/api/exchange-rates" in paths
        assert "/api/gold/sjc" in paths
        assert "/api/gold/btmc" in paths

    def test_health_check_still_works(self):
        """Test that existing health check endpoint still works after adding new routes."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
