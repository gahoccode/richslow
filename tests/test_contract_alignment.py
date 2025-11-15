"""Test frontend-backend contract alignment and field mapping consistency."""

import json
import re
from pathlib import Path
from typing import Dict, Set

import pytest

from app.schemas.schema_statements import FinancialRatiosData


class TestFrontendBackendContract:
    """Test that frontend and backend use the same field contracts."""

    def test_frontend_ratio_fields_exist_in_backend(self, expected_frontend_fields):
        """Test that all frontend expected fields exist in backend schema."""
        # Get backend schema fields
        backend_fields = set(FinancialRatiosData.model_fields.keys())

        # Get frontend expected fields
        frontend_fields = set(expected_frontend_fields.keys())

        # Check for missing fields in backend
        missing_in_backend = frontend_fields - backend_fields

        assert not missing_in_backend, (
            f"Frontend expects fields that don't exist in backend schema: {missing_in_backend}"
        )

    def test_backend_fields_covered_in_frontend(self, expected_frontend_fields):
        """Test that important backend fields are covered in frontend."""
        # Get backend schema fields
        backend_fields = set(FinancialRatiosData.model_fields.keys())

        # Get frontend expected fields
        frontend_fields = set(expected_frontend_fields.keys())

        # Fields that should definitely be in frontend
        critical_backend_fields = {
            "pe_ratio",
            "pb_ratio",
            "roe",
            "roa",
            "debt_to_equity",
            "current_ratio",
            "asset_turnover",
            "average_collection_days",
            "cash_conversion_cycle",
            "gross_profit_margin",
            "net_profit_margin",
            "dividend_yield",
            "bank_loans_long_term_debt_to_equity",
        }

        missing_in_frontend = critical_backend_fields - frontend_fields

        assert not missing_in_frontend, (
            f"Critical backend fields missing from frontend: {missing_in_frontend}"
        )

    def test_parse_frontend_javascript_fields(self):
        """Test parsing actual frontend JavaScript to verify field contract."""
        statements_js_path = Path("static/js/statements.js")

        if not statements_js_path.exists():
            pytest.skip("Frontend JavaScript file not found")

        # Read the JavaScript file
        with open(statements_js_path, "r", encoding="utf-8") as f:
            js_content = f.read()

        # Extract ratioMetrics array using regex
        pattern = r"const ratioMetrics = \[(.*?)\];"
        match = re.search(pattern, js_content, re.DOTALL)

        if not match:
            pytest.fail("Could not find ratioMetrics array in frontend JavaScript")

        metrics_content = match.group(1)

        # Extract field keys using regex
        key_pattern = r"key: ['\"]([^'\"]+)['\"]"
        frontend_keys = set(re.findall(key_pattern, metrics_content))

        # Get backend fields
        backend_fields = set(FinancialRatiosData.model_fields.keys())

        # Verify alignment
        missing_in_backend = frontend_keys - backend_fields
        assert not missing_in_backend, (
            f"Frontend uses fields not in backend: {missing_in_backend}"
        )

    def test_api_response_structure_matches_frontend_expectations(
        self, sample_api_response
    ):
        """Test that API response structure matches frontend expectations."""
        # Validate the sample response against our schema
        from app.schemas.schema_statements import FinancialStatementsResponse

        try:
            validated_response = FinancialStatementsResponse(**sample_api_response)
        except Exception as e:
            pytest.fail(f"Sample API response doesn't match schema: {e}")

        # Check that ratios array contains expected fields
        if validated_response.ratios:
            ratio_data = validated_response.ratios[0]

            # These are the fields frontend definitely expects to access
            expected_fields = [
                "year_report",
                "pe_ratio",
                "roe",
                "debt_to_equity",
                "average_collection_days",
                "cash_conversion_cycle",
            ]

            for field in expected_fields:
                assert hasattr(ratio_data, field), f"Ratio data missing field: {field}"

    def test_field_naming_consistency(self):
        """Test that field names follow consistent naming patterns."""
        fields = FinancialRatiosData.model_fields.keys()

        # Check naming patterns
        for field_name in fields:
            # Should be snake_case
            assert field_name.islower(), f"Field {field_name} should be lowercase"
            assert " " not in field_name, (
                f"Field {field_name} should not contain spaces"
            )

            # Common patterns
            if "ratio" in field_name:
                assert not field_name.endswith("_ratio_ratio"), (
                    f"Redundant naming: {field_name}"
                )

    def test_json_serialization_compatibility(self):
        """Test that backend data serializes in format frontend expects."""
        # Create sample ratios data
        sample_data = {
            "year_report": 2023,
            "pe_ratio": 15.5,
            "roe": 0.225,
            "debt_to_equity": 0.6,
            "average_collection_days": 45.0,
            "cash_conversion_cycle": 75.0,
            "gross_profit_margin": 0.40,
            "net_profit_margin": 0.18,
            "dividend_yield": 0.025,
            "bank_loans_long_term_debt_to_equity": 0.45,
        }

        ratios = FinancialRatiosData(**sample_data)

        # Serialize to JSON
        json_str = ratios.model_dump_json()

        # Parse back
        parsed_data = json.loads(json_str)

        # Verify fields are accessible the way frontend expects
        assert parsed_data["year_report"] == 2023
        assert parsed_data["pe_ratio"] == 15.5
        assert parsed_data["roe"] == 0.225
        assert parsed_data["average_collection_days"] == 45.0

        # Verify null fields serialize properly
        minimal_data = {"year_report": 2023}
        minimal_ratios = FinancialRatiosData(**minimal_data)
        minimal_json = json.loads(minimal_ratios.model_dump_json())

        # Frontend should handle null values
        assert minimal_json["pe_ratio"] is None
        assert minimal_json["roe"] is None


class TestContractDocumentation:
    """Test that contract is properly documented for maintenance."""

    def test_schema_has_openapi_documentation(self):
        """Test that schema generates proper OpenAPI documentation."""
        schema = FinancialRatiosData.model_json_schema()

        # Should have title and properties
        assert "properties" in schema
        assert len(schema["properties"]) > 30  # Should have 34+ fields

        # Critical fields should be documented
        critical_fields = ["pe_ratio", "roe", "debt_to_equity", "cash_conversion_cycle"]
        for field in critical_fields:
            assert field in schema["properties"]
            field_schema = schema["properties"][field]

            # Should have type information
            assert "type" in field_schema or "anyOf" in field_schema

    def test_response_schema_documentation(self):
        """Test that full response schema is properly documented."""
        from app.schemas.schema_statements import FinancialStatementsResponse

        schema = FinancialStatementsResponse.model_json_schema()

        # Should document all response fields
        required_response_fields = [
            "ticker",
            "period",
            "income_statements",
            "balance_sheets",
            "cash_flows",
            "ratios",
            "years",
        ]

        for field in required_response_fields:
            assert field in schema["properties"], f"Response schema missing {field}"

    def test_enum_documentation(self):
        """Test that enums are properly documented."""
        from app.schemas.schema_common import PeriodType

        # Period enum should be documented
        schema = (
            PeriodType.model_json_schema()
            if hasattr(PeriodType, "model_json_schema")
            else None
        )

        # At minimum, should have the enum values
        period_values = [item.value for item in PeriodType]
        assert "year" in period_values
        assert "quarter" in period_values


class TestContractEvolution:
    """Test contract evolution and backward compatibility."""

    def test_new_field_addition_compatibility(self):
        """Test that adding new fields doesn't break existing contracts."""
        # Simulate old client data (missing newer fields)
        old_client_data = {
            "year_report": 2023,
            "pe_ratio": 15.5,
            "pb_ratio": 2.1,
            # Missing: dividend_yield, bank_loans_long_term_debt_to_equity, etc.
        }

        # Should still validate
        ratios = FinancialRatiosData(**old_client_data)
        assert ratios.year_report == 2023
        assert ratios.pe_ratio == 15.5

        # New fields should be None (backward compatible)
        assert ratios.dividend_yield is None
        assert ratios.bank_loans_long_term_debt_to_equity is None

    def test_frontend_handles_missing_fields(self):
        """Test that frontend can handle missing/null field values."""
        # Create data with some null fields
        data_with_nulls = {
            "year_report": 2023,
            "pe_ratio": 15.5,
            "roe": None,  # This might be null from data source
            "debt_to_equity": 0.6,
            "average_collection_days": None,  # This might be null for banks
        }

        ratios = FinancialRatiosData(**data_with_nulls)

        # Serialize as frontend would receive
        serialized = ratios.model_dump()

        # Frontend should get explicit null values, not missing keys
        assert "roe" in serialized
        assert serialized["roe"] is None
        assert "average_collection_days" in serialized
        assert serialized["average_collection_days"] is None

    def test_field_type_compatibility(self):
        """Test that field types are compatible between frontend and backend."""
        # Test various numeric types that might come from data sources
        test_cases = [
            {"year_report": 2023, "pe_ratio": 15.5},  # float
            {"year_report": 2023, "pe_ratio": 15},  # int converted to float
            {"year_report": 2023, "pe_ratio": "15.5"},  # string converted to float
        ]

        for case in test_cases:
            ratios = FinancialRatiosData(**case)
            # Should convert properly for frontend consumption
            assert isinstance(ratios.pe_ratio, (float, type(None)))


class TestContractValidation:
    """Validate the contract against real-world scenarios."""

    def test_realistic_ratio_data_ranges(self):
        """Test that realistic financial ratio ranges are accepted."""
        # Test edge cases with realistic financial data
        edge_cases = [
            # High growth tech company
            {
                "year_report": 2023,
                "pe_ratio": 50.0,  # High P/E
                "roe": 0.35,  # High ROE
                "debt_to_equity": 0.1,  # Low debt
                "gross_profit_margin": 0.8,  # High margin
            },
            # Mature industrial company
            {
                "year_report": 2023,
                "pe_ratio": 8.0,  # Low P/E
                "roe": 0.12,  # Moderate ROE
                "debt_to_equity": 1.5,  # Higher debt
                "gross_profit_margin": 0.25,  # Lower margin
            },
            # Struggling company
            {
                "year_report": 2023,
                "pe_ratio": None,  # Negative earnings
                "roe": -0.05,  # Negative ROE
                "debt_to_equity": 3.0,  # High debt
                "net_profit_margin": -0.02,  # Negative margin
            },
        ]

        for case in edge_cases:
            # Should all validate without errors
            ratios = FinancialRatiosData(**case)
            assert ratios.year_report == 2023

    def test_industry_specific_scenarios(self):
        """Test contract handles different industry scenarios."""
        # Banking company (different ratio availability)
        bank_data = {
            "year_report": 2023,
            "roe": 0.15,
            "roa": 0.012,  # Banks typically have low ROA
            "pe_ratio": 10.0,
            # Banks typically don't have inventory ratios
            "inventory_turnover": None,
            "average_inventory_days": None,
            "cash_conversion_cycle": None,
        }

        bank_ratios = FinancialRatiosData(**bank_data)
        assert bank_ratios.roe == 0.15
        assert bank_ratios.inventory_turnover is None

        # Manufacturing company (should have all ratios)
        manufacturing_data = {
            "year_report": 2023,
            "roe": 0.18,
            "inventory_turnover": 8.0,
            "average_inventory_days": 45.0,
            "cash_conversion_cycle": 65.0,
            "average_collection_days": 35.0,
            "average_payment_days": 25.0,
        }

        mfg_ratios = FinancialRatiosData(**manufacturing_data)
        assert mfg_ratios.inventory_turnover == 8.0
        assert mfg_ratios.cash_conversion_cycle == 65.0
