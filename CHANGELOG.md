# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-09-14

### Added
- **Stock Valuation Module**: Complete stock valuation functionality with multiple valuation methods
  - **Discounted Cash Flow (DCF)**: Intrinsic value calculation based on projected cash flows
  - **Weighted Average Cost of Capital (WACC)**: Cost of capital calculation using market data
  - **Multiples Analysis**: P/E, P/B, EV/EBITDA multiples-based valuation
  - **Sensitivity Analysis**: Valuation ranges under different assumption scenarios
- **Integrated Navigation**: Seamless navigation between statements and valuation analysis pages
- **Automatic Data Downloading**: Valuation page automatically downloads required statements data when missing
- **Comprehensive Architecture Documentation**: 40KB architecture overview document with C4 model diagrams
- **Valuation Architecture Decision Record**: ADR-007 documenting valuation module architecture decisions
- **Enhanced API Endpoints**: `/api/valuation/{ticker}` endpoint for comprehensive stock valuation
- **Valuation Schemas**: Complete Pydantic models for valuation data validation and API contracts
- **Market Data Integration**: Enhanced vnstock integration with proper MultiIndex DataFrame handling

### Changed
- **Backend Architecture**: Extended backend-first processing to include valuation calculations
- **Frontend Navigation**: Updated navigation bars to include valuation page links
- **User Experience**: Automatic data persistence and cross-page data sharing
- **Application Description**: Updated to reflect valuation capabilities
- **Development Documentation**: Enhanced CLAUDE.md with valuation-specific best practices
- **Project Documentation**: Updated README.md with comprehensive valuation feature descriptions

### Fixed
- Navigation issues in RichSlow application where valuation page would load infinitely when accessed from homepage navbar
- WACC calculation failing for VNM stock due to missing market capitalization data from vnstock API
- MultiIndex DataFrame handling in valuation service to properly extract market capitalization from ratio data
- Field name mapping discrepancies between expected and actual vnstock API column names
- API response validation errors in WACC and valuation endpoints due to non-numeric values in assumptions dictionary
- Cross-page data persistence for seamless statements-to-valuation workflow

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

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

[Unreleased]: https://github.com/tamle/richslow/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/tamle/richslow/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/tamle/richslow/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/tamle/richslow/releases/tag/v0.1.0