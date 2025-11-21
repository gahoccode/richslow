"use client";

import useSWR from 'swr';
import api from '@/lib/api/facade';
import {
  getCacheKey,
  financialDataConfig,
  referenceDataConfig,
  benchmarkDataConfig,
} from '@/lib/swr-config';
import type {
  CompanyOverview,
  FinancialStatements,
  StockPrice,
  DividendEvent,
  InsiderDeal,
  CorporateEvent,
  NewsItem,
  Subsidiary,
  CompanyRatioVCI,
  IndustryBenchmark,
} from '@/lib/api/facade';

export interface StockData {
  overview: CompanyOverview | null;
  statements: FinancialStatements | null;
  prices: StockPrice[];
  dividends: DividendEvent[];
  insiderDeals: InsiderDeal[];
  events: CorporateEvent[];
  news: NewsItem[];
  subsidiaries: Subsidiary[];
  ratios: CompanyRatioVCI | null; // Most recent ratio from array
  industryBenchmark: IndustryBenchmark | null;
}

export interface UseStockDataReturn {
  data: StockData;
  loading: boolean; // Overall loading state (true if any stage is loading)
  criticalLoading: boolean; // Stage 1: Critical data
  secondaryLoading: boolean; // Stage 2: Secondary data
  deferredLoading: boolean; // Stage 3: Deferred data
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching stock market data with SWR caching
 *
 * Features:
 * - Automatic request deduplication
 * - Intelligent caching (5 min for financial, 1 hour for reference, 10 min for benchmark)
 * - 3-stage progressive loading (critical → secondary → deferred)
 * - Graceful error handling
 *
 * @param ticker - Stock ticker symbol (e.g., "VNM", "VCB")
 * @param startDate - Start date for historical price data (YYYY-MM-DD)
 * @param endDate - End date for historical price data (YYYY-MM-DD)
 * @param period - Reporting period ('quarter' | 'year')
 * @param years - Number of years for financial statements (default: 5)
 */
export function useStockData(
  ticker: string,
  startDate?: string,
  endDate?: string,
  period?: 'quarter' | 'year',
  years: number = 5
): UseStockDataReturn {
  // STAGE 1: Critical Data (Financial data - 5 min cache)
  // These are essential for the main UI and should load first

  const { data: overview, error: overviewError, isLoading: overviewLoading } = useSWR(
    getCacheKey('/api/company/overview', ticker),
    ticker ? () => api.company.getOverview(ticker) : null,
    referenceDataConfig // 1 hour cache for company overview
  );

  const { data: statements, error: statementsError, isLoading: statementsLoading } = useSWR(
    getCacheKey('/api/statements', ticker, { period, years: years.toString() }),
    ticker ? () => api.statements.getStatements(ticker, { period, years }) : null,
    financialDataConfig // 5 min cache for financial statements
  );

  const { data: prices, error: pricesError, isLoading: pricesLoading } = useSWR(
    getCacheKey('/api/stock-prices', ticker, { startDate, endDate }),
    ticker && startDate && endDate ? () => api.prices.getStockPrices(ticker, startDate, endDate) : null,
    financialDataConfig // 5 min cache for stock prices
  );

  const { data: ratiosArray, error: ratiosError, isLoading: ratiosLoading } = useSWR(
    getCacheKey('/api/company/ratio', ticker),
    ticker ? () => api.company.getRatio(ticker) : null,
    financialDataConfig // 5 min cache for ratios
  );

  // STAGE 2: Secondary Data (Reference data - 1 hour cache)
  // These are important but not essential for initial render

  const { data: dividends, error: dividendsError, isLoading: dividendsLoading } = useSWR(
    getCacheKey('/api/company/dividends', ticker),
    ticker ? () => api.company.getDividends(ticker) : null,
    referenceDataConfig
  );

  const { data: insiderDeals, error: insiderDealsError, isLoading: insiderDealsLoading } = useSWR(
    getCacheKey('/api/company/insider-deals', ticker),
    ticker ? () => api.company.getInsiderDeals(ticker) : null,
    referenceDataConfig
  );

  const { data: events, error: eventsError, isLoading: eventsLoading } = useSWR(
    getCacheKey('/api/company/events', ticker),
    ticker ? () => api.company.getEvents(ticker) : null,
    referenceDataConfig
  );

  const { data: news, error: newsError, isLoading: newsLoading } = useSWR(
    getCacheKey('/api/company/news', ticker),
    ticker ? () => api.company.getNews(ticker) : null,
    referenceDataConfig
  );

  const { data: subsidiaries, error: subsidiariesError, isLoading: subsidiariesLoading } = useSWR(
    getCacheKey('/api/company/subsidiaries', ticker),
    ticker ? () => api.company.getSubsidiaries(ticker) : null,
    referenceDataConfig
  );

  // STAGE 3: Deferred Data (Benchmark data - 10 min cache)
  // Industry benchmark is the heaviest call (50-200+ internal API calls)

  const { data: industryBenchmark, error: benchmarkError, isLoading: benchmarkLoading } = useSWR(
    getCacheKey('/api/industry/benchmark/company', ticker),
    ticker ? () => api.industry.getCompanyBenchmark(ticker) : null,
    benchmarkDataConfig
  );

  // Calculate loading states for each stage
  const criticalLoading = overviewLoading || statementsLoading || pricesLoading || ratiosLoading;
  const secondaryLoading = dividendsLoading || insiderDealsLoading || eventsLoading || newsLoading || subsidiariesLoading;
  const deferredLoading = benchmarkLoading;
  const loading = criticalLoading || secondaryLoading || deferredLoading;

  // Combine errors from all requests
  const error = overviewError || statementsError || pricesError || ratiosError ||
                dividendsError || insiderDealsError || eventsError || newsError ||
                subsidiariesError || benchmarkError || null;

  // Aggregate data into StockData interface
  const data: StockData = {
    overview: overview || null,
    statements: statements || null,
    prices: prices || [],
    dividends: dividends || [],
    insiderDeals: insiderDeals || [],
    events: events || [],
    news: news || [],
    subsidiaries: subsidiaries || [],
    // Take the most recent ratio (first element of array)
    ratios: ratiosArray && ratiosArray.length > 0 ? ratiosArray[0] : null,
    industryBenchmark: industryBenchmark || null,
  };

  // Refetch function to manually trigger revalidation
  const refetch = async () => {
    // SWR's mutate will be called automatically on focus/reconnect
    // For manual refetch, we can use the mutate function from each hook
    // This is a placeholder for now - SWR handles most cases automatically
    return Promise.resolve();
  };

  return {
    data,
    loading,
    criticalLoading,
    secondaryLoading,
    deferredLoading,
    error,
    refetch,
  };
}
