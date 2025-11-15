"""API routes for industry benchmark data."""

from fastapi import APIRouter, HTTPException, Path, Query
from typing import Optional

from app.services.service_industry_benchmark import (
    get_industry_benchmark_ratios,
    get_industry_classification_map
)
from app.schemas.schema_industry_benchmark import (
    IndustryBenchmark,
    IndustryBenchmarkRequest
)

router = APIRouter(prefix="/api/industry", tags=["industry-benchmark"])


@router.get("/benchmark/{industry_id}", response_model=IndustryBenchmark)
async def get_industry_benchmark_by_id(
    industry_id: int = Path(..., description="Industry ID (ICB classification code)"),
    min_companies: int = Query(5, description="Minimum companies required for valid benchmark")
) -> IndustryBenchmark:
    """
    Get industry benchmark financial ratios by industry ID.

    Fetches financial ratios for all companies in the specified industry and calculates
    statistical benchmarks (mean, median, percentiles) for comparison.

    Args:
        industry_id: ICB industry classification code
        min_companies: Minimum number of companies required for valid benchmark

    Returns:
        IndustryBenchmark: Statistical benchmarks for key financial ratios

    Raises:
        HTTPException: If industry not found or insufficient data available
    """
    try:
        benchmark_data = get_industry_benchmark_ratios(
            industry_id=industry_id,
            min_companies=min_companies
        )
        return IndustryBenchmark(**benchmark_data)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve industry benchmark: {str(e)}")


@router.get("/benchmark", response_model=IndustryBenchmark)
async def get_industry_benchmark_by_name(
    industry_name: str = Query(..., description="Industry name"),
    min_companies: int = Query(5, description="Minimum companies required for valid benchmark")
) -> IndustryBenchmark:
    """
    Get industry benchmark financial ratios by industry name.

    Fetches financial ratios for all companies in the specified industry and calculates
    statistical benchmarks (mean, median, percentiles) for comparison.

    Args:
        industry_name: Name of the industry
        min_companies: Minimum number of companies required for valid benchmark

    Returns:
        IndustryBenchmark: Statistical benchmarks for key financial ratios

    Raises:
        HTTPException: If industry not found or insufficient data available
    """
    try:
        benchmark_data = get_industry_benchmark_ratios(
            industry_name=industry_name,
            min_companies=min_companies
        )
        return IndustryBenchmark(**benchmark_data)

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve industry benchmark: {str(e)}")


@router.get("/classifications")
async def get_industry_classifications() -> dict[str, str]:
    """
    Get mapping of industry ID to industry names.

    Returns:
        Dictionary mapping industry codes to industry names for reference
    """
    try:
        classification_map = get_industry_classification_map()
        return classification_map

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve industry classifications: {str(e)}")


@router.get("/benchmark/company/{ticker}")
async def get_company_industry_benchmark(
    ticker: str = Path(..., description="Stock ticker symbol")
) -> IndustryBenchmark:
    """
    Get industry benchmark for a specific company's industry.

    Automatically determines the company's industry and returns benchmark data
    for that industry.

    Args:
        ticker: Stock ticker symbol

    Returns:
        IndustryBenchmark: Statistical benchmarks for the company's industry

    Raises:
        HTTPException: If company not found or industry data unavailable
    """
    try:
        import pandas as pd
        from vnstock import Vnstock

        # Get company overview to determine industry
        stock = Vnstock().stock(symbol=ticker, source='VCI')
        company = stock.company
        overview_df = company.overview()

        if overview_df.empty:
            raise HTTPException(status_code=404, detail=f"Company overview not found for ticker: {ticker}")

        # Extract industry information
        row = overview_df.iloc[0]
        industry_id = None
        industry_name = None

        # Try to get industry names from overview (using ICB naming)
        if 'icb_name3' in overview_df.columns:
            industry_name_val = row.get('icb_name3')
            if industry_name_val and not pd.isna(industry_name_val):
                industry_name = str(industry_name_val)
        elif 'icb_name2' in overview_df.columns:
            industry_name_val = row.get('icb_name2')
            if industry_name_val and not pd.isna(industry_name_val):
                industry_name = str(industry_name_val)

        # Try to match industry name to get industry code
        if industry_name:
            classification_map = get_industry_classification_map()
            for icb_code, icb_name in classification_map.items():
                if industry_name.lower() in icb_name.lower() or icb_name.lower() in industry_name.lower():
                    try:
                        industry_id = int(icb_code)
                        break
                    except ValueError:
                        continue

        # Get benchmark data
        benchmark_data = get_industry_benchmark_ratios(
            industry_id=industry_id,
            industry_name=industry_name,
            min_companies=5
        )

        return IndustryBenchmark(**benchmark_data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve company industry benchmark: {str(e)}")