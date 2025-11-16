# RichSlow Dashboard - User Guide

## Getting Started

### 1. Access the Application
Open your browser and navigate to:
```
http://localhost:8000
```

### 2. Start Analysis
On the landing page:
1. Enter a Vietnamese stock ticker (e.g., **FPT**, **VCB**, **VHM**, **HPG**)
2. Select start and end dates (defaults to last 5 years)
3. Choose report period: **Yearly** or **Quarterly**
4. Click **"Analyze Financial Statements"**

### 3. Explore the Dashboard

## Dashboard Sections

### 📊 Overview Section
**Location**: Top of dashboard

**Components**:
- **Company Overview Card**: Exchange, industry, employees, foreign ownership %, stock rating
- **Key Metrics Grid**: 4 cards showing latest:
  - P/E Ratio (Valuation)
  - ROE (Return on Equity)
  - D/E Ratio (Debt/Equity)
  - Current Ratio (Liquidity)

**How to Use**:
- Quickly assess company fundamentals
- Compare metrics across different companies by changing ticker

---

### 📈 Stock Price & Volume
**Location**: Below overview section

**Features**:
- Blue line: Closing prices over time
- Gray bars: Trading volume
- Dual y-axes for price (left) and volume (right)

**How to Use**:
- Hover over the chart to see exact price and volume for any date
- Observe price trends and volume spikes
- Correlate volume with price movements

---

### 💰 Financial Statements Section
**Location**: Middle of dashboard

**Tabs**:
1. **Revenue Analysis**
   - Blue bars: Total revenue by year
   - Green line: Year-over-year growth %
   - Identifies growth trends and deceleration

2. **Profitability**
   - Gross Profit Margin (blue)
   - EBIT Margin (orange)
   - Net Profit Margin (green)
   - Shows margin compression or expansion

3. **Cash Flow**
   - Operating Cash Flow (green/red)
   - Investing Cash Flow (green/red)
   - Financing Cash Flow (green/red)
   - Net Change (purple)
   - Waterfall visualization showing cash generation vs usage

**How to Use**:
- Click tabs to switch between views
- Hover over charts for exact values
- Compare margins across years to spot trends

---

### 📐 Financial Ratios Dashboard
**Location**: Below financial statements

**Tabs**:

#### 1. Valuation
**Radar Chart** showing:
- P/E Ratio (Price-to-Earnings)
- P/B Ratio (Price-to-Book)
- P/S Ratio (Price-to-Sales)
- EV/EBITDA (Enterprise Value to EBITDA)

**How to Use**:
- Larger area = higher valuation
- Compare shape across different stocks
- Hover for actual values

#### 2. Profitability
**Three Gauge Charts**:
- ROE (Return on Equity): Green ≥15%, Orange 10-15%, Red <10%
- ROA (Return on Assets)
- ROIC (Return on Invested Capital)

**How to Use**:
- Higher percentages indicate better profitability
- Compare gauges across competitors
- Industry benchmarks vary

#### 3. Liquidity
**Three Progress Bars**:
- **Current Ratio**: Should be ≥1.0 (Green zone: 1-3)
- **Quick Ratio**: Should be ≥1.0 (Green zone: 1-2)
- **Cash Ratio**: Lower is normal (Green zone: 0.3-1)

**How to Use**:
- Higher ratios = more liquid (can pay short-term debts)
- Too high may indicate inefficient capital use
- Below 1.0 = potential liquidity crisis

#### 4. Efficiency
**Multi-Line Chart**:
- Asset Turnover (blue): Revenue ÷ Assets
- Inventory Turnover (green): COGS ÷ Inventory
- Cash Conversion Cycle (orange): Days to convert inventory to cash

**How to Use**:
- Higher turnover = more efficient
- Lower CCC = faster cash collection
- Compare trends over time

#### 5. Leverage
**Semi-Circle Gauge**:
- Green (0-0.5): Conservative leverage
- Orange (0.5-1.0): Moderate leverage
- Red (>1.0): Aggressive leverage

**How to Use**:
- Shows financial risk level
- Compare to industry averages
- Banks naturally have higher leverage

---

### 📰 Company Intelligence
**Location**: Bottom of dashboard

#### Latest News
- Shows 10 most recent articles
- Green/red badges show price impact
- Source and date displayed

**How to Use**:
- Scan headlines for material events
- Check price change ratio for market reaction
- Click to read full articles (if implemented)

#### Corporate Events Timeline
- Dividend payments
- Stock splits
- General meetings
- Corporate actions

**How to Use**:
- Review upcoming/past events
- Note exercise dates for shareholder actions
- Track dividend history

---

## Market Data Page

### 📍 Access
Click **"Market Data"** in navigation or visit:
```
http://localhost:8000/market
```

### Features

#### 1. VCB Exchange Rates
**Table showing 20+ currencies**:
- Buy Cash: Rate for cash transactions
- Buy Transfer: Rate for transfers
- Sell: Rate when selling foreign currency

**How to Use**:
- Compare rates across currencies
- Monitor USD, EUR, JPY trends
- Updated daily from VCB

#### 2. SJC Gold Prices
**Grouped Bar Chart**:
- Green bars: Buy prices
- Red bars: Sell prices
- Products: Gold bars, coins, rings, jewelry

**How to Use**:
- Compare buy-sell spreads
- Track SJC gold bar prices (1L, 10L, 1KG)
- Monitor gold ring prices

#### 3. BTMC Gold Prices
**Scrollable List**:
- Each item shows karat, purity, buy/sell/world prices
- Timestamp for last update

**How to Use**:
- Compare BTMC vs SJC prices
- Check gold purity levels
- Monitor world gold price benchmark

---

## Legacy Statements Page

### 📍 Access
Click **"Statements"** in navigation or visit:
```
http://localhost:8000/statements
```

### Features
- **Tabular view** of all financial data
- Same tabs as dashboard (Income, Balance, Cash Flow, Ratios, Raw Data)
- Scroll horizontally to see all years
- Best for detailed data inspection

**When to Use**:
- Need exact numbers for analysis
- Want to copy data to Excel
- Prefer tables over charts
- Reviewing raw API responses

---

## Tips & Tricks

### ⌨️ Keyboard Shortcuts
- `Tab`: Navigate between interactive elements
- `Enter`: Activate buttons
- `Esc`: Close modals (if any)

### 🖱️ Mouse Interactions
- **Hover**: Show tooltips with exact values
- **Click tabs**: Switch between views
- **Scroll**: Navigate long lists (news, events)

### 📱 Mobile Usage
- All charts responsive to screen size
- Tables scroll horizontally
- Tap to reveal tooltips
- Swipe to scroll news/events

### 🔄 Changing Analysis
1. Click **"Change"** button in header
2. Or click **"RichSlow"** logo to return home
3. Enter new ticker/dates
4. Dashboard updates with new data

### ⚠️ Error Handling
If you see errors:
- **"No analysis parameters"**: Start from home page first
- **"Failed to load data"**: Check ticker symbol is correct
- **"API Error"**: vnstock service may be down, try again later

### 🎨 Visual Cues
- **Green**: Positive, profit, buy prices
- **Red**: Negative, loss, sell prices
- **Blue**: Neutral, informational
- **Orange**: Warning, moderate risk
- **Purple**: Special, net values

---

## Sample Stocks to Try

### High-Growth Tech
- **FPT**: FPT Corporation (IT Services)
- **VCB**: Vietcombank (Banking)

### Real Estate
- **VHM**: Vinhomes (Residential)
- **NVL**: Novaland (Mixed Development)

### Industrial
- **HPG**: Hoa Phat Steel
- **GAS**: PetroVietnam Gas

### Consumer
- **VNM**: Vinamilk (Dairy)
- **MSN**: Masan Group (Retail)

---

## Frequently Asked Questions

### Q: Why can't I see stock prices?
**A**: Stock prices require valid date range and available historical data. Try different dates or tickers.

### Q: What does "N/A" mean?
**A**: Data not available for that metric/period. Common for newer companies or specialized ratios.

### Q: How often is data updated?
**A**: Financial statements: Quarterly/Annually
Exchange rates: Daily
Gold prices: Real-time (when market open)

### Q: Can I compare multiple companies?
**A**: Currently no. Open dashboard in multiple tabs to compare side-by-side.

### Q: Can I export data?
**A**: Use the "Statements" page, copy table data, paste into Excel.

### Q: What's the difference between Dashboard and Statements?
**A**:
- **Dashboard**: Visual, chart-based, key insights
- **Statements**: Tabular, comprehensive, all fields

---

## Support & Feedback

### 🐛 Found a Bug?
Report issues at: `https://github.com/YOUR_USERNAME/richslow/issues`

### 💡 Feature Request?
Submit suggestions via GitHub Issues

### 📖 Documentation
- Full API docs: `http://localhost:8000/api/docs`
- Project README: See repository root

---

**Version**: 1.4.0
**Last Updated**: 2025-11-15
**Powered by**: vnstock, Chart.js, FastAPI
