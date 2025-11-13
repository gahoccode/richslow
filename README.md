# RichSlow

A comprehensive Vietnamese stock market financial analysis web application built with FastAPI and vanilla JavaScript. Analyze financial statements, ratios, and metrics for Vietnamese public companies using real-time data from vnstock.

**[Live Demo](https://richslow.onrender.com)** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/gahoccode/richslow)

## Features

- **Real-time Financial Data**: Fetches live data from Vietnamese stock exchanges (VCI, TCBS)
- **Comprehensive Analysis**: Income statements, balance sheets, cash flow statements, and financial ratios
- **34+ Financial Ratios**: Including P/E, ROE, debt ratios, liquidity ratios, and efficiency metrics
- **Multi-period Analysis**: Support for yearly and quarterly data analysis
- **Clean API Design**: RESTful API with comprehensive OpenAPI documentation
- **Reusable Backend**: Modular design allows backend services to be used in other applications

## Quick Start

### Prerequisites

- Python 3.11+
- [uv](https://github.com/astral-sh/uv) package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd richslow
```

2. Install dependencies:
```bash
uv sync
```

3. Start the development server:
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

4. Access the application:
- **Frontend**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs
- **Alternative API Docs**: http://localhost:8000/api/redoc

## Usage

### Web Interface

1. Navigate to http://localhost:8000
2. Enter a Vietnamese stock ticker (e.g., `FPT`, `VCB`, `HPG`)
3. Select date range and analysis period
4. Click "Analyze" to view comprehensive financial data

### API Usage

Get financial statements for a company:

```bash
curl -X POST "http://localhost:8000/api/statements/FPT" \
     -H "Content-Type: application/json" \
     -d '{
       "ticker": "FPT",
       "start_date": "2023-01-01",
       "end_date": "2023-12-31",
       "period": "year"
     }'
```

### Using Backend Services in Other Applications

The backend is designed for reusability. You can import and use services in other Python applications:

```python
# Import schemas for data validation
from app.schemas.schema_statements import (
    FinancialRatiosData,
    FinancialStatementsResponse,
    StatementsRequest
)

# Import utility functions
from app.services.service_statements import (
    get_financial_statements,
    _safe_get,
    _process_ratios
)

# Use in your application
import pandas as pd

# Process custom financial data
custom_data = pd.DataFrame({
    "yearReport": [2023],
    "P/E": [15.5],
    "ROE (%)": [0.225]
})

ratios = _process_ratios(custom_data)
```

## Development

### Code Quality

```bash
# Check code quality
uv run ruff check app/

# Format code
uv run ruff format app/

# Auto-fix issues
uv run ruff check app/ --fix
```

### Testing

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app

# Run specific test categories
uv run pytest tests/test_schemas.py -v
uv run pytest tests/test_integration.py -v
uv run pytest -k "test_contract"
```

### Adding Dependencies

```bash
# Add runtime dependency
uv add <package>

# Add development dependency
uv add <package> --dev
```

## Architecture

### Backend (FastAPI)

- **`app/main.py`** - Application entry point with CORS and route mounting
- **`app/routes/`** - API endpoint handlers organized by feature
- **`app/schemas/`** - Pydantic models defining API contracts (single source of truth)
- **`app/services/`** - Business logic layer with data processing functions

### Frontend (Static HTML/JS)

- **`static/index.html`** - Landing page with ticker input form
- **`static/statements.html`** - Financial statements display interface
- **`static/js/common.js`** - Shared utilities and session storage
- **`static/js/statements.js`** - Data rendering and API integration

### Key Integration Points

- **vnstock Library**: Real financial data from Vietnamese exchanges
- **Pydantic Validation**: 103+ validated financial statement fields
- **MultiIndex DataFrames**: Proper handling of complex financial data structures
- **Manual Field Mapping**: Vietnamese to standardized English field names

## Financial Data Coverage

### Income Statement (28 fields)
- Revenue, operating costs, gross profit
- Operating expenses, EBITDA, EBIT
- Interest expenses, taxes, net profit
- Earnings per share, dividends

### Balance Sheet (39 fields)
- Current and non-current assets
- Inventory, receivables, cash
- Liabilities and equity structure
- Working capital components

### Cash Flow Statement (36 fields)
- Operating cash flow activities
- Investing cash flows
- Financing cash flows
- Net cash position changes

### Financial Ratios (34+ fields)
- **Valuation**: P/E, P/B, EV/EBITDA, dividend yield
- **Profitability**: ROE, ROA, profit margins, ROIC
- **Liquidity**: Current ratio, quick ratio, cash ratio
- **Efficiency**: Asset turnover, inventory turnover, collection cycles
- **Leverage**: Debt-to-equity, interest coverage, financial structure

## API Reference

### Endpoints

#### `POST /api/statements/{ticker}`

Get comprehensive financial statements for a Vietnamese stock.

**Parameters:**
- `ticker` (path): Stock ticker symbol (e.g., "FPT", "VCB")

**Request Body:**
```json
{
  "ticker": "FPT",
  "start_date": "2023-01-01",
  "end_date": "2023-12-31",
  "period": "year"
}
```

**Response:**
```json
{
  "ticker": "FPT",
  "period": "year",
  "income_statements": [...],
  "balance_sheets": [...],
  "cash_flows": [...],
  "ratios": [...],
  "years": [2023, 2022, 2021]
}
```

### Response Schema

All responses follow strict Pydantic schemas ensuring data consistency:

- **FinancialStatementsResponse**: Main API response container
- **IncomeStatementData**: Income statement line items
- **BalanceSheetData**: Balance sheet components  
- **CashFlowData**: Cash flow statement items
- **FinancialRatiosData**: 34+ calculated financial ratios

## Testing

The project includes a comprehensive test suite covering:

- **Import Validation**: Module dependencies and circular import detection
- **Schema Testing**: Pydantic model validation and type safety
- **Contract Alignment**: Frontend-backend field mapping consistency
- **Reusability Testing**: Standalone service usage for external applications
- **Integration Testing**: End-to-end API testing with mocked data sources

Run tests with:
```bash
uv run pytest -v --cov=app
```

## Data Sources

- **vnstock**: Vietnamese stock market data provider
- **VCI**: Primary data source for financial statements
- **TCBS**: Alternative data source for validation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and add tests
4. Run the test suite: `uv run pytest`
5. Check code quality: `uv run ruff check app/`
6. Commit changes: `git commit -m "Description"`
7. Push to branch: `git push origin feature-name`
8. Create a Pull Request

### Development Guidelines

- All functions must include type hints
- Business logic functions require comprehensive docstrings
- Use exception chaining for error handling
- Follow the existing field mapping patterns for new financial data
- Update tests when adding new features or fields
- Ensure backend services remain reusable for external applications

## License

[Add your license here]

## Support

For questions or issues:

1. Check the API documentation at `/api/docs`
2. Review the troubleshooting section in `CLAUDE.md`
3. Run tests to validate your environment: `uv run pytest`
4. Open an issue with detailed error information

## Roadmap

- [ ] React frontend migration
- [ ] Real-time data streaming
- [ ] Portfolio analysis features
- [ ] Technical analysis indicators
- [ ] Industry comparison tools
- [ ] Export functionality (PDF, Excel)
- [ ] Historical data visualization
- [ ] Alert and notification system