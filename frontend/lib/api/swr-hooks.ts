/**
 * SWR Hooks for API Integration
 *
 * This file provides custom SWR hooks that wrap the facade layer API client.
 * These hooks encapsulate:
 * - SWR configuration (caching, revalidation)
 * - Cache key generation
 * - Loading and error states
 * - Type safety from generated client
 *
 * Benefits:
 * - Clean, ergonomic API for components
 * - Consistent caching strategy across the app
 * - Automatic request deduplication
 * - Type-safe parameters and return values
 * - Easy to test and maintain
 */

import useSWR from 'swr';
import { api } from './facade';
import type {
  CompanyOverview,
  CompanyProfile,
  ShareholderInfo,
  CompanyOfficer,
  Subsidiary,
  DividendEvent,
  InsiderDeal,
  CorporateEvent,
  NewsItem,
  CompanyRatioVCI,
  CompanyReportsVCI,
  TradingStatsVCI,
  FinancialStatements,
  StockPrice,
  ExchangeRate,
  GoldSJC,
  GoldBTMC,
  QuarterlyRatio,
  IndustryBenchmark,
} from './facade';
import {
  getCacheKey,
  financialDataConfig,
  referenceDataConfig,
  benchmarkDataConfig,
} from '@/lib/swr-config';

// ============================================================================
// COMPANY DATA HOOKS
// ============================================================================

/**
 * Fetch company overview information
 * Cache: 1 hour (reference data)
 */
export function useCompanyOverview(ticker: string) {
  return useSWR<CompanyOverview>(
    getCacheKey('/api/company/overview', ticker),
    ticker ? () => api.company.getOverview(ticker) : null,
    referenceDataConfig
  );
}

/**
 * Fetch company profile information
 * Cache: 1 hour (reference data)
 */
export function useCompanyProfile(ticker: string) {
  return useSWR<CompanyProfile>(
    getCacheKey('/api/company/profile', ticker),
    ticker ? () => api.company.getProfile(ticker) : null,
    referenceDataConfig
  );
}

/**
 * Fetch company shareholders
 * Cache: 1 hour (reference data)
 */
export function useCompanyShareholders(ticker: string) {
  return useSWR<ShareholderInfo[]>(
    getCacheKey('/api/company/shareholders', ticker),
    ticker ? () => api.company.getShareholders(ticker) : null,
    referenceDataConfig
  );
}

/**
 * Fetch company officers
 * Cache: 1 hour (reference data)
 */
export function useCompanyOfficers(ticker: string) {
  return useSWR<CompanyOfficer[]>(
    getCacheKey('/api/company/officers', ticker),
    ticker ? () => api.company.getOfficers(ticker) : null,
    referenceDataConfig
  );
}

/**
 * Fetch company subsidiaries
 * Cache: 1 hour (reference data)
 */
export function useCompanySubsidiaries(ticker: string) {
  return useSWR<Subsidiary[]>(
    getCacheKey('/api/company/subsidiaries', ticker),
    ticker ? () => api.company.getSubsidiaries(ticker) : null,
    referenceDataConfig
  );
}

/**
 * Fetch dividend history
 * Cache: 1 hour (reference data)
 */
export function useCompanyDividends(ticker: string) {
  return useSWR<DividendEvent[]>(
    getCacheKey('/api/company/dividends', ticker),
    ticker ? () => api.company.getDividends(ticker) : null,
    referenceDataConfig
  );
}

/**
 * Fetch insider trading deals
 * Cache: 1 hour (reference data)
 */
export function useCompanyInsiderDeals(ticker: string) {
  return useSWR<InsiderDeal[]>(
    getCacheKey('/api/company/insider-deals', ticker),
    ticker ? () => api.company.getInsiderDeals(ticker) : null,
    referenceDataConfig
  );
}

/**
 * Fetch corporate events
 * Cache: 1 hour (reference data)
 */
export function useCompanyEvents(ticker: string) {
  return useSWR<CorporateEvent[]>(
    getCacheKey('/api/company/events', ticker),
    ticker ? () => api.company.getEvents(ticker) : null,
    referenceDataConfig
  );
}

/**
 * Fetch company news
 * Cache: 1 hour (reference data)
 */
export function useCompanyNews(ticker: string) {
  return useSWR<NewsItem[]>(
    getCacheKey('/api/company/news', ticker),
    ticker ? () => api.company.getNews(ticker) : null,
    referenceDataConfig
  );
}

/**
 * Fetch financial ratios from VCI
 * Cache: 5 minutes (financial data)
 */
export function useCompanyRatio(ticker: string) {
  return useSWR<CompanyRatioVCI[]>(
    getCacheKey('/api/company/ratio', ticker),
    ticker ? () => api.company.getRatio(ticker) : null,
    financialDataConfig
  );
}

/**
 * Fetch company reports
 * Cache: 1 hour (reference data)
 */
export function useCompanyReports(ticker: string) {
  return useSWR<CompanyReportsVCI[]>(
    getCacheKey('/api/company/reports', ticker),
    ticker ? () => api.company.getReports(ticker) : null,
    referenceDataConfig
  );
}

/**
 * Fetch trading statistics
 * Cache: 5 minutes (financial data)
 */
export function useCompanyTradingStats(ticker: string) {
  return useSWR<TradingStatsVCI>(
    getCacheKey('/api/company/trading-stats', ticker),
    ticker ? () => api.company.getTradingStats(ticker) : null,
    financialDataConfig
  );
}

// ============================================================================
// FINANCIAL STATEMENTS HOOKS
// ============================================================================

/**
 * Fetch comprehensive financial statements
 * Cache: 5 minutes (financial data)
 *
 * @param ticker - Stock ticker symbol
 * @param period - 'quarter' or 'year' (default: 'year')
 * @param years - Number of years/quarters to retrieve (default: 5)
 */
export function useFinancialStatements(
  ticker: string,
  period: 'quarter' | 'year' = 'year',
  years: number = 5
) {
  return useSWR<FinancialStatements>(
    getCacheKey('/api/statements', ticker, {
      period,
      years: years.toString()
    }),
    ticker ? () => api.statements.getStatements(ticker, { period, years }) : null,
    financialDataConfig
  );
}

// ============================================================================
// HISTORICAL PRICES HOOKS
// ============================================================================

/**
 * Fetch stock OHLCV historical data
 * Cache: 5 minutes (financial data)
 *
 * @param ticker - Stock ticker symbol
 * @param startDate - Start date in YYYY-MM-DD format (required)
 * @param endDate - End date in YYYY-MM-DD format (required)
 * @param interval - Time interval (default: '1D')
 */
export function useStockPrices(
  ticker: string,
  startDate: string,
  endDate: string,
  interval: string = '1D'
) {
  return useSWR<StockPrice[]>(
    getCacheKey('/api/stock-prices', ticker, {
      start_date: startDate,
      end_date: endDate,
      interval
    }),
    ticker && startDate && endDate ? () => api.prices.getStockPrices(ticker, startDate, endDate, interval) : null,
    financialDataConfig
  );
}

/**
 * Fetch exchange rates
 * Cache: 1 hour (reference data)
 *
 * @param date - Date in YYYY-MM-DD format (optional, default: today)
 */
export function useExchangeRates(date?: string) {
  // Always fetch exchange rates (no ticker dependency)
  const cacheKey = date ? `/api/exchange-rates?date=${date}` : '/api/exchange-rates';

  return useSWR<ExchangeRate[]>(
    cacheKey,
    () => api.prices.getExchangeRates(date),
    referenceDataConfig
  );
}

/**
 * Fetch SJC gold prices (current/today only)
 * Cache: 1 hour (reference data)
 */
export function useGoldSJC() {
  // Always fetch current gold prices (no parameters)
  return useSWR<GoldSJC[]>(
    '/api/gold/sjc',
    () => api.prices.getGoldSJC(),
    referenceDataConfig
  );
}

/**
 * Fetch BTMC gold prices
 * Cache: 1 hour (reference data)
 */
export function useGoldBTMC() {
  // Always fetch gold prices (no ticker dependency)
  return useSWR<GoldBTMC[]>(
    '/api/gold/btmc',
    () => api.prices.getGoldBTMC(),
    referenceDataConfig
  );
}

// ============================================================================
// QUARTERLY RATIOS HOOKS
// ============================================================================

/**
 * Fetch quarterly financial ratios
 * Cache: 5 minutes (financial data)
 */
export function useQuarterlyRatios(ticker: string) {
  return useSWR<QuarterlyRatio[]>(
    getCacheKey('/api/ratios', ticker),
    ticker ? () => api.ratios.getQuarterlyRatios(ticker) : null,
    financialDataConfig
  );
}

// ============================================================================
// INDUSTRY BENCHMARK HOOKS
// ============================================================================

/**
 * Fetch industry benchmark by industry ID
 * Cache: 10 minutes (benchmark data)
 *
 * @param industryId - Industry identifier
 * @param minCompanies - Minimum number of companies required (default: 5)
 */
export function useIndustryBenchmarkById(
  industryId: number | null,
  minCompanies: number = 5
) {
  return useSWR<IndustryBenchmark>(
    industryId ? `/api/industry/benchmark/${industryId}?min_companies=${minCompanies}` : null,
    industryId ? () => api.industry.getBenchmarkById(industryId, minCompanies) : null,
    benchmarkDataConfig
  );
}

/**
 * Fetch industry benchmark by industry name
 * Cache: 10 minutes (benchmark data)
 *
 * @param industryName - Industry name
 * @param minCompanies - Minimum number of companies required (default: 5)
 */
export function useIndustryBenchmarkByName(
  industryName: string | null,
  minCompanies: number = 5
) {
  return useSWR<IndustryBenchmark>(
    industryName ? `/api/industry/benchmark?industry_name=${industryName}&min_companies=${minCompanies}` : null,
    industryName ? () => api.industry.getBenchmarkByName(industryName, minCompanies) : null,
    benchmarkDataConfig
  );
}

/**
 * Fetch company's industry benchmark (auto-determines industry)
 * Cache: 10 minutes (benchmark data)
 */
export function useCompanyIndustryBenchmark(ticker: string) {
  return useSWR<IndustryBenchmark>(
    getCacheKey('/api/industry/benchmark/company', ticker),
    ticker ? () => api.industry.getCompanyBenchmark(ticker) : null,
    benchmarkDataConfig
  );
}

/**
 * Fetch industry classifications
 * Cache: 1 hour (reference data)
 */
export function useIndustryClassifications() {
  return useSWR<Record<string, string>>(
    '/api/industry/classifications',
    () => api.industry.getClassifications(),
    referenceDataConfig
  );
}
