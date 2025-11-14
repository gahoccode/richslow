# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Code Quality
- `uv run ruff check app/` - Check for linting errors and code quality issues
- `uv run ruff format app/` - Format code automatically  
- `uv run ruff check app/ --fix` - Auto-fix linting issues where possible

### Running the Application
- `uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` - Start development server with hot reload
- Access frontend at `http://localhost:8000`
- API documentation at `http://localhost:8000/api/docs`

### Testing
- `uv run pytest` - Run all tests
- `uv run pytest tests/test_schemas.py` - Run specific test file
- `uv run pytest tests/test_schemas.py::TestFinancialRatiosDataValidation::test_financial_ratios_complete_data` - Run specific test
- `uv run pytest -v` - Run tests with verbose output
- `uv run pytest --cov=app` - Run tests with coverage report
- `uv run pytest --cov=app --cov-report=html` - Generate HTML coverage report
- `uv run pytest -k "test_contract"` - Run tests matching pattern
- `uv run pytest tests/test_integration.py -v` - Run integration tests

### Dependency Management
- `uv sync` - Install/update dependencies from pyproject.toml
- `uv add <package>` - Add new dependency
- `uv add <package> --dev` - Add development dependency

### Changelog Maintenance
- Update `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format
- Add entries to "Unreleased" section during development
- Move to versioned section before releases
- See `.changelog-template.md` for entry examples

## Architecture Overview

### Vietnamese Stock Market Financial Analysis Web Application

This is a full-stack web application for analyzing Vietnamese stock market data using the vnstock library. The architecture follows a clean separation between backend API and frontend UI.

### Backend Architecture (FastAPI)

**Core Structure:**
- `app/main.py` - FastAPI application entry point with CORS, static file serving, and route mounting
- `app/routes/` - API endpoint handlers organized by feature
- `app/schemas/` - Pydantic models defining API contracts (single source of truth)
- `app/services/` - Business logic layer containing data processing functions

**Key Integration Points:**
- **vnstock Library**: Fetches real financial data from Vietnamese stock exchanges (VCI, TCBS sources)
- **Pydantic Validation**: All API requests/responses use comprehensive schemas with 103+ financial statement fields
- **MultiIndex DataFrame Handling**: Uses `flatten_hierarchical_index` from vnstock to process complex financial data structures

**Financial Data Models:**
- `IncomeStatementData` - 28 fields covering revenue, expenses, profits, taxes
- `BalanceSheetData` - 39 fields covering assets, liabilities, equity
- `CashFlowData` - 36 fields covering operating, investing, financing activities
- `FinancialRatiosData` - 34+ fields covering valuation, profitability, liquidity, efficiency metrics
- `StockOHLCV` - Stock historical prices (open, high, low, close, volume)
- `ExchangeRate` - VCB exchange rates for 20+ currencies
- `GoldSJC` - SJC gold prices (buy/sell for various products)
- `GoldBTMC` - BTMC gold prices with karat and purity details
- Manual field mapping from Vietnamese financial statement column names to standardized Pydantic fields

### Frontend Architecture (Static HTML/JS)

**File Structure:**
- `static/index.html` - Landing page with ticker/date input form
- `static/statements.html` - Financial statements display with tabbed interface
- `static/js/common.js` - Shared utilities and session storage management
- `static/js/statements.js` - Financial data rendering and API integration

**State Management:**
- Uses browser `sessionStorage` to persist user inputs (ticker, date range, period)
- Allows users to input once and navigate between analysis pages
- Ready for future migration to React with global state management

### Data Flow

1. **User Input**: Landing page collects ticker symbol, date range, analysis period
2. **API Request**: Frontend calls `/api/statements/{ticker}` endpoint
3. **Data Fetching**: Backend uses vnstock to fetch from Vietnamese stock APIs
4. **Data Processing**: Raw DataFrames processed through manual field mapping functions
5. **Response**: Comprehensive financial statements returned as validated Pydantic models
6. **Display**: Frontend renders tabbed interface showing Income Statement, Balance Sheet, Cash Flow

### Development Conventions

**Code Quality Requirements:**
- All functions must use type hints (enforced by ruff)
- Business logic functions require comprehensive docstrings describing purpose, inputs/outputs, side effects, business rules
- Exception chaining required (`raise ... from e`)
- Modern Python syntax (`list[T]`, `dict[K,V]`, `X | None`)

**API Design:**
- Pydantic schemas in `app/schemas/` are the single source of truth
- No schema logic duplication in other layers
- All endpoints return validated, serialized responses
- OpenAPI/Swagger documentation auto-generated

**Financial Data Handling:**
- Comprehensive field mapping covers all Vietnamese financial statement line items
- Safe data extraction with null handling (`_safe_get`, `_safe_get_str`, `_safe_get_int`)
- Multi-column fallback extraction (`_safe_get_multi`) for API compatibility
- MultiIndex DataFrame flattening for ratio data with vnstock v3+ parameters
- Error handling for vnstock API rate limits and data availability
- Debug logging for field mapping validation and troubleshooting

**Data Cleaning Utilities (`app/utils/data_cleaning.py`):**
- `clean_price_string()` - Convert Vietnamese price format (comma separators, dashes) to float
- `clean_price_int()` - Convert Vietnamese price format to integer
- `parse_exchange_date()` - Parse YYYY-MM-DD date format from vnstock
- `parse_btmc_datetime()` - Parse DD/MM/YYYY HH:MM datetime format from BTMC gold prices
- All utilities handle edge cases (None, dashes, empty strings, whitespace)

**Backend-First Processing Architecture:**
- **All data processing, transformation, and formatting must be done in backend services**
- **Frontend should only display pre-processed data from API responses** 
- **No calculations, data manipulation, or business logic in frontend JavaScript**
- **Backend returns data in final display-ready format through Pydantic models**
- **Frontend JavaScript handles only DOM manipulation and user interactions**

This architecture supports the current static frontend while being designed for future React migration with minimal backend changes.
- decouple backend code with frontend so that backend can be reused for other apps
- decouple backend logic with frontend so that it can be reused in other app

## Troubleshooting and Best Practices

### vnstock API Integration
- Always use `flatten_columns=True` parameter for ratio data to ensure proper DataFrame structure
- Implement multi-column fallback mapping (`_safe_get_multi`) for field extraction resilience
- Add debug logging when integrating new vnstock endpoints to identify column name discrepancies
- Test with multiple Vietnamese stocks across different sectors (tech, banking, utilities, real estate)
- Handle graceful fallbacks for unsupported vnstock parameters

### Data Integration Debugging
- Use raw data endpoints to verify actual API response structure
- Check server logs for debug output when troubleshooting missing fields
- Compare expected vs. actual column names from vnstock responses
- Verify MultiIndex DataFrame handling with `flatten_hierarchical_index`

### Financial Ratio Validation
- Cross-verify ratio calculations with multiple data sources
- Account for industry-specific ratio availability (e.g., banks vs. manufacturing)
- Implement null handling for ratios not applicable to certain business models
- Test edge cases with companies having unusual financial structures

## Testing Framework

### Test Organization
The test suite is organized into comprehensive categories to ensure reliability and maintainability:

- **`tests/test_imports.py`** - Module import validation and circular dependency detection
- **`tests/test_schemas.py`** - Pydantic model validation and schema contract testing
- **`tests/test_contract_alignment.py`** - Frontend-backend field mapping consistency
- **`tests/test_backend_reusability.py`** - Standalone service function testing for external app integration
- **`tests/test_integration.py`** - End-to-end API testing and system integration
- **`tests/test_route_historical_prices.py`** - Historical prices API endpoint testing with mocked vnstock responses
- **`tests/conftest.py`** - Shared test fixtures and sample data

### Test Categories

**Schema Validation Tests:**
- Comprehensive field coverage validation (34+ financial ratio fields)
- Type coercion and validation error handling
- Backward/forward compatibility testing
- JSON serialization/deserialization validation

**Contract Alignment Tests:**
- Frontend JavaScript field extraction and validation
- API response structure validation against frontend expectations
- Cross-language data type compatibility (Python ↔ JavaScript)
- Field naming convention consistency

**Backend Reusability Tests:**
- Standalone service function testing without web framework dependencies
- External application integration patterns (wrapper classes, plugins, microservices)
- Modular import patterns for code reuse
- Service layer isolation from FastAPI context

**Integration Tests:**
- Full API endpoint testing with mocked vnstock responses
- Error handling and resilience under various failure conditions
- CORS configuration and static file serving
- Performance and memory usage validation

**Historical Prices API Tests:**
- Stock OHLCV endpoint with date range validation
- Exchange rates endpoint with default/custom dates
- Gold prices endpoints (SJC and BTMC)
- Missing data and API error handling
- OpenAPI schema validation for all endpoints

### Best Practices for Testing

**Writing New Tests:**
- Use comprehensive test fixtures from `conftest.py` for consistent sample data
- Test both success and failure scenarios
- Include edge cases and boundary conditions
- Validate external API integration with mocked responses

**Maintaining Tests:**
- Update test fixtures when adding new financial data fields
- Ensure contract alignment tests reflect current frontend field requirements
- **IMPORTANT**: Always update `app/schemas/` after making schema-related changes and run tests to verify compatibility
- Run full test suite before committing changes
- Use coverage reports to identify untested code paths

**External Application Testing:**
- Test that backend services can be imported without FastAPI dependencies
- Verify schemas can be used independently for data validation
- Ensure utility functions work with any pandas DataFrame structure
- Validate plugin-style integration patterns
- Document as you build - not after
- Test documentation accuracy