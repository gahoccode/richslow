from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, Query

from app.schemas.schema_common import PeriodType
from app.schemas.schema_statements import FinancialStatementsResponse, StatementsRequest
from app.services.service_statements import get_financial_statements

router = APIRouter(prefix="/api", tags=["Financial Statements"])


@router.post("/statements", response_model=FinancialStatementsResponse)
async def fetch_financial_statements(request: StatementsRequest):
    """
    Fetch comprehensive financial statements for a given stock ticker.

    Returns income statement, balance sheet, and cash flow data.
    """
    try:
        return get_financial_statements(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/statements/{ticker}", response_model=FinancialStatementsResponse)
async def fetch_financial_statements_get(
    ticker: str,
    period: PeriodType = PeriodType.yearly,
    years: int = Query(5, ge=1, le=20, description="Number of years to fetch"),
):
    """
    Fetch financial statements using GET method for easier frontend integration.

    Returns the last N years of financial statements (annual or quarterly).
    """
    try:
        # Calculate date range based on years parameter
        end_date = datetime.now()
        start_date = end_date - timedelta(days=years * 365)

        # Format dates as YYYY-MM-DD strings
        start_date_str = start_date.strftime("%Y-%m-%d")
        end_date_str = end_date.strftime("%Y-%m-%d")

        request = StatementsRequest(
            ticker=ticker,
            start_date=start_date_str,
            end_date=end_date_str,
            period=period,
        )
        return get_financial_statements(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Internal server error: {str(e)}"
        ) from e


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "richslow-api"}
