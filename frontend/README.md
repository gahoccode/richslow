# RichSlow Frontend

Next.js frontend for the RichSlow Vietnamese stock market financial analysis platform.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts (primary), D3.js (for complex visualizations)
- **State Management**: React Context API
- **Icons**: Lucide React

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The frontend will be available at [http://localhost:3001](http://localhost:3001)

## Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Available Environment Variables

| Variable              | Description                | Default                 |
| --------------------- | -------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend FastAPI server URL | `http://localhost:8000` |

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Dashboard page
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── charts/              # Chart components
│       ├── ChartAreaGradient.tsx
│       ├── ChartBarDefault.tsx
│       └── ChartLineMultiple.tsx
├── contexts/
│   └── TickerContext.tsx    # Global state management
├── hooks/
│   └── useStockData.ts      # Data fetching hook
├── lib/
│   ├── api.ts               # API client (20+ endpoints)
│   ├── formatters.ts        # Data formatting utilities
│   └── utils.ts             # shadcn/ui utilities
├── public/                  # Static assets
├── .env.local              # Environment configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Scripts

| Command         | Description                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start development server on port 3001 |
| `npm run build` | Build production bundle               |
| `npm start`     | Start production server on port 3001  |
| `npm run lint`  | Run ESLint                            |

## Features

### Current Implementation

- ✅ Next.js 16 with App Router
- ✅ TypeScript type safety
- ✅ shadcn/ui component library
- ✅ Recharts integration
- ✅ Global state management (TickerContext)
- ✅ API client with 20+ endpoint wrappers
- ✅ Data formatting utilities
- ✅ Responsive layout with sticky header
- ✅ Toast notifications (Sonner)
- ✅ Example charts (Area, Bar, Line)

### API Integration

The frontend integrates with the FastAPI backend through a comprehensive API client (`lib/api.ts`) that provides typed interfaces for:

**Company Endpoints** (13 routes):

- Company overview and profile
- Shareholders and officers
- Subsidiaries
- Dividend history
- Insider trading data
- Corporate events
- News feed
- Financial ratios
- Trading statistics

**Financial Data Endpoints**:

- Financial statements (Income, Balance Sheet, Cash Flow)
- Stock prices (OHLCV data)
- Exchange rates
- Gold prices (SJC, BTMC)
- Quarterly ratios
- Industry benchmarks

All API calls include:

- TypeScript type safety
- Error handling
- Loading states
- Automatic retries (via useStockData hook)

## Development Notes

### Backend Dependency

The frontend requires the FastAPI backend to be running on `localhost:8000` (or the URL specified in `NEXT_PUBLIC_API_URL`).

To start the backend:

```bash
cd ../
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Adding New shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

Available components: button, card, chart, tabs, progress, sonner, and more.

### State Management

The app uses React Context for global state:

- `TickerContext`: Manages ticker symbol, date range, and analysis period
- Usage: `const { ticker, setTicker } = useTicker()`

### Data Fetching Pattern

Use the `useStockData` hook for parallel API calls:

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

## Building for Production

```bash
npm run build
npm start
```

The production server will run on port 3001.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Part of the RichSlow project. See main repository README for details.
