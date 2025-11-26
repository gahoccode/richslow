"""Company information service functions for vnstock integration.

This module provides service functions for retrieving and processing
company information from vnstock API, with proper data validation
and transformation using Pydantic models.
"""

from vnstock.explorer.tcbs import Company as TCBSCompany
from vnstock.explorer.vci import Company as VCICompany

from app.schemas.schema_company import (
    CompanyEventsTCBS,
    CompanyInsiderDeals,
    CompanyNews,
    CompanyOfficer,
    CompanyOverviewTCBS,
    CompanyProfile,
    CompanyRatioVCI,
    CompanyReportsVCI,
    CompanyShareholders,
    CompanySubsidiaries,
    DividendHistory,
    TradingStatsVCI,
)
from app.utils.transform import (
    safe_get_float,
    safe_get_int,
    safe_get_str,
)


def get_company_overview(ticker: str) -> CompanyOverviewTCBS:
    """Get company overview information from TCBS.

    Args:
        ticker: Stock ticker symbol (e.g., 'VCB', 'FPT')

    Returns:
        CompanyOverviewTCBS: Company overview data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = TCBSCompany(ticker)
        df = company.overview()

        if df.empty:
            raise ValueError(f"No overview data found for ticker {ticker}")

        # Extract data from the first row
        row = df.iloc[0]

        return CompanyOverviewTCBS(
            exchange=safe_get_str(row, "exchange") or "",
            industry=safe_get_str(row, "industry") or "",
            company_type=safe_get_str(row, "company_type") or "",
            no_shareholders=safe_get_int(row, "no_shareholders") or 0,
            foreign_percent=safe_get_float(row, "foreign_percent") or 0.0,
            outstanding_share=safe_get_float(row, "outstanding_share") or 0.0,
            issue_share=safe_get_float(row, "issue_share") or 0.0,
            established_year=str(safe_get_str(row, "established_year") or ""),
            no_employees=safe_get_int(row, "no_employees") or 0,
            stock_rating=safe_get_float(row, "stock_rating") or 0.0,
            delta_in_week=safe_get_float(row, "delta_in_week") or 0.0,
            delta_in_month=safe_get_float(row, "delta_in_month") or 0.0,
            delta_in_year=safe_get_float(row, "delta_in_year") or 0.0,
            short_name=safe_get_str(row, "short_name") or "",
            website=safe_get_str(row, "website") or "",
            industry_id=safe_get_int(row, "industry_id") or 0,
            industry_id_v2=safe_get_str(row, "industry_id_v2") or "",
        )

    except ValueError:
        raise  # Re-raise ValueError to be caught by route handler
    except Exception as e:
        raise Exception(
            f"Failed to retrieve company overview for {ticker}: {str(e)}"
        ) from e


def get_company_profile(ticker: str) -> CompanyProfile:
    """Get company profile information from TCBS.

    Args:
        ticker: Stock ticker symbol

    Returns:
        CompanyProfile: Company profile data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = TCBSCompany(ticker)
        df = company.profile()

        if df.empty:
            raise ValueError(f"No profile data found for ticker {ticker}")

        row = df.iloc[0]

        return CompanyProfile(
            company_name=safe_get_str(row, "company_name") or "",
            company_profile=safe_get_str(row, "company_profile") or "",
            history_dev=safe_get_str(row, "history_dev") or "",
            company_promise=safe_get_str(row, "company_promise") or None,
            business_risk=safe_get_str(row, "business_risk") or "",
            key_developments=safe_get_str(row, "key_developments") or "",
            business_strategies=safe_get_str(row, "business_strategies") or "",
        )

    except ValueError:
        raise  # Re-raise ValueError to be caught by route handler
    except Exception as e:
        raise Exception(
            f"Failed to retrieve company profile for {ticker}: {str(e)}"
        ) from e


def get_company_shareholders(ticker: str) -> list[CompanyShareholders]:
    """Get company shareholder information from TCBS.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyShareholders: Shareholder data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = TCBSCompany(ticker)
        df = company.shareholders()

        if df.empty:
            return []

        shareholders = []
        for _, row in df.iterrows():
            shareholders.append(
                CompanyShareholders(
                    share_holder=safe_get_str(row, "share_holder") or "",
                    share_own_percent=safe_get_float(row, "share_own_percent") or 0.0,
                )
            )

        return shareholders

    except Exception as e:
        raise Exception(
            f"Failed to retrieve company shareholders for {ticker}: {str(e)}"
        ) from e


def get_company_officers(ticker: str) -> list[CompanyOfficer]:
    """Get company officer information from TCBS.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyOfficer: Officer data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = TCBSCompany(ticker)
        df = company.officers()

        if df.empty:
            return []

        officers = []
        for _, row in df.iterrows():
            officers.append(
                CompanyOfficer(
                    officer_name=safe_get_str(row, "officer_name") or "",
                    officer_position=safe_get_str(row, "officer_position") or None,
                    officer_own_percent=safe_get_float(row, "officer_own_percent")
                    or 0.0,
                )
            )

        return officers

    except Exception as e:
        raise Exception(
            f"Failed to retrieve company officers for {ticker}: {str(e)}"
        ) from e


def get_company_subsidiaries(ticker: str) -> list[CompanySubsidiaries]:
    """Get company subsidiary information from TCBS.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanySubsidiaries: Subsidiary data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = TCBSCompany(ticker)
        df = company.subsidiaries()

        if df.empty:
            return []

        subsidiaries = []
        for _, row in df.iterrows():
            subsidiaries.append(
                CompanySubsidiaries(
                    sub_company_name=safe_get_str(row, "sub_company_name") or "",
                    sub_own_percent=safe_get_float(row, "sub_own_percent") or 0.0,
                )
            )

        return subsidiaries

    except Exception as e:
        raise Exception(
            f"Failed to retrieve company subsidiaries for {ticker}: {str(e)}"
        ) from e


def get_company_dividends(ticker: str) -> list[DividendHistory]:
    """Get company dividend history from TCBS.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of DividendHistory: Dividend data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = TCBSCompany(ticker)
        df = company.dividends()

        if df.empty:
            return []

        dividends = []
        for _, row in df.iterrows():
            dividends.append(
                DividendHistory(
                    exercise_date=str(safe_get_str(row, "exercise_date") or ""),
                    cash_year=safe_get_int(row, "cash_year") or 0,
                    cash_dividend_percentage=safe_get_float(
                        row, "cash_dividend_percentage"
                    )
                    or 0.0,
                    issue_method=safe_get_str(row, "issue_method") or "",
                )
            )

        return dividends

    except Exception as e:
        raise Exception(
            f"Failed to retrieve company dividends for {ticker}: {str(e)}"
        ) from e


def get_company_insider_deals(ticker: str) -> list[CompanyInsiderDeals]:
    """Get company insider trading information from TCBS.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyInsiderDeals: Insider deal data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = TCBSCompany(ticker)
        df = company.insider_deals()

        if df.empty:
            return []

        insider_deals = []
        for _, row in df.iterrows():
            insider_deals.append(
                CompanyInsiderDeals(
                    deal_announce_date=safe_get_str(row, "deal_announce_date"),
                    deal_method=safe_get_str(row, "deal_method") or None,
                    deal_action=safe_get_str(row, "deal_action") or "",
                    deal_quantity=safe_get_float(row, "deal_quantity") or 0.0,
                    deal_price=safe_get_float(row, "deal_price") or None,
                    deal_ratio=safe_get_float(row, "deal_ratio") or None,
                )
            )

        return insider_deals

    except Exception as e:
        raise Exception(
            f"Failed to retrieve company insider deals for {ticker}: {str(e)}"
        ) from e


def get_company_events(ticker: str) -> list[CompanyEventsTCBS]:
    """Get company corporate events from TCBS.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyEventsTCBS: Corporate event data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = TCBSCompany(ticker)
        df = company.events()

        if df.empty:
            return []

        events = []
        for _, row in df.iterrows():
            events.append(
                CompanyEventsTCBS(
                    rsi=safe_get_float(row, "rsi") or None,
                    rs=safe_get_float(row, "rs") or 0.0,
                    id=safe_get_int(row, "id") or 0,
                    price=safe_get_int(row, "price") or 0,
                    price_change=safe_get_int(row, "price_change") or 0,
                    price_change_ratio=safe_get_float(row, "price_change_ratio") or 0.0,
                    price_change_ratio_1m=safe_get_float(row, "price_change_ratio_1m")
                    or 0.0,
                    event_name=safe_get_str(row, "event_name") or "",
                    event_code=safe_get_str(row, "event_code") or "",
                    notify_date=str(safe_get_str(row, "notify_date") or ""),
                    exer_date=str(safe_get_str(row, "exer_date") or ""),
                    reg_final_date=str(safe_get_str(row, "reg_final_date") or ""),
                    exer_right_date=str(safe_get_str(row, "exer_right_date") or ""),
                    event_desc=safe_get_str(row, "event_desc") or "",
                )
            )

        return events

    except Exception as e:
        raise Exception(
            f"Failed to retrieve company events for {ticker}: {str(e)}"
        ) from e


def get_company_news(ticker: str) -> list[CompanyNews]:
    """Get company news from TCBS.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyNews: Company news data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = TCBSCompany(ticker)
        df = company.news()

        if df.empty:
            return []

        news_list = []
        for _, row in df.iterrows():
            news_list.append(
                CompanyNews(
                    rsi=safe_get_float(row, "rsi") or 0.0,
                    rs=safe_get_float(row, "rs") or 0.0,
                    price=safe_get_float(row, "price") or None,
                    price_change=safe_get_float(row, "price_change") or None,
                    price_change_ratio=safe_get_float(row, "price_change_ratio")
                    or None,
                    price_change_ratio_1m=safe_get_float(row, "price_change_ratio_1m")
                    or None,
                    id=safe_get_int(row, "id") or 0,
                    title=safe_get_str(row, "title") or "",
                    source=safe_get_str(row, "source") or "",
                    publish_date=str(safe_get_str(row, "publish_date") or ""),
                )
            )

        return news_list

    except Exception as e:
        raise Exception(
            f"Failed to retrieve company news for {ticker}: {str(e)}"
        ) from e


def get_company_ratio_vci(ticker: str) -> list[CompanyRatioVCI]:
    """Get company financial ratios from VCI.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyRatioVCI: Financial ratio data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = VCICompany(ticker)
        df = company.ratio_summary()

        if df.empty:
            return []

        ratios = []
        for _, row in df.iterrows():
            ratios.append(
                CompanyRatioVCI(
                    symbol=safe_get_str(row, "symbol") or "",
                    year_report=safe_get_int(row, "year_report") or 0,
                    length_report=safe_get_int(row, "length_report") or 0,
                    update_date=safe_get_int(row, "update_date") or 0,
                    revenue=safe_get_int(row, "revenue") or 0,
                    revenue_growth=safe_get_float(row, "revenue_growth") or 0.0,
                    net_profit=safe_get_int(row, "net_profit") or 0,
                    net_profit_growth=safe_get_float(row, "net_profit_growth") or 0.0,
                    ebit_margin=safe_get_int(row, "ebit_margin") or 0,
                    roe=safe_get_float(row, "roe") or 0.0,
                    roic=safe_get_int(row, "roic") or 0,
                    roa=safe_get_float(row, "roa") or 0.0,
                    pe=safe_get_float(row, "pe") or 0.0,
                    pb=safe_get_float(row, "pb") or 0.0,
                    eps=safe_get_float(row, "eps") or 0.0,
                    current_ratio=safe_get_int(row, "current_ratio") or 0,
                    cash_ratio=safe_get_int(row, "cash_ratio") or 0,
                    quick_ratio=safe_get_int(row, "quick_ratio") or 0,
                    interest_coverage=safe_get_str(row, "interest_coverage") or None,
                    ae=safe_get_float(row, "ae") or 0.0,
                    fae=safe_get_float(row, "fae") or 0.0,
                    net_profit_margin=safe_get_float(row, "net_profit_margin") or 0.0,
                    gross_margin=safe_get_int(row, "gross_margin") or 0,
                    ev=safe_get_int(row, "ev") or 0,
                    issue_share=safe_get_int(row, "issue_share") or 0,
                    ps=safe_get_float(row, "ps") or 0.0,
                    pcf=safe_get_float(row, "pcf") or 0.0,
                    bvps=safe_get_float(row, "bvps") or 0.0,
                    ev_per_ebitda=safe_get_int(row, "ev_per_ebitda") or 0,
                    at=safe_get_int(row, "at") or 0,
                    fat=safe_get_int(row, "fat") or 0,
                    acp=safe_get_str(row, "acp") or None,
                    dso=safe_get_int(row, "dso") or 0,
                    dpo=safe_get_int(row, "dpo") or 0,
                    eps_ttm=safe_get_float(row, "eps_ttm") or 0.0,
                    charter_capital=safe_get_int(row, "charter_capital") or 0,
                    rtq4=safe_get_int(row, "rtq4") or 0,
                    charter_capital_ratio=safe_get_float(row, "charter_capital_ratio")
                    or 0.0,
                    rtq10=safe_get_int(row, "rtq10") or 0,
                    dividend=safe_get_int(row, "dividend") or 0,
                    ebitda=safe_get_int(row, "ebitda") or 0,
                    ebit=safe_get_int(row, "ebit") or 0,
                    le=safe_get_int(row, "le") or 0,
                    de=safe_get_int(row, "de") or 0,
                    ccc=safe_get_str(row, "ccc") or None,
                    rtq17=safe_get_int(row, "rtq17") or 0,
                )
            )

        return ratios

    except Exception as e:
        raise Exception(
            f"Failed to retrieve company ratios for {ticker}: {str(e)}"
        ) from e


def get_company_reports_vci(ticker: str) -> list[CompanyReportsVCI]:
    """Get company financial reports from VCI.

    Args:
        ticker: Stock ticker symbol

    Returns:
        List of CompanyReportsVCI: Financial report data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = VCICompany(ticker)
        df = company.reports()

        if df.empty:
            return []

        reports = []
        for _, row in df.iterrows():
            reports.append(
                CompanyReportsVCI(
                    date=safe_get_str(row, "date") or "",
                    description=safe_get_str(row, "description") or "",
                    link=safe_get_str(row, "link") or "",
                    name=safe_get_str(row, "name") or "",
                )
            )

        return reports

    except Exception as e:
        raise Exception(
            f"Failed to retrieve company reports for {ticker}: {str(e)}"
        ) from e


def get_company_trading_stats_vci(ticker: str) -> TradingStatsVCI:
    """Get company trading statistics from VCI.

    Args:
        ticker: Stock ticker symbol

    Returns:
        TradingStatsVCI: Trading statistics data

    Raises:
        ValueError: If ticker is invalid or data retrieval fails
        Exception: For vnstock API errors
    """
    try:
        company = VCICompany(ticker)
        df = company.trading_stats()

        if df.empty:
            raise ValueError(f"No trading statistics found for ticker {ticker}")

        row = df.iloc[0]

        return TradingStatsVCI(
            symbol=safe_get_str(row, "symbol") or "",
            exchange=safe_get_str(row, "exchange") or "",
            ev=safe_get_int(row, "ev") or 0,
            ceiling=safe_get_int(row, "ceiling") or 0,
            floor=safe_get_int(row, "floor") or 0,
            foreign_room=safe_get_int(row, "foreign_room") or 0,
            avg_match_volume_2w=safe_get_int(row, "avg_match_volume_2w") or 0,
            foreign_holding_room=safe_get_int(row, "foreign_holding_room") or 0,
            current_holding_ratio=safe_get_float(row, "current_holding_ratio") or 0.0,
            max_holding_ratio=safe_get_float(row, "max_holding_ratio") or 0.0,
        )

    except ValueError:
        raise  # Re-raise ValueError to be caught by route handler
    except Exception as e:
        raise Exception(
            f"Failed to retrieve trading statistics for {ticker}: {str(e)}"
        ) from e
