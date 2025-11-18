"use client"

import useSWR from 'swr';
import api, { ExchangeRate, GoldSJC, GoldBTMC } from '@/lib/api';
import { referenceDataConfig } from '@/lib/swr-config';

/**
 * Market data aggregated from all endpoints
 */
export interface MarketData {
  exchangeRates: ExchangeRate[];
  goldSJC: GoldSJC[];
  goldBTMC: GoldBTMC[];
}

/**
 * Return type for useMarketData hook
 */
export interface UseMarketDataReturn {
  data: MarketData;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching market data (exchange rates, gold prices)
 *
 * Features:
 * - Automatic request deduplication via SWR
 * - 1-hour cache for reference data (market data changes infrequently)
 * - Parallel data fetching
 * - Graceful error handling
 *
 * @param date - Optional date for exchange rates (defaults to today)
 */
export function useMarketData(date?: string): UseMarketDataReturn {
  // Fetch exchange rates
  const { data: exchangeRates, error: ratesError, isLoading: ratesLoading, mutate: mutateRates } = useSWR(
    date ? `/api/exchange-rates?date=${date}` : '/api/exchange-rates',
    () => api.prices.getExchangeRates(date),
    referenceDataConfig // 1 hour cache for market data
  );

  // Fetch SJC gold prices
  const { data: goldSJC, error: sjcError, isLoading: sjcLoading, mutate: mutateSJC } = useSWR(
    '/api/gold/sjc',
    () => api.prices.getGoldSJC(),
    referenceDataConfig // 1 hour cache
  );

  // Fetch BTMC gold prices
  const { data: goldBTMC, error: btmcError, isLoading: btmcLoading, mutate: mutateBTMC } = useSWR(
    '/api/gold/btmc',
    () => api.prices.getGoldBTMC(),
    referenceDataConfig // 1 hour cache
  );

  // Aggregate loading states
  const loading = ratesLoading || sjcLoading || btmcLoading;

  // Aggregate errors (prioritize first error encountered)
  const error = ratesError || sjcError || btmcError || null;

  // Aggregate data
  const data: MarketData = {
    exchangeRates: exchangeRates || [],
    goldSJC: goldSJC || [],
    goldBTMC: goldBTMC || [],
  };

  // Refetch all market data
  const refetch = async () => {
    await Promise.all([
      mutateRates(),
      mutateSJC(),
      mutateBTMC(),
    ]);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
