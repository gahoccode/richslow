# API Endpoints

## Financial Statements API

- `POST /api/statements` & `GET /api/statements/{ticker}` - Comprehensive financial statements
- Returns: Income statement (28 fields), Balance sheet (39 fields), Cash flow (36 fields), Financial ratios (34+ fields)

## Company Information API

- `GET /api/company/{ticker}/overview` - Company metadata, industry, shareholder stats
- `GET /api/company/{ticker}/profile` - Business description, history, strategies
- `GET /api/company/{ticker}/shareholders` - Major shareholders and ownership %
- `GET /api/company/{ticker}/officers` - Management team and positions
- `GET /api/company/{ticker}/subsidiaries` - Subsidiary companies list
- `GET /api/company/{ticker}/dividends` - Historical dividend payments
- `GET /api/company/{ticker}/insider-deals` - Insider trading activities
- `GET /api/company/{ticker}/events` - Corporate events timeline
- `GET /api/company/{ticker}/news` - Recent news and announcements
- `GET /api/company/{ticker}/ratio` - Financial ratios (VCI source)
- `GET /api/company/{ticker}/reports` - Financial reports with download links
- `GET /api/company/{ticker}/trading-stats` - Trading volumes, foreign ownership limits

## Historical Prices API

- `GET /api/stock-prices/{ticker}` - OHLCV data with date ranges
- `GET /api/exchange-rates` - VCB rates for 20+ currencies
- `GET /api/gold/sjc` - SJC gold prices (bars, coins, jewelry)
- `GET /api/gold/btmc` - BTMC gold prices with karat/purity details

## Industry Benchmark API

- `GET /api/industry/benchmark/{industry_id}` & `GET /api/industry/benchmark` - Industry financial ratios
- `GET /api/industry/classifications` - ICB industry classification mapping
- `GET /api/industry/benchmark/company/{ticker}` - Auto-detect company industry

## Quarterly Data API

- `GET /api/quarterly/ratios/{ticker}` - Quarterly financial ratios
