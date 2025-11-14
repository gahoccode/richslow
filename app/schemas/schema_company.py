from datetime import datetime

from pydantic import BaseModel, Field


class DividendHistory(BaseModel):
    exercise_date: str
    cash_year: int = Field(..., description="Cash year")
    cash_dividend_percentage: float = Field(..., description="Dividend Percentage")
    issue_method: str = Field(..., description="Dividend type")


class CompanyOverviewTCBS(BaseModel):
    exchange: str
    industry: str
    company_type: str
    no_shareholders: int
    foreign_percent: float
    outstanding_share: float
    issue_share: float
    established_year: str
    no_employees: int
    stock_rating: float
    delta_in_week: float
    delta_in_month: float
    delta_in_year: float
    short_name: str
    website: str
    industry_id: int
    industry_id_v2: str


class CompanyProfile(BaseModel):
    company_name: str
    company_profile: str
    history_dev: str
    company_promise: str | None = None
    business_risk: str
    key_developments: str
    business_strategies: str


class CompanyShareholders(BaseModel):
    share_holder: str
    share_own_percent: float


class CompanyOfficer(BaseModel):
    officer_name: str = Field(..., description="Full name")
    officer_position: str | None = Field(None, description="Job Position")
    officer_own_percent: float = Field(..., description="Ownership Percentage")


class CompanySubsidiaries(BaseModel):
    sub_company_name: str
    sub_own_percent: float


class CompanyInsiderDeals(BaseModel):
    deal_announce_date: datetime
    deal_method: str | None = None
    deal_action: str
    deal_quantity: float
    deal_price: float | None = None
    deal_ratio: float | None = None


class CompanyEventsTCBS(BaseModel):
    rsi: float | None = None
    rs: float
    id: int
    price: int
    price_change: int
    price_change_ratio: float
    price_change_ratio_1m: float
    event_name: str
    event_code: str
    notify_date: str
    exer_date: str
    reg_final_date: str
    exer_right_date: str
    event_desc: str


class CompanyNews(BaseModel):
    rsi: float
    rs: float
    price: float | None = None
    price_change: float | None = None
    price_change_ratio: float | None = None
    price_change_ratio_1m: float | None = None
    id: int
    title: str
    source: str
    publish_date: str


class CompanyRatioVCI(BaseModel):
    symbol: str
    year_report: int
    length_report: int
    update_date: int
    revenue: int
    revenue_growth: float
    net_profit: int
    net_profit_growth: float
    ebit_margin: int
    roe: float
    roic: int
    roa: float
    pe: float
    pb: float
    eps: float
    current_ratio: int
    cash_ratio: int
    quick_ratio: int
    interest_coverage: str | None = None
    ae: float
    fae: float
    net_profit_margin: float
    gross_margin: int
    ev: int
    issue_share: int
    ps: float
    pcf: float
    bvps: float
    ev_per_ebitda: int
    at: int
    fat: int
    acp: str | None = None
    dso: int
    dpo: int
    eps_ttm: float
    charter_capital: int
    rtq4: int
    charter_capital_ratio: float
    rtq10: int
    dividend: int
    ebitda: int
    ebit: int
    le: int
    de: int
    ccc: str | None = None
    rtq17: int


class CompanyReportsVCI(BaseModel):
    date: str
    description: str
    link: str
    name: str


class TradingStatsVCI(BaseModel):
    symbol: str
    exchange: str
    ev: int
    ceiling: int
    floor: int
    foreign_room: int
    avg_match_volume_2w: int
    foreign_holding_room: int
    current_holding_ratio: float
    max_holding_ratio: float
