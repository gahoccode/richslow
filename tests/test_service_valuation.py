"""Unit tests for valuation service functions."""

import pandas as pd
import pytest
from unittest.mock import patch, MagicMock

from app.services.service_valuation import (
    calculate_beta,
    calculate_wacc,
    get_market_assumptions,
)
from app.schemas.schema_valuation import BetaMetrics, WACCMetrics


class TestBetaCalculation:
    """Test beta coefficient calculation functions."""
    
    @patch('app.services.service_valuation.Quote')
    def test_calculate_beta_success(self, mock_quote, sample_stock_price_data, sample_vnindex_price_data):
        """Test successful beta calculation."""
        # Mock Quote class instances
        mock_stock_quote = MagicMock()
        mock_market_quote = MagicMock()
        
        mock_stock_quote.history.return_value = sample_stock_price_data
        mock_market_quote.history.return_value = sample_vnindex_price_data
        
        # Mock Quote constructor to return our mock instances
        mock_quote.side_effect = [mock_stock_quote, mock_market_quote]
        
        result = calculate_beta("FPT", "2023-01-01", "2023-12-31")
        
        # Verify result structure
        assert isinstance(result, BetaMetrics)
        assert result.ticker == "FPT"
        assert isinstance(result.beta, float)
        assert isinstance(result.correlation, float)
        assert isinstance(result.r_squared, float)

    @patch('app.services.service_valuation.Quote')
    def test_calculate_beta_insufficient_data(self, mock_quote):
        """Test beta calculation with insufficient data."""
        # Mock insufficient aligned data
        short_data = pd.DataFrame({
            "time": pd.date_range("2023-01-01", periods=5, freq="D"),
            "close": [100, 101, 102, 103, 104],
        })
        
        mock_stock_quote = MagicMock()
        mock_market_quote = MagicMock()
        
        mock_stock_quote.history.return_value = short_data
        mock_market_quote.history.return_value = short_data
        
        mock_quote.side_effect = [mock_stock_quote, mock_market_quote]
        
        with pytest.raises(Exception):  # Will raise some exception due to insufficient data
            calculate_beta("FPT", "2023-01-01", "2023-01-05")

    @patch('app.services.service_valuation.Quote')
    def test_calculate_beta_market_data_error(self, mock_quote):
        """Test beta calculation with market data fetch error."""
        mock_quote.side_effect = Exception("Market data unavailable")
        
        with pytest.raises(Exception) as exc_info:
            calculate_beta("FPT", "2023-01-01", "2023-12-31")
        
        # Check exception occurred
        assert exc_info.value is not None


class TestWACCCalculation:
    """Test WACC calculation functions."""
    
    @patch('app.services.service_valuation.Finance')
    @patch('app.services.service_valuation.calculate_beta')
    def test_calculate_wacc_success(self, mock_beta, mock_finance, sample_beta_metrics,
                                   sample_valuation_ratios_data, sample_valuation_balance_data):
        """Test successful WACC calculation."""
        # Setup mocks
        mock_beta.return_value = sample_beta_metrics
        
        mock_finance_instance = MagicMock()
        mock_finance_instance.ratio.return_value = sample_valuation_ratios_data
        mock_finance_instance.finance.return_value = sample_valuation_balance_data
        mock_finance.return_value = mock_finance_instance
        
        result = calculate_wacc("FPT", "2023-01-01", "2023-12-31")
        
        # Verify result structure
        assert isinstance(result, WACCMetrics)
        assert result.ticker == "FPT"
        assert isinstance(result.wacc, float)
        assert isinstance(result.cost_of_equity, float)
        assert isinstance(result.cost_of_debt, float)
        assert result.beta == sample_beta_metrics.beta

    @patch('app.services.service_valuation.Finance')
    @patch('app.services.service_valuation.calculate_beta')
    def test_calculate_wacc_missing_market_cap(self, mock_beta, mock_finance, sample_beta_metrics):
        """Test WACC calculation with missing market cap data."""
        mock_beta.return_value = sample_beta_metrics
        
        # Mock ratios without market cap
        ratios_no_market_cap = pd.DataFrame({
            "yearReport": [2023],
            "pe_ratio": [15.5],
        })
        
        mock_finance_instance = MagicMock()
        mock_finance_instance.ratio.return_value = ratios_no_market_cap
        mock_finance_instance.finance.return_value = pd.DataFrame({"yearReport": [2023]})
        mock_finance.return_value = mock_finance_instance
        
        with pytest.raises(Exception):  # Will raise exception due to missing market cap
            calculate_wacc("FPT", "2023-01-01", "2023-12-31")

    @patch('app.services.service_valuation.calculate_beta')
    def test_calculate_wacc_beta_calculation_error(self, mock_beta):
        """Test WACC calculation when beta calculation fails."""
        mock_beta.side_effect = Exception("Beta calculation failed")
        
        with pytest.raises(Exception) as exc_info:
            calculate_wacc("FPT", "2023-01-01", "2023-12-31")
        
        # Check exception occurred
        assert exc_info.value is not None

    def test_get_market_assumptions(self):
        """Test market assumptions retrieval."""
        assumptions = get_market_assumptions()
        
        # Verify Vietnamese market parameters
        assert assumptions["vietnam_risk_free_rate"] == 0.035
        assert assumptions["vietnam_market_risk_premium"] == 0.05
        assert assumptions["vietnam_corporate_tax_rate"] == 0.20
        assert assumptions["default_credit_spread"] == 0.025
        
        # Verify all required keys present
        required_keys = [
            "vietnam_risk_free_rate", "vietnam_market_risk_premium",
            "vietnam_corporate_tax_rate", "default_credit_spread"
        ]
        for key in required_keys:
            assert key in assumptions
            assert isinstance(assumptions[key], (int, float))


class TestEdgeCasesAndValidation:
    """Test edge cases and data validation."""
    
    @patch('app.services.service_valuation.Quote')
    def test_calculate_beta_extreme_values(self, mock_quote):
        """Test beta calculation with extreme but valid values."""
        # Create data that should produce high beta
        stock_data = pd.DataFrame({
            "time": pd.date_range("2023-01-01", periods=100, freq="D"),
            "close": [100 * (1.05 ** (i/100)) for i in range(100)],  # High volatility stock
        })
        market_data = pd.DataFrame({
            "time": pd.date_range("2023-01-01", periods=100, freq="D"),
            "close": [1000 * (1.01 ** (i/100)) for i in range(100)],  # Low volatility market
        })
        
        mock_stock_quote = MagicMock()
        mock_market_quote = MagicMock()
        
        mock_stock_quote.history.return_value = stock_data
        mock_market_quote.history.return_value = market_data
        
        mock_quote.side_effect = [mock_stock_quote, mock_market_quote]
        
        result = calculate_beta("FPT", "2023-01-01", "2023-03-31")
        
        # Should produce valid result
        assert isinstance(result.beta, float)
        assert not pd.isna(result.beta)
        assert abs(result.beta) < 50  # Reasonable upper bound

    @patch('app.services.service_valuation.Finance')
    def test_wacc_calculation_negative_debt(self, mock_finance, sample_beta_metrics):
        """Test WACC calculation with negative debt values."""
        with patch('app.services.service_valuation.calculate_beta') as mock_beta:
            mock_beta.return_value = sample_beta_metrics
            
            # Mock data with negative debt (cash position)
            ratios_data = pd.DataFrame({
                "yearReport": [2023],
                "market_cap": [15000000],
            })
            balance_data = pd.DataFrame({
                "yearReport": [2023],
                "short_term_borrowings": [-1000000],  # Negative = net cash
                "long_term_borrowings": [0],
                "owners_equity": [8000000],
            })
            
            mock_finance_instance = MagicMock()
            mock_finance_instance.ratio.return_value = ratios_data
            mock_finance_instance.finance.return_value = balance_data
            mock_finance.return_value = mock_finance_instance
            
            result = calculate_wacc("FPT", "2023-01-01", "2023-12-31")
            
            # Should handle debt gracefully
            assert isinstance(result, WACCMetrics)
            assert isinstance(result.market_value_debt, (int, float))
            assert isinstance(result.debt_weight, (int, float))