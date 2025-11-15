"""API routes for quarterly financial ratios."""

from fastapi import APIRouter, HTTPException, Path
from app.services.service_statements import get_financial_statements
from app.schemas.schema_statements import StatementsRequest

router = APIRouter(prefix="/api/quarterly", tags=["quarterly-ratios"])


@router.get("/ratios/{ticker}")
async def get_quarterly_ratios(
    ticker: str = Path(..., description="Stock ticker symbol"),
):
    """
    Get quarterly financial ratios for a specific company.

    Retrieves quarterly financial ratios including cash conversion cycle data
    for enhanced drill-down analysis on the dashboard.

    Args:
        ticker: Stock ticker symbol (e.g., 'VCB', 'FPT')

    Returns:
        Quarterly financial statements with ratios data

    Raises:
        HTTPException: If ticker is invalid or data retrieval fails
    """
    try:
        request = StatementsRequest(
            ticker=ticker.upper(),
            period="quarter",  # Force quarterly period
            start_date="2020-01-01",  # Default range for sufficient data
            end_date="2025-12-31",
        )

        statements_data = get_financial_statements(request)
        return statements_data

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve quarterly ratios: {str(e)}"
        ) from e
