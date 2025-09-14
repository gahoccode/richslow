from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.routes.route_statements import router as statements_router
from app.routes.route_valuation import router as valuation_router

app = FastAPI(
    title="RichSlow Financial Analysis API",
    description="Vietnamese stock market financial analysis platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(statements_router)
app.include_router(valuation_router)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")


# Serve frontend pages
@app.get("/")
async def serve_index():
    """Serve the main landing page."""
    return FileResponse("static/index.html")


@app.get("/statements")
async def serve_statements():
    """Serve the financial statements page."""
    return FileResponse("static/statements.html")


@app.get("/valuation")
async def serve_valuation():
    """Serve the valuation analysis page."""
    return FileResponse("static/valuation.html")


# Health check at root level
@app.get("/health")
async def root_health():
    """Root health check."""
    return {"status": "healthy", "message": "RichSlow API is running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
