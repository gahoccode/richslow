# ADR-006: vnstock v3+ Compatibility and Financial Ratio Data Processing

## Status
Accepted - 2024-09-13

## Context

During implementation, we discovered that several key financial ratio fields were missing from the frontend display:
- Days Sales Outstanding
- Days Inventory Outstanding  
- Days Payable Outstanding
- Cash Conversion Cycle
- Total Borrowings to Equity
- Debt-to-Equity Ratio
- Gross Profit Margin (%)
- Net Profit Margin (%)
- Return on Assets (%)
- Return on Equity (%)
- Dividend Yield (%)

Investigation revealed this was due to vnstock v3+ API compatibility issues:

1. **Missing API Parameters**: The vnstock v3+ API requires `flatten_columns=True` parameter for proper DataFrame column structure
2. **Column Name Mismatches**: Actual vnstock column names differed from our expected field mappings
3. **MultiIndex Handling**: Inadequate handling of vnstock's MultiIndex DataFrame responses

## Decision

### Primary Solution: Update vnstock API Integration
1. **Add missing vnstock v3+ parameters**:
   - `flatten_columns=True` for proper column structure
   - Enhanced error handling for parameter compatibility
   - Fallback to basic API call if advanced parameters fail

2. **Fix column name mappings** based on actual vnstock responses:
   - `"Dividend yield (%)"` instead of `"Dividend Yield (%)"`
   - `"ROE (%)"` and `"ROA (%)"` for return ratios
   - `"Gross Profit Margin (%)"` and `"Net Profit Margin (%)"` for margins
   - `"(ST+LT borrowings)/Equity"` for total borrowings ratio
   - `"Debt/Equity"` for debt-to-equity ratio
   - Activity ratio field names: `"Days Sales Outstanding"`, `"Days Inventory Outstanding"`, etc.

3. **Enhanced field mapping strategy**:
   - Implement `_safe_get_multi()` helper to try multiple column name variations
   - Maintain backward compatibility with existing column names
   - Add debug logging to identify missing fields in future

### Implementation Details
- **File Modified**: `app/services/service_statements.py`
- **Functions Updated**: `get_financial_statements()`, `_process_ratios()`
- **Approach**: Conservative enhancement with fallback handling

## Consequences

### Positive
- ✅ All 11 missing financial ratio fields now populate correctly
- ✅ Improved vnstock v3+ API compatibility
- ✅ Enhanced error handling and debugging capabilities
- ✅ Backward compatibility maintained
- ✅ Better field mapping strategy for future vnstock updates

### Negative
- ⚠️ Increased code complexity in ratio processing function
- ⚠️ Debug logging may need cleanup for production
- ⚠️ Some fields may still be null for certain company types (e.g., banks)

### Testing Results
Verified with multiple Vietnamese stocks:
- **FPT**: All fields populated (tech company)
- **REE**: All fields populated (real estate/utilities)
- **VCB**: Expected nulls for bank-specific ratios

### Performance Impact
- Minimal impact on API response times
- Enhanced data completeness significantly improves user experience

## Implementation Notes

### Key Lessons Learned
1. **Always check actual API responses**: Column names from documentation may not match reality
2. **Use debug logging**: Essential for troubleshooting data integration issues
3. **Implement flexible field mapping**: APIs may change column names between versions
4. **Test with multiple data sources**: Different company types may have different data availability

### Best Practices Established
1. Use `_safe_get_multi()` pattern for field extraction with multiple possible column names
2. Add debug logging for new integrations to identify discrepancies early
3. Implement graceful fallbacks for API parameter compatibility
4. Test financial ratio calculations across different industry sectors

### Future Considerations
- Monitor vnstock API changes and update mappings as needed
- Consider implementing calculated fallbacks for missing ratios
- Evaluate caching strategy for expensive API calls
- Add automated tests for ratio data completeness

## Related Decisions
- Builds on ADR-001 (Technology Stack Selection) - vnstock integration
- Extends ADR-002 (Data Model Design) - financial ratio field definitions
- Complements ADR-005 (Error Handling Strategy) - API integration error handling

## References
- vnstock v3+ documentation: https://github.com/thinh-vu/vnstock
- Implementation commit: Financial ratio data fix
- Testing results: API verification with FPT, REE, VCB stocks