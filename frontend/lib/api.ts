/**
 * API client for RichSlow backend
 * Provides typed fetch wrappers for all FastAPI endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Base fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `API Error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================================================
// COMPANY ENDPOINTS
// ============================================================================

export interface CompanyOverview {
  exchange?: string;
  industry?: string;
  companyType?: string;
  noEmployees?: number;
  noShareholders?: number;
  foreignPercent?: number;
  outstandingShare?: number;
  issueShare?: number;
  establishedYear?: number;
  noSubsidiaries?: number;
  issueddate?: string;
  website?: string;
  stockRating?: number;
  deltaInWeek?: number;
  deltaInMonth?: number;
  deltaInYear?: number;
  shortName?: string;
  industryEn?: string;
  industryId?: number;
  icbCode?: string;
}

export interface CompanyProfile {
  ticker?: string;
  exchange?: string;
  fullname?: string;
  industry?: string;
  company_type?: string;
}

export interface ShareholderInfo {
  share_holder: string;
  share_own_percent: number;
  [key: string]: unknown;
}

export interface CompanyOfficer {
  // Add fields based on actual API response
  [key: string]: unknown;
}

export interface Subsidiary {
  ticker?: string;
  organCode?: string;
  organName?: string;
  organShortName?: string;
  ownPercent?: number;
  sub_company_name?: string;
  sub_own_percent?: number;
  [key: string]: unknown;
}

export interface DividendEvent {
  exercise_date: string;
  cash_year: number;
  cash_dividend_percentage: number;
  issue_method: string;
  [key: string]: unknown;
}

export interface InsiderDeal {
  deal_announce_date: string; // datetime
  deal_method?: string | null;
  deal_action: string; // "Mua" or "Bán"
  deal_quantity: number;
  deal_price?: number | null;
  deal_ratio?: number | null;
  [key: string]: unknown;
}

export interface CorporateEvent {
  ticker?: string;
  exerciseDate?: string;
  eventCode?: string;
  eventName?: string;
  eventTitle?: string;
  // Backend API fields (snake_case)
  event_name?: string;
  event_code?: string;
  exer_date?: string;
  event_desc?: string;
  notify_date?: string;
  reg_final_date?: string;
  exer_right_date?: string;
  [key: string]: unknown;
}

export interface NewsItem {
  source?: string;
  ticker?: string;
  title?: string;
  url?: string;
  publishDate?: string;
  [key: string]: unknown;
}

export interface CompanyRatioVCI {
  symbol: string;
  year_report: number;
  length_report: number;
  update_date: number;
  revenue: number;
  revenue_growth: number;
  net_profit: number;
  net_profit_growth: number;
  ebit_margin: number;
  roe: number;
  roic: number;
  roa: number;
  pe: number;
  pb: number;
  ps: number;
  eps: number;
  ev_per_ebitda: number;
  current_ratio: number;
  cash_ratio: number;
  quick_ratio: number;
  interest_coverage?: string | null;
  ae: number;
  debt_on_equity: number;
  debt_on_asset: number;
  debt_on_ebitda: number;
  [key: string]: unknown;
}

export const companyAPI = {
  /**
   * Get company overview
   */
  getOverview: (ticker: string): Promise<CompanyOverview> => {
    return apiFetch<CompanyOverview>(`/api/company/${ticker}/overview`);
  },

  /**
   * Get company profile
   */
  getProfile: (ticker: string): Promise<CompanyProfile> => {
    return apiFetch<CompanyProfile>(`/api/company/${ticker}/profile`);
  },

  /**
   * Get shareholders information
   */
  getShareholders: (ticker: string): Promise<ShareholderInfo[]> => {
    return apiFetch<ShareholderInfo[]>(`/api/company/${ticker}/shareholders`);
  },

  /**
   * Get company officers
   */
  getOfficers: (ticker: string): Promise<CompanyOfficer[]> => {
    return apiFetch<CompanyOfficer[]>(`/api/company/${ticker}/officers`);
  },

  /**
   * Get subsidiary list
   */
  getSubsidiaries: (ticker: string): Promise<Subsidiary[]> => {
    return apiFetch<Subsidiary[]>(`/api/company/${ticker}/subsidiaries`);
  },

  /**
   * Get dividend history
   */
  getDividends: (ticker: string): Promise<DividendEvent[]> => {
    return apiFetch<DividendEvent[]>(`/api/company/${ticker}/dividends`);
  },

  /**
   * Get insider trading data
   */
  getInsiderDeals: (ticker: string): Promise<InsiderDeal[]> => {
    return apiFetch<InsiderDeal[]>(`/api/company/${ticker}/insider-deals`);
  },

  /**
   * Get corporate events
   */
  getEvents: (ticker: string): Promise<CorporateEvent[]> => {
    return apiFetch<CorporateEvent[]>(`/api/company/${ticker}/events`);
  },

  /**
   * Get news feed
   */
  getNews: (ticker: string): Promise<NewsItem[]> => {
    return apiFetch<NewsItem[]>(`/api/company/${ticker}/news`);
  },

  /**
   * Get financial ratios (returns array of historical ratios, most recent first)
   */
  getRatio: (ticker: string): Promise<CompanyRatioVCI[]> => {
    return apiFetch<CompanyRatioVCI[]>(`/api/company/${ticker}/ratio`);
  },

  /**
   * Get company reports
   */
  getReports: (ticker: string): Promise<unknown[]> => {
    return apiFetch<unknown[]>(`/api/company/${ticker}/reports`);
  },

  /**
   * Get trading statistics
   */
  getTradingStats: (ticker: string): Promise<unknown> => {
    return apiFetch<unknown>(`/api/company/${ticker}/trading-stats`);
  },
};

// ============================================================================
// STATEMENTS ENDPOINTS
// ============================================================================

export interface FinancialStatements {
  ticker: string;
  period: string;
  income_statements: IncomeStatementData[];
  balance_sheets: BalanceSheetData[];
  cash_flows: CashFlowData[];
  ratios: FinancialRatiosData[];
  years: number[];
  raw_data?: Record<string, unknown[]> | null;
}

export interface IncomeStatementData {
  ticker?: string | null;
  year_report?: number | null;
  revenue?: number | null;
  revenue_yoy?: number | null;
  gross_profit?: number | null;
  operating_profit?: number | null;
  net_profit?: number | null;
  profit_before_tax?: number | null;
  // Revenue & Sales
  sales?: number | null;
  sales_deductions?: number | null;
  net_sales?: number | null;
  // Costs & Expenses
  cost_of_sales?: number | null;
  selling_expenses?: number | null;
  general_admin_expenses?: number | null;
  // Attributable Profits
  attributable_to_parent?: number | null;
  attributable_to_parent_vnd?: number | null;
  attributable_to_parent_yoy?: number | null;
  minority_interest?: number | null;
  // Financial Income/Expenses
  financial_income?: number | null;
  financial_expenses?: number | null;
  interest_expenses?: number | null;
  // Tax
  business_tax_current?: number | null;
  business_tax_deferred?: number | null;
  // Other Income
  other_income?: number | null;
  other_income_expenses?: number | null;
  net_other_income?: number | null;
  // Investment Related
  gain_loss_joint_ventures?: number | null;
  net_income_associated_companies?: number | null;
  [key: string]: unknown;
}

export interface BalanceSheetData {
  ticker?: string | null;
  year_report?: number | null;
  total_assets?: number | null;
  total_liabilities?: number | null;
  owners_equity?: number | null;
  // Current Assets
  current_assets?: number | null;
  cash_and_equivalents?: number | null;
  short_term_investments?: number | null;
  accounts_receivable?: number | null;
  short_term_loans_receivable?: number | null;
  inventories_net?: number | null;
  net_inventories?: number | null;
  prepayments_to_suppliers?: number | null;
  other_current_assets?: number | null;
  // Long-term Assets
  long_term_assets?: number | null;
  fixed_assets?: number | null;
  long_term_investments?: number | null;
  investment_properties?: number | null;
  long_term_loans_receivable?: number | null;
  long_term_trade_receivables?: number | null;
  long_term_prepayments?: number | null;
  goodwill?: number | null;
  goodwill_alt?: number | null;
  other_non_current_assets?: number | null;
  other_long_term_assets?: number | null;
  // Total Resources
  total_resources?: number | null;
  // Liabilities
  current_liabilities?: number | null;
  short_term_borrowings?: number | null;
  advances_from_customers?: number | null;
  long_term_liabilities?: number | null;
  long_term_borrowings?: number | null;
  convertible_bonds?: number | null;
  // Equity
  capital_and_reserves?: number | null;
  paid_in_capital?: number | null;
  common_shares?: number | null;
  investment_development_funds?: number | null;
  other_reserves?: number | null;
  undistributed_earnings?: number | null;
  minority_interests?: number | null;
  [key: string]: unknown;
}

export interface CashFlowData {
  ticker?: string | null;
  year_report?: number | null;
  // Starting Items
  profit_before_tax?: number | null;
  depreciation_amortisation?: number | null;
  provision_credit_losses?: number | null;
  unrealized_fx_gain_loss?: number | null;
  profit_loss_investing?: number | null;
  interest_expense?: number | null;
  // Working Capital Changes
  increase_decrease_receivables?: number | null;
  increase_decrease_inventories?: number | null;
  increase_decrease_payables?: number | null;
  increase_decrease_prepaid?: number | null;
  // Operating Cash Flow
  interest_paid?: number | null;
  business_tax_paid?: number | null;
  other_receipts_operating?: number | null;
  other_payments_operating?: number | null;
  operating_cash_flow?: number | null;
  // Investing Activities
  purchase_fixed_assets?: number | null;
  proceeds_disposal_assets?: number | null;
  loans_granted?: number | null;
  collection_loans?: number | null;
  investment_other_entities?: number | null;
  proceeds_divestment?: number | null;
  dividends_received?: number | null;
  interest_income_dividends?: number | null;
  investing_cash_flow?: number | null;
  // Financing Activities
  increase_charter_capital?: number | null;
  proceeds_borrowings?: number | null;
  repayment_borrowings?: number | null;
  dividends_paid?: number | null;
  finance_lease_principal_payments?: number | null;
  financing_cash_flow?: number | null;
  // Net Cash Flow
  net_change_in_cash?: number | null;
  cash_beginning?: number | null;
  fx_adjustment?: number | null;
  cash_end_period?: number | null;
  [key: string]: unknown;
}

export interface FinancialRatiosData {
  ticker?: string | null;
  year_report?: number | null;
  [key: string]: unknown;
}

export const statementsAPI = {
  /**
   * Get financial statements for ticker
   */
  getStatements: (
    ticker: string,
    params?: {
      period?: 'quarter' | 'year';
      years?: number;
    }
  ): Promise<FinancialStatements> => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.years) queryParams.append('years', params.years.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/statements/${ticker}${queryString ? `?${queryString}` : ''}`;

    return apiFetch<FinancialStatements>(endpoint);
  },
};

// ============================================================================
// HISTORICAL PRICES ENDPOINTS
// ============================================================================

export interface StockPrice {
  time?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  [key: string]: unknown;
}

export interface ExchangeRate {
  currency_code?: string;
  currency_name?: string;
  buy_cash?: number;
  buy_transfer?: number;
  sell?: number;
  date?: string;
  [key: string]: unknown;
}

export interface GoldSJC {
  name: string;
  buy_price: number;
  sell_price: number;
}

export interface GoldBTMC {
  name: string;
  karat: string;
  gold_content: string;
  buy_price: number;
  sell_price: number;
  world_price: number;
  time: string;
}

export const pricesAPI = {
  /**
   * Get stock OHLCV data
   */
  getStockPrices: (
    ticker: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<StockPrice[]> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/api/stock-prices/${ticker}${queryString ? `?${queryString}` : ''}`;

    return apiFetch<StockPrice[]>(endpoint);
  },

  /**
   * Get exchange rates
   */
  getExchangeRates: (date?: string): Promise<ExchangeRate[]> => {
    const queryParams = date ? `?date=${date}` : '';
    return apiFetch<ExchangeRate[]>(`/api/exchange-rates${queryParams}`);
  },

  /**
   * Get SJC gold prices
   */
  getGoldSJC: (date?: string): Promise<GoldSJC[]> => {
    const queryParams = date ? `?date=${date}` : '';
    return apiFetch<GoldSJC[]>(`/api/gold/sjc${queryParams}`);
  },

  /**
   * Get BTMC gold prices
   */
  getGoldBTMC: (): Promise<GoldBTMC[]> => {
    return apiFetch<GoldBTMC[]>('/api/gold/btmc');
  },
};

// ============================================================================
// RATIOS ENDPOINTS
// ============================================================================

export interface QuarterlyRatio {
  ticker?: string;
  quarter?: string;
  year?: number;
  [key: string]: unknown;
}

export const ratiosAPI = {
  /**
   * Get quarterly financial ratios
   */
  getQuarterlyRatios: (ticker: string): Promise<QuarterlyRatio[]> => {
    return apiFetch<QuarterlyRatio[]>(`/api/ratios/${ticker}`);
  },
};

// ============================================================================
// INDUSTRY BENCHMARK ENDPOINTS
// ============================================================================

export interface RatioBenchmark {
  mean: number;
  median: number;
  p25: number;
  p75: number;
  std: number;
  count: number;
}

export interface IndustryBenchmark {
  industry_name: string;
  industry_id?: number | null;
  company_count: number;
  companies_analyzed: number;
  benchmarks: Record<string, RatioBenchmark>;
  ratios_available: string[];
}

export interface IndustryClassification {
  icbCode?: string;
  icbName?: string;
  [key: string]: unknown;
}

export const industryAPI = {
  /**
   * Get industry benchmark by industry ID
   */
  getBenchmarkById: (industryId: number, minCompanies: number = 5): Promise<IndustryBenchmark> => {
    return apiFetch<IndustryBenchmark>(`/api/industry/benchmark/${industryId}?min_companies=${minCompanies}`);
  },

  /**
   * Get industry benchmark by industry name
   */
  getBenchmarkByName: (industryName: string, minCompanies: number = 5): Promise<IndustryBenchmark> => {
    return apiFetch<IndustryBenchmark>(`/api/industry/benchmark?industry_name=${industryName}&min_companies=${minCompanies}`);
  },

  /**
   * Get company's industry benchmark (auto-determines industry)
   */
  getCompanyBenchmark: (ticker: string): Promise<IndustryBenchmark> => {
    return apiFetch<IndustryBenchmark>(`/api/industry/benchmark/company/${ticker}`);
  },

  /**
   * Get industry classifications
   */
  getClassifications: (): Promise<Record<string, string>> => {
    return apiFetch<Record<string, string>>('/api/industry/classifications');
  },
};

// ============================================================================
// EXPORT ALL APIs
// ============================================================================

export const api = {
  company: companyAPI,
  statements: statementsAPI,
  prices: pricesAPI,
  ratios: ratiosAPI,
  industry: industryAPI,
};

export default api;
