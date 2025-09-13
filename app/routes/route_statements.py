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
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    period: PeriodType = PeriodType.yearly,
):
    """
    Fetch financial statements using GET method for easier frontend integration.
    """
    try:
        request = StatementsRequest(
            ticker=ticker, start_date=start_date, end_date=end_date, period=period
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
