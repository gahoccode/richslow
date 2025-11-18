import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.route_company import router as company_router
from app.routes.route_historical_prices import router as historical_router
from app.routes.route_industry_benchmark import router as industry_benchmark_router
from app.routes.route_quarterly_ratios import router as quarterly_ratios_router
from app.routes.route_statements import router as statements_router

app = FastAPI(
    title="RichSlow Financial Analysis API",
    description="Vietnamese stock market financial analysis platform - Backend API Service",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Get frontend URL from environment variable
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3001")

# Add CORS middleware with specific frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:3001",  # Local development
        "https://richslow-frontend.onrender.com"  # Render deployment
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(statements_router)
app.include_router(historical_router)
app.include_router(company_router)
app.include_router(industry_benchmark_router)
app.include_router(quarterly_ratios_router)

# Health check endpoint for monitoring
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    return {
        "status": "healthy",
        "service": "richslow-api",
        "version": "2.0.0",
        "frontend_url": frontend_url
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
