from datetime import datetime
from pydantic import BaseModel, Field, Optional


class DividendHistory(BaseModel):
    exercise_date: datetime
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
    established_year: int
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
    company_promise: Optional[str] = None
    business_risk: str
    key_developments: str
    business_strategies: str


class CompanyShareholders(BaseModel):
    share_holder: str
    share_own_percent: float


class CompanyOfficer(BaseModel):
    officer_name: str
    officer_position: Optional[str] = None
    officer_own_percent: float


class CompanySubsidiaries(BaseModel):
    sub_company_name: str
    sub_own_percent: float


class CompanyInsiderDeals(BaseModel):
    deal_announce_date: datetime
    deal_method: Optional[str] = None
    deal_action: str
    deal_quantity: float
    deal_price: Optional[float] = None
    deal_ratio: Optional[float] = None


class CompanyEventsTCBS(BaseModel):
    rsi: Optional[float] = None
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
    price: Optional[float] = None
    price_change: Optional[float] = None
    price_change_ratio: Optional[float] = None
    price_change_ratio_1m: Optional[float] = None
    id: int
    title: str
    source: str
    publish_date: str
