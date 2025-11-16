"""Industry benchmark service for financial ratio comparison."""

from typing import Any

import pandas as pd
from vnstock import Listing, Vnstock
from vnstock.core.utils.transform import flatten_hierarchical_index

from app.utils.transform import (
    safe_get_float,
)


def get_industry_benchmark_ratios(
    industry_id: int | None = None,
    industry_name: str | None = None,
    min_companies: int = 5,
) -> dict[str, Any]:
    """
    Calculate industry benchmark financial ratios for comparison.

    Fetches all companies in the specified industry, calculates their financial ratios,
    and returns industry averages, medians, and percentiles for benchmark comparison.

    Args:
        industry_id: Industry ID from company overview (ICB classification)
        industry_name: Industry name for fallback lookup
        min_companies: Minimum number of companies required for valid benchmark

    Returns:
        Dictionary containing:
        - industry_name: Name of the industry
        - company_count: Number of companies in the benchmark
        - benchmarks: Dictionary of ratio statistics (mean, median, 25th, 75th percentiles)
        - ratios_available: List of available ratio names

    Raises:
        ValueError: If industry cannot be determined or insufficient data
        Exception: If data retrieval fails
    """
    try:
        # Get industry mapping and companies
        industry_data = _get_industry_companies(industry_id, industry_name)

        if (
            not industry_data["companies"]
            or len(industry_data["companies"]) < min_companies
        ):
            raise ValueError(
                f"Insufficient companies found for industry benchmark. "
                f"Need at least {min_companies}, found {len(industry_data['companies'])}"
            )

        # Calculate benchmark ratios
        benchmark_data = _calculate_industry_benchmarks(industry_data["companies"])

        return {
            "industry_name": industry_data["industry_name"],
            "industry_id": industry_data["industry_id"],
            "company_count": len(industry_data["companies"]),
            "companies_analyzed": benchmark_data["companies_analyzed"],
            "benchmarks": benchmark_data["benchmarks"],
            "ratios_available": list(benchmark_data["benchmarks"].keys())
            if benchmark_data["benchmarks"]
            else [],
        }

    except ValueError:
        raise
    except Exception as e:
        raise Exception(f"Failed to retrieve industry benchmark data: {str(e)}") from e


def _get_industry_companies(
    industry_id: int | None, industry_name: str | None
) -> dict[str, Any]:
    """Get list of companies in the specified industry."""
    try:
        # Initialize vnstock listing
        listing = Listing()

        # Try to get industries mapping
        try:
            industries_df = listing.industries_icb()
            industries_dict = {}

            if not industries_df.empty:
                for _, row in industries_df.iterrows():
                    industries_dict[row.get("icb_code", "")] = row.get("icb_name", "")
        except Exception:
            industries_dict = {}

        # Determine industry name if we have industry_id
        determined_industry_name = industry_name
        determined_industry_id = industry_id

        if industry_id and not industry_name:
            determined_industry_name = industries_dict.get(
                str(industry_id), f"Industry {industry_id}"
            )

        # Get symbols by industries if possible
        companies_in_industry = []

        try:
            # Try to get symbols by industries
            symbols_by_industries = listing.symbols_by_industries()

            if not symbols_by_industries.empty and determined_industry_name:
                # Filter by industry name using ICB columns
                industry_mask = (
                    symbols_by_industries["icb_name3"].str.contains(
                        determined_industry_name, case=False, na=False
                    )
                    | symbols_by_industries["icb_name2"].str.contains(
                        determined_industry_name, case=False, na=False
                    )
                    | symbols_by_industries["icb_name4"].str.contains(
                        determined_industry_name, case=False, na=False
                    )
                )
                industry_companies_df = symbols_by_industries[industry_mask]

                if not industry_companies_df.empty:
                    companies_in_industry = industry_companies_df["symbol"].tolist()
        except Exception:
            # Fallback: try to get all symbols and filter
            try:
                all_symbols = listing.all_symbols()
                if not all_symbols.empty:
                    companies_in_industry = all_symbols["symbol"].tolist()[
                        :50
                    ]  # Limit for performance
            except Exception:
                companies_in_industry = [
                    "VCB",
                    "FPT",
                    "ACB",
                    "BID",
                    "CTG",
                    "HDB",
                    "MBB",
                    "TCB",
                    "VNM",
                    "HPG",
                ]  # Default list

        return {
            "industry_name": determined_industry_name or "Unknown Industry",
            "industry_id": determined_industry_id,
            "companies": companies_in_industry[:20],  # Limit for performance
        }

    except Exception as e:
        raise Exception(f"Failed to get industry companies: {str(e)}") from e


def _calculate_industry_benchmarks(companies: list[str]) -> dict[str, Any]:
    """Calculate benchmark ratios for the list of companies."""

    # Vietnamese to English ratio field mapping
    vietnamese_ratio_mapping = {
        # Valuation ratios
        "Chỉ tiêu định giá_P/E": "pe_ratio",
        "Chỉ tiêu định giá_P/B": "pb_ratio",
        "Chỉ tiêu định giá_P/S": "ps_ratio",
        "Chỉ tiêu định giá_EV/EBITDA": "ev_ebitda",
        # Profitability ratios
        "Chỉ tiêu khả năng sinh lợi_ROE (%)": "roe",
        "Chỉ tiêu khả năng sinh lợi_ROA (%)": "roa",
        "Chỉ tiêu khả năng sinh lợi_ROIC (%)": "roic",
        "Chỉ tiêu khả năng sinh lợi_Gross Margin (%)": "gross_margin",
        "Chỉ tiêu khả năng sinh lợi_Operating Margin (%)": "operating_margin",
        "Chỉ tiêu khả năng sinh lợi_Net Profit Margin (%)": "net_margin",
        # Efficiency ratios
        "Chỉ tiêu hiệu quả hoạt động_Asset Turnover": "asset_turnover",
        "Chỉ tiêu hiệu quả hoạt động_Inventory Turnover": "inventory_turnover",
        "Chỉ tiêu hiệu quả hoạt động_Days Sales Outstanding": "receivable_turnover",
        # Leverage ratios
        "Chỉ tiêu cơ cấu nguồn vốn_Debt/Equity": "debt_to_equity",
        "Chỉ tiêu cơ cấu nguồn vốn_Debt/Asset": "debt_to_assets",
        # Liquidity ratios
        "Chỉ thanh khoản Current Ratio": "current_ratio",
        "Chỉ thanh khoản Quick Ratio": "quick_ratio",
        # Cash conversion cycle
        "Chỉ tiêu hiệu quả hoạt động_Cash Conversion Cycle": "cash_conversion_cycle",
    }

    ratio_fields = list(vietnamese_ratio_mapping.values())
    ratio_data = {field: [] for field in ratio_fields}
    companies_analyzed = []

    for ticker in companies:
        try:
            # Get company ratios
            stock = Vnstock().stock(symbol=ticker, source="VCI")
            ratios_df = stock.finance.ratio(period="year", lang="en", dropna=False)

            if ratios_df.empty:
                continue

            # Flatten the hierarchical columns
            flattened_df = flatten_hierarchical_index(ratios_df)

            # Get the most recent year's data
            latest_ratio = flattened_df.iloc[-1] if not flattened_df.empty else None

            if latest_ratio is not None:
                companies_analyzed.append(ticker)

                # Extract ratio values using Vietnamese field mapping
                for vn_field, en_field in vietnamese_ratio_mapping.items():
                    value = safe_get_float(latest_ratio, vn_field)
                    if value is not None and value > 0:  # Only include positive values
                        ratio_data[en_field].append(value)

        except Exception as e:
            # Skip companies with data access issues
            print(f"Skipping {ticker} due to error: {e}")
            continue

    # Calculate statistics
    benchmarks = {}

    for field, values in ratio_data.items():
        if len(values) >= 3:  # Need at least 3 data points for meaningful stats
            values_series = pd.Series(values)
            benchmarks[field] = {
                "mean": float(values_series.mean()),
                "median": float(values_series.median()),
                "p25": float(values_series.quantile(0.25)),
                "p75": float(values_series.quantile(0.75)),
                "std": float(values_series.std()),
                "count": len(values),
            }

    return {"companies_analyzed": len(companies_analyzed), "benchmarks": benchmarks}


def get_industry_classification_map() -> dict[str, str]:
    """
    Get mapping of industry ID to industry names.

    Returns:
        Dictionary mapping industry codes to industry names
    """
    try:
        listing = Vnstock().listing
        industries_df = listing.industries_icb()

        if industries_df.empty:
            return {}

        industry_map = {}
        for _, row in industries_df.iterrows():
            icb_code = str(row.get("icb_code", ""))
            icb_name = row.get("icb_name", "")
            if icb_code and icb_name:
                industry_map[icb_code] = icb_name

        return industry_map

    except Exception:
        return {}
