Product Requirements Document (PRD)

Project: Web App with Decoupled Python Backend and Static Frontend

⸻

1. Overview

This project is a web application with a Python backend providing API endpoints and a Flowbite/Tailwind-based frontend. The backend will use Pydantic models for data validation, establishing a shared contract between backend and frontend.

The frontend will initially be implemented as a static Flowbite-CDN site, but the system must be designed for a smooth migration to a React/Vite frontend later without requiring significant backend changes.

Referenced Frontend Spec: [Flowbite CDN Frontend Spec](https://raw.githubusercontent.com/gahoccode/PRDs/refs/heads/main/web-app/flask/flowbite-cdn-frontend.md)

⸻

2. Goals & Objectives
	•	Deliver a lightweight, secure, and maintainable web app
	•	Ensure backend logic is decoupled and reusable across multiple frontends
	•	Use Pydantic schemas as the single source of truth for API contracts
	•	Establish coding conventions that enforce clarity and consistency
	•	Provide a clean routing flow for the frontend, with state stored client-side
	•	Prepare for future frontend migration with minimal friction

⸻

3. Architecture

3.1 Backend (Python API Layer)



Directory Structure:
```
app/
├── main.py              # Entry point
├── routes/              # Define endpoint handlers
│   ├── route_statements.py    # /statements route - financial statements
│   ├── route_optimize.py      # /optimize route - charts and visualization
│   ├── route_tearsheet.py     # /tearsheet route - financial tearsheet
│   └── route_valuation.py     # /valuation route - charts, tables and visualization
├── schemas/             # Pydantic models (request/response contracts)
│   ├── schema_statements.py     # Financial statements schemas
│   ├── schema_optimize.py     # Optimization analysis schemas
│   ├── schema_tearsheet.py    # Tearsheet schemas
│   ├── schema_valuation.py      # Valuation schemas
│   └── schema_common.py       # Shared schemas (ticker, date range, period)
├── services/            # Business logic / domain layer
│   ├── service_statements.py    # Financial statements processing
│   ├── service_optimize.py    # Portfolio optimization logic
│   ├── service_tearsheet.py   # Tearsheet generation
│   └── service_valuation.py   # Valuation calculations
└── db/                  # Database / ORM models, sessions, etc.
```


Key Features:
	•	Built with Python web framework (e.g., FastAPI)
	•	Provides REST API endpoints for data access and analysis
	•	Validates all requests and responses with Pydantic
	•	Uses centralized Pydantic models stored in schemas/ directory
	•	Functions must use type hints as inline documentation
	•	Business logic functions must include docstrings
	•	API endpoints expose only validated, serialized responses
	•	OpenAPI/Swagger auto-generated from FastAPI

3.2 Coding Conventions

1. **Type Hints**: All Python functions must use type hints (parameters and return types).

2. **Docstrings**: All business logic functions (those in services/) must have docstrings that describe:
   - What the function does (purpose)
   - Its inputs & outputs (types, semantic meaning)
   - Any side effects or important business rules / constraints

3. **Shared Contract**: 
   - Pydantic models in schemas/ are the single source of truth
   - Backend shouldn't duplicate schema logic elsewhere
   - Use common schemas for repeated structures (e.g. error responses, pagination, user profile)


Example of proper function implementation:
```python
from typing import List, Optional
from datetime import datetime
from app.schemas.schema_optimize import PortfolioAnalysis  # Import from schemas directory

def calculate_portfolio_metrics(
    tickers: List[str],
    start_date: str,
    end_date: str,
    risk_free_rate: float = 0.02
) -> PortfolioAnalysis:
    """
    Calculate portfolio performance metrics including expected return, volatility, and Sharpe ratio.
    
    Args:
        tickers: List of stock ticker symbols (e.g., ['AAPL', 'GOOGL', 'MSFT'])
        start_date: Start date for analysis period in 'YYYY-MM-DD' format
        end_date: End date for analysis period in 'YYYY-MM-DD' format
        risk_free_rate: Annual risk-free rate (default: 0.02 for 2%)
    
    Returns:
        PortfolioAnalysis object containing calculated metrics
        
    Side Effects:
        - Makes API calls to fetch historical price data
        - Performs statistical calculations on price returns
        
    Business Rules:
        - Minimum 30 days of data required for meaningful calculations
        - All tickers must be valid and have data for the specified period
        - Risk-free rate should be annualized
    """
    # Implementation here
    pass
```

3.2 Frontend (General Routing Overview)
	•	Landing Page (/): Input form for ticker, date range, and time period
	•	Financial Statements Page (/statements): Displays income statement, balance sheet, and cash flow data as tables
	•	Future Pages: Ratios (/ratios), Charts (/charts), AI Insights (/ai-insights)
	•	State Management: User inputs persist across pages so the user only enters them once per session

⸻

4. Requirements

4.1 Functional Requirements
	•	Users can submit input (ticker, date range, period)
	•	Backend validates requests with Pydantic
	•	Frontend stores user input client-side and reuses it across analysis pages
	•	API responses strictly conform to Pydantic models

4.2 Non-Functional Requirements
	•	Maintainability: Routing should be simple and portable to React/Vite later
	•	Scalability: Additional analysis pages can be added without redesigning routing
	•	User Experience: Input once, analyze across multiple pages

⸻

5. Future Considerations
	•	More analysis pages can be added with minimal changes to routing
	•	Migration to React/Vite should use global state (Context/Redux/Zustand) in place of sessionStorage
	•	Add deep-linking later if sharing URLs with embedded parameters becomes important

6. Tests
	• tests suite verifying routing, pydantic model imports

⸻

Routing Design Document

Version: 1.0

⸻

1. Routing Map
	•	/ → Input form page
	•	/statements → Financial statements (tables)
	•	/tearsheet (future) → Financial tearsheet
	•	/optimize (future) → Charts and visualization
	•	/valuation (future) → Charts, tables and visualization
   

⸻

2. State Persistence
	•	Mechanism: Browser sessionStorage
	•	Stored Object (key: analysisParams):

{
  "ticker": "AAPL",
  "startDate": "2020-01-01",
  "endDate": "2023-12-31",
  "period": "quarterly"
}


⸻

3. Page Flow

/ (Input Form Page)
	•	Collects: ticker, date range, period
	•	On “Analyze”:
	1.	Save inputs to sessionStorage
	2.	Redirect to /statements

/statements (Financial Statements Page)
	•	On load:
	1.	Read params from sessionStorage
	2.	Call backend /api/statements
	3.	Display results as tables

/optimize (Future)
	•	On load:
	1.	Read params from sessionStorage
	2.	Call backend /api/optimize
	3.	Render efficient frontier visualization

/tearsheet (Future)
	•	On load:
	1.	Read params from sessionStorage
	2.	Call backend /api/tearsheet
	3.	Display generated html 

/valuation (Future)
	•	On load:
	1.	Read params from sessionStorage
	2.	Call backend /api/tearsheet
	3.	Display generated tables, charts
⸻

4. JavaScript Helpers


// Save inputs
function saveParams(ticker, startDate, endDate, period) {
  sessionStorage.setItem("analysisParams", JSON.stringify({ ticker, startDate, endDate, period }));
}

// Retrieve inputs
function getParams() {
  const data = sessionStorage.getItem("analysisParams");
  return data ? JSON.parse(data) : null;
}


⸻

5. Migration Notes (React/Vite)
	•	Replace sessionStorage with global state (React Context, Redux, Zustand)
	•	Routing remains the same, just implemented via React Router or Next.js
	•	API calls reuse the same params object from context
