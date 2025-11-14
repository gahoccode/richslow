"""Test Pydantic model validation and schema contracts."""

import json
from datetime import datetime
from typing import Any, Dict

import pytest
from pydantic import ValidationError

from app.schemas.schema_statements import (
    BalanceSheetData,
    CashFlowData,
    FinancialRatiosData,
    FinancialStatementsResponse,
    FinancialStatement,
    IncomeStatementData,
    StatementsRequest,
)
from app.schemas.schema_common import PeriodType


class TestSchemaValidation:
    """Test Pydantic model validation for all financial data schemas."""

    def test_statements_request_validation(self):
        """Test StatementsRequest model validation."""
        # Valid request
        valid_data = {
            "ticker": "FPT",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31", 
            "period": "year"
        }
        
        request = StatementsRequest(**valid_data)
        assert request.ticker == "FPT"
        assert request.period == PeriodType.yearly
        
        # Test serialization
        serialized = request.model_dump()
        assert serialized["ticker"] == "FPT"
        assert serialized["period"] == "year"

    def test_statements_request_invalid_data(self):
        """Test StatementsRequest validation with invalid data."""
        # Missing required fields
        with pytest.raises(ValidationError):
            StatementsRequest()
        
        # Invalid period
        with pytest.raises(ValidationError):
            StatementsRequest(
                ticker="FPT",
                start_date="2023-01-01",
                end_date="2023-12-31",
                period="invalid"
            )

    def test_income_statement_data_validation(self):
        """Test IncomeStatementData model validation."""
        valid_data = {
            "year_report": 2023,
            "revenue": 1000000.0,
            "gross_profit": 400000.0,
            "operating_profit": 250000.0,
            "net_profit": 180000.0,
            "attributable_to_parent": 175000.0,
        }
        
        income = IncomeStatementData(**valid_data)
        assert income.year_report == 2023
        assert income.revenue == 1000000.0
        assert income.net_profit == 180000.0

    def test_income_statement_with_nulls(self):
        """Test IncomeStatementData with null values."""
        # Only required field provided
        minimal_data = {"year_report": 2023}
        
        income = IncomeStatementData(**minimal_data)
        assert income.year_report == 2023
        assert income.revenue is None
        assert income.net_profit is None

    def test_balance_sheet_data_validation(self):
        """Test BalanceSheetData model validation."""
        valid_data = {
            "year_report": 2023,
            "total_assets": 2000000.0,
            "current_assets": 800000.0,
            "total_liabilities": 1200000.0,
            "owners_equity": 800000.0,
            "cash_and_equivalents": 200000.0,
        }
        
        balance = BalanceSheetData(**valid_data)
        assert balance.year_report == 2023
        assert balance.total_assets == 2000000.0
        assert balance.owners_equity == 800000.0

    def test_cash_flow_data_validation(self):
        """Test CashFlowData model validation."""
        valid_data = {
            "year_report": 2023,
            "operating_cash_flow": 300000.0,
            "investing_cash_flow": -50000.0,
            "financing_cash_flow": -100000.0,
            "net_change_in_cash": 150000.0,
        }
        
        cash_flow = CashFlowData(**valid_data)
        assert cash_flow.year_report == 2023
        assert cash_flow.operating_cash_flow == 300000.0
        assert cash_flow.investing_cash_flow == -50000.0


class TestFinancialRatiosDataValidation:
    """Comprehensive tests for FinancialRatiosData schema - the most critical model."""

    def test_financial_ratios_complete_data(self):
        """Test FinancialRatiosData with complete dataset."""
        complete_data = {
            "year_report": 2023,
            # Valuation Ratios
            "pe_ratio": 15.5,
            "pb_ratio": 2.1,
            "ps_ratio": 3.2,
            "p_cash_flow": 8.5,
            "ev_ebitda": 12.5,
            "market_cap": 50000.0,
            "outstanding_shares": 100.0,
            "earnings_per_share": 1800.0,
            "book_value_per_share": 8000.0,
            "dividend_yield": 0.025,
            # Profitability Ratios
            "roe": 0.225,
            "roa": 0.090,
            "roic": 0.125,
            "gross_profit_margin": 0.40,
            "net_profit_margin": 0.18,
            "ebit_margin": 0.25,
            "ebitda": 350000.0,
            "ebit": 250000.0,
            # Liquidity Ratios
            "current_ratio": 1.8,
            "quick_ratio": 1.2,
            "cash_ratio": 0.5,
            "interest_coverage_ratio": 8.5,
            # Leverage/Capital Structure Ratios
            "debt_to_equity": 0.6,
            "bank_loans_long_term_debt_to_equity": 0.45,
            "fixed_assets_to_equity": 1.2,
            "equity_to_registered_capital": 1.1,
            # Efficiency/Activity Ratios
            "asset_turnover": 1.2,
            "fixed_asset_turnover": 2.5,
            "inventory_turnover": 6.0,
            "average_collection_days": 45.0,
            "average_inventory_days": 60.0,
            "average_payment_days": 30.0,
            "cash_conversion_cycle": 75.0,
        }
        
        ratios = FinancialRatiosData(**complete_data)
        
        # Test all critical fields that were previously missing
        assert ratios.year_report == 2023
        assert ratios.dividend_yield == 0.025
        assert ratios.roe == 0.225
        assert ratios.roa == 0.090
        assert ratios.gross_profit_margin == 0.40
        assert ratios.net_profit_margin == 0.18
        assert ratios.debt_to_equity == 0.6
        assert ratios.bank_loans_long_term_debt_to_equity == 0.45
        assert ratios.average_collection_days == 45.0
        assert ratios.average_inventory_days == 60.0
        assert ratios.average_payment_days == 30.0
        assert ratios.cash_conversion_cycle == 75.0

    def test_financial_ratios_minimal_data(self):
        """Test FinancialRatiosData with only required field."""
        minimal_data = {"year_report": 2023}
        
        ratios = FinancialRatiosData(**minimal_data)
        assert ratios.year_report == 2023
        
        # All other fields should be None
        assert ratios.pe_ratio is None
        assert ratios.roe is None
        assert ratios.debt_to_equity is None
        assert ratios.average_collection_days is None
        assert ratios.cash_conversion_cycle is None

    def test_financial_ratios_field_coverage(self):
        """Test that all expected financial ratio fields are defined."""
        # Get all model fields
        fields = FinancialRatiosData.model_fields.keys()
        
        # Critical fields that must be present (the ones we recently fixed)
        required_fields = {
            "year_report",
            # Previously missing fields
            "dividend_yield",
            "roe", 
            "roa",
            "gross_profit_margin",
            "net_profit_margin", 
            "debt_to_equity",
            "bank_loans_long_term_debt_to_equity",
            "average_collection_days",
            "average_inventory_days", 
            "average_payment_days",
            "cash_conversion_cycle",
            # Other important fields
            "pe_ratio",
            "pb_ratio",
            "current_ratio",
            "asset_turnover",
        }
        
        missing_fields = required_fields - set(fields)
        assert not missing_fields, f"Missing required fields: {missing_fields}"
        
        # Verify we have comprehensive coverage (should be 34+ fields)
        assert len(fields) >= 34, f"Expected at least 34 fields, got {len(fields)}"

    def test_financial_ratios_type_validation(self):
        """Test type validation for financial ratios."""
        # Test with string numbers (should convert)
        data_with_strings = {
            "year_report": "2023",  # Should convert to int
            "pe_ratio": "15.5",     # Should convert to float
            "roe": "0.225",         # Should convert to float
        }
        
        ratios = FinancialRatiosData(**data_with_strings)
        assert ratios.year_report == 2023
        assert ratios.pe_ratio == 15.5
        assert ratios.roe == 0.225

    def test_financial_ratios_invalid_types(self):
        """Test validation errors with invalid types."""
        # Invalid year_report type
        with pytest.raises(ValidationError):
            FinancialRatiosData(year_report="invalid")
        
        # Invalid ratio values
        with pytest.raises(ValidationError):
            FinancialRatiosData(year_report=2023, pe_ratio="not_a_number")


class TestFinancialStatementsResponse:
    """Test the main API response model."""

    def test_complete_response_validation(self):
        """Test complete FinancialStatementsResponse validation."""
        response_data = {
            "ticker": "FPT",
            "period": "year",
            "income_statements": [
                {"year_report": 2023, "revenue": 1000000, "net_profit": 180000}
            ],
            "balance_sheets": [
                {"year_report": 2023, "total_assets": 2000000, "owners_equity": 800000}
            ],
            "cash_flows": [
                {"year_report": 2023, "operating_cash_flow": 300000}
            ],
            "ratios": [
                {
                    "year_report": 2023,
                    "pe_ratio": 15.5,
                    "roe": 0.225,
                    "debt_to_equity": 0.6,
                    "average_collection_days": 45.0,
                    "cash_conversion_cycle": 75.0,
                }
            ],
            "years": [2023, 2022, 2021],
            "raw_data": {
                "income_statements": [],
                "balance_sheets": [],
                "cash_flows": [],
                "ratios": [],
            },
        }
        
        response = FinancialStatementsResponse(**response_data)
        
        assert response.ticker == "FPT"
        assert response.period == "year"
        assert len(response.income_statements) == 1
        assert len(response.ratios) == 1
        assert response.ratios[0].year_report == 2023
        assert response.ratios[0].pe_ratio == 15.5

    def test_response_serialization(self):
        """Test that response can be serialized to JSON."""
        response_data = {
            "ticker": "FPT", 
            "period": "year",
            "income_statements": [{"year_report": 2023}],
            "balance_sheets": [{"year_report": 2023}],
            "cash_flows": [{"year_report": 2023}],
            "ratios": [{"year_report": 2023, "pe_ratio": 15.5}],
            "years": [2023],
        }
        
        response = FinancialStatementsResponse(**response_data)
        
        # Test model_dump (Pydantic v2)
        serialized = response.model_dump()
        assert isinstance(serialized, dict)
        assert serialized["ticker"] == "FPT"
        
        # Test JSON serialization
        json_str = response.model_dump_json()
        assert isinstance(json_str, str)
        
        # Verify it can be loaded back
        loaded_data = json.loads(json_str)
        assert loaded_data["ticker"] == "FPT"


class TestSchemaCompatibility:
    """Test schema compatibility and evolution."""

    def test_backward_compatibility(self):
        """Test that schemas maintain backward compatibility."""
        # Test with old-style data that might be missing new fields
        old_ratios_data = {
            "year_report": 2023,
            "pe_ratio": 15.5,
            "pb_ratio": 2.1,
            # Missing many of the newer fields we added
        }
        
        # Should still work
        ratios = FinancialRatiosData(**old_ratios_data)
        assert ratios.year_report == 2023
        assert ratios.pe_ratio == 15.5
        # New fields should be None
        assert ratios.dividend_yield is None
        assert ratios.cash_conversion_cycle is None

    def test_forward_compatibility(self):
        """Test handling of unknown fields."""
        # Pydantic v2 by default ignores extra fields
        data_with_extra = {
            "year_report": 2023,
            "pe_ratio": 15.5,
            "unknown_field": "should_be_ignored",
        }
        
        ratios = FinancialRatiosData(**data_with_extra)
        assert ratios.year_report == 2023
        assert ratios.pe_ratio == 15.5
        # unknown_field should be ignored, not cause an error

    def test_model_field_documentation(self):
        """Test that all model fields have proper documentation."""
        # Get model info
        fields = FinancialRatiosData.model_fields
        
        # Check that important fields have descriptions
        critical_fields = [
            "pe_ratio", 
            "roe", 
            "debt_to_equity", 
            "average_collection_days",
            "cash_conversion_cycle"
        ]
        
        for field_name in critical_fields:
            assert field_name in fields
            field_info = fields[field_name]
            # Should have a description
            assert hasattr(field_info, 'description') and field_info.description

    def test_schema_json_export(self):
        """Test that schema can be exported as JSON schema for documentation."""
        # This is important for API documentation and frontend contract validation
        schema = FinancialRatiosData.model_json_schema()

        assert "properties" in schema
        assert "year_report" in schema["properties"]
        assert "pe_ratio" in schema["properties"]

        # Test that critical fields are documented
        critical_fields = ["roe", "debt_to_equity", "cash_conversion_cycle"]
        for field in critical_fields:
            assert field in schema["properties"]
            # Should have type information
            assert "type" in schema["properties"][field] or "anyOf" in schema["properties"][field]


class TestHistoricalPricesSchemas:
    """Test Pydantic model validation for historical price schemas."""

    def test_exchange_rate_with_proper_aliases(self):
        """Test ExchangeRate schema with correct vnstock field aliases (buy _cash, buy _transfer)."""
        from app.schemas.historical_prices import ExchangeRate

        # Data matching vnstock API structure with spaces in column names
        valid_data = {
            "currency_code": "USD",
            "currency_name": "US DOLLAR",
            "buy _cash": 25154.00,  # Note: space before underscore
            "buy _transfer": 25184.00,  # Note: space before underscore
            "sell": 25484.00,
            "date": datetime(2024, 5, 10)
        }

        rate = ExchangeRate(**valid_data)
        assert rate.currency_code == "USD"
        assert rate.buy_cash == 25154.00
        assert rate.buy_transfer == 25184.00
        assert rate.sell == 25484.00

    def test_exchange_rate_missing_values(self):
        """Test ExchangeRate handling of missing values (dashes converted to None)."""
        from app.schemas.historical_prices import ExchangeRate
        from app.utils.data_cleaning import clean_price_string

        # Test dash handling
        assert clean_price_string("-") is None
        assert clean_price_string(None) is None
        assert clean_price_string("") is None

        # ExchangeRate with None values should succeed (fields are optional)
        rate = ExchangeRate(
            currency_code="DKK",
            currency_name="DANISH KRONE",
            **{"buy _cash": None, "buy _transfer": 3611.55},
            sell=3749.84,
            date=datetime(2024, 5, 10)
        )
        assert rate.currency_code == "DKK"
        assert rate.buy_cash is None  # None is valid for optional field
        assert rate.buy_transfer == 3611.55

    def test_gold_sjc_comma_separated_prices(self):
        """Test GoldSJC with comma-separated price strings."""
        from app.schemas.historical_prices import GoldSJC
        from app.utils.data_cleaning import clean_price_string

        # Test cleaning function
        assert clean_price_string("88,500,000") == 88500000.0
        assert clean_price_string("90,500,000") == 90500000.0

        # Test schema validation
        gold = GoldSJC(
            name="SJC 1L, 10L, 1KG",
            buy_price=88500000.0,
            sell_price=90500000.0
        )
        assert gold.name == "SJC 1L, 10L, 1KG"
        assert gold.buy_price == 88500000.0

    def test_gold_btmc_datetime_parsing(self):
        """Test GoldBTMC datetime parsing from DD/MM/YYYY HH:MM format."""
        from app.schemas.historical_prices import GoldBTMC
        from app.utils.data_cleaning import parse_btmc_datetime

        # Test parsing function
        parsed = parse_btmc_datetime("28/05/2024 08:52")
        assert parsed.year == 2024
        assert parsed.month == 5
        assert parsed.day == 28
        assert parsed.hour == 8
        assert parsed.minute == 52

        # Test schema validation
        gold = GoldBTMC(
            name="VÀNG MIẾNG SJC",
            karat="24k",
            gold_content="999.9",
            buy_price=8845000,
            sell_price=9000000,
            world_price=7338000,
            time=datetime(2024, 5, 28, 8, 52)
        )
        assert gold.karat == "24k"
        assert gold.time.hour == 8

    def test_gold_btmc_int_conversion(self):
        """Test GoldBTMC integer price conversion."""
        from app.utils.data_cleaning import clean_price_int

        # Test cleaning function with various formats
        assert clean_price_int("7,542,000") == 7542000
        assert clean_price_int("7542000") == 7542000
        assert clean_price_int("-") is None
        assert clean_price_int(None) is None

    def test_exchange_rate_date_parsing(self):
        """Test ExchangeRate date parsing from YYYY-MM-DD format."""
        from app.utils.data_cleaning import parse_exchange_date

        # Test parsing function
        parsed = parse_exchange_date("2024-05-10")
        assert parsed.year == 2024
        assert parsed.month == 5
        assert parsed.day == 10

    def test_stock_ohlcv_validation(self):
        """Test StockOHLCV schema validation."""
        from app.schemas.historical_prices import StockOHLCV

        ohlcv = StockOHLCV(
            time=datetime(2024, 1, 15),
            open=89500.0,
            high=90200.0,
            low=88800.0,
            close=90000.0,
            volume=1500000.0
        )
        assert ohlcv.open == 89500.0
        assert ohlcv.high == 90200.0
        assert ohlcv.close == 90000.0

    def test_data_cleaning_edge_cases(self):
        """Test data cleaning utilities with edge cases."""
        from app.utils.data_cleaning import clean_price_string, clean_price_int

        # Empty strings
        assert clean_price_string("") is None
        assert clean_price_string("   ") is None
        assert clean_price_int("") is None

        # Numbers without commas
        assert clean_price_string("12345.67") == 12345.67
        assert clean_price_int("12345") == 12345

        # Multiple commas
        assert clean_price_string("1,234,567.89") == 1234567.89
        assert clean_price_int("1,234,567") == 1234567

    def test_datetime_parsing_edge_cases(self):
        """Test datetime parsing with invalid formats."""
        from app.utils.data_cleaning import parse_btmc_datetime, parse_exchange_date

        # Invalid formats should raise ValueError
        with pytest.raises(ValueError):
            parse_btmc_datetime("2024-05-28 08:52")  # Wrong format

        with pytest.raises(ValueError):
            parse_exchange_date("28/05/2024")  # Wrong format

    def test_historical_prices_serialization(self):
        """Test that all historical price models can be serialized to JSON."""
        from app.schemas.historical_prices import (
            ExchangeRate,
            GoldBTMC,
            GoldSJC,
            StockOHLCV,
        )

        # ExchangeRate
        rate = ExchangeRate(
            currency_code="USD",
            currency_name="US DOLLAR",
            **{"buy _cash": 25154.00, "buy _transfer": 25184.00},
            sell=25484.00,
            date=datetime(2024, 5, 10)
        )
        rate_json = rate.model_dump_json()
        assert "USD" in rate_json

        # GoldSJC
        sjc = GoldSJC(name="SJC 1L", buy_price=88500000.0, sell_price=90500000.0)
        sjc_json = sjc.model_dump_json()
        assert "SJC 1L" in sjc_json

        # GoldBTMC
        btmc = GoldBTMC(
            name="VÀNG MIẾNG",
            karat="24k",
            gold_content="999.9",
            buy_price=8845000,
            sell_price=9000000,
            world_price=7338000,
            time=datetime(2024, 5, 28, 8, 52)
        )
        btmc_json = btmc.model_dump_json()
        assert "24k" in btmc_json

        # StockOHLCV
        ohlcv = StockOHLCV(
            time=datetime(2024, 1, 15),
            open=89500.0,
            high=90200.0,
            low=88800.0,
            close=90000.0,
            volume=1500000.0
        )
        ohlcv_json = ohlcv.model_dump_json()
        assert "89500" in ohlcv_json