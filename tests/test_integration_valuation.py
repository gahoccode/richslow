"""Integration tests for valuation API endpoints."""

import json
from unittest.mock import patch, MagicMock
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.schema_valuation import BetaMetrics, WACCMetrics, ValuationMetrics


class TestValuationAPIEndpoints:
    """Test valuation API endpoint integration."""
    
    def test_beta_endpoint_success(self, client, mock_vnstock_responses):
        """Test successful beta calculation endpoint."""
        with patch('app.services.service_valuation.stock') as mock_stock:
            mock_stock.history.side_effect = [
                mock_vnstock_responses["stock_history"],
                mock_vnstock_responses["market_history"]
            ]
            
            response = client.get("/api/beta/FPT?start_date=2023-01-01&end_date=2023-12-31")
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify response structure
            assert "ticker" in data
            assert "beta" in data
            assert "correlation" in data
            assert "r_squared" in data
            assert "volatility_stock" in data
            assert "volatility_market" in data
            assert "data_points_used" in data
            assert "start_date" in data
            assert "end_date" in data
            
            # Verify values
            assert data["ticker"] == "FPT"
            assert isinstance(data["beta"], (int, float))
            assert isinstance(data["correlation"], (int, float))
            assert data["data_points_used"] > 0

    def test_beta_endpoint_missing_params(self, client):
        """Test beta endpoint with missing parameters."""
        response = client.get("/api/beta/FPT")
        
        assert response.status_code == 422  # Validation error
        
    def test_beta_endpoint_invalid_ticker(self, client):
        """Test beta endpoint with invalid ticker."""
        with patch('app.services.service_valuation.stock') as mock_stock:
            mock_stock.history.side_effect = Exception("Invalid ticker")
            
            response = client.get("/api/beta/INVALID?start_date=2023-01-01&end_date=2023-12-31")
            
            assert response.status_code == 500
            error_data = response.json()
            assert "detail" in error_data
            assert "Failed to calculate beta" in error_data["detail"]

    def test_wacc_endpoint_success(self, client, mock_vnstock_responses, sample_beta_metrics):
        """Test successful WACC calculation endpoint."""
        with patch('app.services.service_valuation.stock') as mock_stock, \
             patch('app.services.service_valuation.calculate_beta') as mock_beta:
            
            mock_beta.return_value = sample_beta_metrics
            mock_stock.ratio.return_value = mock_vnstock_responses["ratios"]
            mock_stock.finance.return_value = mock_vnstock_responses["balance_sheet"]
            
            response = client.get("/api/wacc/FPT?start_date=2023-01-01&end_date=2023-12-31")
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify response structure
            wacc_fields = [
                "ticker", "wacc", "cost_of_equity", "cost_of_debt",
                "market_value_equity", "market_value_debt", "total_value",
                "equity_weight", "debt_weight", "tax_rate",
                "risk_free_rate", "market_risk_premium", "beta"
            ]
            
            for field in wacc_fields:
                assert field in data
                
            # Verify values
            assert data["ticker"] == "FPT"
            assert isinstance(data["wacc"], (int, float))
            assert isinstance(data["cost_of_equity"], (int, float))
            assert isinstance(data["cost_of_debt"], (int, float))
            assert data["beta"] == sample_beta_metrics.beta

    def test_wacc_endpoint_insufficient_data(self, client):
        """Test WACC endpoint with insufficient financial data."""
        with patch('app.services.service_valuation.stock') as mock_stock, \
             patch('app.services.service_valuation.calculate_beta') as mock_beta:
            
            mock_beta.return_value = BetaMetrics(
                ticker="FPT", beta=1.2, correlation=0.7, r_squared=0.5,
                volatility_stock=0.25, volatility_market=0.2,
                data_points_used=100, start_date="2023-01-01", end_date="2023-12-31"
            )
            
            # Mock insufficient data
            mock_stock.ratio.return_value = pd.DataFrame({"yearReport": [2023]})
            mock_stock.finance.return_value = pd.DataFrame({"yearReport": [2023]})
            
            response = client.get("/api/wacc/FPT?start_date=2023-01-01&end_date=2023-12-31")
            
            assert response.status_code == 500
            error_data = response.json()
            assert "Market capitalization data not available" in error_data["detail"]

    def test_valuation_endpoint_success(self, client, mock_vnstock_responses, sample_beta_metrics, sample_wacc_metrics):
        """Test successful comprehensive valuation endpoint."""
        with patch('app.services.service_valuation.stock') as mock_stock, \
             patch('app.services.service_valuation.calculate_beta') as mock_beta, \
             patch('app.services.service_valuation.calculate_wacc') as mock_wacc:
            
            mock_beta.return_value = sample_beta_metrics
            mock_wacc.return_value = sample_wacc_metrics
            mock_stock.ratio.return_value = mock_vnstock_responses["ratios"]
            mock_stock.finance.return_value = mock_vnstock_responses["balance_sheet"]
            
            response = client.get("/api/valuation/FPT?start_date=2023-01-01&end_date=2023-12-31")
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify response structure contains both beta and WACC data
            assert "beta_analysis" in data
            assert "wacc_analysis" in data
            assert "market_assumptions" in data
            
            # Verify beta analysis
            beta_data = data["beta_analysis"]
            assert beta_data["ticker"] == "FPT"
            assert "beta" in beta_data
            
            # Verify WACC analysis
            wacc_data = data["wacc_analysis"]
            assert wacc_data["ticker"] == "FPT" 
            assert "wacc" in wacc_data
            
            # Verify market assumptions
            assumptions = data["market_assumptions"]
            assert "vietnam_risk_free_rate" in assumptions
            assert "vietnam_market_risk_premium" in assumptions

    def test_market_assumptions_endpoint(self, client):
        """Test market assumptions endpoint."""
        response = client.get("/api/market-assumptions")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify Vietnamese market parameters
        required_fields = [
            "vietnam_risk_free_rate",
            "vietnam_market_risk_premium", 
            "vietnam_corporate_tax_rate",
            "default_credit_spread"
        ]
        
        for field in required_fields:
            assert field in data
            assert isinstance(data[field], (int, float))

    def test_api_endpoints_cors_headers(self, client):
        """Test CORS headers are properly set for valuation endpoints."""
        response = client.options("/api/beta/FPT?start_date=2023-01-01&end_date=2023-12-31")
        
        assert response.status_code == 200
        # Note: Actual CORS headers testing would require specific client configuration

    def test_api_error_handling_consistency(self, client):
        """Test consistent error handling across valuation endpoints."""
        endpoints = [
            "/api/beta/FPT?start_date=invalid&end_date=2023-12-31",
            "/api/wacc/FPT?start_date=invalid&end_date=2023-12-31", 
            "/api/valuation/FPT?start_date=invalid&end_date=2023-12-31"
        ]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 422  # Validation error
            
            error_data = response.json()
            assert "detail" in error_data

    def test_api_date_validation(self, client):
        """Test date parameter validation."""
        # Test invalid date format
        response = client.get("/api/beta/FPT?start_date=2023-13-01&end_date=2023-12-31")
        assert response.status_code == 422
        
        # Test end date before start date
        response = client.get("/api/beta/FPT?start_date=2023-12-31&end_date=2023-01-01")
        assert response.status_code == 422


class TestValuationAPIPerformance:
    """Test performance and resource usage of valuation APIs."""
    
    @patch('app.services.service_valuation.stock')
    def test_beta_calculation_performance(self, mock_stock, client, sample_stock_price_data, sample_vnindex_price_data):
        """Test beta calculation performance with large dataset."""
        # Create larger dataset for performance testing
        large_stock_data = pd.DataFrame({
            "time": pd.date_range("2020-01-01", "2023-12-31", freq="D"),
            "close": [100 + i * 0.1 for i in range(len(pd.date_range("2020-01-01", "2023-12-31", freq="D")))],
            "volume": [1000000] * len(pd.date_range("2020-01-01", "2023-12-31", freq="D"))
        })
        
        large_market_data = pd.DataFrame({
            "time": pd.date_range("2020-01-01", "2023-12-31", freq="D"),
            "close": [1000 + i * 0.05 for i in range(len(pd.date_range("2020-01-01", "2023-12-31", freq="D")))],
            "volume": [50000000] * len(pd.date_range("2020-01-01", "2023-12-31", freq="D"))
        })
        
        mock_stock.history.side_effect = [large_stock_data, large_market_data]
        
        import time
        start_time = time.time()
        
        response = client.get("/api/beta/FPT?start_date=2020-01-01&end_date=2023-12-31")
        
        execution_time = time.time() - start_time
        
        assert response.status_code == 200
        assert execution_time < 5.0  # Should complete within 5 seconds

    def test_concurrent_api_requests(self, client, mock_vnstock_responses):
        """Test handling of concurrent API requests."""
        import threading
        import time
        
        results = []
        
        def make_request():
            with patch('app.services.service_valuation.stock') as mock_stock:
                mock_stock.history.side_effect = [
                    mock_vnstock_responses["stock_history"],
                    mock_vnstock_responses["market_history"]
                ]
                response = client.get("/api/beta/FPT?start_date=2023-01-01&end_date=2023-12-31")
                results.append(response.status_code)
        
        # Create multiple concurrent requests
        threads = []
        for _ in range(5):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Verify all requests completed successfully
        assert all(status == 200 for status in results)
        assert len(results) == 5


class TestValuationDataIntegrity:
    """Test data integrity and consistency across valuation calculations."""
    
    def test_beta_wacc_consistency(self, client, mock_vnstock_responses, sample_beta_metrics):
        """Test that beta values are consistent between beta and WACC endpoints."""
        with patch('app.services.service_valuation.stock') as mock_stock:
            mock_stock.history.side_effect = [
                mock_vnstock_responses["stock_history"],
                mock_vnstock_responses["market_history"]
            ] * 2  # For both beta and WACC calls
            mock_stock.ratio.return_value = mock_vnstock_responses["ratios"]
            mock_stock.finance.return_value = mock_vnstock_responses["balance_sheet"]
            
            # Get beta from beta endpoint
            beta_response = client.get("/api/beta/FPT?start_date=2023-01-01&end_date=2023-12-31")
            beta_data = beta_response.json()
            
            # Get beta from WACC endpoint
            wacc_response = client.get("/api/wacc/FPT?start_date=2023-01-01&end_date=2023-12-31")
            wacc_data = wacc_response.json()
            
            # Beta values should be identical
            assert abs(beta_data["beta"] - wacc_data["beta"]) < 1e-10

    def test_valuation_response_completeness(self, client, mock_vnstock_responses, sample_beta_metrics, sample_wacc_metrics):
        """Test that comprehensive valuation response contains all required data."""
        with patch('app.services.service_valuation.calculate_beta') as mock_beta, \
             patch('app.services.service_valuation.calculate_wacc') as mock_wacc:
            
            mock_beta.return_value = sample_beta_metrics
            mock_wacc.return_value = sample_wacc_metrics
            
            response = client.get("/api/valuation/FPT?start_date=2023-01-01&end_date=2023-12-31")
            data = response.json()
            
            # Verify all sections are present and non-empty
            assert len(data["beta_analysis"]) > 0
            assert len(data["wacc_analysis"]) > 0
            assert len(data["market_assumptions"]) > 0
            
            # Verify data consistency
            assert data["beta_analysis"]["ticker"] == data["wacc_analysis"]["ticker"]

    def test_api_response_json_serialization(self, client, mock_vnstock_responses):
        """Test that all API responses are properly JSON serializable."""
        with patch('app.services.service_valuation.stock') as mock_stock:
            mock_stock.history.side_effect = [
                mock_vnstock_responses["stock_history"],
                mock_vnstock_responses["market_history"]
            ]
            
            response = client.get("/api/beta/FPT?start_date=2023-01-01&end_date=2023-12-31")
            
            # Verify response can be round-tripped through JSON
            json_str = response.content.decode()
            parsed_data = json.loads(json_str)
            re_serialized = json.dumps(parsed_data)
            
            assert isinstance(re_serialized, str)
            assert len(re_serialized) > 0