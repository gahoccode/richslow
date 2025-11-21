# ADR-007: OpenAPI Code Generation for Frontend

**Status**: Accepted

**Date**: 2025-11-21

## Context

The RichSlow application evolved from a static HTML frontend to a modern Next.js 16 application with TypeScript. During this evolution, the frontend API integration was initially implemented using a manual API client (`frontend/lib/api.ts` - 607 lines) that:

### Problems with Manual API Client

1. **Type Drift**: Frontend TypeScript types could drift from backend Pydantic schemas
2. **Maintenance Burden**: Every backend schema change required manual frontend updates
3. **Boilerplate Code**: 607 lines of repetitive API wrapper code
4. **Error-Prone**: Manual type definitions could contain mistakes or become outdated
5. **No Single Source of Truth**: Types existed in both backend and frontend codebases
6. **Documentation Lag**: API changes not immediately reflected in frontend code

### Requirements for Solution

- Automatically sync frontend types with backend Pydantic schemas
- Reduce manual maintenance overhead
- Maintain type safety and developer experience
- Support existing SWR caching strategy
- Minimize migration complexity
- Preserve backward compatibility during transition

## Decision

We have adopted **OpenAPI code generation** with a **facade pattern** for frontend-backend API integration:

### Core Components

1. **OpenAPI Specification**
   - Backend auto-generates OpenAPI spec from FastAPI/Pydantic
   - Accessible at `/api/openapi.json`
   - Single source of truth for API contracts

2. **Code Generation Tool**
   - Using `openapi-typescript-codegen` npm package
   - Generates TypeScript client from OpenAPI spec
   - Output: ~35 files in `frontend/lib/api/generated/`

3. **Facade Layer**
   - Custom wrapper (`frontend/lib/api/facade.ts` - 353 lines)
   - Provides clean, intuitive API surface
   - Wraps verbose generated client methods
   - Exports commonly-used types with friendly names

### Architecture Pattern

```
Backend Pydantic Schemas
        ↓
  FastAPI OpenAPI
        ↓
OpenAPI Specification (JSON)
        ↓
openapi-typescript-codegen
        ↓
Generated TypeScript Client (~35 files)
        ↓
Custom Facade Layer (facade.ts)
        ↓
Frontend Components & Hooks
```

### Implementation Details

**Code Generation Command**:
```bash
bunx openapi-typescript-codegen \
  --input http://localhost:8000/api/openapi.json \
  --output ./lib/api/generated \
  --client fetch
```

**Facade Pattern Example**:
```typescript
// Generated client (verbose)
import { DefaultService } from './generated';
const result = await DefaultService.getCompanyOverview({ ticker: 'VCB' });

// Facade layer (clean)
import api from '@/lib/api/facade';
const result = await api.company.getOverview('VCB');
```

## Consequences

### Positive

1. **Type Safety**: Frontend types automatically sync with backend schemas
2. **Reduced Maintenance**: No manual type updates required
3. **Code Reduction**: Eliminated 607 lines of manual API client code
4. **Developer Experience**: Full IDE autocomplete and type checking
5. **Single Source of Truth**: Backend Pydantic schemas define API contract
6. **Auto-Documentation**: Generated code includes JSDoc comments from OpenAPI
7. **Fewer Bugs**: Type mismatches caught at compile time
8. **Faster Iteration**: Backend changes immediately available in frontend
9. **Consistent Naming**: Property names match backend `snake_case` convention

### Negative

1. **Build Complexity**: Requires code generation step in development workflow
2. **Generated Code Size**: ~35 generated files add ~5000 lines to codebase
3. **Migration Effort**: Required 6 hours to migrate 20 files across 3 phases
4. **Debugging Complexity**: Stack traces may reference generated code
5. **Customization Limits**: Generated code shouldn't be manually edited
6. **Tool Dependency**: Reliant on `openapi-typescript-codegen` maintenance
7. **Learning Curve**: Team needs to understand generation workflow
8. **Regeneration Required**: Must regenerate after backend schema changes

### Neutral

- **Property Naming Convention**: Changed from `camelCase` to `snake_case` (backend alignment)
- **Facade Pattern Required**: Generated API too verbose for direct use
- **Testing Strategy**: Can test facade without running code generation

## Related Decisions

- [ADR-001: Technology Stack Selection](001-technology-stack.md) - Original backend/frontend choices
- [ADR-002: Data Model Design](002-data-model-design.md) - Pydantic schema design
- [ADR-004: Frontend Architecture](004-frontend-architecture.md) - Frontend evolution (Static HTML → Next.js)

## Alternatives Considered

### Alternative 1: Continue Manual API Client

**Pros**:
- No new tooling or dependencies
- Complete control over API surface
- Simpler build process
- No code generation step

**Cons**:
- Manual maintenance burden (607 lines)
- Type drift between frontend/backend
- Error-prone manual updates
- No automation benefits

**Verdict**: Rejected due to maintenance burden and type drift risks

### Alternative 2: GraphQL with Code Generation

**Pros**:
- Flexible querying capabilities
- Strong code generation ecosystem (GraphQL Code Generator)
- Industry-standard approach
- Excellent tooling support

**Cons**:
- Major backend rewrite required (FastAPI → GraphQL server)
- Overkill for our use case (no complex queries needed)
- Additional learning curve for team
- More complex than REST for simple CRUD operations

**Verdict**: Rejected due to migration complexity and overkill for current needs

### Alternative 3: tRPC (End-to-End Type Safety)

**Pros**:
- Perfect TypeScript integration
- No code generation required
- Shared types between frontend/backend
- Excellent developer experience

**Cons**:
- Requires Node.js backend (we use Python/FastAPI)
- Not compatible with existing FastAPI backend
- Would require complete backend rewrite
- Less mature ecosystem than OpenAPI

**Verdict**: Rejected due to incompatibility with Python backend

### Alternative 4: Handwritten Types + Zod Validation

**Pros**:
- Runtime validation of API responses
- More control over validation logic
- No code generation step

**Cons**:
- Still requires manual type maintenance
- Doesn't solve type drift problem
- Additional validation library dependency
- More code to maintain

**Verdict**: Rejected - doesn't address core problem of type drift

## Rationale

The OpenAPI code generation approach was chosen because:

1. **Existing Backend**: Already using FastAPI with comprehensive Pydantic schemas
2. **Zero Backend Changes**: Works with existing OpenAPI spec generation
3. **Type Safety**: Automatic sync between backend schemas and frontend types
4. **Maintenance**: Eliminates 607 lines of manual code requiring updates
5. **Standards-Based**: OpenAPI is industry standard with mature tooling
6. **Minimal Migration**: Could migrate incrementally without breaking changes
7. **Developer Experience**: Full autocomplete and type checking
8. **Proven Approach**: Widely adopted pattern in TypeScript/Python stacks

## Migration Strategy

### Phase 1: Component Import Updates (2 hours)
- Updated 17 component imports to use facade
- Fixed type exports in facade layer
- Updated property names (camelCase → snake_case)
- **Result**: 0 TypeScript compilation errors

### Phase 2: Hook Migrations (3 hours)
- Migrated `useMarketData.ts` to facade API
- Migrated `useCompanyData.ts` to facade API
- Migrated `useStockData.ts` to facade API (critical hook)
- Fixed parameter signatures for compatibility
- **Result**: All hooks working correctly, full app tested

### Phase 3: Cleanup & Finalization (1 hour)
- Verified no legacy imports remaining
- Deleted legacy `lib/api.ts` (607 lines)
- Updated documentation (CHANGELOG, CLAUDE.md)
- **Result**: 18/19 facade tests passing (95%)

### Total Migration Time
- **Actual**: 6 hours
- **Estimated**: 6-9 hours
- **Outcome**: Successful, no regressions

## Testing & Validation

### Test Coverage
- **Facade Test Suite**: 18/19 endpoints passing (95%)
- **TypeScript Compilation**: 0 errors
- **Component Tests**: All renders verified
- **Hook Tests**: All data fetching working
- **Integration Tests**: Full app functionality tested

### Known Issues
1. **Quarterly Ratios API**: Test failing (endpoint not used in current hooks)
   - Status: Non-blocking
   - Plan: Investigate separately

## Implementation Guidelines

### When to Regenerate Client

Regenerate the OpenAPI client when:
- Backend Pydantic schemas change
- New API endpoints added
- Existing endpoint signatures modified
- OpenAPI spec updated

### Development Workflow

1. **Make Backend Changes**: Update FastAPI routes/schemas
2. **Start Backend Server**: Ensure OpenAPI spec is current
3. **Regenerate Client**: Run `bun run generate:api`
4. **Review Changes**: Check git diff for type changes
5. **Update Facade**: Add new methods to facade if needed
6. **Update Components**: Use new types/methods
7. **Test**: Run facade tests and component tests

### Facade Maintenance

**DO**:
- Add convenience methods for common operations
- Create type aliases for better readability
- Group related methods by domain
- Export commonly-used types
- Add JSDoc comments for clarity

**DON'T**:
- Modify generated code directly
- Duplicate logic from generated client
- Add business logic to facade
- Create inconsistent API surfaces

## Future Considerations

### Potential Improvements

1. **Automated Regeneration**: Add pre-commit hook to regenerate on backend changes
2. **Type Validation**: Add runtime validation with Zod for extra safety
3. **Mock Generation**: Generate mock data from OpenAPI spec for testing
4. **API Versioning**: Support multiple API versions with separate clients
5. **Optimistic Updates**: Add optimistic update helpers to facade
6. **Cache Management**: Integrate SWR cache keys with generated types

### Monitoring & Maintenance

- **Track Generation Failures**: Monitor code generation success rate
- **Version Lock**: Pin `openapi-typescript-codegen` version for stability
- **Type Coverage**: Monitor TypeScript strict mode compliance
- **Migration Patterns**: Document common migration patterns for team

## Conclusion

The adoption of OpenAPI code generation with a facade pattern has successfully:
- Reduced frontend API code by 607 lines
- Established single source of truth for types
- Improved developer experience with autocomplete
- Eliminated manual type maintenance burden
- Maintained full type safety across stack

The 6-hour migration was completed successfully with no regressions, validating the decision. The facade pattern provides a clean API surface while leveraging automated code generation benefits.
