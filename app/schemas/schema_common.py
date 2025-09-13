from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class PeriodType(str, Enum):
    quarterly = "quarter"
    yearly = "year"


class AnalysisRequest(BaseModel):
    ticker: str = Field(
        ..., description="Stock ticker symbol", min_length=1, max_length=10
    )
    start_date: str = Field(..., description="Start date in YYYY-MM-DD format")
    end_date: str = Field(..., description="End date in YYYY-MM-DD format")
    period: PeriodType = Field(default=PeriodType.yearly, description="Analysis period")


class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    detail: str | None = Field(None, description="Detailed error information")
    code: str = Field(..., description="Error code")


class SuccessResponse(BaseModel):
    message: str = Field(..., description="Success message")
    data: dict | None = Field(None, description="Response data")


class HealthResponse(BaseModel):
    status: str = Field(..., description="Service health status")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="Response timestamp"
    )
