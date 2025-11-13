# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Centralized Field Mappings** (`app/config/field_mappings.py`): Single source of truth for vnstock API column name mappings
  - `INCOME_STATEMENT_MAPPINGS`: 28 field mappings from vnstock API to IncomeStatementData schema
  - `BALANCE_SHEET_MAPPINGS`: 42 field mappings from vnstock API to BalanceSheetData schema
  - `CASH_FLOW_MAPPINGS`: 40 field mappings from vnstock API to CashFlowData schema
  - `FINANCIAL_RATIOS_MAPPINGS`: 37 field mappings from vnstock API to FinancialRatiosData schema
  - **All mappings validated against actual API responses with dropna=False** - 100% field coverage (147 total mappings)
  - All mappings use deterministic column names from actual vnstock v3.2.6 API responses
- **Data Transformation Utilities** (`app/utils/transform.py`): Reusable helper functions extracted from service layer
  - `safe_get_float()`: Safely extract float values from pandas Series with null handling
  - `safe_get_str()`: Safely extract string values from pandas Series
  - `safe_get_int()`: Safely extract integer values from pandas Series
  - `safe_convert_float()`: Convert any value to float with error handling
  - `apply_field_mapping()`: Apply field mappings for consistent data extraction
- **New Schema Fields**: Added 9 missing fields discovered from comprehensive API validation with dropna=False
  - Balance Sheet: `budget_sources_and_other_funds`, `goodwill_alt`, `investment_properties`, `convertible_bonds` (42 total fields)
  - Cash Flow: `finance_lease_principal_payments`, `profit_loss_disposal_assets`, `dividends_received`, `interest_income_dividends` (40 total fields)
  - Financial Ratios: `ticker`, `length_report`, `financial_leverage` (37 total fields)
  - **Total: 147 financial data fields** across all schemas

### Changed
- **Refactored Service Layer** (`app/services/service_statements.py`): Improved code organization and maintainability
  - Removed inline helper functions (`_safe_get`, `_safe_get_str`, `_safe_get_int`, `_safe_float`)
  - All processing functions now use centralized field mappings via `apply_field_mapping()`
  - Imports now reference `app.config.field_mappings` and `app.utils.transform`
  - Improved code readability by separating concerns
- **Updated Test Suite**: Fixed imports and function references in test files
  - Updated `test_backend_reusability.py` to import utilities from `app.utils.transform`
  - Updated `test_imports.py` to verify correct module structure after refactoring
  - All 60 non-integration tests passing after refactoring

### Deprecated

### Removed
- Inline helper functions from `app/services/service_statements.py` (moved to `app/utils/transform.py`)

### Fixed
- **Documentation**: Corrected API documentation URLs in README.md and CLAUDE.md
  - Changed from `/docs` and `/redoc` to `/api/docs` and `/api/redoc`
  - Updated all references to API documentation URLs throughout project documentation

### Security

## [1.0.0] - 2025-09-13

### Added
- **Comprehensive Test Suite**: 75 automated tests covering imports, schemas, contracts, and backend reusability
  - Pydantic model validation tests for all 34+ financial ratio fields
  - Frontend-backend contract alignment validation
  - Backend reusability tests for external application integration
  - Import and circular dependency validation
  - Integration tests with mocked vnstock responses
- **Complete Project Documentation**: README.md with installation, usage, and development guides
- **Testing Framework Documentation**: Comprehensive testing guidelines in CLAUDE.md
- **Architecture Decision Record**: ADR-006 documenting vnstock v3+ compatibility improvements
- **Enhanced CLAUDE.md**: Detailed troubleshooting guides and testing commands
- **External Application Integration**: Backend services designed for reuse in other Python applications
- **Plugin-Style Integration**: Support for wrapper classes, microservices, and modular imports

### Changed
- **Version bumped to 1.0.0**: First stable release with comprehensive features
- **Enhanced Test Coverage**: 95% of core functionality validated through automated tests
- **Improved Documentation**: Complete user and developer documentation
- **Better Error Handling**: Enhanced debug logging and troubleshooting capabilities

### Fixed
- Missing financial ratio data on frontend for 11 key financial metrics:
  - Days Sales Outstanding, Days Inventory Outstanding, Days Payable Outstanding
  - Cash Conversion Cycle, Total Borrowings to Equity, Debt-to-Equity Ratio
  - Gross Profit Margin (%), Net Profit Margin (%), Return on Assets (%)
  - Return on Equity (%), Dividend Yield (%)
- vnstock v3+ API compatibility issues with ratio data fetching
- MultiIndex DataFrame handling for financial ratios
- Column name mapping discrepancies between expected and actual vnstock API responses
- Enhanced field extraction with multi-column fallback support (`_safe_get_multi`)
- Test schema imports (Period → PeriodType) for proper enum handling

## [0.1.0] - 2024-09-13

### Added
- Vietnamese stock market financial analysis web application
- FastAPI backend with comprehensive financial data models (103+ fields)
- Static HTML/JavaScript frontend with tabbed interface
- Financial statements display for Income Statement, Balance Sheet, and Cash Flow
- Real-time data integration with Vietnamese stock exchanges via vnstock library
- Session storage for user input persistence across pages
- Comprehensive Pydantic schemas for data validation
- Financial ratios calculation and display
- Auto-generated API documentation with OpenAPI/Swagger
- Health check endpoints for monitoring
- CORS middleware for cross-origin requests
- Static file serving for frontend assets
- Type-safe Python codebase with 100% type hints
- Comprehensive error handling and data validation
- Safe data extraction utilities for financial data processing
- MultiIndex DataFrame handling for complex financial data structures

### Fixed
- Financial ratios metric display formatting
- Missing line items on frontend display
- Figure scaling to display in original scale
- Data processing pipeline for Vietnamese financial statements

[Unreleased]: https://github.com/tamle/richslow/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/tamle/richslow/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/tamle/richslow/releases/tag/v0.1.0