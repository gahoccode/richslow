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
from app.schemas.historical_prices import (
    ExchangeRate,
    GoldSJC,
    GoldBTMC,
    StockOHLCV
)

# Import utility functions
from app.services.service_statements import (
    get_financial_statements,
    _safe_get,
    _process_ratios
)
from app.services.service_historical_prices import (
    process_exchange_rate_data,
    process_gold_sjc_data,
    process_gold_btmc_data,
    process_stock_ohlcv_data
)
from app.utils.data_cleaning import (
    clean_price_string,
    clean_price_int,
    parse_exchange_date,
    parse_btmc_datetime
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

# Process exchange rate data
from vnstock.explorer.misc.exchange_rate import vcb_exchange_rate
df = vcb_exchange_rate(date='2024-05-10')
rates = process_exchange_rate_data(df)
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

### Historical Prices & Market Data
- **Stock OHLCV**: Time series data for Vietnamese stocks (open, high, low, close, volume)
- **Exchange Rates**: VCB exchange rates for 20+ currencies (USD, EUR, GBP, JPY, CNY, etc.)
- **Gold Prices**: SJC and BTMC gold prices with buy/sell rates and karat details
- **Data Processing**: Automatic handling of Vietnamese number formatting (comma separators, dashes for missing values)

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

#### `GET /api/stock-prices/{ticker}`

Get historical stock OHLCV data.

**Parameters:**
- `ticker` (path): Stock ticker symbol
- `start_date` (query): Start date (YYYY-MM-DD)
- `end_date` (query): End date (YYYY-MM-DD)
- `interval` (query, optional): Time interval - 1D (daily), 1W (weekly), 1M (monthly)

**Example:**
```bash
curl "http://localhost:8000/api/stock-prices/FPT?start_date=2024-01-01&end_date=2024-12-31&interval=1D"
```

#### `GET /api/exchange-rates`

Get VCB exchange rates for major currencies.

**Parameters:**
- `date` (query, optional): Date in YYYY-MM-DD format (defaults to today)

**Example:**
```bash
curl "http://localhost:8000/api/exchange-rates?date=2024-05-10"
```

#### `GET /api/gold/sjc`

Get current SJC gold prices.

**Example:**
```bash
curl "http://localhost:8000/api/gold/sjc"
```

#### `GET /api/gold/btmc`

Get current BTMC gold prices with detailed karat and purity information.

**Example:**
```bash
curl "http://localhost:8000/api/gold/btmc"
```

### Response Schemas

All responses follow strict Pydantic schemas ensuring data consistency:

**Financial Statements:**
- **FinancialStatementsResponse**: Main API response container
- **IncomeStatementData**: Income statement line items
- **BalanceSheetData**: Balance sheet components
- **CashFlowData**: Cash flow statement items
- **FinancialRatiosData**: 34+ calculated financial ratios

**Historical Prices:**
- **StockOHLCV**: Stock price data (open, high, low, close, volume)
- **ExchangeRate**: Currency exchange rates
- **GoldSJC**: SJC gold prices
- **GoldBTMC**: BTMC gold prices with karat details

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



## Support

For questions or issues:

1. Check the API documentation at `/api/docs`
2. Review the troubleshooting section in `CLAUDE.md`
3. Run tests to validate your environment: `uv run pytest`
4. Open an issue with detailed error information

## Roadmap

- [ ] React frontend migration
- [ ] Portfolio analysis features
- [ ] Historical data visualization