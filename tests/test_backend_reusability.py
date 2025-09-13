"""Test backend code reusability for other applications."""

import sys
from unittest.mock import Mock, patch

import pandas as pd
import pytest

from app.schemas.schema_statements import (
    FinancialRatiosData,
    FinancialStatementsResponse,
    StatementsRequest,
)
from app.services.service_statements import (
    _process_ratios,
    _safe_get,
    _safe_get_int,
    _safe_get_str,
    get_financial_statements,
)


class TestStandaloneServiceFunctions:
    """Test that service functions work independently of FastAPI context."""

    def test_safe_get_functions_standalone(self):
        """Test utility functions work with any pandas Series."""
        # Create test data
        test_data = pd.Series({
            "string_value": "hello world",
            "numeric_value": 123.45,
            "integer_value": 789,
            "null_value": None,
            "zero_value": 0,
            "empty_string": "",
        })
        
        # Test _safe_get
        assert _safe_get(test_data, "string_value") == "hello world"
        assert _safe_get(test_data, "numeric_value") == 123.45
        assert _safe_get(test_data, "null_value") is None
        assert _safe_get(test_data, "missing_key") is None
        assert _safe_get(test_data, "zero_value") == 0
        
        # Test _safe_get_str
        assert _safe_get_str(test_data, "string_value") == "hello world"
        assert _safe_get_str(test_data, "numeric_value") == "123.45"
        assert _safe_get_str(test_data, "null_value") is None
        assert _safe_get_str(test_data, "missing_key") is None
        
        # Test _safe_get_int
        assert _safe_get_int(test_data, "integer_value") == 789
        assert _safe_get_int(test_data, "numeric_value") == 123  # Truncated
        assert _safe_get_int(test_data, "string_value") is None  # Can't convert
        assert _safe_get_int(test_data, "null_value") is None
        assert _safe_get_int(test_data, "zero_value") == 0

    def test_process_ratios_standalone(self, sample_vnstock_ratios_data):
        """Test _process_ratios works with any DataFrame."""
        # Test with sample data
        ratios = _process_ratios(sample_vnstock_ratios_data)
        
        # Should return list of FinancialRatiosData
        assert isinstance(ratios, list)
        assert len(ratios) == 3  # 3 years of data
        assert all(isinstance(r, FinancialRatiosData) for r in ratios)
        
        # Check first ratio
        first_ratio = ratios[0]
        assert first_ratio.year_report == 2023
        assert first_ratio.pe_ratio == 15.5
        assert first_ratio.roe == 0.225
        assert first_ratio.debt_to_equity == 0.6

    def test_process_ratios_with_custom_data(self):
        """Test _process_ratios with custom DataFrame structure."""
        # Create custom data with different column names
        custom_data = pd.DataFrame({
            "yearReport": [2023, 2022],
            "P/E": [18.0, 19.0],
            "ROE (%)": [0.20, 0.18],
            "Debt/Equity": [0.5, 0.6],
            "Days Sales Outstanding": [40.0, 42.0],
            "Cash Cycle": [70.0, 75.0],
        })
        
        ratios = _process_ratios(custom_data)
        
        assert len(ratios) == 2
        assert ratios[0].year_report == 2023
        assert ratios[0].pe_ratio == 18.0
        assert ratios[0].roe == 0.20
        assert ratios[0].debt_to_equity == 0.5
        assert ratios[0].average_collection_days == 40.0
        assert ratios[0].cash_conversion_cycle == 70.0

    def test_process_ratios_empty_dataframe(self):
        """Test _process_ratios handles empty DataFrame gracefully."""
        empty_df = pd.DataFrame()
        ratios = _process_ratios(empty_df)
        
        assert isinstance(ratios, list)
        assert len(ratios) == 0

    def test_safe_functions_with_edge_cases(self):
        """Test utility functions handle edge cases properly."""
        # Test with Series containing various edge cases
        edge_data = pd.Series({
            "negative_number": -123.45,
            "large_number": 1e10,
            "scientific_notation": 1.23e-4,
            "string_number": "456.78",
            "string_int": "999",
            "invalid_string": "not_a_number",
            "boolean_true": True,
            "boolean_false": False,
            "nan_value": float('nan'),
        })
        
        # Test numeric handling
        assert _safe_get(edge_data, "negative_number") == -123.45
        assert _safe_get(edge_data, "large_number") == 1e10
        assert _safe_get(edge_data, "scientific_notation") == 1.23e-4
        
        # Test string conversions
        assert _safe_get_str(edge_data, "negative_number") == "-123.45"
        assert _safe_get_str(edge_data, "boolean_true") == "True"
        
        # Test int conversions
        assert _safe_get_int(edge_data, "string_int") == 999
        assert _safe_get_int(edge_data, "boolean_true") == 1
        assert _safe_get_int(edge_data, "boolean_false") == 0
        assert _safe_get_int(edge_data, "invalid_string") is None


class TestServiceLayerIsolation:
    """Test that service layer can work independently of web framework."""

    @patch('app.services.service_statements.Vnstock')
    def test_get_financial_statements_mocked(self, mock_vnstock_class, 
                                           sample_vnstock_income_data,
                                           sample_vnstock_balance_data,
                                           sample_vnstock_cashflow_data, 
                                           sample_vnstock_ratios_data):
        """Test get_financial_statements with mocked vnstock for isolation."""
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
        
        # Create request
        request = StatementsRequest(
            ticker="TEST",
            start_date="2023-01-01",
            end_date="2023-12-31",
            period="year"
        )
        
        # Call service function
        result = get_financial_statements(request)
        
        # Verify result
        assert isinstance(result, FinancialStatementsResponse)
        assert result.ticker == "TEST"
        assert result.period == "year"
        assert len(result.ratios) == 3  # 3 years of data
        
        # Verify the ratios data was processed correctly
        first_ratio = result.ratios[0]
        assert first_ratio.year_report == 2023
        assert first_ratio.pe_ratio == 15.5
        assert first_ratio.roe == 0.225

    def test_service_without_web_context(self):
        """Test that services don't depend on web request context."""
        # This test ensures services can be used by other Python applications
        # without needing FastAPI or web framework
        
        # Import should work without web context
        from app.services.service_statements import _safe_get, _process_ratios
        
        # Functions should work with plain Python data
        test_series = pd.Series({"test_value": 42})
        result = _safe_get(test_series, "test_value")
        assert result == 42
        
        # Should work in any Python environment
        assert callable(_safe_get)
        assert callable(_process_ratios)


class TestConfigurationFlexibility:
    """Test that backend can be configured for different environments."""

    @patch('app.services.service_statements.Vnstock')
    def test_different_data_sources(self, mock_vnstock_class):
        """Test that service can work with different data source configurations."""
        # Test with different source parameter
        mock_vnstock_instance = Mock()
        mock_vnstock_class.return_value = mock_vnstock_instance
        
        # Mock the stock method to capture the source parameter
        mock_stock_instance = Mock()
        mock_vnstock_instance.stock.return_value = mock_stock_instance
        mock_stock_instance.finance = Mock()
        
        # Configure mock returns
        mock_stock_instance.finance.cash_flow.return_value = pd.DataFrame({"yearReport": [2023]})
        mock_stock_instance.finance.balance_sheet.return_value = pd.DataFrame({"yearReport": [2023]})
        mock_stock_instance.finance.income_statement.return_value = pd.DataFrame({"yearReport": [2023]})
        mock_stock_instance.finance.ratio.return_value = pd.DataFrame({"yearReport": [2023]})
        
        request = StatementsRequest(
            ticker="TEST",
            start_date="2023-01-01", 
            end_date="2023-12-31",
            period="year"
        )
        
        # The service uses VCI source - this could be made configurable
        get_financial_statements(request)
        
        # Verify vnstock was called with expected parameters
        mock_vnstock_instance.stock.assert_called_once()
        call_args = mock_vnstock_instance.stock.call_args
        assert call_args[1]["symbol"] == "TEST"
        assert call_args[1]["source"] == "VCI"  # Current default

    def test_standalone_schema_usage(self):
        """Test that schemas can be used independently by other applications."""
        # This simulates another Python application using our schemas
        
        # Import schemas without importing the full app
        from app.schemas.schema_statements import FinancialRatiosData, FinancialStatementsResponse
        
        # Should be able to create instances for external use
        external_data = {
            "year_report": 2023,
            "pe_ratio": 20.0,
            "roe": 0.25,
            "debt_to_equity": 0.4,
        }
        
        ratio_instance = FinancialRatiosData(**external_data)
        assert ratio_instance.pe_ratio == 20.0
        
        # Should be able to serialize for external systems
        json_data = ratio_instance.model_dump_json()
        assert "pe_ratio" in json_data
        
        # External app should be able to create response structures
        response_data = {
            "ticker": "EXTERNAL",
            "period": "year", 
            "income_statements": [],
            "balance_sheets": [],
            "cash_flows": [],
            "ratios": [ratio_instance],
            "years": [2023],
        }
        
        response = FinancialStatementsResponse(**response_data)
        assert response.ticker == "EXTERNAL"


class TestModularImportPatterns:
    """Test different ways external applications can import and use backend code."""

    def test_import_specific_functions(self):
        """Test importing specific functions for external use."""
        # Pattern 1: Import specific utility functions
        from app.services.service_statements import _safe_get, _safe_get_str
        
        assert callable(_safe_get)
        assert callable(_safe_get_str)
        
        # Pattern 2: Import specific schemas
        from app.schemas.schema_statements import FinancialRatiosData
        
        assert hasattr(FinancialRatiosData, 'model_fields')

    def test_import_entire_modules(self):
        """Test importing entire modules for external use."""
        # Pattern 3: Import entire service module
        from app.services import service_statements
        
        assert hasattr(service_statements, 'get_financial_statements')
        assert hasattr(service_statements, '_safe_get')
        
        # Pattern 4: Import entire schema module
        from app.schemas import schema_statements
        
        assert hasattr(schema_statements, 'FinancialRatiosData')
        assert hasattr(schema_statements, 'FinancialStatementsResponse')

    def test_namespace_imports(self):
        """Test namespace import patterns for external applications."""
        # Pattern 5: Namespace imports
        import app.schemas.schema_statements as schemas
        import app.services.service_statements as services
        
        # Should be able to use with namespace
        ratio_data = schemas.FinancialRatiosData(year_report=2023)
        assert ratio_data.year_report == 2023
        
        # Service functions should work
        test_series = pd.Series({"value": 100})
        result = services._safe_get(test_series, "value") 
        assert result == 100

    def test_dynamic_imports(self):
        """Test dynamic import patterns for plugin-style usage."""
        import importlib
        
        # Pattern 6: Dynamic imports (useful for plugin systems)
        schema_module = importlib.import_module("app.schemas.schema_statements")
        service_module = importlib.import_module("app.services.service_statements")
        
        # Should have expected attributes
        assert hasattr(schema_module, "FinancialRatiosData")
        assert hasattr(service_module, "_safe_get")
        
        # Should be functional
        RatiosClass = getattr(schema_module, "FinancialRatiosData")
        safe_get_func = getattr(service_module, "_safe_get")
        
        ratio_instance = RatiosClass(year_report=2023)
        assert ratio_instance.year_report == 2023
        
        test_data = pd.Series({"test": 42})
        result = safe_get_func(test_data, "test")
        assert result == 42


class TestExternalApplicationIntegration:
    """Test patterns for integrating backend into external applications."""

    def test_create_external_wrapper(self):
        """Test creating wrapper for external application integration."""
        # This demonstrates how an external app might wrap our services
        
        class ExternalFinancialAnalyzer:
            """Example wrapper for external application."""
            
            def __init__(self):
                from app.services.service_statements import _safe_get, _process_ratios
                from app.schemas.schema_statements import FinancialRatiosData
                
                self._safe_get = _safe_get
                self._process_ratios = _process_ratios
                self._ratios_schema = FinancialRatiosData
            
            def process_custom_data(self, dataframe):
                """Process custom data using our backend logic."""
                return self._process_ratios(dataframe)
            
            def extract_safe_value(self, data_series, key):
                """Extract value safely using our utility."""
                return self._safe_get(data_series, key)
            
            def create_ratio_object(self, **kwargs):
                """Create ratio object using our schema."""
                return self._ratios_schema(**kwargs)
        
        # Test the wrapper
        analyzer = ExternalFinancialAnalyzer()
        
        # Test safe extraction
        test_data = pd.Series({"pe_ratio": 15.5})
        result = analyzer.extract_safe_value(test_data, "pe_ratio")
        assert result == 15.5
        
        # Test schema creation
        ratio_obj = analyzer.create_ratio_object(year_report=2023, pe_ratio=15.5)
        assert ratio_obj.year_report == 2023
        assert ratio_obj.pe_ratio == 15.5

    def test_plugin_style_integration(self):
        """Test plugin-style integration pattern."""
        # This demonstrates how our backend could be used as a plugin
        
        def load_financial_plugin():
            """Load financial processing plugin."""
            try:
                from app.services.service_statements import _process_ratios
                from app.schemas.schema_statements import FinancialRatiosData
                
                return {
                    "name": "richslow_financial",
                    "version": "0.1.0",
                    "processor": _process_ratios,
                    "schema": FinancialRatiosData,
                    "capabilities": ["financial_ratios", "safe_extraction"]
                }
            except ImportError:
                return None
        
        # Test plugin loading
        plugin = load_financial_plugin()
        
        assert plugin is not None
        assert plugin["name"] == "richslow_financial"
        assert callable(plugin["processor"])
        assert hasattr(plugin["schema"], "model_fields")

    def test_microservice_style_integration(self):
        """Test using backend logic in microservice architecture."""
        # This demonstrates how backend could be used in microservices
        
        class FinancialMicroservice:
            """Example microservice using our backend logic."""
            
            def __init__(self):
                from app.services.service_statements import _process_ratios
                from app.schemas.schema_statements import FinancialRatiosData
                
                self.processor = _process_ratios
                self.schema = FinancialRatiosData
            
            def process_request(self, input_data):
                """Process microservice request."""
                # Convert input to DataFrame
                df = pd.DataFrame(input_data)
                
                # Process using our backend logic
                ratios = self.processor(df)
                
                # Return serialized results
                return [ratio.model_dump() for ratio in ratios]
        
        # Test microservice
        service = FinancialMicroservice()
        
        # Test with sample input
        input_data = [
            {"yearReport": 2023, "P/E": 15.5, "ROE (%)": 0.225}
        ]
        
        result = service.process_request(input_data)
        
        assert len(result) == 1
        assert result[0]["year_report"] == 2023
        assert result[0]["pe_ratio"] == 15.5
        assert result[0]["roe"] == 0.225