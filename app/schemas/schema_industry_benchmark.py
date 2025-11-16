"""Pydantic schemas for industry benchmark data."""

from pydantic import BaseModel, Field


class RatioBenchmark(BaseModel):
    """Statistical benchmark for a single financial ratio."""

    mean: float = Field(..., description="Industry average (mean)")
    median: float = Field(..., description="Industry median")
    p25: float = Field(..., description="25th percentile")
    p75: float = Field(..., description="75th percentile")
    std: float = Field(..., description="Standard deviation")
    count: int = Field(..., description="Number of companies in calculation")


class IndustryBenchmark(BaseModel):
    """Industry benchmark data for financial ratios comparison."""

    industry_name: str = Field(..., description="Name of the industry")
    industry_id: int | None = Field(None, description="Industry ID (ICB code)")
    company_count: int = Field(..., description="Total companies in industry")
    companies_analyzed: int = Field(..., description="Companies successfully analyzed")
    benchmarks: dict[str, RatioBenchmark] = Field(
        ..., description="Ratio benchmarks by name"
    )
    ratios_available: list[str] = Field(
        ..., description="List of available ratio benchmarks"
    )


class IndustryBenchmarkRequest(BaseModel):
    """Request model for industry benchmark data."""

    industry_id: int | None = Field(
        None, description="Industry ID (ICB classification)"
    )
    industry_name: str | None = Field(None, description="Industry name for lookup")
    min_companies: int = Field(
        5, description="Minimum companies required for valid benchmark"
    )
