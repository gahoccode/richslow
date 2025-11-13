"""Test module imports and circular dependency validation."""

import importlib
import sys
from pathlib import Path
from typing import List

import pytest


class TestImports:
    """Test suite for module imports and dependency validation."""

    def test_app_main_import(self):
        """Test that main application module imports successfully."""
        try:
            import app.main
            assert hasattr(app.main, "app")
        except ImportError as e:
            pytest.fail(f"Failed to import app.main: {e}")

    def test_schemas_import(self):
        """Test that all schema modules import successfully."""
        try:
            from app.schemas import schema_statements, schema_common
            
            # Verify key classes are available
            assert hasattr(schema_statements, "FinancialStatementsResponse")
            assert hasattr(schema_statements, "FinancialRatiosData")
            assert hasattr(schema_statements, "IncomeStatementData")
            assert hasattr(schema_statements, "BalanceSheetData")
            assert hasattr(schema_statements, "CashFlowData")
            
        except ImportError as e:
            pytest.fail(f"Failed to import schemas: {e}")

    def test_services_import(self):
        """Test that service modules import successfully."""
        try:
            from app.services import service_statements

            # Verify key functions are available
            assert hasattr(service_statements, "get_financial_statements")
            assert hasattr(service_statements, "_process_ratios")

        except ImportError as e:
            pytest.fail(f"Failed to import services: {e}")

    def test_routes_import(self):
        """Test that route modules import successfully."""
        try:
            from app.routes import route_statements
            
            # Verify router is available
            assert hasattr(route_statements, "router")
            
        except ImportError as e:
            pytest.fail(f"Failed to import routes: {e}")

    def test_standalone_schema_import(self):
        """Test importing schemas without full app context for reusability."""
        try:
            # This tests that schemas can be imported by external applications
            from app.schemas.schema_statements import (
                FinancialStatementsResponse,
                FinancialRatiosData,
                IncomeStatementData,
                BalanceSheetData,
                CashFlowData,
                StatementsRequest,
            )
            
            # Verify classes are properly defined
            assert FinancialStatementsResponse.__name__ == "FinancialStatementsResponse"
            assert FinancialRatiosData.__name__ == "FinancialRatiosData"
            
        except ImportError as e:
            pytest.fail(f"Failed to import schemas standalone: {e}")

    def test_standalone_service_import(self):
        """Test importing services without full app context for reusability."""
        try:
            # This tests that services can be imported by external applications
            from app.services.service_statements import (
                get_financial_statements,
                _process_ratios,
            )
            from app.utils.transform import (
                safe_get_float,
                safe_get_str,
                safe_get_int,
            )

            # Verify functions are callable
            assert callable(get_financial_statements)
            assert callable(_process_ratios)
            assert callable(safe_get_float)

        except ImportError as e:
            pytest.fail(f"Failed to import services standalone: {e}")

    def test_no_circular_imports(self):
        """Test that there are no circular import dependencies."""
        app_modules = [
            "app.main",
            "app.schemas.schema_statements",
            "app.schemas.schema_common", 
            "app.services.service_statements",
            "app.routes.route_statements",
        ]
        
        # Clear any previously imported modules
        modules_to_clear = [mod for mod in sys.modules.keys() if mod.startswith("app.")]
        for mod in modules_to_clear:
            if mod in sys.modules:
                del sys.modules[mod]
        
        # Try importing each module
        for module_name in app_modules:
            try:
                importlib.import_module(module_name)
            except ImportError as e:
                if "circular import" in str(e).lower():
                    pytest.fail(f"Circular import detected in {module_name}: {e}")
                else:
                    # Re-raise other import errors for investigation
                    raise

    def test_all_app_modules_importable(self):
        """Test that all Python files in app/ directory are importable."""
        app_dir = Path("app")
        python_files = list(app_dir.rglob("*.py"))
        
        # Filter out __pycache__ and get module names
        modules_to_test = []
        for py_file in python_files:
            if "__pycache__" not in str(py_file) and py_file.name != "__init__.py":
                # Convert file path to module name
                relative_path = py_file.relative_to(Path("."))
                module_name = str(relative_path).replace("/", ".").replace("\\", ".")[:-3]
                modules_to_test.append(module_name)
        
        failed_imports = []
        for module_name in modules_to_test:
            try:
                importlib.import_module(module_name)
            except ImportError as e:
                failed_imports.append((module_name, str(e)))
        
        if failed_imports:
            error_messages = [f"{mod}: {err}" for mod, err in failed_imports]
            pytest.fail(f"Failed to import modules: {'; '.join(error_messages)}")

    def test_external_dependencies_available(self):
        """Test that all external dependencies are available."""
        required_packages = [
            "fastapi",
            "uvicorn",
            "pandas", 
            "vnstock",
            "pydantic",
        ]
        
        missing_packages = []
        for package in required_packages:
            try:
                importlib.import_module(package)
            except ImportError:
                missing_packages.append(package)
        
        if missing_packages:
            pytest.fail(f"Missing required packages: {', '.join(missing_packages)}")

    def test_optional_dev_dependencies(self):
        """Test that development dependencies are available when installed."""
        dev_packages = [
            "pytest",
            "httpx",
        ]
        
        # These should be available in test environment
        for package in dev_packages:
            try:
                importlib.import_module(package)
            except ImportError as e:
                pytest.fail(f"Development dependency {package} not available: {e}")

    def test_version_compatibility(self):
        """Test that imported modules have expected attributes for version compatibility."""
        try:
            import pandas as pd
            import pydantic
            
            # Check pandas has DataFrame
            assert hasattr(pd, "DataFrame")
            
            # Check pydantic has BaseModel  
            assert hasattr(pydantic, "BaseModel")
            
        except (ImportError, AttributeError) as e:
            pytest.fail(f"Version compatibility issue: {e}")


class TestModularityForReuse:
    """Test that backend modules can be reused in other applications."""

    def test_schemas_independent_import(self):
        """Test that schemas can be imported without any app dependencies."""
        # Simulate importing from another application
        try:
            # Import just the data models
            from app.schemas.schema_statements import FinancialRatiosData
            
            # Verify we can create an instance
            sample_data = {
                "year_report": 2023,
                "pe_ratio": 15.5,
                "roe": 0.225,
                "debt_to_equity": 0.6,
            }
            
            ratio_instance = FinancialRatiosData(**sample_data)
            assert ratio_instance.year_report == 2023
            assert ratio_instance.pe_ratio == 15.5
            
        except Exception as e:
            pytest.fail(f"Schemas not independently importable: {e}")

    def test_service_functions_standalone(self):
        """Test that service utility functions work standalone."""
        try:
            from app.utils.transform import safe_get_float, safe_get_str, safe_get_int

            # Test with sample data
            import pandas as pd
            test_row = pd.Series({"value": 123.45, "text": "hello", "number": "789"})

            # Test utility functions work independently
            assert safe_get_float(test_row, "value") == 123.45
            assert safe_get_str(test_row, "text") == "hello"
            assert safe_get_int(test_row, "number") == 789
            assert safe_get_float(test_row, "missing") is None
            
        except Exception as e:
            pytest.fail(f"Service functions not standalone: {e}")