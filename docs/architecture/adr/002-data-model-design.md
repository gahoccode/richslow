# ADR-002: Data Model Design

**Status**: Accepted

**Date**: 2024-01-01

## Context

We need to design data models for Vietnamese financial statements that are comprehensive, type-safe, and easily serializable. The system must handle:

- Complex MultiIndex DataFrames from vnstock library
- Vietnamese financial statement field names and formats
- Type safety and validation at API boundaries
- Comprehensive coverage of financial statement line items
- Null handling and data quality assurance

## Decision

We have chosen the following data model design approach:

### Core Design Principles
- **Pydantic Models**: Use Pydantic for strong typing and runtime validation
- **Comprehensive Coverage**: Include all relevant Vietnamese financial statement fields
- **Single Source of Truth**: Pydantic schemas serve as API contract and validation
- **Safe Data Extraction**: Implement helper functions for null-safe data access
- **Type Conversion**: Handle Vietnamese numeric formats and data types

### Model Structure
- **StatementsRequest**: Input model for API requests
- **FinancialStatementsResponse**: Output response wrapper
- **IncomeStatementData**: 28 fields covering income statement line items
- **BalanceSheetData**: 39 fields covering balance sheet line items  
- **CashFlowData**: 36 fields covering cash flow statement line items
- **FinancialRatiosData**: Calculated financial ratios and metrics

### Data Processing Approach
- **MultiIndex Handling**: Use vnstock's `flatten_hierarchical_index` function
- **Field Mapping**: Manual mapping from Vietnamese field names to standardized English
- **Null Safety**: Implement `_safe_get`, `_safe_get_str`, `_safe_get_int` functions
- **Type Conversion**: Handle numeric formatting and Vietnamese number formats

## Consequences

### Positive
- **Type Safety**: Strong typing prevents runtime errors and improves documentation
- **Validation**: Automatic validation at API boundaries ensures data quality
- **Documentation**: Self-documenting schemas serve as API documentation
- **Comprehensive Coverage**: 103+ fields cover all Vietnamese financial statement items
- **Maintainability**: Clear separation of concerns in data models
- **Testability**: Typed models enable easier testing and mocking

### Negative
- **Complexity**: Field mapping logic adds complexity to data processing
- **Maintenance**: Requires updates when Vietnamese financial reporting standards change
- **Performance**: Comprehensive validation adds some overhead
- **Learning Curve**: Developers need to understand Vietnamese financial terminology

## Related Decisions

- [ADR-001: Technology Stack Selection](001-technology-stack.md)
- [ADR-005: Error Handling Strategy](005-error-handling-strategy.md)

## Alternatives Considered

### Alternative 1: Simple Dictionary-based Models
- **Pros**: Simple implementation, less boilerplate
- **Cons**: No type safety, no validation, poor documentation

### Alternative 2: Database-first Approach
- **Pros**: Persistent storage, query capabilities
- **Cons**: Overkill for current stateless requirements, added complexity

### Alternative 3: Minimal Field Coverage
- **Pros**: Simplified models, less maintenance
- **Cons**: Incomplete financial analysis, limited usefulness

## Rationale

The chosen approach provides the best foundation for financial analysis because:

1. **Type Safety**: Pydantic models prevent entire classes of runtime errors
2. **Comprehensive Coverage**: All Vietnamese financial statement fields are included
3. **Validation**: Automatic validation ensures data quality at API boundaries
4. **Documentation**: Self-documenting schemas serve as living documentation
5. **Future-proof**: Can easily extend with additional fields or calculations
6. **Integration**: Works seamlessly with FastAPI's OpenAPI generation

The investment in comprehensive data models pays dividends in:
- Reduced bugs from type mismatches
- Better API documentation
- Easier testing and debugging
- Clearer business logic
- Simplified frontend integration

## Future Considerations

- Consider adding calculated fields and financial ratios
- Evaluate adding data validation rules specific to Vietnamese accounting standards
- Plan for internationalization support for multiple languages
- Consider adding historical data models when persistence is added
- Evaluate adding data quality metrics and validation scores