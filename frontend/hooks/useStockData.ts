"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
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
} from '@/lib/api';

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

export function useStockData(
  ticker: string,
  startDate?: string,
  endDate?: string,
  period?: 'quarter' | 'year'
): UseStockDataReturn {
  const [data, setData] = useState<StockData>({
    overview: null,
    statements: null,
    prices: [],
    dividends: [],
    insiderDeals: [],
    events: [],
    news: [],
    subsidiaries: [],
    ratios: null,
    industryBenchmark: null,
  });
  const [loading, setLoading] = useState(true);
  const [criticalLoading, setCriticalLoading] = useState(true);
  const [secondaryLoading, setSecondaryLoading] = useState(true);
  const [deferredLoading, setDeferredLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllData = async () => {
    if (!ticker) {
      setLoading(false);
      setCriticalLoading(false);
      setSecondaryLoading(false);
      setDeferredLoading(false);
      return;
    }

    setLoading(true);
    setCriticalLoading(true);
    setSecondaryLoading(true);
    setDeferredLoading(true);
    setError(null);

    try {
      // STAGE 1: Critical Data (Load immediately)
      // These are essential for the main UI and should load first
      const [overview, statements, prices, ratios] = await Promise.allSettled([
        api.company.getOverview(ticker),
        api.statements.getStatements(ticker, {
          startDate,
          endDate,
          period,
        }),
        api.prices.getStockPrices(ticker, { startDate, endDate }),
        api.company.getRatio(ticker),
      ]);

      // Update with critical data immediately
      setData((prev) => ({
        ...prev,
        overview: overview.status === 'fulfilled' ? overview.value : null,
        statements: statements.status === 'fulfilled' ? statements.value : null,
        prices: prices.status === 'fulfilled' ? prices.value : [],
        ratios: ratios.status === 'fulfilled' && ratios.value.length > 0 ? ratios.value[0] : null,
      }));

      setCriticalLoading(false);

      // STAGE 2: Secondary Data (Load after critical data)
      // These are important but not essential for initial render
      const [dividends, insiderDeals, events, news, subsidiaries] = await Promise.allSettled([
        api.company.getDividends(ticker),
        api.company.getInsiderDeals(ticker),
        api.company.getEvents(ticker),
        api.company.getNews(ticker),
        api.company.getSubsidiaries(ticker),
      ]);

      // Update with secondary data
      setData((prev) => ({
        ...prev,
        dividends: dividends.status === 'fulfilled' ? dividends.value : [],
        insiderDeals: insiderDeals.status === 'fulfilled' ? insiderDeals.value : [],
        events: events.status === 'fulfilled' ? events.value : [],
        news: news.status === 'fulfilled' ? news.value : [],
        subsidiaries: subsidiaries.status === 'fulfilled' ? subsidiaries.value : [],
      }));

      setSecondaryLoading(false);

      // STAGE 3: Deferred Data (Load last)
      // Industry benchmark is the heaviest call (50-200+ internal API calls)
      const [industryBenchmark] = await Promise.allSettled([
        api.industry.getCompanyBenchmark(ticker),
      ]);

      // Update with deferred data
      setData((prev) => ({
        ...prev,
        industryBenchmark: industryBenchmark.status === 'fulfilled' ? industryBenchmark.value : null,
      }));

      setDeferredLoading(false);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, startDate, endDate, period]);

  return {
    data,
    loading,
    criticalLoading,
    secondaryLoading,
    deferredLoading,
    error,
    refetch: fetchAllData,
  };
}
