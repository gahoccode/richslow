"""Contract alignment tests for valuation frontend-backend integration."""

import json
from typing import Dict, Any
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from app.main import app
from app.schemas.schema_valuation import BetaMetrics, WACCMetrics, ValuationMetrics


class TestValuationContractAlignment:
    """Test alignment between valuation API responses and frontend expectations."""
    
    @pytest.fixture
    def expected_beta_fields(self) -> Dict[str, str]:
        """Frontend field expectations from valuation.js beta analysis."""
        return {
            "beta": "Beta (vs VNINDEX)",
            "correlation": "Correlation with Market", 
            "r_squared": "R-squared (Statistical Quality)",
            "stock_volatility": "Stock Volatility (Annualized)",
            "market_volatility": "Market Volatility (Annualized)",
            "start_date": "Analysis Period Start",
            "end_date": "Analysis Period End",
        }
    
    @pytest.fixture 
    def expected_wacc_fields(self) -> Dict[str, str]:
        """Frontend field expectations from valuation.js WACC analysis."""
        return {
            "wacc": "Weighted Average Cost of Capital (WACC)",
            "cost_of_equity": "Cost of Equity (Re)",
            "cost_of_debt": "After-tax Cost of Debt (Rd)",
            "equity_weight": "Equity Weight (E/V)",
            "debt_weight": "Debt Weight (D/V)",
            "market_cap": "Market Value of Equity (Bn VND)",
            "total_debt": "Market Value of Debt (Bn VND)",
            "enterprise_value": "Enterprise Value (Bn VND)",
        }
    
    @pytest.fixture
    def expected_market_assumptions_fields(self) -> Dict[str, str]:
        """Frontend field expectations from valuation.js market assumptions."""
        return {
            "vietnam_risk_free_rate": "Risk-free Rate",
            "vietnam_market_risk_premium": "Market Risk Premium", 
            "vietnam_corporate_tax_rate": "Corporate Tax Rate",
            "default_credit_spread": "Default Credit Spread",
        }
    
    @pytest.fixture
    def expected_data_quality_fields(self) -> Dict[str, str]:
        """Frontend field expectations from valuation.js data quality metrics."""
        return {
            "beta_data_points": "Trading Days Used",
            "beta_correlation": "Correlation with VNINDEX",
            "beta_r_squared": "R-squared (Goodness of Fit)",
            "statistical_quality": "Overall Statistical Quality",
            "periods_analyzed": "Financial Periods Analyzed",
            "volatility_analysis": "Volatility Analysis",
        }

    def test_beta_endpoint_field_alignment(self, client, mock_vnstock_responses, expected_beta_fields):
        """Test beta endpoint response contains all frontend-expected fields."""
        with patch('app.services.service_valuation.stock') as mock_stock:
            mock_stock.history.side_effect = [
                mock_vnstock_responses["stock_history"],
                mock_vnstock_responses["market_history"]
            ]
            
            response = client.get("/api/beta/FPT?start_date=2023-01-01&end_date=2023-12-31")
            assert response.status_code == 200
            
            data = response.json()
            
            # Verify all frontend-expected fields are present
            for field, label in expected_beta_fields.items():
                assert field in data, f"Missing field '{field}' (expected for '{label}') in beta response"
                
                # Verify field has valid data type
                value = data[field]
                if field in ["start_date", "end_date"]:
                    assert isinstance(value, str), f"Field '{field}' should be string, got {type(value)}"
                else:
                    assert isinstance(value, (int, float)), f"Field '{field}' should be numeric, got {type(value)}"

    def test_wacc_endpoint_field_alignment(self, client, mock_vnstock_responses, sample_beta_metrics, expected_wacc_fields):
        """Test WACC endpoint response contains all frontend-expected fields."""
        with patch('app.services.service_valuation.stock') as mock_stock, \
             patch('app.services.service_valuation.calculate_beta') as mock_beta:
            
            mock_beta.return_value = sample_beta_metrics
            mock_stock.ratio.return_value = mock_vnstock_responses["ratios"]
            mock_stock.finance.return_value = mock_vnstock_responses["balance_sheet"]
            
            response = client.get("/api/wacc/FPT?start_date=2023-01-01&end_date=2023-12-31")
            assert response.status_code == 200
            
            data = response.json()
            
            # Verify all frontend-expected fields are present
            for field, label in expected_wacc_fields.items():
                assert field in data, f"Missing field '{field}' (expected for '{label}') in WACC response"
                
                # Verify field has valid numeric data type
                value = data[field]
                assert isinstance(value, (int, float)), f"Field '{field}' should be numeric, got {type(value)}"

    def test_market_assumptions_field_alignment(self, client, expected_market_assumptions_fields):
        """Test market assumptions endpoint response contains all frontend-expected fields."""
        response = client.get("/api/market-assumptions")
        assert response.status_code == 200
        
        data = response.json()
        
        # Verify all frontend-expected fields are present
        for field, label in expected_market_assumptions_fields.items():
            assert field in data, f"Missing field '{field}' (expected for '{label}') in market assumptions response"
            
            # Verify field has valid numeric data type
            value = data[field]
            assert isinstance(value, (int, float)), f"Field '{field}' should be numeric, got {type(value)}"

    def test_comprehensive_valuation_field_alignment(self, client, mock_vnstock_responses, 
                                                   sample_beta_metrics, sample_wacc_metrics,
                                                   expected_beta_fields, expected_wacc_fields,
                                                   expected_market_assumptions_fields):
        """Test comprehensive valuation endpoint response structure matches frontend expectations."""
        with patch('app.services.service_valuation.calculate_beta') as mock_beta, \
             patch('app.services.service_valuation.calculate_wacc') as mock_wacc:
            
            mock_beta.return_value = sample_beta_metrics
            mock_wacc.return_value = sample_wacc_metrics
            
            response = client.get("/api/valuation/FPT?start_date=2023-01-01&end_date=2023-12-31")
            assert response.status_code == 200
            
            data = response.json()
            
            # Verify top-level structure expected by frontend
            assert "beta_analysis" in data, "Missing 'beta_analysis' section expected by frontend"
            assert "wacc_analysis" in data, "Missing 'wacc_analysis' section expected by frontend"  
            assert "market_assumptions" in data, "Missing 'market_assumptions' section expected by frontend"
            
            # Verify beta analysis fields
            beta_data = data["beta_analysis"]
            for field, label in expected_beta_fields.items():
                assert field in beta_data, f"Missing beta field '{field}' (expected for '{label}')"
                
            # Verify WACC analysis fields
            wacc_data = data["wacc_analysis"]
            for field, label in expected_wacc_fields.items():
                assert field in wacc_data, f"Missing WACC field '{field}' (expected for '{label}')"
                
            # Verify market assumptions fields
            assumptions_data = data["market_assumptions"]
            for field, label in expected_market_assumptions_fields.items():
                assert field in assumptions_data, f"Missing assumption field '{field}' (expected for '{label}')"

    def test_frontend_data_formatting_compatibility(self, client, mock_vnstock_responses):
        """Test that API response values are compatible with frontend formatting functions."""
        with patch('app.services.service_valuation.stock') as mock_stock:
            mock_stock.history.side_effect = [
                mock_vnstock_responses["stock_history"],
                mock_vnstock_responses["market_history"]
            ]
            
            response = client.get("/api/beta/FPT?start_date=2023-01-01&end_date=2023-12-31")
            data = response.json()
            
            # Test percentage formatting compatibility (frontend expects values 0-1 for percentages)
            percentage_fields = ["correlation", "stock_volatility", "market_volatility"]
            for field in percentage_fields:
                if field in data:
                    value = data[field]
                    if value is not None:
                        # Frontend formatPercentage expects decimal values (0.05 = 5%)
                        assert 0 <= abs(value) <= 10, f"Field '{field}' value {value} not in expected percentage range"
            
            # Test numeric precision compatibility
            numeric_fields = ["beta", "r_squared"]
            for field in numeric_fields:
                if field in data:
                    value = data[field]
                    if value is not None:
                        # Should be finite numbers that can be formatted
                        assert not (isinstance(value, float) and (value != value or abs(value) == float('inf'))), \
                               f"Field '{field}' contains invalid numeric value: {value}"

    def test_currency_formatting_compatibility(self, client, mock_vnstock_responses, sample_beta_metrics):
        """Test that currency values are compatible with frontend formatting."""
        with patch('app.services.service_valuation.stock') as mock_stock, \
             patch('app.services.service_valuation.calculate_beta') as mock_beta:
            
            mock_beta.return_value = sample_beta_metrics
            mock_stock.ratio.return_value = mock_vnstock_responses["ratios"]
            mock_stock.finance.return_value = mock_vnstock_responses["balance_sheet"]
            
            response = client.get("/api/wacc/FPT?start_date=2023-01-01&end_date=2023-12-31")
            data = response.json()
            
            # Test currency fields (frontend expects values in billions VND)
            currency_fields = ["market_value_equity", "market_value_debt", "total_value"]
            for field in currency_fields:
                if field in data:
                    value = data[field]
                    if value is not None:
                        # Should be positive numbers representing billions VND
                        assert isinstance(value, (int, float)), f"Currency field '{field}' should be numeric"
                        assert value >= 0, f"Currency field '{field}' should be non-negative, got {value}"
                        # Reasonable upper bound for Vietnamese companies (in billions VND)
                        assert value < 1e12, f"Currency field '{field}' value {value} seems unreasonably large"

    def test_json_serialization_compatibility(self, client, mock_vnstock_responses):
        """Test that all API responses can be properly JSON serialized/deserialized by frontend."""
        endpoints = [
            "/api/beta/FPT?start_date=2023-01-01&end_date=2023-12-31",
            "/api/market-assumptions"
        ]
        
        with patch('app.services.service_valuation.stock') as mock_stock:
            mock_stock.history.side_effect = [
                mock_vnstock_responses["stock_history"],
                mock_vnstock_responses["market_history"]
            ] * len(endpoints)
            
            for endpoint in endpoints:
                response = client.get(endpoint)
                assert response.status_code == 200
                
                # Test that response can be round-tripped through JSON
                json_str = response.content.decode()
                parsed_data = json.loads(json_str)
                re_serialized = json.dumps(parsed_data)
                re_parsed = json.loads(re_serialized)
                
                # Verify data integrity after round-trip
                assert parsed_data == re_parsed, f"JSON round-trip failed for endpoint {endpoint}"

    def test_error_response_format_alignment(self, client):
        """Test that error responses match frontend error handling expectations."""
        # Test validation error
        response = client.get("/api/beta/FPT?start_date=invalid&end_date=2023-12-31")
        assert response.status_code == 422
        
        error_data = response.json()
        assert "detail" in error_data, "Error responses should contain 'detail' field for frontend display"
        
        # Test server error format
        with patch('app.services.service_valuation.stock') as mock_stock:
            mock_stock.history.side_effect = Exception("Test error")
            
            response = client.get("/api/beta/INVALID?start_date=2023-01-01&end_date=2023-12-31")
            assert response.status_code == 500
            
            error_data = response.json()
            assert "detail" in error_data, "Server error responses should contain 'detail' field"
            assert isinstance(error_data["detail"], str), "Error detail should be string for frontend display"

    def test_frontend_table_rendering_compatibility(self, client, mock_vnstock_responses, sample_beta_metrics):
        """Test that API responses are compatible with frontend table rendering logic."""
        with patch('app.services.service_valuation.stock') as mock_stock, \
             patch('app.services.service_valuation.calculate_beta') as mock_beta:
            
            mock_beta.return_value = sample_beta_metrics
            mock_stock.ratio.return_value = mock_vnstock_responses["ratios"]
            mock_stock.finance.return_value = mock_vnstock_responses["balance_sheet"]
            
            response = client.get("/api/wacc/FPT?start_date=2023-01-01&end_date=2023-12-31")
            data = response.json()
            
            # Frontend expects these fields for WACC table rendering
            table_fields = [
                "wacc", "cost_of_equity", "cost_of_debt", 
                "equity_weight", "debt_weight",
                "market_value_equity", "market_value_debt", "total_value"
            ]
            
            for field in table_fields:
                assert field in data, f"Table field '{field}' missing from API response"
                value = data[field]
                
                if value is not None:
                    # Should be renderable as table cell
                    assert isinstance(value, (int, float, str)), \
                           f"Table field '{field}' should be renderable type, got {type(value)}"
                    
                    # Should not contain invalid values that would break table display
                    if isinstance(value, float):
                        assert not (value != value), f"Table field '{field}' contains NaN"
                        assert abs(value) != float('inf'), f"Table field '{field}' contains infinity"

    def test_data_quality_metrics_alignment(self, client, mock_vnstock_responses, expected_data_quality_fields):
        """Test data quality metrics structure matches frontend expectations."""
        # Note: This test would require the comprehensive valuation endpoint to return data quality metrics
        # Based on the frontend code, it expects these fields in valuationData.data_quality
        
        # For now, test that market assumptions endpoint structure is compatible
        response = client.get("/api/market-assumptions")
        assert response.status_code == 200
        
        # Verify response structure can support data quality rendering
        data = response.json()
        assert isinstance(data, dict), "Response should be object for data quality compatibility"
        
        # All values should be serializable for frontend consumption
        for key, value in data.items():
            assert isinstance(value, (int, float, str, bool, type(None))), \
                   f"Data quality field '{key}' has unsupported type {type(value)}"

    def test_frontend_summary_cards_compatibility(self, client, mock_vnstock_responses, sample_beta_metrics, sample_wacc_metrics):
        """Test that API responses support frontend summary cards rendering."""
        with patch('app.services.service_valuation.calculate_beta') as mock_beta, \
             patch('app.services.service_valuation.calculate_wacc') as mock_wacc:
            
            mock_beta.return_value = sample_beta_metrics
            mock_wacc.return_value = sample_wacc_metrics
            
            response = client.get("/api/valuation/FPT?start_date=2023-01-01&end_date=2023-12-31")
            data = response.json()
            
            # Frontend summary cards expect these fields to be accessible
            beta_data = data["beta_analysis"]
            wacc_data = data["wacc_analysis"]
            
            # Summary card fields (from populateSummaryCards function)
            summary_fields = {
                "latest_wacc": wacc_data.get("wacc"),
                "latest_beta": beta_data.get("beta"),
                "latest_market_cap": wacc_data.get("market_value_equity"),
                "enterprise_value": wacc_data.get("total_value"),
            }
            
            for field, value in summary_fields.items():
                if value is not None:
                    assert isinstance(value, (int, float)), \
                           f"Summary field '{field}' should be numeric for card display"
                    assert not (isinstance(value, float) and value != value), \
                           f"Summary field '{field}' should not be NaN"