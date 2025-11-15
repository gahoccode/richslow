# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Industry Benchmark Overlays**: Competitive analysis with industry median comparisons across all key financial charts
  - **Valuation Radar Benchmark**: Industry median overlay on P/E, P/B, P/S, EV/EBITDA ratios with red dashed lines
  - **Profitability Gauge Benchmarks**: ROE, ROA, ROIC gauges show industry median percentages in tooltips
  - **Efficiency Chart Benchmarks**: Asset turnover, inventory turnover, and cash conversion cycle industry comparisons
  - **New Industry Benchmark API**: 3 endpoints for comprehensive industry analysis
    - `GET /api/industry/benchmark/{industry_id}` - Benchmark by ICB industry code
    - `GET /api/industry/benchmark?industry_name={name}` - Benchmark by industry name
    - `GET /api/industry/benchmark/company/{ticker}` - Auto-detect company industry and benchmark
    - `GET /api/industry/classifications` - Get industry ID to name mapping
  - **Statistical Analysis**: Industry calculations include mean, median, 25th/75th percentiles, standard deviation
  - **Visual Distinction**: Company data in solid lines, industry benchmarks in dashed lines with transparency
  - **Performance Context**: Users can instantly see if company metrics outperform/underperform industry averages
  - **vnstock Integration**: Uses vnstock's `symbols_by_industries()` and `industries_icb()` for industry classification

- **Dividend Timeline Chart**: Interactive stock price visualization with dividend event markers
  - **Real dividend data integration**: Uses `/api/company/{ticker}/dividends` endpoint for accurate dividend history
  - **Green triangle markers**: Visual indicators on stock price timeline showing dividend payment dates
  - **Interactive tooltips**: Display dividend percentage, payment date, cash year, and payment type
  - **Mixed chart types**: Line chart for stock prices + scatter plot for dividend events
  - **Proper data matching**: 7-day window algorithm to match dividend dates with nearest stock price data

- **Ownership Structure Sunburst Visualization**: Interactive D3.js hierarchical ownership chart
  - **Subsidiaries API integration**: Uses `/api/company/{ticker}/subsidiaries` endpoint for ownership data
  - **Color-coded segments**: Each subsidiary displayed with unique color for easy identification
  - **Interactive tooltips**: Hover to see subsidiary name, ownership percentage, and parent company
  - **Responsive design**: Adapts to container size with proper scaling
  - **Center company label**: Displays parent company ticker in sunburst center
  - **Proper percentage scaling**: Ownership values converted from 0-1 range to accurate visual representation

### Fixed
- **Industry Benchmark 500 Error**: Resolved critical API compatibility issues with vnstock v3.2.6
  - **vnstock API Update**: Fixed `Vnstock().listing` to `Listing()` for correct vnstock v3.2.6 usage
  - **Function Name Error**: Corrected `_safe_get_float` to `safe_get_float` (removed underscore)
  - **Vietnamese Column Mapping**: Added comprehensive mapping from Vietnamese ratio names to English field names
  - **Data Structure Handling**: Updated to use `icb_name3`, `icb_name2`, `icb_name4` columns instead of non-existent `industry` column
  - **Hierarchical Column Flattening**: Properly implemented `flatten_hierarchical_index()` for MultiIndex DataFrames
  - **Field Mapping Integration**: Created Vietnamese-to-English mapping for 17 key financial ratios
  - **Endpoint Compatibility**: All industry benchmark endpoints now return 200 status with proper data

- **Chart.js Date Adapter Error**: Resolved "This method is not implemented" error by adding Chart.js date adapter
- **Invalid Point Style Configuration**: Fixed Chart.js `pointStyle: 'star'` (not supported) to valid `'triangle'` markers
- **D3 Sunburst Scaling Issue**: Corrected ownership percentage scaling from 0-1 range to proper 0-100 representation
- **Data Structure Alignment**: Improved dividend event data mapping for accurate scatter plot coordinates

### Enhanced
- **Dashboard Visual Intelligence**: Added comprehensive company intelligence features for investment analysis
- **Data-Driven Decision Making**: Users can now visualize dividend history and corporate structure alongside financial metrics
- **Professional Chart Implementation**: Industry-standard visualizations with proper error handling and fallback states

## [1.4.0] - 2025-11-14

### Added
- **Company Information API**: 12 new comprehensive endpoints for Vietnamese stock market company analysis
  - **TCBS Data Source (9 endpoints)**: Complete company information from TCBS
    - `GET /api/company/{ticker}/overview` - Company basic information (exchange, industry, employees, trading stats)
    - `GET /api/company/{ticker}/profile` - Company profile and history (business description, strategies)
    - `GET /api/company/{ticker}/shareholders` - Major shareholders with ownership percentages
    - `GET /api/company/{ticker}/officers` - Management team and board members
    - `GET /api/company/{ticker}/subsidiaries` - Subsidiary companies and ownership structure
    - `GET /api/company/{ticker}/dividends` - Historical dividend payments and corporate actions
    - `GET /api/company/{ticker}/insider-deals` - Insider trading activities and transactions
    - `GET /api/company/{ticker}/events` - Corporate events (shareholder meetings, dividends)
    - `GET /api/company/{ticker}/news` - Company news and announcements from TCBS
  - **VCI Data Source (3 endpoints)**: Financial ratios and trading statistics from VCI
    - `GET /api/company/{ticker}/ratio` - Comprehensive financial ratios (45+ fields across multiple periods)
    - `GET /api/company/{ticker}/reports` - Financial reports with download links
    - `GET /api/company/{ticker}/trading-stats` - Trading statistics and foreign ownership limits

### New Architecture Components
- **Service Layer**: `app/services/service_company.py` - Business logic for company data processing
- **API Routes**: `app/routes/route_company.py` - REST API endpoints with comprehensive error handling
- **Data Validation**: Full Pydantic model validation using existing `schema_company.py` models
- **Error Handling**: HTTP 404/422/500 responses with proper error messages for invalid tickers
- **Type Safety**: Complete type hints and null-safe data extraction

### Testing & Quality
- **Comprehensive Test Suite**: 30+ new unit and integration tests for company endpoints
  - Service layer unit tests with mocked vnstock responses
  - API endpoint integration tests with error scenarios
  - Data validation and serialization testing
  - Edge case handling for missing/invalid data
- **Code Quality**: Following existing project patterns and linting standards
- **Documentation**: Full OpenAPI documentation with field descriptions and examples

### Enhanced API Capabilities
- **Multi-Source Integration**: Combined TCBS and VCI data sources for comprehensive coverage
- **Vietnamese Data Handling**: Proper processing of Vietnamese company names and financial formats
- **Performance**: Optimized data transformation with pandas DataFrame processing
- **Consistency**: Following existing route/service/schema architecture patterns
- **Extensibility**: Modular design allows easy addition of new company data endpoints

### Integration Notes
- All endpoints use ticker parameter following Vietnamese stock exchange conventions (e.g., 'VCB', 'FPT', 'HPG')
- Comprehensive error handling for invalid tickers and vnstock API failures
- Full backward compatibility maintained with existing API structure
- Ready for frontend integration and third-party application usage

### Fixed
- **Company Test Infrastructure Critical Issues**: Resolved 3 failing route tests that were blocking proper validation of company API endpoints
- **Mock Class Alignment**: Updated 16+ test mock patches from generic `Company` class to specific vnstock classes:
  - `TCBSCompany` for all TCBS data source endpoints (overview, profile, shareholders, officers, etc.)
  - `VCICompany` for all VCI data source endpoints (ratio, reports, trading-stats)
- **API Documentation Endpoint Corrections**: Fixed test paths to match FastAPI configuration:
  - `test_api_docs_includes_company_endpoints`: `/docs` → `/api/docs`
  - Updated assertions to validate Swagger UI elements instead of dynamic content
- **VCI Method Name Correction**: Fixed mock method from `financial_ratio` → `ratio_summary` to match actual vnstock library API
- **Error Handling Test Fix**: Updated server error test to properly mock `TCBSCompany.overview()` method for 500 status code validation
- **Test Suite Reliability**: Company route tests now 26/26 passing (was 23/26 with 3 failures), service tests 21/21 passing
- **Company Schema Critical Issues**: Fixed blocking syntax error in `CompanyOfficer.officer_position` field that prevented schema import
- **Data Type Corrections**: Corrected field types to match vnstock API documentation:
  - `CompanyOverviewTCBS.established_year`: Changed from int to str (matches vnstock object type)
  - `DividendHistory.exercise_date`: Changed from datetime to str (matches DD/MM/YY format)
- **Import Error Fix**: Corrected `Optional` import from `typing` instead of `pydantic` for proper module loading
- **Extra Field Removal**: Removed undocumented `type` field from `CompanyOfficer` model
- **Typo Correction**: Fixed "Onwership" typo in field description

### Added
- **Comprehensive Company Schema Tests**: Added 14 new unit tests covering all company data models:
  - DividendHistory validation with sample data from documentation
  - CompanyOverviewTCBS with correct string established_year type
  - CompanyProfile with optional field handling
  - CompanyShareholders, CompanySubsidiaries, CompanyInsiderDeals validation
  - CompanyEventsTCBS, CompanyNews model validation
  - CompanyOfficer with optional position field handling
  - JSON serialization testing for all models
  - Invalid data validation error testing
- **Sample Data Integration**: All tests use real sample data from vnstock company API documentation
- **Type Safety Validation**: Comprehensive validation of field types and optional/null handling

### Changed
- **Test Coverage**: Increased from 102 to 116 total tests (14 new company schema tests)
- **Schema Reliability**: Enhanced validation ensures robust data handling for Vietnamese company information
- **Documentation Alignment**: Schema models now perfectly match vnstock API field specifications

## [1.3.0] - 2025-11-14

### Added
- **Historical Stock Prices API** (`GET /api/stock-prices/{ticker}`): Fetch OHLCV time series data for Vietnamese stocks
  - Query parameters: `start_date`, `end_date`, `interval` (1D/1W/1M)
  - Returns validated list of StockOHLCV models with open, high, low, close, volume data
  - Full error handling for invalid tickers and date ranges
- **Exchange Rates API** (`GET /api/exchange-rates`): VCB exchange rates for 20+ major currencies
  - Optional `date` query parameter (YYYY-MM-DD format, defaults to today)
  - Returns validated list of ExchangeRate models (USD, EUR, GBP, JPY, CNY, etc.)
  - Graceful handling of missing values (dashes converted to None)
- **Gold Prices APIs**: Two endpoints for Vietnamese gold market data
  - `GET /api/gold/sjc`: SJC gold prices with buy/sell rates for various products (bars, coins, jewelry)
  - `GET /api/gold/btmc`: BTMC gold prices with detailed karat and purity information
- **Data Cleaning Utilities Module** (`app/utils/data_cleaning.py`): Reusable Vietnamese data formatting functions
  - `clean_price_string()`: Convert comma-separated price strings to float, handle dashes (→ None)
  - `clean_price_int()`: Convert comma-separated price strings to int
  - `parse_exchange_date()`: Parse YYYY-MM-DD date format from vnstock
  - `parse_btmc_datetime()`: Parse DD/MM/YYYY HH:MM datetime format
  - All functions handle edge cases (None, empty strings, whitespace)
- **Service Layer Processing Functions** (`app/services/service_historical_prices.py`): Data transformation pipeline
  - `process_exchange_rate_data()`: Transform vnstock DataFrame to ExchangeRate models
  - `process_gold_sjc_data()`: Transform vnstock DataFrame to GoldSJC models
  - `process_gold_btmc_data()`: Transform vnstock DataFrame to GoldBTMC models
  - `process_stock_ohlcv_data()`: Transform vnstock DataFrame to StockOHLCV models
- **Response Wrapper Models** (`app/schemas/historical_prices.py`): Enhanced API documentation
  - `StockPricesResponse`: Wrapper for stock price history with metadata
  - `ExchangeRatesResponse`: Wrapper for exchange rates with count
  - `GoldPricesResponse`: Wrapper for gold prices with source and timestamp
- **Comprehensive Integration Tests** (`tests/test_route_historical_prices.py`): 27 new tests (all passing)
  - Stock prices endpoint testing with mocked vnstock responses
  - Exchange rates testing with default/custom dates and missing values
  - Gold prices testing (SJC and BTMC providers)
  - Error handling tests (404, 500, 422 validation errors)
  - OpenAPI schema validation for all new endpoints
- **API Documentation Updates**:
  - README.md: Added 4 new endpoint examples with curl commands
  - CLAUDE.md: Added historical prices API testing guidelines
  - All endpoints include comprehensive docstrings with parameter descriptions

### Fixed
- **ExchangeRate Schema Validation**: Corrected field aliases to match vnstock API structure
  - Fixed `buy_cash` alias from `"buy_cash"` to `"buy _cash"` (space before underscore)
  - Fixed `buy_transfer` alias from `"buy_transfer"` to `"buy _transfer"` (space before underscore)
- **ExchangeRate Optional Fields**: Changed `buy_cash` and `buy_transfer` from required to optional
  - Updated type from `float` to `float | None` with default `None`
  - Prevents validation errors when vnstock API returns dashes for missing values
  - Gracefully handles currencies without cash buying rates (e.g., DKK, INR, KWD)

### Changed
- **Test Suite Expansion**: Increased from 75 to 102 total tests
  - 27 new integration tests for historical prices endpoints
  - 13 new schema validation tests for historical price models
  - All historical price tests pass in isolation
- **Documentation Updates**:
  - Updated README.md with Historical Prices & Market Data section
  - Updated CLAUDE.md with historical price schemas and utilities
  - Added backend reusability examples for new utility functions

## [1.2.0] - 2025-11-14

### Added
- **Render Deployment Configuration** (`render.yaml`): Production deployment configuration for Render.com
  - Singapore region deployment on free plan
  - Python 3.10.11 runtime environment
  - UV package manager integration with `uv sync` build command
  - Health check endpoint configuration at `/health`
  - Smart build filtering to optimize deployments (triggers only on app/, static/, pyproject.toml, uv.lock changes)
  - Ignores test files, docs, cache directories, and markdown files for efficiency
  - Environment variables for Python version control
- **One-Click Deployment**: Deploy to Render button in README for easy production deployments
- **Live Demo**: Production deployment at https://richslow.onrender.com with public access
- **Streamlit Prototype** (`tests/streamlit/streamlit.py`): Experimental Streamlit-based UI (302 lines)
  - Alternative frontend implementation for testing and evaluation
  - Located in tests directory as experimental feature
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
- **Python Version Pinning**: Pinned to exact version 3.10.11 in `.python-version` for environment consistency across development and production
- **Refactored Service Layer** (`app/services/service_statements.py`): Improved code organization and maintainability
  - Removed inline helper functions (`_safe_get`, `_safe_get_str`, `_safe_get_int`, `_safe_float`)
  - All processing functions now use centralized field mappings via `apply_field_mapping()`
  - Imports now reference `app.config.field_mappings` and `app.utils.transform`
  - Improved code readability by separating concerns
- **Updated Test Suite**: Fixed imports and function references in test files
  - Updated `test_backend_reusability.py` to import utilities from `app.utils.transform`
  - Updated `test_imports.py` to verify correct module structure after refactoring
  - All 60 non-integration tests passing after refactoring

### Fixed
- **Documentation**: Corrected API documentation URLs throughout project
  - Changed from `/docs` and `/redoc` to `/api/docs` and `/api/redoc`
  - Updated README.md, CLAUDE.md, and all API references
- **Environment Consistency**: Exact Python version pinning prevents runtime discrepancies between development and production

### Removed
- Inline helper functions from `app/services/service_statements.py` (migrated to `app/utils/transform.py`)

### Infrastructure
- Added `.claude/` to `.gitignore` to exclude AI assistant cache from version control
- Configured production deployment on Render.com with optimized build settings
- Build filter configured to skip unnecessary rebuilds on documentation and test changes

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

[Unreleased]: https://github.com/gahoccode/richslow/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/gahoccode/richslow/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/gahoccode/richslow/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/gahoccode/richslow/compare/v1.0.0...v1.2.0
[1.0.0]: https://github.com/gahoccode/richslow/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/gahoccode/richslow/releases/tag/v0.1.0