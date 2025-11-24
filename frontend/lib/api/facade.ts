/**
 * API Facade Layer
 *
 * This facade wraps the auto-generated OpenAPI client with a clean, backward-compatible API
 * that matches the manual API client interface. It provides:
 * - Concise method names (e.g., getOverview vs getCompanyOverviewEndpointApiCompanyTickerOverviewGet)
 * - Simplified parameter passing (positional args where appropriate)
 * - Consistent API surface for gradual migration
 * - Type safety from generated client under the hood
 *
 * The facade allows components to migrate from the manual API client to the generated
 * client without breaking changes, while still benefiting from automatic type synchronization.
 */

import { api as generatedApi } from './client';
import type {
  CompanyOverviewTCBS,
  CompanyProfile,
  CompanyShareholders,
  CompanyOfficer,
  CompanySubsidiaries,
  DividendHistory,
  CompanyInsiderDeals,
  CompanyEventsTCBS,
  CompanyNews,
  CompanyRatioVCI,
  CompanyReportsVCI,
  TradingStatsVCI,
  FinancialStatementsResponse,
  FinancialRatiosData,
  IncomeStatementData,
  BalanceSheetData,
  CashFlowData,
  PeriodType,
  StockOHLCV,
  ExchangeRate,
  GoldSJC,
  GoldBTMC,
  IndustryBenchmark,
} from './client';

// ============================================================================
// TYPE ALIASES FOR BACKWARD COMPATIBILITY
// ============================================================================

// Re-export generated types with more familiar names
export type CompanyOverview = CompanyOverviewTCBS;
export type ShareholderInfo = CompanyShareholders;
export type Subsidiary = CompanySubsidiaries;
export type DividendEvent = DividendHistory;
export type InsiderDeal = CompanyInsiderDeals;
export type CorporateEvent = CompanyEventsTCBS;
export type NewsItem = CompanyNews;
export type FinancialStatements = FinancialStatementsResponse;
export type StockPrice = StockOHLCV;

// Enhanced discriminated union types for quarterly vs annual data
export type QuarterlyFinancialRatios = FinancialRatiosData & {
  length_report: 1 | 2 | 3 | 4; // Quarterly periods only
};

export type AnnualFinancialRatios = FinancialRatiosData & {
  length_report: 5; // Annual period only
};

export type TypedFinancialRatios = QuarterlyFinancialRatios | AnnualFinancialRatios;

// Type guard functions for runtime discrimination
export function isQuarterlyFinancialRatios(
  data: FinancialRatiosData
): data is QuarterlyFinancialRatios {
  return data.length_report !== null &&
         data.length_report !== undefined &&
         data.length_report >= 1 &&
         data.length_report <= 4;
}

export function isAnnualFinancialRatios(
  data: FinancialRatiosData
): data is AnnualFinancialRatios {
  return data.length_report === 5;
}

// Re-export all other types
export type {
  CompanyProfile,
  CompanyOfficer,
  CompanyRatioVCI,
  CompanyReportsVCI,
  TradingStatsVCI,
  ExchangeRate,
  GoldSJC,
  GoldBTMC,
  IndustryBenchmark,
  PeriodType,
  IncomeStatementData,
  BalanceSheetData,
  CashFlowData,
};

// ============================================================================
// COMPANY API FACADE
// ============================================================================

export const companyAPI = {
  /**
   * Get company overview information from TCBS
   * @param ticker - Stock ticker symbol (e.g., 'VCB', 'FPT')
   * @returns Company overview data including industry, shareholders, and trading stats
   */
  getOverview: (ticker: string): Promise<CompanyOverview> => {
    return generatedApi.company.getCompanyOverviewEndpointApiCompanyTickerOverviewGet({ ticker });
  },

  /**
   * Get company profile information from TCBS
   * @param ticker - Stock ticker symbol
   * @returns Company profile with business description and history
   */
  getProfile: (ticker: string): Promise<CompanyProfile> => {
    return generatedApi.company.getCompanyProfileEndpointApiCompanyTickerProfileGet({ ticker });
  },

  /**
   * Get company shareholder information
   * @param ticker - Stock ticker symbol
   * @returns List of major shareholders and ownership percentages
   */
  getShareholders: (ticker: string): Promise<ShareholderInfo[]> => {
    return generatedApi.company.getCompanyShareholdersEndpointApiCompanyTickerShareholdersGet({ ticker });
  },

  /**
   * Get company officers and management team
   * @param ticker - Stock ticker symbol
   * @returns List of company officers and their positions
   */
  getOfficers: (ticker: string): Promise<CompanyOfficer[]> => {
    return generatedApi.company.getCompanyOfficersEndpointApiCompanyTickerOfficersGet({ ticker });
  },

  /**
   * Get subsidiary company list
   * @param ticker - Stock ticker symbol
   * @returns List of subsidiary companies
   */
  getSubsidiaries: (ticker: string): Promise<Subsidiary[]> => {
    return generatedApi.company.getCompanySubsidiariesEndpointApiCompanyTickerSubsidiariesGet({ ticker });
  },

  /**
   * Get dividend payment history
   * @param ticker - Stock ticker symbol
   * @returns List of historical dividend payments
   */
  getDividends: (ticker: string): Promise<DividendEvent[]> => {
    return generatedApi.company.getCompanyDividendsEndpointApiCompanyTickerDividendsGet({ ticker });
  },

  /**
   * Get insider trading transactions
   * @param ticker - Stock ticker symbol
   * @returns List of insider buy/sell transactions
   */
  getInsiderDeals: (ticker: string): Promise<InsiderDeal[]> => {
    return generatedApi.company.getCompanyInsiderDealsEndpointApiCompanyTickerInsiderDealsGet({ ticker });
  },

  /**
   * Get corporate events (meetings, offerings, etc.)
   * @param ticker - Stock ticker symbol
   * @returns List of corporate events
   */
  getEvents: (ticker: string): Promise<CorporateEvent[]> => {
    return generatedApi.company.getCompanyEventsEndpointApiCompanyTickerEventsGet({ ticker });
  },

  /**
   * Get company news feed
   * @param ticker - Stock ticker symbol
   * @returns List of recent news articles
   */
  getNews: (ticker: string): Promise<NewsItem[]> => {
    return generatedApi.company.getCompanyNewsEndpointApiCompanyTickerNewsGet({ ticker });
  },

  /**
   * Get financial ratios from VCI
   * @param ticker - Stock ticker symbol
   * @returns Array of historical financial ratios (most recent first)
   */
  getRatio: (ticker: string): Promise<CompanyRatioVCI[]> => {
    return generatedApi.company.getCompanyRatioEndpointApiCompanyTickerRatioGet({ ticker });
  },

  /**
   * Get company reports
   * @param ticker - Stock ticker symbol
   * @returns List of company reports
   */
  getReports: (ticker: string): Promise<CompanyReportsVCI[]> => {
    return generatedApi.company.getCompanyReportsEndpointApiCompanyTickerReportsGet({ ticker });
  },

  /**
   * Get trading statistics from VCI
   * @param ticker - Stock ticker symbol
   * @returns Trading statistics data
   */
  getTradingStats: (ticker: string): Promise<TradingStatsVCI> => {
    return generatedApi.company.getCompanyTradingStatsEndpointApiCompanyTickerTradingStatsGet({ ticker });
  },
};

// ============================================================================
// STATEMENTS API FACADE
// ============================================================================

export const statementsAPI = {
  /**
   * Get comprehensive financial statements
   * @param ticker - Stock ticker symbol
   * @param params - Optional parameters
   * @param params.period - 'quarter' or 'year' (default: 'year')
   * @param params.years - Number of years/quarters to retrieve (default: 5)
   * @returns Financial statements including income statement, balance sheet, cash flow, and ratios
   */
  getStatements: (
    ticker: string,
    params?: {
      period?: 'quarter' | 'year';
      years?: number;
    }
  ): Promise<FinancialStatements> => {
    return generatedApi.financialStatements.fetchFinancialStatementsGetApiStatementsTickerGet({
      ticker,
      period: params?.period as PeriodType | undefined,
      years: params?.years,
    });
  },
};

// ============================================================================
// PRICES API FACADE
// ============================================================================

export const pricesAPI = {
  /**
   * Get stock OHLCV (Open, High, Low, Close, Volume) historical data
   * @param ticker - Stock ticker symbol
   * @param startDate - Start date in YYYY-MM-DD format (required)
   * @param endDate - End date in YYYY-MM-DD format (required)
   * @param interval - Time interval (default: '1D')
   * @returns Array of stock price data
   */
  getStockPrices: (
    ticker: string,
    startDate: string,
    endDate: string,
    interval: string = '1D'
  ): Promise<StockPrice[]> => {
    return generatedApi.historicalPrices.fetchStockPricesApiStockPricesTickerGet({
      ticker,
      startDate,
      endDate,
      interval,
    });
  },

  /**
   * Get Vietcombank exchange rates
   * @param date - Optional date in YYYY-MM-DD format (default: today)
   * @returns Array of exchange rates for various currencies
   */
  getExchangeRates: (date?: string): Promise<ExchangeRate[]> => {
    return generatedApi.historicalPrices.fetchExchangeRatesApiExchangeRatesGet({ date });
  },

  /**
   * Get SJC gold prices (current/today only)
   * @returns Array of SJC gold prices (buy/sell for various products)
   */
  getGoldSJC: (): Promise<GoldSJC[]> => {
    return generatedApi.historicalPrices.fetchGoldSjcApiGoldSjcGet();
  },

  /**
   * Get BTMC gold prices
   * @returns Array of BTMC gold prices with karat and purity details
   */
  getGoldBTMC: (): Promise<GoldBTMC[]> => {
    return generatedApi.historicalPrices.fetchGoldBtmcApiGoldBtmcGet();
  },
};

// ============================================================================
// RATIOS API FACADE
// ============================================================================

export const ratiosAPI = {
  /**
   * Get quarterly financial ratios
   * @param ticker - Stock ticker symbol
   * @returns Array of quarterly financial ratios with type safety
   */
  getQuarterlyRatios: async (ticker: string): Promise<QuarterlyFinancialRatios[]> => {
    const response = await generatedApi.quarterlyRatios.getQuarterlyRatiosApiQuarterlyRatiosTickerGet({ ticker });
    const ratios = response.ratios || [];

    // Type filtering to ensure only quarterly data is returned
    return ratios.filter(isQuarterlyFinancialRatios);
  },
};

// ============================================================================
// INDUSTRY API FACADE
// ============================================================================

export const industryAPI = {
  /**
   * Get industry benchmark by industry ID
   * @param industryId - Industry identifier
   * @param minCompanies - Minimum number of companies required for benchmark (default: 5)
   * @returns Industry benchmark with ratio statistics
   */
  getBenchmarkById: (industryId: number, minCompanies: number = 5): Promise<IndustryBenchmark> => {
    return generatedApi.industryBenchmark.getIndustryBenchmarkByIdApiIndustryBenchmarkIndustryIdGet({
      industryId,
      minCompanies,
    });
  },

  /**
   * Get industry benchmark by industry name
   * @param industryName - Industry name
   * @param minCompanies - Minimum number of companies required for benchmark (default: 5)
   * @returns Industry benchmark with ratio statistics
   */
  getBenchmarkByName: (industryName: string, minCompanies: number = 5): Promise<IndustryBenchmark> => {
    return generatedApi.industryBenchmark.getIndustryBenchmarkByNameApiIndustryBenchmarkGet({
      industryName,
      minCompanies,
    });
  },

  /**
   * Get company's industry benchmark (auto-determines industry from ticker)
   * @param ticker - Stock ticker symbol
   * @returns Industry benchmark for the company's industry
   */
  getCompanyBenchmark: (ticker: string): Promise<IndustryBenchmark> => {
    return generatedApi.industryBenchmark.getCompanyIndustryBenchmarkApiIndustryBenchmarkCompanyTickerGet({ ticker });
  },

  /**
   * Get industry classifications (ICB codes and names)
   * @returns Dictionary mapping industry codes to names
   */
  getClassifications: (): Promise<Record<string, string>> => {
    return generatedApi.industryBenchmark.getIndustryClassificationsApiIndustryClassificationsGet();
  },
};

// ============================================================================
// UNIFIED API EXPORT
// ============================================================================

/**
 * Main API facade object with all service categories
 *
 * Usage:
 * ```typescript
 * import { api } from '@/lib/api/facade';
 *
 * const overview = await api.company.getOverview('VCB');
 * const statements = await api.statements.getStatements('VCB', { period: 'year', years: 5 });
 * ```
 */
export const api = {
  company: companyAPI,
  statements: statementsAPI,
  prices: pricesAPI,
  ratios: ratiosAPI,
  industry: industryAPI,
};

export default api;
