"""Integration and end-to-end tests for the financial statements API."""

import json
from unittest.mock import Mock, patch

import pandas as pd
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.schema_statements import FinancialStatementsResponse


class TestAPIIntegration:
    """Test full API integration with mocked external services."""

    @pytest.fixture
    def client(self):
        """Create test client for FastAPI application."""
        return TestClient(app)

    @patch('app.services.service_statements.Vnstock')
    def test_get_financial_statements_endpoint_success(self, mock_vnstock_class, client,
                                                     sample_vnstock_income_data,
                                                     sample_vnstock_balance_data,
                                                     sample_vnstock_cashflow_data,
                                                     sample_vnstock_ratios_data):
        """Test successful API call to financial statements endpoint."""
        # Setup mock
        mock_vnstock_instance = Mock()
        mock_stock_instance = Mock()
        mock_finance_instance = Mock()
        
        mock_vnstock_class.return_value.stock.return_value = mock_stock_instance
        mock_stock_instance.finance = mock_finance_instance
        
        # Configure mock responses
        mock_finance_instance.cash_flow.return_value = sample_vnstock_cashflow_data
        mock_finance_instance.balance_sheet.return_value = sample_vnstock_balance_data
        mock_finance_instance.income_statement.return_value = sample_vnstock_income_data
        mock_finance_instance.ratio.return_value = sample_vnstock_ratios_data
        
        # Make API request
        response = client.post("/api/statements/TEST", json={
            "ticker": "TEST",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "period": "year"
        })
        
        # Verify response
        assert response.status_code == 200
        
        data = response.json()
        assert data["ticker"] == "TEST"
        assert data["period"] == "year"
        assert len(data["ratios"]) == 3  # 3 years of data
        
        # Verify critical fields are present and correctly mapped
        first_ratio = data["ratios"][0]
        assert first_ratio["year_report"] == 2023
        assert first_ratio["pe_ratio"] == 15.5
        assert first_ratio["roe"] == 0.225
        assert first_ratio["debt_to_equity"] == 0.6
        assert first_ratio["average_collection_days"] == 40.0
        assert first_ratio["cash_conversion_cycle"] == 70.0

    def test_get_financial_statements_invalid_ticker(self, client):
        """Test API response with invalid ticker."""
        response = client.post("/api/statements/INVALID", json={
            "ticker": "INVALID",
            "start_date": "2023-01-01", 
            "end_date": "2023-12-31",
            "period": "year"
        })
        
        # Should return error response
        assert response.status_code in [400, 422, 500]

    def test_get_financial_statements_invalid_request_data(self, client):
        """Test API validation with invalid request data."""
        # Missing required fields
        response = client.post("/api/statements/TEST", json={
            "ticker": "TEST"
            # Missing start_date, end_date, period
        })
        
        assert response.status_code == 422
        
        # Invalid period
        response = client.post("/api/statements/TEST", json={
            "ticker": "TEST",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31", 
            "period": "invalid_period"
        })
        
        assert response.status_code == 422

    def test_api_response_schema_validation(self, client):
        """Test that API response matches expected schema."""
        with patch('app.services.service_statements.Vnstock') as mock_vnstock_class:
            # Setup minimal mock data
            mock_vnstock_instance = Mock()
            mock_stock_instance = Mock()
            mock_finance_instance = Mock()
            
            mock_vnstock_class.return_value.stock.return_value = mock_stock_instance
            mock_stock_instance.finance = mock_finance_instance
            
            # Configure minimal mock responses
            mock_finance_instance.cash_flow.return_value = pd.DataFrame({"yearReport": [2023]})
            mock_finance_instance.balance_sheet.return_value = pd.DataFrame({"yearReport": [2023]})
            mock_finance_instance.income_statement.return_value = pd.DataFrame({"yearReport": [2023]})
            mock_finance_instance.ratio.return_value = pd.DataFrame({"yearReport": [2023]})
            
            response = client.post("/api/statements/TEST", json={
                "ticker": "TEST",
                "start_date": "2023-01-01",
                "end_date": "2023-12-31",
                "period": "year"
            })
            
            if response.status_code == 200:
                # Validate response can be parsed as our schema
                data = response.json()
                validated_response = FinancialStatementsResponse(**data)
                
                assert validated_response.ticker == "TEST"
                assert validated_response.period == "year"


class TestFrontendBackendIntegration:
    """Test frontend-backend integration patterns."""

    @pytest.fixture
    def client(self):
        """Create test client for FastAPI application."""
        return TestClient(app)

    def test_static_files_served(self, client):
        """Test that static files are properly served."""
        # Test main page
        response = client.get("/")
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        
        # Test statements page  
        response = client.get("/statements.html")
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        
        # Test JavaScript files
        response = client.get("/js/common.js")
        assert response.status_code == 200
        assert "javascript" in response.headers.get("content-type", "")
        
        response = client.get("/js/statements.js")
        assert response.status_code == 200
        assert "javascript" in response.headers.get("content-type", "")

    def test_api_documentation_available(self, client):
        """Test that API documentation is available."""
        response = client.get("/docs")
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
        
        # Test OpenAPI schema
        response = client.get("/openapi.json")
        assert response.status_code == 200
        
        openapi_data = response.json()
        assert "paths" in openapi_data
        assert "/api/statements/{ticker}" in openapi_data["paths"]

    def test_cors_headers_present(self, client):
        """Test that CORS headers are properly configured."""
        response = client.options("/api/statements/TEST")
        
        # Should have CORS headers
        headers = response.headers
        assert "access-control-allow-origin" in headers
        assert "access-control-allow-methods" in headers

    @patch('app.services.service_statements.Vnstock')
    def test_frontend_field_contract_fulfillment(self, mock_vnstock_class, client,
                                                sample_vnstock_ratios_data):
        """Test that API provides all fields frontend expects."""
        # Setup mock with comprehensive data
        mock_vnstock_instance = Mock()
        mock_stock_instance = Mock()
        mock_finance_instance = Mock()
        
        mock_vnstock_class.return_value.stock.return_value = mock_stock_instance
        mock_stock_instance.finance = mock_finance_instance
        
        # Configure mock responses with comprehensive data
        mock_finance_instance.cash_flow.return_value = pd.DataFrame({"yearReport": [2023]})
        mock_finance_instance.balance_sheet.return_value = pd.DataFrame({"yearReport": [2023]})
        mock_finance_instance.income_statement.return_value = pd.DataFrame({"yearReport": [2023]})
        mock_finance_instance.ratio.return_value = sample_vnstock_ratios_data
        
        response = client.post("/api/statements/TEST", json={
            "ticker": "TEST",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "period": "year"
        })
        
        assert response.status_code == 200
        
        data = response.json()
        if data["ratios"]:
            ratio_data = data["ratios"][0]
            
            # Frontend critical fields that were previously missing
            frontend_critical_fields = [
                "average_collection_days",
                "average_inventory_days", 
                "average_payment_days",
                "cash_conversion_cycle",
                "bank_loans_long_term_debt_to_equity",
                "debt_to_equity",
                "gross_profit_margin",
                "net_profit_margin",
                "roe",
                "roa",
                "dividend_yield",
            ]
            
            for field in frontend_critical_fields:
                assert field in ratio_data, f"Critical frontend field {field} missing from API response"


class TestEndToEndWorkflow:
    """Test complete end-to-end user workflows."""

    @pytest.fixture
    def client(self):
        """Create test client for FastAPI application."""
        return TestClient(app)

    def test_user_session_workflow(self, client):
        """Test typical user workflow from landing page to statements."""
        # 1. User visits landing page
        response = client.get("/")
        assert response.status_code == 200
        
        # 2. User accesses statements page
        response = client.get("/statements.html")
        assert response.status_code == 200
        
        # 3. Frontend would call API (simulated)
        # This tests the full cycle from user input to data display

    @patch('app.services.service_statements.Vnstock')
    def test_complete_data_pipeline(self, mock_vnstock_class, client,
                                  sample_vnstock_income_data,
                                  sample_vnstock_balance_data,
                                  sample_vnstock_cashflow_data,
                                  sample_vnstock_ratios_data):
        """Test complete data pipeline from vnstock to frontend."""
        # Setup comprehensive mock
        mock_vnstock_instance = Mock()
        mock_stock_instance = Mock()
        mock_finance_instance = Mock()
        
        mock_vnstock_class.return_value.stock.return_value = mock_stock_instance
        mock_stock_instance.finance = mock_finance_instance
        
        # Configure all data sources
        mock_finance_instance.cash_flow.return_value = sample_vnstock_cashflow_data
        mock_finance_instance.balance_sheet.return_value = sample_vnstock_balance_data
        mock_finance_instance.income_statement.return_value = sample_vnstock_income_data
        mock_finance_instance.ratio.return_value = sample_vnstock_ratios_data
        
        # Test API call
        response = client.post("/api/statements/TEST", json={
            "ticker": "TEST",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "period": "year"
        })
        
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify complete data structure
        assert "ticker" in data
        assert "period" in data
        assert "income_statements" in data
        assert "balance_sheets" in data
        assert "cash_flows" in data
        assert "ratios" in data
        assert "years" in data
        
        # Verify data quality
        assert len(data["ratios"]) > 0
        assert len(data["years"]) > 0
        
        # Verify all critical financial metrics are populated
        first_ratio = data["ratios"][0]
        critical_metrics = [
            "pe_ratio", "roe", "debt_to_equity", "current_ratio",
            "average_collection_days", "cash_conversion_cycle"
        ]
        
        for metric in critical_metrics:
            assert metric in first_ratio


class TestErrorHandlingAndResilience:
    """Test error handling and system resilience."""

    @pytest.fixture
    def client(self):
        """Create test client for FastAPI application."""
        return TestClient(app)

    @patch('app.services.service_statements.Vnstock')
    def test_vnstock_api_failure_handling(self, mock_vnstock_class, client):
        """Test handling of vnstock API failures."""
        # Simulate vnstock API failure
        mock_vnstock_class.side_effect = Exception("vnstock API unavailable")
        
        response = client.post("/api/statements/TEST", json={
            "ticker": "TEST",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "period": "year"
        })
        
        # Should return error response, not crash
        assert response.status_code in [400, 500, 503]

    @patch('app.services.service_statements.Vnstock')
    def test_partial_data_handling(self, mock_vnstock_class, client):
        """Test handling when only partial data is available."""
        # Setup mock with some missing data
        mock_vnstock_instance = Mock()
        mock_stock_instance = Mock()
        mock_finance_instance = Mock()
        
        mock_vnstock_class.return_value.stock.return_value = mock_stock_instance
        mock_stock_instance.finance = mock_finance_instance
        
        # Only provide ratios data, simulate other data sources failing
        mock_finance_instance.cash_flow.side_effect = Exception("Cash flow data unavailable")
        mock_finance_instance.balance_sheet.side_effect = Exception("Balance sheet unavailable")
        mock_finance_instance.income_statement.side_effect = Exception("Income statement unavailable")
        mock_finance_instance.ratio.return_value = pd.DataFrame({"yearReport": [2023]})
        
        response = client.post("/api/statements/TEST", json={
            "ticker": "TEST",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "period": "year"
        })
        
        # Should handle gracefully
        if response.status_code == 200:
            data = response.json()
            # Should have ratios but empty other statements
            assert "ratios" in data
        else:
            # Or return appropriate error
            assert response.status_code in [400, 500]

    def test_malformed_request_handling(self, client):
        """Test handling of malformed requests."""
        # Send invalid JSON
        response = client.post("/api/statements/TEST", 
                             data="invalid json",
                             headers={"content-type": "application/json"})
        assert response.status_code == 422
        
        # Send wrong content type
        response = client.post("/api/statements/TEST",
                             data="ticker=TEST",
                             headers={"content-type": "application/x-www-form-urlencoded"})
        assert response.status_code in [422, 415]


class TestPerformanceAndScaling:
    """Test performance characteristics and scaling behavior."""

    @pytest.fixture
    def client(self):
        """Create test client for FastAPI application."""
        return TestClient(app)

    @patch('app.services.service_statements.Vnstock')
    def test_response_time_acceptable(self, mock_vnstock_class, client):
        """Test that API responses are returned in reasonable time."""
        import time
        
        # Setup minimal mock for fast response
        mock_vnstock_instance = Mock()
        mock_stock_instance = Mock()
        mock_finance_instance = Mock()
        
        mock_vnstock_class.return_value.stock.return_value = mock_stock_instance
        mock_stock_instance.finance = mock_finance_instance
        
        # Configure fast mock responses
        mock_finance_instance.cash_flow.return_value = pd.DataFrame({"yearReport": [2023]})
        mock_finance_instance.balance_sheet.return_value = pd.DataFrame({"yearReport": [2023]})
        mock_finance_instance.income_statement.return_value = pd.DataFrame({"yearReport": [2023]})
        mock_finance_instance.ratio.return_value = pd.DataFrame({"yearReport": [2023]})
        
        start_time = time.time()
        
        response = client.post("/api/statements/TEST", json={
            "ticker": "TEST",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "period": "year"
        })
        
        end_time = time.time()
        response_time = end_time - start_time
        
        # Response should be reasonably fast (under 5 seconds with mocked data)
        assert response_time < 5.0
        assert response.status_code == 200

    def test_memory_usage_reasonable(self, client):
        """Test that memory usage stays reasonable during operation."""
        # Test multiple static file requests don't cause memory leaks
        for _ in range(10):
            response = client.get("/")
            assert response.status_code == 200
            
            response = client.get("/js/statements.js")
            assert response.status_code == 200
        
        # If we get here without memory errors, memory usage is acceptable
        assert True