# ADR-007: Stock Valuation Module Architecture

## Status
Accepted - 2024-09-14

## Context

We need to design and implement a comprehensive stock valuation module for the RichSlow Vietnamese stock market analysis application. The valuation module should:

- Provide multiple valuation methodologies (DCF, WACC, multiples)
- Integrate seamlessly with existing financial statements data
- Support Vietnamese market-specific requirements and data sources
- Handle missing data gracefully with appropriate fallbacks
- Maintain the backend-first processing architecture
- Enable cross-page navigation and data reuse

## Decision

### Core Architecture Approach

We have chosen to implement a comprehensive valuation module with the following architecture:

#### 1. Backend-First Valuation Processing
- **All valuation calculations performed in backend services**
- **Frontend only displays pre-calculated valuation results**
- **No complex calculations in frontend JavaScript**
- **Consistent with existing backend-first architecture**

#### 2. Multi-Method Valuation Framework
- **Discounted Cash Flow (DCF)**: Intrinsic value calculation based on projected cash flows
- **Weighted Average Cost of Capital (WACC)**: Cost of capital using market data and ratios
- **Multiples Analysis**: P/E, P/B, EV/EBITDA-based valuation with industry benchmarks
- **Sensitivity Analysis**: Valuation ranges under different assumption scenarios

#### 3. Cross-Service Integration
- **Reuse existing statements service data** to avoid redundant API calls
- **Extend existing ratio data** with market-specific metrics
- **Share validation schemas** across statements and valuation modules
- **Consistent error handling** and data processing patterns

### Technical Implementation Details

#### Backend Structure
```
app/
├── routes/
│   └── route_valuation.py          # Valuation API endpoints
├── schemas/
│   └── schema_valuation.py         # Valuation Pydantic models
└── services/
    └── service_valuation.py        # Valuation business logic
```

#### Frontend Structure
```
static/
├── valuation.html                  # Valuation analysis interface
└── js/
    └── valuation.js               # Valuation UI and interaction logic
```

#### Key Components

**1. Valuation Service (`service_valuation.py`)**
- Core valuation calculations and business logic
- Integration with vnstock for market data
- MultiIndex DataFrame handling for Vietnamese market data
- Comprehensive error handling and validation
- Configurable assumptions and parameters

**2. Valuation Schema (`schema_valuation.py`)**
- `ValuationRequest`: Input validation for valuation requests
- `ValuationResponse`: Main API response container
- `ValuationData`: DCF, WACC, and multiples valuation results
- `AssumptionsData`: Valuation parameters and configuration
- Type-safe validation and OpenAPI documentation

**3. Valuation Routes (`route_valuation.py`)**
- `/api/valuation/{ticker}` endpoint
- Request validation and response serialization
- Error handling for missing data and calculation failures
- Integration with existing FastAPI application

**4. Frontend Integration**
- Automatic data downloading when statements data missing
- Session storage integration for user inputs
- Seamless navigation between statements and valuation pages
- Interactive display of valuation results and sensitivity analysis

### Data Flow Architecture

#### 1. User Navigation Flow
```
Homepage → Input ticker/date → Navigate to Valuation
    ↓
Check session storage for statements data
    ↓
If missing: Auto-download statements data
    ↓
Display valuation interface with full data
```

#### 2. Valuation Calculation Flow
```
Statements Data → Market Data → Valuation Engine
    ↓                    ↓              ↓
Financial Ratios → Market Cap → DCF/WACC/Multiples
    ↓                    ↓              ↓
Processed Data → Assumptions → Valuation Results
```

#### 3. API Integration Pattern
```
Frontend Request → Valuation API → Statements Service
    ↓                    ↓              ↓
Validation → Business Logic → vnstock Integration
    ↓                    ↓              ↓
Response ← Calculations ← Data Processing
```

## Consequences

### Positive
- ✅ **Comprehensive Valuation**: Multiple valuation methods with Vietnamese market support
- ✅ **Seamless Integration**: Reuses existing data and follows established patterns
- ✅ **Backend-First**: Maintains architectural consistency and performance
- ✅ **Error Resilience**: Graceful handling of missing market data
- ✅ **User Experience**: Automatic data downloading and integrated navigation
- ✅ **Extensibility**: Framework supports additional valuation methods
- ✅ **Data Consistency**: Single source of truth for financial data

### Negative
- ⚠️ **Increased Complexity**: Additional service layer and calculations
- ⚠️ **API Dependencies**: Reliance on vnstock market data availability
- ⚠️ **Performance Impact**: Additional calculations may affect response times
- ⚠️ **Testing Complexity**: Multiple valuation methods require comprehensive testing
- ⚠️ **Maintenance**: Additional code to maintain and document

### Technical Challenges Addressed

**1. MultiIndex DataFrame Handling**
- **Issue**: vnstock returns MultiIndex DataFrames for ratio data
- **Solution**: Use `flatten_hierarchical_index` for proper column structure
- **Implementation**: Added import and proper DataFrame processing in valuation service

**2. Market Capitalization Data**
- **Issue**: Field name mismatches between expected and actual vnstock responses
- **Solution**: Map "Market Capital (Bn. VND)" field for Vietnamese stocks
- **Implementation**: Updated field mapping with multi-column fallback support

**3. API Validation**
- **Issue**: String values in assumptions dictionary causing validation errors
- **Solution**: Filter assumptions to include only numeric values
- **Implementation**: Added validation filtering in valuation routes

**4. Cross-Page Data Persistence**
- **Issue**: Valuation page requires statements data but direct navigation doesn't trigger download
- **Solution**: Automatic data downloading when statements data is missing
- **Implementation**: Added utility function in common.js and modified valuation.js

## Implementation Details

### Key Files Modified/Created

**New Files:**
- `app/routes/route_valuation.py` - Valuation API endpoints
- `app/schemas/schema_valuation.py` - Valuation Pydantic models
- `app/services/service_valuation.py` - Valuation business logic
- `static/valuation.html` - Valuation analysis interface
- `static/js/valuation.js` - Valuation UI logic

**Modified Files:**
- `app/main.py` - Added valuation route mounting
- `static/js/common.js` - Added data downloading utility
- `static/index.html` - Updated navigation links
- `static/statements.html` - Updated navigation links

### Critical Implementation Patterns

**1. MultiIndex DataFrame Processing**
```python
from vnstock.core.utils.transform import flatten_hierarchical_index

if isinstance(ratio_data.columns, pd.MultiIndex):
    ratio_data = flatten_hierarchical_index(
        ratio_data, separator="_", handle_duplicates=True, drop_levels=0
    )
```

**2. Market Data Field Mapping**
```python
market_cap = _safe_get_multi(ratio_data, [
    "Market Capital (Bn. VND)", 
    "Market Capital (Bn. VND)"
])
```

**3. Assumptions Validation**
```python
# Filter out string values for API validation
numeric_assumptions = {k: v for k, v in assumptions.items() if isinstance(v, (int, float))}
```

**4. Automatic Data Downloading**
```javascript
async function downloadStatementsForValuation(ticker, startDate, endDate, period) {
    // Reuse existing API endpoint for statements data
    // Store in session storage for valuation page use
}
```

## Testing Strategy

### Test Categories Added

**1. Valuation Calculation Tests**
- DCF calculation accuracy with known inputs
- WACC component validation (cost of equity, debt, market risk premium)
- Multiples calculation and industry benchmarking
- Sensitivity analysis across assumption ranges

**2. Integration Tests**
- Cross-service data consistency validation
- Navigation workflow testing
- API endpoint error handling
- Missing data fallback behavior

**3. Data Integration Tests**
- vnstock market data integration
- MultiIndex DataFrame handling
- Field mapping accuracy
- Vietnamese market-specific scenarios

### Test Coverage

**Valuation-Specific Tests:**
- `tests/test_service_valuation.py` - Valuation service function testing
- `tests/test_valuation_schemas.py` - Valuation schema validation
- `tests/test_valuation_integration.py` - End-to-end valuation testing
- Updated `tests/test_contract_alignment.py` - Valuation field mapping

## Best Practices Established

### Development Guidelines

**1. Valuation Calculations**
- All complex calculations must be performed in backend services
- Use established financial formulas and industry standards
- Implement proper error handling for edge cases
- Document assumptions and limitations clearly

**2. Data Integration**
- Reuse existing statements service data where possible
- Implement proper field mapping for Vietnamese market data
- Handle MultiIndex DataFrames with appropriate flattening
- Validate data consistency across different sources

**3. API Design**
- Follow existing RESTful API patterns
- Use comprehensive Pydantic validation
- Provide clear error messages for missing data
- Maintain backward compatibility

**4. Frontend Integration**
- Implement automatic data downloading when needed
- Use session storage for cross-page data persistence
- Provide loading states for asynchronous operations
- Design intuitive user interfaces for complex valuation data

### Performance Considerations

**1. Caching Strategy**
- Cache frequently accessed market data
- Implement intelligent data reuse between services
- Consider Redis for future scaling needs

**2. Calculation Optimization**
- Optimize expensive valuation calculations
- Implement proper error handling to prevent cascading failures
- Consider background processing for complex analyses

**3. API Response Times**
- Monitor and optimize valuation endpoint performance
- Implement proper pagination for large datasets
- Consider streaming responses for complex calculations

## Future Considerations

### Phase 2 Enhancements

**1. Advanced Valuation Methods**
- Real options valuation
- Monte Carlo simulation
- Industry-specific valuation models
- Economic value added (EVA) calculations

**2. Enhanced Data Sources**
- Additional Vietnamese market data providers
- Real-time market data integration
- Historical data analysis capabilities
- Economic indicator integration

**3. User Experience Improvements**
- Interactive sensitivity analysis tools
- Advanced charting and visualization
- Portfolio valuation features
- Custom valuation model builders

### Evolution Strategy

**1. Scalability**
- Consider microservices architecture for valuation calculations
- Implement distributed processing for complex analyses
- Add caching layers for improved performance

**2. Extensibility**
- Design plugin architecture for custom valuation models
- Support multiple valuation methodologies
- Enable third-party data source integration

**3. Internationalization**
- Support for other Southeast Asian markets
- Multi-currency valuation capabilities
- Regional benchmarking and comparison tools

## Related Decisions

- **ADR-001**: Technology Stack Selection - FastAPI, vnstock integration
- **ADR-002**: Data Model Design - Financial statement field mappings
- **ADR-003**: Stateless Architecture - No database persistence
- **ADR-005**: Error Handling Strategy - API integration patterns
- **ADR-006**: vnstock v3+ Compatibility - MultiIndex DataFrame handling

## References

- **vnstock Documentation**: https://github.com/thinh-vu/vnstock
- **Financial Valuation Standards**: CFA Institute valuation guidelines
- **Vietnamese Market Data**: VCI, TCBS data source specifications
- **Implementation Commit**: Stock valuation module integration
- **Testing Results**: Valuation calculation verification with FPT, VCB, VNM stocks

## Appendices

### A. Valuation Methods Implemented

**1. Discounted Cash Flow (DCF)**
- Free cash flow projection
- Terminal value calculation
- Discount rate application
- Sensitivity analysis

**2. Weighted Average Cost of Capital (WACC)**
- Cost of equity calculation (CAPM)
- Cost of debt determination
- Market risk premium application
- Capital structure weighting

**3. Multiples Analysis**
- P/E multiple valuation
- P/B multiple valuation
- EV/EBITDA multiple valuation
- Industry benchmark comparison

### B. Vietnamese Market-Specific Considerations

**1. Data Availability**
- Market capitalization data availability
- Financial statement reporting standards
- Industry classification systems
- Market segment differences

**2. Regulatory Environment**
- Vietnamese stock exchange regulations
- Financial reporting requirements
- Corporate governance standards
- Market-specific risk factors

**3. Industry Variations**
- Banking sector specific ratios
- Real estate valuation methods
- Technology company considerations
- State-owned enterprise adjustments