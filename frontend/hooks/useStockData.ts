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
  loading: boolean;
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
  const [error, setError] = useState<Error | null>(null);

  const fetchAllData = async () => {
    if (!ticker) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        overview,
        statements,
        prices,
        dividends,
        insiderDeals,
        events,
        news,
        subsidiaries,
        ratios,
        industryBenchmark,
      ] = await Promise.allSettled([
        api.company.getOverview(ticker),
        api.statements.getStatements(ticker, {
          startDate,
          endDate,
          period,
        }),
        api.prices.getStockPrices(ticker, { startDate, endDate }),
        api.company.getDividends(ticker),
        api.company.getInsiderDeals(ticker),
        api.company.getEvents(ticker),
        api.company.getNews(ticker),
        api.company.getSubsidiaries(ticker),
        api.company.getRatio(ticker),
        api.industry.getCompanyBenchmark(ticker),
      ]);

      setData({
        overview: overview.status === 'fulfilled' ? overview.value : null,
        statements: statements.status === 'fulfilled' ? statements.value : null,
        prices: prices.status === 'fulfilled' ? prices.value : [],
        dividends: dividends.status === 'fulfilled' ? dividends.value : [],
        insiderDeals: insiderDeals.status === 'fulfilled' ? insiderDeals.value : [],
        events: events.status === 'fulfilled' ? events.value : [],
        news: news.status === 'fulfilled' ? news.value : [],
        subsidiaries: subsidiaries.status === 'fulfilled' ? subsidiaries.value : [],
        // Take the most recent ratio (first element of array)
        ratios: ratios.status === 'fulfilled' && ratios.value.length > 0 ? ratios.value[0] : null,
        industryBenchmark: industryBenchmark.status === 'fulfilled' ? industryBenchmark.value : null,
      });
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
    error,
    refetch: fetchAllData,
  };
}
