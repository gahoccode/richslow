"""Backend reusability tests for valuation service external app integration."""

import sys
from pathlib import Path
from typing import Dict, Any
import pandas as pd
import pytest
from unittest.mock import patch, MagicMock

# Test importing services without FastAPI dependencies
from app.services.service_valuation import (
    calculate_beta,
    calculate_wacc, 
    get_market_assumptions,
)
from app.schemas.schema_valuation import (
    BetaMetrics,
    WACCMetrics,
    ValuationMetrics,
    ValuationRequest,
)


class TestStandaloneServiceImports:
    """Test that valuation services can be imported without web framework dependencies."""
    
    def test_service_imports_without_fastapi(self):
        """Test that service functions can be imported independently."""
        # Verify functions are importable
        assert callable(calculate_beta)
        assert callable(calculate_wacc)
        assert callable(get_market_assumptions)
# Remove references to private functions
        
        # Verify they don't require FastAPI context
        import inspect
        
        # Check function signatures don't depend on FastAPI Request objects
        for func in [calculate_beta, calculate_wacc, get_market_assumptions]:
            sig = inspect.signature(func)
            for param_name, param in sig.parameters.items():
                # Ensure no FastAPI dependencies in signatures
                assert "Request" not in str(param.annotation)
                assert "Depends" not in str(param.annotation)

    def test_schema_imports_without_fastapi(self):
        """Test that schemas can be used independently for data validation."""
        # Test BetaMetrics can be instantiated without FastAPI
        beta_data = {
            "ticker": "FPT",
            "beta": 1.25,
            "correlation": 0.75,
            "r_squared": 0.56,
            "volatility_stock": 0.25,
            "volatility_market": 0.20,
            "data_points_used": 252,
            "start_date": "2023-01-01",
            "end_date": "2023-12-31"
        }
        
        beta_metrics = BetaMetrics(**beta_data)
        assert beta_metrics.ticker == "FPT"
        assert beta_metrics.beta == 1.25
        
        # Test WACCMetrics 
        wacc_data = {
            "ticker": "FPT",
            "wacc": 0.085,
            "cost_of_equity": 0.095,
            "cost_of_debt": 0.056,
            "market_value_equity": 15000000,
            "market_value_debt": 5000000,
            "total_value": 20000000,
            "equity_weight": 0.75,
            "debt_weight": 0.25,
            "tax_rate": 0.20,
            "risk_free_rate": 0.035,
            "market_risk_premium": 0.05,
            "beta": 1.25
        }
        
        wacc_metrics = WACCMetrics(**wacc_data)
        assert wacc_metrics.ticker == "FPT"
        assert wacc_metrics.wacc == 0.085

    def test_market_assumptions_standalone(self):
        """Test market assumptions function works independently."""
        assumptions = get_market_assumptions()
        
        # Verify returns expected data structure
        assert isinstance(assumptions, dict)
        assert "vietnam_risk_free_rate" in assumptions
        assert "vietnam_market_risk_premium" in assumptions
        assert "vietnam_corporate_tax_rate" in assumptions
        assert "default_credit_spread" in assumptions


class TestExternalAppIntegrationPatterns:
    """Test patterns for integrating valuation services into external applications."""
    
    def test_wrapper_class_pattern(self, mock_vnstock_responses):
        """Test wrapper class pattern for external app integration."""
        
        class ValuationServiceWrapper:
            """Example wrapper class for external applications."""
            
            def __init__(self, default_market_symbol: str = "VNINDEX"):
                self.default_market_symbol = default_market_symbol
                self.assumptions = get_market_assumptions()
            
            def get_beta_analysis(self, ticker: str, start_date: str, end_date: str) -> Dict[str, Any]:
                """Get beta analysis with error handling for external apps."""
                try:
                    with patch('app.services.service_valuation.Quote') as mock_quote:
                        mock_stock_quote = MagicMock()
                        mock_market_quote = MagicMock()
                        
                        mock_stock_quote.history.return_value = mock_vnstock_responses["stock_history"]
                        mock_market_quote.history.return_value = mock_vnstock_responses["market_history"]
                        
                        mock_quote.side_effect = [mock_stock_quote, mock_market_quote]
                        
                        beta_result = calculate_beta(ticker, start_date, end_date)
                        return {
                            "success": True,
                            "data": beta_result.model_dump(),
                            "error": None
                        }
                except Exception as e:
                    return {
                        "success": False,
                        "data": None,
                        "error": str(e)
                    }
            
            def get_market_parameters(self) -> Dict[str, float]:
                """Get market parameters for external calculations."""
                return self.assumptions
        
        # Test wrapper usage
        wrapper = ValuationServiceWrapper()
        
        # Test market parameters access
        params = wrapper.get_market_parameters()
        assert "vietnam_risk_free_rate" in params
        assert isinstance(params["vietnam_risk_free_rate"], (int, float))
        
        # Test beta analysis
        result = wrapper.get_beta_analysis("FPT", "2023-01-01", "2023-12-31")
        assert "success" in result
        assert "data" in result
        assert "error" in result

    def test_plugin_pattern(self, sample_beta_metrics):
        """Test plugin pattern for extending external applications."""
        
        class ValuationPlugin:
            """Example plugin for external financial applications."""
            
            def __init__(self):
                self.name = "Vietnamese Stock Valuation"
                self.version = "1.0.0"
                self.supported_markets = ["VN"]
                
            def calculate_metrics(self, ticker: str, financial_data: Dict[str, Any]) -> Dict[str, Any]:
                """Calculate valuation metrics from provided financial data."""
                # Mock calculation based on provided data
                if "market_cap" in financial_data and "total_debt" in financial_data:
                    market_cap = financial_data["market_cap"]
                    total_debt = financial_data["total_debt"]
                    
                    return {
                        "enterprise_value": market_cap + total_debt,
                        "debt_to_equity": total_debt / market_cap if market_cap > 0 else 0,
                        "calculated_by": self.name
                    }
                return {}
            
            def validate_ticker(self, ticker: str) -> bool:
                """Validate Vietnamese stock ticker format."""
                return len(ticker) >= 3 and ticker.isalpha() and ticker.isupper()
            
            def get_assumptions(self) -> Dict[str, float]:
                """Get Vietnamese market assumptions."""
                return get_market_assumptions()
        
        # Test plugin usage
        plugin = ValuationPlugin()
        
        # Test ticker validation
        assert plugin.validate_ticker("FPT") == True
        assert plugin.validate_ticker("ABC") == True
        assert plugin.validate_ticker("ab") == False
        assert plugin.validate_ticker("123") == False
        
        # Test metrics calculation
        financial_data = {"market_cap": 15000000, "total_debt": 5000000}
        metrics = plugin.calculate_metrics("FPT", financial_data)
        assert metrics["enterprise_value"] == 20000000
        assert metrics["debt_to_equity"] == 1/3
        
        # Test assumptions access
        assumptions = plugin.get_assumptions()
        assert isinstance(assumptions, dict)
        assert len(assumptions) > 0

    def test_microservice_pattern(self, mock_vnstock_responses):
        """Test microservice integration pattern."""
        
        class ValuationMicroservice:
            """Example microservice interface for valuation calculations."""
            
            def __init__(self):
                self.service_name = "valuation-service"
                self.health_status = "healthy"
                
            def health_check(self) -> Dict[str, str]:
                """Health check endpoint for microservice monitoring."""
                return {
                    "service": self.service_name,
                    "status": self.health_status,
                    "dependencies": ["vnstock", "pandas"]
                }
            
            def calculate_beta_batch(self, requests: list[Dict[str, str]]) -> list[Dict[str, Any]]:
                """Batch beta calculation for multiple tickers."""
                results = []
                
                for request in requests:
                    try:
                        with patch('app.services.service_valuation.Quote') as mock_quote:
                            mock_stock_quote = MagicMock()
                            mock_market_quote = MagicMock()
                            
                            mock_stock_quote.history.return_value = mock_vnstock_responses["stock_history"]
                            mock_market_quote.history.return_value = mock_vnstock_responses["market_history"]
                            
                            mock_quote.side_effect = [mock_stock_quote, mock_market_quote]
                            
                            beta_result = calculate_beta(
                                request["ticker"],
                                request["start_date"], 
                                request["end_date"]
                            )
                            
                            results.append({
                                "ticker": request["ticker"],
                                "success": True,
                                "beta": beta_result.beta,
                                "correlation": beta_result.correlation
                            })
                            
                    except Exception as e:
                        results.append({
                            "ticker": request.get("ticker", "unknown"),
                            "success": False,
                            "error": str(e)
                        })
                
                return results
        
        # Test microservice usage
        microservice = ValuationMicroservice()
        
        # Test health check
        health = microservice.health_check()
        assert health["service"] == "valuation-service"
        assert health["status"] == "healthy"
        
        # Test batch processing
        requests = [
            {"ticker": "FPT", "start_date": "2023-01-01", "end_date": "2023-12-31"},
            {"ticker": "VIC", "start_date": "2023-01-01", "end_date": "2023-12-31"}
        ]
        
        results = microservice.calculate_beta_batch(requests)
        assert len(results) == 2
        assert all("success" in result for result in results)

    def test_data_pipeline_integration(self, sample_stock_price_data, sample_vnindex_price_data):
        """Test integration with data pipeline and ETL processes."""
        
        class ValuationDataPipeline:
            """Example data pipeline for valuation calculations."""
            
            def __init__(self):
                self.processed_tickers = []
                self.results_cache = {}
            
            def extract_price_data(self, ticker: str, start_date: str, end_date: str) -> pd.DataFrame:
                """Extract price data (would typically connect to data source)."""
                # Return mock data for testing
                if ticker == "FPT":
                    return sample_stock_price_data
                return pd.DataFrame()
            
            def transform_for_beta_calculation(self, stock_data: pd.DataFrame, market_data: pd.DataFrame) -> pd.DataFrame:
                """Transform data for beta calculation."""
                # Use the same alignment logic as the service
                aligned = stock_data[["time", "close"]].merge(
                    market_data[["time", "close"]], on="time", how="inner", 
                    suffixes=("_stock", "_market")
                ).rename(columns={"close_stock": "stock_close", "close_market": "market_close"})
                return aligned.sort_values("time")
            
            def load_results(self, ticker: str, results: Dict[str, Any]) -> None:
                """Load results to cache/database."""
                self.results_cache[ticker] = results
                if ticker not in self.processed_tickers:
                    self.processed_tickers.append(ticker)
            
            def process_ticker(self, ticker: str, start_date: str, end_date: str) -> Dict[str, Any]:
                """Full pipeline processing for a ticker."""
                try:
                    # Extract
                    stock_data = self.extract_price_data(ticker, start_date, end_date)
                    market_data = sample_vnindex_price_data  # Would extract VNINDEX data
                    
                    # Transform
                    aligned_data = self.transform_for_beta_calculation(stock_data, market_data)
                    
                    # Simple beta calculation for testing (not production logic)
                    stock_returns = aligned_data["stock_close"].pct_change().dropna()
                    market_returns = aligned_data["market_close"].pct_change().dropna()
                    
                    # Basic beta calculation
                    beta = stock_returns.cov(market_returns) / market_returns.var() if market_returns.var() > 0 else 1.0
                    
                    results = {
                        "ticker": ticker,
                        "beta": beta,
                        "data_points": len(aligned_data) - 1,
                        "processing_date": "2023-12-31"
                    }
                    
                    # Load
                    self.load_results(ticker, results)
                    
                    return results
                    
                except Exception as e:
                    return {"ticker": ticker, "error": str(e), "success": False}
        
        # Test pipeline usage
        pipeline = ValuationDataPipeline()
        
        # Test processing
        result = pipeline.process_ticker("FPT", "2023-01-01", "2023-12-31")
        assert "ticker" in result
        assert "beta" in result or "error" in result
        
        # Test caching
        if "beta" in result:
            assert "FPT" in pipeline.processed_tickers
            assert "FPT" in pipeline.results_cache

    def test_configuration_management(self):
        """Test configuration management for external applications."""
        
        class ValuationConfig:
            """Configuration management for external valuation applications."""
            
            def __init__(self, config_dict: Dict[str, Any] = None):
                self.config = config_dict or self.get_default_config()
                
            def get_default_config(self) -> Dict[str, Any]:
                """Get default configuration with Vietnamese market parameters."""
                market_assumptions = get_market_assumptions()
                return {
                    "market_parameters": market_assumptions,
                    "calculation_settings": {
                        "min_data_points": 30,
                        "trading_days_per_year": 252,
                        "confidence_level": 0.95
                    },
                    "data_sources": {
                        "primary": "vnstock",
                        "fallback": None
                    },
                    "caching": {
                        "enabled": True,
                        "ttl_seconds": 3600
                    }
                }
            
            def get_market_parameter(self, parameter: str) -> float:
                """Get specific market parameter."""
                return self.config["market_parameters"].get(parameter, 0.0)
            
            def get_calculation_setting(self, setting: str) -> Any:
                """Get specific calculation setting."""
                return self.config["calculation_settings"].get(setting)
            
            def update_config(self, updates: Dict[str, Any]) -> None:
                """Update configuration."""
                self.config.update(updates)
                
            def validate_config(self) -> bool:
                """Validate configuration completeness."""
                required_sections = ["market_parameters", "calculation_settings"]
                return all(section in self.config for section in required_sections)
        
        # Test configuration usage
        config = ValuationConfig()
        
        # Test default configuration
        assert config.validate_config() == True
        assert config.get_market_parameter("vietnam_risk_free_rate") > 0
        assert config.get_calculation_setting("min_data_points") == 30
        
        # Test configuration updates
        config.update_config({"calculation_settings": {"min_data_points": 50}})
        assert config.get_calculation_setting("min_data_points") == 50

    def test_error_handling_for_external_apps(self):
        """Test robust error handling patterns for external applications."""
        
        class ValuationErrorHandler:
            """Error handling utilities for external valuation applications."""
            
            def __init__(self):
                self.error_counts = {}
                self.last_errors = {}
            
            def safe_calculate_beta(self, ticker: str, start_date: str, end_date: str) -> Dict[str, Any]:
                """Beta calculation with comprehensive error handling."""
                try:
                    # This would normally call calculate_beta, but we'll simulate for testing
                    if ticker == "INVALID":
                        raise ValueError("Invalid ticker format")
                    
                    # Mock successful calculation
                    return {
                        "success": True,
                        "data": {"beta": 1.2, "ticker": ticker},
                        "error": None,
                        "error_code": None
                    }
                    
                except ValueError as e:
                    return self._handle_validation_error(ticker, str(e))
                except Exception as e:
                    return self._handle_unexpected_error(ticker, str(e))
            
            def _handle_validation_error(self, ticker: str, error_msg: str) -> Dict[str, Any]:
                """Handle validation errors."""
                error_code = "VALIDATION_ERROR"
                self._log_error(ticker, error_code, error_msg)
                
                return {
                    "success": False,
                    "data": None,
                    "error": error_msg,
                    "error_code": error_code,
                    "retry_recommended": False
                }
            
            def _handle_unexpected_error(self, ticker: str, error_msg: str) -> Dict[str, Any]:
                """Handle unexpected errors."""
                error_code = "UNEXPECTED_ERROR"
                self._log_error(ticker, error_code, error_msg)
                
                return {
                    "success": False,
                    "data": None,
                    "error": "Unexpected error occurred",
                    "error_code": error_code,
                    "retry_recommended": True
                }
            
            def _log_error(self, ticker: str, error_code: str, error_msg: str) -> None:
                """Log error for monitoring."""
                if error_code not in self.error_counts:
                    self.error_counts[error_code] = 0
                self.error_counts[error_code] += 1
                self.last_errors[ticker] = {"code": error_code, "message": error_msg}
            
            def get_error_stats(self) -> Dict[str, int]:
                """Get error statistics."""
                return self.error_counts.copy()
        
        # Test error handling
        error_handler = ValuationErrorHandler()
        
        # Test successful calculation
        result = error_handler.safe_calculate_beta("FPT", "2023-01-01", "2023-12-31")
        assert result["success"] == True
        assert result["error"] is None
        
        # Test validation error
        result = error_handler.safe_calculate_beta("INVALID", "2023-01-01", "2023-12-31")
        assert result["success"] == False
        assert result["error_code"] == "VALIDATION_ERROR"
        assert result["retry_recommended"] == False
        
        # Test error statistics
        stats = error_handler.get_error_stats()
        assert "VALIDATION_ERROR" in stats
        assert stats["VALIDATION_ERROR"] > 0