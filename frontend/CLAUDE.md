# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Next.js React frontend code in this repository.

## Development Commands

### Frontend Development

```bash
# Install dependencies
bun install
```

```bash
# Development server (port 3001)
bun run dev
```

```bash
# Production build
bun run build
```

```bash
# Production server (port 3001)
bun run start             # Uses package.json script
# bun run next start -p 3001  # Direct Next.js command (alternative)
```

```bash
# Code linting
bun run lint
```

### Package Management

```bash
# Add new dependencies
bun add <package>          # Production dependency
bun add <package> --dev     # Development dependency

# Remove dependencies
bun remove <package>

# Update dependencies
bun update
```

### Testing Facade Layer

```bash
# Fast integration tests (~16 seconds, 18 endpoints)
bun run test:facade

# Rate-limited tests (~60-180 seconds, 3 endpoints)
bun run test:facade:rate-limited

# All tests including rate-limited
bun run test:facade:all
```

**Prerequisites**: Backend server must be running on port 8000

**Coverage**:
- Company APIs (10 endpoints)
- Financial Statements (2 variations)
- Stock Prices & Market Data (4 endpoints)
- Quarterly Ratios (1 endpoint)
- Industry Classifications (1 endpoint)

### Backend Integration

```bash
# Backend serves APIs and static files (port 8000)
cd ../
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Access points:
# Frontend: http://localhost:3001
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

### Environment Setup

```bash
# Set environment variable (optional)
export NEXT_PUBLIC_API_URL=http://localhost:8000

# Start both servers simultaneously
# Terminal 1: Backend (port 8000)
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend (port 3001)
bun run dev
```

## Architecture Overview

### Modern Next.js React Frontend

**Framework Stack:**
- **Next.js 16** with App Router and TypeScript
- **React 19.2.0** with strict TypeScript mode
- **Tailwind CSS v4** with PostCSS configuration
- **shadcn/ui** component library with "new-york" style
- **SWR 2.3.6** for data fetching and caching
- **Recharts 2.15.4** and **D3.js 7.9.0** for charting
- **Lucide React** for icons

**Development Environment:**
- Frontend Port: 3001 (Next.js dev server)
- Backend Port: 8000 (FastAPI API + static files)
- API Base URL: `http://localhost:8000` (configurable via `NEXT_PUBLIC_API_URL`)
- Hot Reload: Enabled for both frontend and backend

### Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Main dashboard page
│   ├── market/                   # Market data pages
│   └── globals.css               # Global styles with Tailwind v4
├── components/                   # React components
│   ├── ui/                       # shadcn/ui base components
│   ├── charts/                   # 6 chart components with real data
│   ├── company/                  # Company information components
│   ├── market/                   # Market data display components
│   ├── statements/               # Financial statement tables
│   ├── DateRangePicker.tsx       # Date selection component
│   ├── FinancialRatiosDashboard.tsx # Ratios overview
│   ├── FinancialStatementsTabs.tsx # Statement navigation
│   ├── FloatingNav.tsx           # Navigation component
│   ├── MetricCard.tsx            # Key metrics display
│   ├── SWRProvider.tsx          # Global SWR configuration
│   └── TickerSelector.tsx        # Stock ticker input
├── contexts/                     # React Context providers
│   └── TickerContext.tsx         # Global ticker/date/period state
├── hooks/                        # Custom React hooks
│   ├── useCompanyData.ts         # Company information fetching
│   ├── useMarketData.ts          # Market data fetching
│   └── useStockData.ts           # Main data fetching hook (9 endpoints)
├── lib/                          # Utilities and configurations
│   ├── api/                      # OpenAPI-generated API client
│   │   ├── facade.ts             # Clean facade layer (20+ typed endpoints)
│   │   ├── client.ts             # Generated client configuration
│   │   └── generated/            # Auto-generated OpenAPI client (~35 files)
│   ├── formatters.ts             # Vietnamese data formatting utilities
│   ├── statement-fields.ts       # Field mapping utilities
│   ├── swr-config.ts             # SWR caching configuration
│   └── utils.ts                  # General utility functions
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts               # Next.js configuration
└── components.json               # shadcn/ui configuration
```

### State Management Architecture

**Global State:**
- **TickerContext**: Manages ticker symbol, date range, and period selection
- **Provider Pattern**: Context wraps entire application in `layout.tsx`
- **State Persistence**: Browser session storage for parameter persistence

**Data Fetching:**
- **SWR Library**: Smart caching with request deduplication
- **3-Stage Loading**: Critical → Secondary → Deferred data loading
- **Cache Strategy**:
  - Financial data: 5 minutes
  - Reference data: 1 hour
  - Industry benchmarks: 10 minutes
- **Error Handling**: Graceful fallbacks with retry logic

### API Integration

#### API Client Architecture (OpenAPI Facade Layer)

The frontend uses an **OpenAPI-generated facade layer** (`lib/api/facade.ts`) with 20+ typed endpoint wrappers automatically synced with backend Pydantic schemas:

```typescript
import api from '@/lib/api/facade';

export const api = {
  company: api.company,     // 8 endpoints (overview, profile, ratios, etc.)
  statements: api.statements, // 1 endpoint (financial statements)
  prices: api.prices,       // 4 endpoints (stock prices, exchange rates, gold)
  industry: api.industry,   // 4 endpoints (industry benchmarks)
};
```

**Facade Benefits:**
- Auto-synced types from backend (no manual type updates)
- 80% less boilerplate code
- Single source of truth (backend Pydantic schemas)
- Type-safe API calls with full IDE autocomplete

#### Data Flow

1. **User Input** → TickerContext updates state (ticker, date range, period)
2. **useStockData Hook** → Multiple SWR requests with intelligent caching (9 endpoints)
3. **Data Transformation** → API format → Chart format (memoized transformations)
4. **Component Props** → Transformed data passed to 6 chart components
5. **Chart Rendering** → Display with Vietnamese formatting and interactive tooltips

#### useStockData Hook Features

- Fetches data from 9 different API endpoints
- Progressive loading with separate states
- Automatic caching and revalidation
- Error aggregation from all requests
- TypeScript interfaces for all data structures

### Chart System (6 Integrated Components)

#### Chart Types with Real Data

1. **ChartAreaGradient** - Revenue & Profitability Trends
2. **ChartLineMultiple** - Stock Price Movement (OHLCV)
3. **ChartBarDefault** - Quarterly Revenue Comparison
4. **ChartRadialStacked** - Profitability Gauges (ROE/ROA/ROIC)
5. **ChartRadarMultiple** - Financial Ratios Comparison
6. **ChartBarNegative** - Insider Trading Activity

#### Chart Features

- Real API data integration
- Loading skeleton states
- Error boundary handling
- Responsive design
- Vietnamese formatting
- Interactive tooltips
- Trend calculations

### Development Guidelines

#### Component Development

- Use TypeScript interfaces for all props and data structures
- Implement proper error boundaries for chart components
- Use React.memo for expensive component renders
- Apply useMemo for data transformations
- Follow shadcn/ui component patterns

#### Data Fetching Best Practices

- Use SWR hooks for all API calls
- Implement proper cache key strategies
- Handle loading and error states gracefully
- Use the appropriate cache duration for data type
- Deduplicate requests automatically

#### Styling Guidelines

- Use Tailwind CSS classes with Tailwind v4 syntax
- Apply CSS variables for theming
- Follow shadcn/ui component patterns
- Ensure responsive design with mobile-first approach
- Use proper Vietnamese typography and spacing

#### Vietnamese Data Formatting

- Currency: VND with compact notation (1.2B, 450M)
- Dates: Vietnamese date formatting
- Percentages: Proper percentage display for ratios
- Numbers: Vietnamese number formatting conventions

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Testing Approach

#### Manual Testing Strategy

- Manual testing in multiple browsers
- Test data loading states and error scenarios
- Verify Vietnamese formatting correctness
- Check responsive behavior on different screen sizes
- Test API integration with real backend data

#### Component Testing

- Test chart components with real API data
- Verify error boundary handling
- Check loading skeleton states
- Test responsive design behavior
- Validate Vietnamese number/currency formatting

#### Performance Considerations

- Implement lazy loading for charts
- Use SWR caching to minimize API calls
- Optimize data transformations with useMemo
- Consider virtualization for large datasets
- Monitor bundle size and load times

### Key Dependencies

#### Core Dependencies

- **React 19.2.0** - Modern React with strict TypeScript
- **Next.js 16.0.3** - Full-stack React framework with App Router
- **TypeScript 5** - Type safety with strict mode
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library

#### Data and State Management

- **SWR 2.3.6** - Data fetching with caching
- **date-fns** - Date manipulation and formatting

#### Visualization and UI

- **Recharts 2.15.4** - Chart library for React
- **D3.js 7.9.0** - Data visualization library
- **Lucide React** - Beautiful icon library
- **next-themes** - Theme management

### Development Tools

#### Adding New shadcn/ui Components

```bash
bunx shadcn@latest add [component-name]
```

Available components: button, card, chart, tabs, progress, sonner, and more.

#### Linting and Code Quality

- ESLint with Next.js rules
- TypeScript strict mode
- Automatic code formatting with Prettier (configured in Next.js)

### Current Implementation Status

#### ✅ Completed Features

- Next.js foundation with TypeScript
- Complete API integration layer (20+ endpoints)
- All 6 chart components with real data integration
- Global state management with Context
- SWR caching with intelligent strategies
- Error handling and loading states
- Responsive design system
- Vietnamese data formatting
- shadcn/ui component library

#### 🔄 Active Development

- Enhanced company information sections
- Market data visualization improvements
- Financial statements table refinements
- Additional chart types and features
- Mobile optimization enhancements

### Data Fetching Pattern

Use the `useStockData` hook for parallel API calls (uses facade internally):

```typescript
import { useStockData } from '@/hooks/useStockData';
import { useTicker } from '@/contexts/TickerContext';

function Component() {
  const { ticker, startDate, endDate, period } = useTicker();
  const { data, loading, error } = useStockData(
    ticker,
    startDate,
    endDate,
    period
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

**Direct Facade Usage:**

For custom API calls, import directly from the facade:

```typescript
import api from '@/lib/api/facade';
import type { CompanyOverview } from '@/lib/api/facade';

async function fetchCompanyData(ticker: string) {
  const overview: CompanyOverview = await api.company.getOverview(ticker);
  return overview;
}
```

### State Management Pattern

The app uses React Context for global state:

```typescript
import { useTicker } from '@/contexts/TickerContext';

function Component() {
  const { ticker, setTicker, startDate, setStartDate, endDate, setEndDate, period, setPeriod } = useTicker();

  // Use state as needed
}
```

This frontend architecture supports a modern, type-safe, and performant Vietnamese stock market analysis application with comprehensive data visualization capabilities.