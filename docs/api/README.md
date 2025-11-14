# RichSlow API Documentation

This directory contains comprehensive documentation for all RichSlow API endpoints.

## API Endpoints Overview

### Company Information API
- **Data Source**: TCBS (9 endpoints) + VCI (3 endpoints)
- **Base URL**: `/api/company/{ticker}`
- **Documentation**: [Company API Details](company.md)

### Quick Access

#### Live API Documentation
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

#### Data Sources
- **TCBS**: Technical Analysis & Brokerage Solution - Real-time company data
- **VCI**: Vietnam Capital Intelligence - Financial ratios and reports

## API Categories

### 1. Company Information API (`/api/company/`)
Comprehensive company data from Vietnamese stock exchanges:

**TCBS Data Source (9 endpoints)**:
- Company overview and basic information
- Company profile and business details
- Shareholders and ownership structure
- Management team and officers
- Subsidiary companies
- Dividend history
- Insider trading activities
- Corporate events
- Company news

**VCI Data Source (3 endpoints)**:
- Financial ratios and performance metrics
- Financial reports with download links
- Trading statistics and market data

### 2. Historical Market Data API
- Stock prices and OHLCV data
- Exchange rates
- Gold prices

### 3. Financial Statements API
- Income statements
- Balance sheets
- Cash flow statements
- Financial ratios

## Usage Examples

All APIs return JSON responses with proper HTTP status codes:
- `200` - Success
- `404` - Resource not found (invalid ticker, no data)
- `422` - Validation error
- `500` - Server error

## Authentication
Currently, no authentication is required for public endpoints.

## Rate Limiting
Please be considerate with API usage to avoid overwhelming vnstock data sources.

## Error Handling
All endpoints include comprehensive error handling with descriptive error messages.

For detailed endpoint documentation, see [Company API Details](company.md).