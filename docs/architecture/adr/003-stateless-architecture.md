# ADR-003: Stateless Architecture

**Status**: Accepted

**Date**: 2024-01-01

## Context

We need to determine the persistence and state management strategy for the RichSlow application. The application must:

- Provide real-time financial data from Vietnamese stock exchanges
- Handle user inputs and preferences across multiple pages
- Support multiple concurrent users
- Scale efficiently with minimal infrastructure
- Maintain data freshness and accuracy

## Decision

We have chosen a stateless architecture approach:

### Core Architecture
- **No Database**: No persistent storage for financial data
- **Stateless API**: Each request is independent and self-contained
- **Session Storage**: User inputs persisted in browser session storage
- **Real-time Fetching**: Always fetch fresh data from external APIs
- **Static Asset Caching**: Browser-level caching for static files

### State Management Strategy
- **User Inputs**: Form data stored in browser `sessionStorage`
- **Navigation**: Parameters passed between pages via URL or session storage
- **API Requests**: Each request contains all necessary parameters
- **Response Processing**: No server-side state maintained between requests

### Data Flow
1. User submits form on landing page
2. Parameters saved to session storage
3. User redirected to statements page
4. Frontend reads parameters from session storage
5. API request made with all required parameters
6. External API called via vnstock library
7. Data processed and returned as response
8. Frontend renders response without server state

## Consequences

### Positive
- **Simplicity**: No database setup, maintenance, or scaling concerns
- **Scalability**: Stateless design enables horizontal scaling
- **Freshness**: Always current financial data, no stale data issues
- **Deployment**: Simplified deployment with minimal infrastructure
- **Cost**: Reduced infrastructure and operational costs
- **Reliability**: Fewer points of failure (no database outages)

### Negative
- **API Dependency**: Complete reliance on external API availability
- **Rate Limiting**: Subject to external API rate limits and quotas
- **Performance**: No caching of frequently accessed data
- **Historical Analysis**: Limited ability to analyze historical trends
- **Offline Functionality**: No capability when external APIs are unavailable
- **User Experience**: Slower response times due to external API calls

## Related Decisions

- [ADR-001: Technology Stack Selection](001-technology-stack.md)
- [ADR-004: Frontend Architecture](004-frontend-architecture.md)
- [ADR-005: Error Handling Strategy](005-error-handling-strategy.md)

## Alternatives Considered

### Alternative 1: Full Database Persistence
- **Pros**: Historical analysis, offline capability, caching
- **Cons**: Complexity, cost, data synchronization challenges

### Alternative 2: Hybrid Approach (Cache + Fresh Data)
- **Pros**: Performance benefits, offline capability
- **Cons**: Cache invalidation complexity, data consistency issues

### Alternative 3: Read-replicas for Data
- **Pros**: Performance, availability
- **Cons**: Complexity, synchronization overhead

## Rationale

The stateless approach was chosen because:

1. **Market Data Nature**: Financial market data is time-sensitive and changes frequently
2. **Simplicity Requirements**: Initial version prioritizes simplicity and quick deployment
3. **External API Quality**: Vietnamese stock APIs provide reliable, real-time data
4. **Cost Considerations**: Minimizing infrastructure costs for initial launch
5. **Scalability**: Stateless design naturally scales with user growth
6. **Maintenance**: Reduced operational overhead and complexity

The trade-offs are acceptable because:
- External APIs are generally reliable for Vietnamese market data
- Performance impact is mitigated by efficient data processing
- Missing historical analysis is acceptable for initial launch
- Future evolution can add persistence as needed

## Future Considerations

### Phase 2: Caching Layer
- Add Redis for caching frequently accessed data
- Implement cache invalidation strategies
- Add cache warming for popular stocks

### Phase 3: Persistence Layer
- Add time-series database for historical analysis
- Implement data archiving and retention policies
- Add offline capabilities and bulk data processing

### Evolution Strategy
- Maintain stateless core architecture
- Add caching and persistence as optimization layers
- Ensure backward compatibility during evolution
- Monitor performance and user experience metrics

## Mitigation Strategies

### External API Dependencies
- Implement multiple data source fallbacks (VCI, TCBS)
- Add circuit breaker patterns for API failures
- Implement exponential backoff for retry logic
- Add comprehensive error handling and user feedback

### Performance Considerations
- Optimize data processing algorithms
- Implement efficient field mapping and validation
- Add client-side caching for static resources
- Monitor response times and optimize bottlenecks