# Company Information API Documentation

Comprehensive API endpoints for Vietnamese stock market company information, combining data from TCBS and VCI sources.

## Base URL
```
/api/company/{ticker}
```

## Parameters
- `ticker` (path): Stock ticker symbol (e.g., `VCB`, `FPT`, `HPG`, `REE`)

---

## TCBS Data Source Endpoints

### 1. Company Overview
**Data Source**: TCBS
**Endpoint**: `GET /api/company/{ticker}/overview`

Get basic company information including exchange, industry, employee count, and trading statistics.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/VCB/overview" | jq
```

**Response Fields**:
- `exchange`: Stock exchange (HOSE, HNX, UPCOM)
- `industry`: Industry sector
- `company_type`: Company classification
- `no_shareholders`: Number of shareholders
- `foreign_percent`: Foreign ownership percentage
- `outstanding_share`: Number of outstanding shares
- `issue_share`: Number of issued shares
- `established_year`: Company founding year
- `no_employees`: Number of employees
- `stock_rating`: Stock rating (if available)
- `short_name`: Company short name
- `website`: Company website

### 2. Company Profile
**Data Source**: TCBS
**Endpoint**: `GET /api/company/{ticker}/profile`

Get detailed company profile including business description, history, and strategies.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/FPT/profile" | jq
```

**Response Fields**:
- `company_name`: Full company name
- `company_profile`: Business description
- `history_dev`: Company development history
- `company_promise`: Company commitments and vision
- `business_risk`: Business risk factors
- `key_developments`: Recent key developments
- `business_strategies`: Business strategies

### 3. Company Shareholders
**Data Source**: TCBS
**Endpoint**: `GET /api/company/{ticker}/shareholders`

Get major shareholders and their ownership percentages.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/HPG/shareholders" | jq
```

**Response Fields** (array):
- `share_holder`: Shareholder name
- `share_own_percent`: Ownership percentage

### 4. Company Officers
**Data Source**: TCBS
**Endpoint**: `GET /api/company/{ticker}/officers`

Get management team and board members information.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/ACB/officers" | jq
```

**Response Fields** (array):
- `officer_name`: Officer name
- `officer_position`: Position/title
- `officer_own_percent`: Ownership percentage

### 5. Company Subsidiaries
**Data Source**: TCBS
**Endpoint**: `GET /api/company/{ticker}/subsidiaries`

Get subsidiary companies and ownership structure.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/MWG/subsidiaries" | jq
```

**Response Fields** (array):
- `sub_company_name`: Subsidiary company name
- `sub_own_percent`: Ownership percentage

### 6. Company Dividends
**Data Source**: TCBS
**Endpoint**: `GET /api/company/{ticker}/dividends`

Get historical dividend payments and corporate actions.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/VCB/dividends" | jq
```

**Response Fields** (array):
- `exercise_date`: Dividend payment date
- `cash_year`: Year of cash dividend
- `cash_dividend_percentage`: Cash dividend percentage
- `issue_method`: Dividend issuance method

### 7. Company Insider Deals
**Data Source**: TCBS
**Endpoint**: `GET /api/company/{ticker}/insider-deals`

Get insider trading activities and transactions.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/FPT/insider-deals" | jq
```

**Response Fields** (array):
- `deal_announce_date`: Deal announcement date
- `deal_method`: Trading method
- `deal_action`: Buy/Sell action
- `deal_quantity`: Number of shares
- `deal_price`: Deal price
- `deal_ratio`: Deal ratio

### 8. Company Events
**Data Source**: TCBS
**Endpoint**: `GET /api/company/{ticker}/events`

Get corporate events and shareholder meetings.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/REE/events" | jq
```

**Response Fields** (array):
- `event_name`: Event name
- `event_code`: Event code
- `notify_date`: Notification date
- `exer_date`: Exercise date
- `reg_final_date`: Registration final date
- `event_desc`: Event description
- `price`: Related price information

### 9. Company News
**Data Source**: TCBS
**Endpoint**: `GET /api/company/{ticker}/news`

Get company news and announcements.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/FPT/news" | jq
```

**Response Fields** (array):
- `title`: News title
- `source`: News source
- `publish_date`: Publication date
- `id`: News ID
- `price`: Related stock price

---

## VCI Data Source Endpoints

### 10. Company Financial Ratios
**Data Source**: VCI
**Endpoint**: `GET /api/company/{ticker}/ratio`

Get comprehensive financial ratios and performance metrics across multiple periods.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/VCB/ratio" | jq
```

**Response Fields** (array, one entry per period):
- `symbol`: Stock ticker
- `year_report`: Reporting year
- `revenue`: Revenue amount
- `revenue_growth`: Revenue growth rate
- `net_profit`: Net profit amount
- `net_profit_growth`: Net profit growth rate
- `roe`: Return on equity
- `roa`: Return on assets
- `pe`: Price-to-earnings ratio
- `pb`: Price-to-book ratio
- `eps`: Earnings per share
- `current_ratio`: Current ratio
- `quick_ratio`: Quick ratio
- `debt_to_equity`: Debt-to-equity ratio
- `gross_margin`: Gross profit margin
- `net_profit_margin`: Net profit margin
- And 30+ additional financial metrics

### 11. Company Financial Reports
**Data Source**: VCI
**Endpoint**: `GET /api/company/{ticker}/reports`

Get financial reports with download links.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/HPG/reports" | jq
```

**Response Fields** (array):
- `date`: Report date
- `description`: Report description
- `link`: Download link
- `name`: Report file name

### 12. Company Trading Statistics
**Data Source**: VCI
**Endpoint**: `GET /api/company/{ticker}/trading-stats`

Get trading statistics and foreign ownership limits.

**Curl Example**:
```bash
curl -X GET "http://localhost:8000/api/company/FPT/trading-stats" | jq
```

**Response Fields**:
- `symbol`: Stock ticker
- `exchange`: Stock exchange
- `ev`: Enterprise value
- `ceiling`: Ceiling price
- `floor`: Floor price
- `foreign_room`: Foreign ownership room
- `avg_match_volume_2w`: 2-week average trading volume
- `foreign_holding_room`: Foreign holding room
- `current_holding_ratio`: Current foreign holding ratio
- `max_holding_ratio`: Maximum allowed foreign holding ratio

---

## Error Handling

### Common Error Responses

**404 Not Found**:
```json
{
  "detail": "No overview data found for ticker INVALID"
}
```

**500 Server Error**:
```json
{
  "detail": "Internal server error: Failed to retrieve company overview for INVALID: API connection failed"
}
```

**422 Validation Error**:
```json
{
  "detail": [
    {
      "loc": ["path", "ticker"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Usage Tips

1. **Valid Tickers**: Use Vietnamese stock ticker symbols (e.g., `VCB`, `FPT`, `HPG`, `REE`, `ACB`, `MWG`)
2. **Data Sources**: Different endpoints may return different data due to source differences (TCBS vs VCI)
3. **Empty Results**: Some endpoints may return empty arrays if no data is available
4. **Rate Limiting**: Be considerate with API usage to avoid overwhelming data sources

## Data Freshness

- **TCBS Data**: Real-time and regularly updated
- **VCI Data**: Financial ratios and reports may have slight delays
- **Historical Data**: All historical data is preserved and accessible

## Integration Examples

### Get Complete Company Profile
```bash
# Get basic info
curl "http://localhost:8000/api/company/VCB/overview"

# Get detailed profile
curl "http://localhost:8000/api/company/VCB/profile"

# Get financial analysis
curl "http://localhost:8000/api/company/VCB/ratio"
```

### Analyze Ownership Structure
```bash
# Get major shareholders
curl "http://localhost:8000/api/company/VCB/shareholders"

# Get management team
curl "http://localhost:8000/api/company/VCB/officers"

# Get subsidiaries
curl "http://localhost:8000/api/company/VCB/subsidiaries"
```

### Monitor Corporate Actions
```bash
# Get dividend history
curl "http://localhost:8000/api/company/VCB/dividends"

# Get upcoming events
curl "http://localhost:8000/api/company/VCB/events"

# Get recent news
curl "http://localhost:8000/api/company/VCB/news"
```