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
  [key: string]: unknown;
}

export interface BalanceSheetData {
  ticker?: string | null;
  year_report?: number | null;
  total_assets?: number | null;
  total_liabilities?: number | null;
  owners_equity?: number | null;
  [key: string]: unknown;
}

export interface CashFlowData {
  ticker?: string | null;
  year_report?: number | null;
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
      startDate?: string;
      endDate?: string;
      period?: 'quarter' | 'year';
    }
  ): Promise<FinancialStatements> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);
    if (params?.period) queryParams.append('period', params.period);

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
