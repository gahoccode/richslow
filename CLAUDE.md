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
- API documentation at `http://localhost:8000/docs`

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
- MultiIndex DataFrame flattening for ratio data
- Error handling for vnstock API rate limits and data availability

**Backend-First Processing Architecture:**
- **All data processing, transformation, and formatting must be done in backend services**
- **Frontend should only display pre-processed data from API responses** 
- **No calculations, data manipulation, or business logic in frontend JavaScript**
- **Backend returns data in final display-ready format through Pydantic models**
- **Frontend JavaScript handles only DOM manipulation and user interactions**

This architecture supports the current static frontend while being designed for future React migration with minimal backend changes.
- decouple backend code with frontend so that backend can be reused for other apps
- decouple backend logic with frontend so that it can be reused in other app