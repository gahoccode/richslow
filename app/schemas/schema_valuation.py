from pydantic import BaseModel, Field

from app.schemas.schema_common import AnalysisRequest


class ValuationRequest(AnalysisRequest):
    """Reuses ticker, start_date, end_date, period from AnalysisRequest for consistency."""



class BetaMetrics(BaseModel):
    """Standalone beta calculation results - reusable across applications."""

    ticker: str = Field(..., description="Stock ticker symbol")
    year_report: int | None = Field(None, description="Report year")
    beta: float = Field(..., description="Beta coefficient vs market index")
    correlation: float = Field(..., description="Correlation coefficient with market")
    r_squared: float = Field(..., description="R-squared of beta regression")
    volatility_stock: float = Field(
        ..., description="Stock price volatility (annualized)"
    )
    volatility_market: float = Field(..., description="Market volatility (annualized)")
    data_points_used: int = Field(
        ..., description="Number of trading days used in calculation"
    )
    start_date: str = Field(..., description="Analysis start date")
    end_date: str = Field(..., description="Analysis end date")


class WACCMetrics(BaseModel):
    """Standalone WACC calculation results - reusable for financial analysis tools."""

    ticker: str = Field(..., description="Stock ticker symbol")
    year_report: int | None = Field(None, description="Report year")
    wacc: float = Field(..., description="Weighted Average Cost of Capital")
    cost_of_equity: float = Field(..., description="Cost of equity using CAPM")
    cost_of_debt: float = Field(..., description="After-tax cost of debt")
    market_value_equity: float = Field(
        ..., description="Market value of equity (Bn VND)"
    )
    market_value_debt: float = Field(..., description="Market value of debt (Bn VND)")
    total_value: float = Field(..., description="Total firm value (Bn VND)")
    equity_weight: float = Field(..., description="Equity weight in capital structure")
    debt_weight: float = Field(..., description="Debt weight in capital structure")
    tax_rate: float = Field(..., description="Corporate tax rate used")
    risk_free_rate: float = Field(..., description="Risk-free rate used in CAPM")
    market_risk_premium: float = Field(..., description="Market risk premium used")
    beta: float = Field(..., description="Beta used in cost of equity calculation")


class ValuationMetrics(BaseModel):
    """Complete valuation analysis combining beta, WACC, and additional metrics."""

    ticker: str = Field(..., description="Stock ticker symbol")
    year_report: int | None = Field(None, description="Report year")

    # Beta Analysis
    beta: float = Field(..., description="Beta coefficient vs VNINDEX")
    correlation: float = Field(..., description="Correlation with market")
    r_squared: float = Field(..., description="Beta regression R-squared")
    stock_volatility: float = Field(..., description="Stock volatility (annualized)")
    market_volatility: float = Field(..., description="Market volatility (annualized)")

    # WACC Components
    wacc: float = Field(..., description="Weighted Average Cost of Capital")
    cost_of_equity: float = Field(..., description="Cost of equity (CAPM)")
    cost_of_debt: float = Field(..., description="After-tax cost of debt")

    # Market Values
    market_cap: float = Field(..., description="Market capitalization (Bn VND)")
    total_debt: float = Field(..., description="Total debt (Bn VND)")
    enterprise_value: float = Field(..., description="Enterprise value (Bn VND)")

    # Capital Structure
    equity_weight: float = Field(..., description="Equity weight in capital structure")
    debt_weight: float = Field(..., description="Debt weight in capital structure")

    # Risk Metrics
    financial_leverage: float | None = Field(
        None, description="Financial leverage ratio"
    )
    interest_coverage: float | None = Field(None, description="Interest coverage ratio")

    # Market Assumptions Used
    risk_free_rate: float = Field(..., description="Risk-free rate assumption")
    market_risk_premium: float = Field(
        ..., description="Market risk premium assumption"
    )
    tax_rate: float = Field(..., description="Tax rate used")

    # Data Quality
    data_points_used: int = Field(
        ..., description="Trading days used for beta calculation"
    )
    start_date: str = Field(..., description="Analysis period start")
    end_date: str = Field(..., description="Analysis period end")


class BetaResponse(BaseModel):
    """Lightweight beta-only response for external applications."""

    ticker: str = Field(..., description="Stock ticker symbol")
    period: str = Field(..., description="Analysis period")
    beta_metrics: BetaMetrics = Field(..., description="Beta calculation results")
    data_quality: dict[str, str | int | float] = Field(
        ..., description="Data alignment and quality metrics"
    )


class WACCResponse(BaseModel):
    """Standalone WACC response for financial analysis applications."""

    ticker: str = Field(..., description="Stock ticker symbol")
    period: str = Field(..., description="Analysis period")
    wacc_metrics: WACCMetrics = Field(..., description="WACC calculation results")
    assumptions: dict[str, float] = Field(
        ..., description="Market assumptions used in calculations"
    )


class ValuationResponse(BaseModel):
    """Complete valuation response for comprehensive analysis applications."""

    ticker: str = Field(..., description="Stock ticker symbol")
    period: str = Field(..., description="Analysis period")
    valuation_metrics: list[ValuationMetrics] = Field(
        ..., description="Valuation metrics by time period"
    )
    summary: dict[str, float] = Field(..., description="Key valuation summary metrics")
    data_quality: dict[str, str | int | float] = Field(
        ..., description="Data alignment and statistical quality metrics"
    )
    assumptions: dict[str, float] = Field(
        ..., description="Market assumptions and parameters used"
    )
    years: list[int] = Field(..., description="Available analysis years")
    raw_data: dict[str, list[dict]] | None = Field(
        None, description="Raw calculation data for debugging"
    )
