# ADR-004: Frontend Architecture

**Status**: Superseded (by Next.js migration + ADR-007)

**Date**: 2024-01-01

**Last Updated**: 2025-11-21

## Context

We need to select a frontend architecture for the RichSlow financial analysis application. The frontend must:

- Provide forms for user input (ticker, date range, period)
- Display complex financial data in tabular format
- Handle data visualization and charts
- Support multiple views (landing page, statements page)
- Maintain user state across navigation
- Be performant and easy to maintain

## Decision

We have chosen a static HTML with vanilla JavaScript architecture:

### Core Technology Stack
- **Static HTML**: Server-side rendered HTML pages
- **TailwindCSS**: Utility-first CSS framework for styling
- **Vanilla JavaScript**: No framework, native browser APIs
- **Session Storage**: Browser session storage for state persistence
- **CDN Dependencies**: External libraries loaded from CDNs

### Architecture Pattern
- **Multi-page Application**: Separate HTML pages for different views
- **Progressive Enhancement**: Base functionality works without JavaScript
- **Client-side State Management**: Session storage for user inputs
- **Form Handling**: Native HTML forms with JavaScript enhancement
- **Data Rendering**: Dynamic DOM manipulation for financial data

### Component Structure
- **Landing Page** (`index.html`): Input form and navigation
- **Statements Page** (`statements.html`): Financial data display
- **Common Utilities** (`common.js`): Shared functions and session management
- **Page-specific Logic** (`statements.js`): Page-specific functionality

## Consequences

### Positive
- **Performance**: Fast initial load, minimal JavaScript overhead
- **Simplicity**: No build process, framework complexity, or tooling
- **Deployment**: Simple static file serving, no compilation needed
- **SEO**: Search engine friendly with server-rendered HTML
- **Accessibility**: Works with assistive technologies out of the box
- **Maintenance**: Easier to debug and modify with plain JavaScript
- **Learning Curve**: Lower barrier for new developers

### Negative
- **Interactivity**: Limited compared to modern SPA frameworks
- **State Management**: Manual state handling can become complex
- **Code Organization**: Risk of spaghetti code without structure
- **Testing**: More challenging to test compared to component-based frameworks
- **Reusability**: Less natural component sharing and reuse
- **Development Speed**: Slower for complex UI interactions

## Related Decisions

- [ADR-001: Technology Stack Selection](001-technology-stack.md)
- [ADR-003: Stateless Architecture](003-stateless-architecture.md)

## Alternatives Considered

### Alternative 1: React SPA
- **Pros**: Rich interactivity, component-based architecture, ecosystem
- **Cons**: Build process, bundle size, complexity, overkill for current needs

### Alternative 2: Vue.js Application
- **Pros**: Progressive enhancement, smaller learning curve
- **Cons**: Still requires build process, added complexity

### Alternative 3: Angular Application
- **Pros**: Full-featured framework, enterprise-grade
- **Cons**: Heavyweight, steep learning curve, over-engineering

## Rationale

The static HTML approach was chosen because:

1. **Current Requirements**: Current functionality is primarily form-based data display
2. **Performance**: Fast loading is critical for financial applications
3. **Simplicity**: Minimizes complexity for initial launch and maintenance
4. **Development Speed**: No build tooling or framework setup required
5. **Team Skills**: Accessible to developers with basic web skills
6. **Deployment**: Extremely simple deployment and scaling

The trade-offs are acceptable because:
- Current functionality doesn't require complex state management
- Performance benefits outweigh interactivity limitations
- Can evolve to more complex frontend as requirements grow
- Lower maintenance cost is valuable for initial launch

## Future Evolution

### Phase 2: Enhanced Interactivity
- Add charting libraries (Chart.js, D3.js) for data visualization
- Implement real-time updates with Server-Sent Events
- Add more sophisticated form validation and user feedback
- Implement keyboard shortcuts and accessibility improvements

### Phase 3: Framework Migration
- Migrate to React or Vue.js for complex state management
- Implement component-based architecture for reusability
- Add build process for optimization and code splitting
- Implement proper testing framework and CI/CD

### Migration Strategy
- **Gradual Migration**: Convert pages one by one to framework
- **Hybrid Approach**: Use framework for new features, maintain static for existing
- **Feature Flagging**: Enable framework features conditionally
- **Performance Monitoring**: Ensure migration doesn't degrade performance

## Code Organization Guidelines

### JavaScript Structure
- **Module Pattern**: Use IIFEs or ES6 modules for encapsulation
- **Event Delegation**: Centralized event handling for dynamic content
- **Separation of Concerns**: Clear separation between DOM manipulation and business logic
- **Error Handling**: Comprehensive error handling and user feedback
- **Utility Functions**: Reusable helper functions in common.js

### CSS Organization
- **TailwindCSS Utility Classes**: Consistent styling approach
- **Component-based Classes**: Reusable component classes where needed
- **Responsive Design**: Mobile-first responsive design approach
- **Accessibility**: ARIA labels and keyboard navigation support
- **Performance**: Minimal CSS, optimized for performance

## Quality Assurance

### Testing Strategy
- **Manual Testing**: Cross-browser compatibility testing
- **Accessibility Testing**: Screen reader and keyboard navigation testing
- **Performance Testing**: Page load and interaction performance
- **User Testing**: Real user feedback on usability

### Monitoring and Analytics
- **Performance Metrics**: Page load times, interaction latency
- **Error Tracking**: JavaScript errors and API failures
- **User Behavior**: Form completion rates, navigation patterns
- **Browser Support**: Usage statistics and compatibility issues

---

## Status Update (2025-11-21): Superseded by Modern Frontend Stack

**This ADR has been superseded** by significant architectural evolution over time.

### Evolution Timeline

#### Phase 1: Static HTML + Vanilla JavaScript (2024-01-01)
- **Status**: Initial implementation as documented in this ADR
- **Technologies**: Static HTML, Vanilla JS, TailwindCSS, Session Storage
- **Rationale**: Simplicity, performance, low complexity for MVP

#### Phase 2: Next.js 16 + React Migration (2025-11-18)
- **Status**: Completed - See CHANGELOG.md v2.0.0 and [Unreleased]
- **Technologies**: Next.js 16 with App Router, React 19.2.0, TypeScript, shadcn/ui
- **Major Changes**:
  - Modern React-based frontend with component architecture
  - 77+ new components (charts, tables, UI elements)
  - TickerContext for global state management
  - SWR for intelligent data fetching and caching
  - Comprehensive charting system (30+ visualizations)
  - Full TypeScript coverage with strict mode

#### Phase 3: OpenAPI Code Generation (2025-11-21)
- **Status**: Completed - See [ADR-007](007-openapi-code-generation.md)
- **Technologies**: OpenAPI-generated TypeScript client + Facade pattern
- **Major Changes**:
  - Migrated from manual API client (607 lines) to auto-generated facade
  - Frontend types now auto-sync with backend Pydantic schemas
  - Single source of truth for API contracts
  - 80% reduction in boilerplate code
  - Full type safety with IDE autocomplete

### Current Architecture (2025-11-21)

The application now uses:
- **Frontend Framework**: Next.js 16 with App Router
- **UI Library**: React 19.2.0 + shadcn/ui components
- **Type System**: TypeScript with strict mode
- **API Integration**: OpenAPI-generated client with facade pattern (ADR-007)
- **State Management**: React Context + SWR caching
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts + D3.js for financial visualizations

### Migration Outcomes

**Benefits Achieved**:
- Component-based architecture with reusability
- Auto-synced types from backend to frontend
- Professional UI with modern design system
- Comprehensive data visualization capabilities
- Improved developer experience and maintainability
- Single source of truth for API contracts

**Code Metrics**:
- Frontend codebase: 77+ components, 8000+ lines
- Legacy static frontend: Still available for comparison
- Manual API client: Eliminated (607 lines removed)
- Generated API client: ~5000 lines (automated)

### Related Documentation

- **CHANGELOG.md**: Complete migration history and version timeline
- **ADR-007**: OpenAPI Code Generation decision and rationale
- **frontend/CLAUDE.md**: Current frontend development guidelines
- **IMPLEMENTATION_STATUS.md**: Next.js implementation tracking

### Lessons Learned

1. **Progressive Enhancement Works**: Started simple, evolved as needed
2. **Type Safety Matters**: TypeScript + OpenAPI generation prevents bugs
3. **Automation Saves Time**: Code generation eliminates maintenance burden
4. **Component Architecture**: React components enable better code organization
5. **Incremental Migration**: Gradual evolution prevented big-bang rewrites

This ADR remains as historical reference for the original architecture decision and evolution path.