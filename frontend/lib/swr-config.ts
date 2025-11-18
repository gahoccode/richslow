import type { SWRConfiguration } from 'swr';

/**
 * SWR Configuration for API Request Caching and Deduplication
 *
 * Cache Strategy:
 * - Financial data (statements, prices, ratios): 5 minutes
 * - Reference data (overview, dividends, events, news): 1 hour
 * - Industry benchmark (heavy API call): 10 minutes
 */

/**
 * Data type categories for cache duration
 */
export type DataType = 'financial' | 'reference' | 'benchmark';

/**
 * Base SWR configuration shared across all hooks
 */
export const baseSWRConfig: SWRConfiguration = {
  // Don't revalidate on window focus (prevents unnecessary API calls)
  revalidateOnFocus: false,

  // Revalidate when network reconnects
  revalidateOnReconnect: true,

  // Deduplicate requests within 2 seconds
  dedupingInterval: 2000,

  // Retry failed requests up to 2 times
  errorRetryCount: 2,

  // Wait 1 second between retries
  errorRetryInterval: 1000,

  // Keep previous data while revalidating (show stale data immediately)
  keepPreviousData: true,
};

/**
 * Get cache configuration based on data type
 *
 * @param dataType - Type of data being cached
 * @returns SWR configuration with appropriate cache duration
 */
export function getCacheConfig(dataType: DataType): SWRConfiguration {
  const cacheDurations = {
    financial: 5 * 60 * 1000,     // 5 minutes
    reference: 60 * 60 * 1000,    // 1 hour
    benchmark: 10 * 60 * 1000,    // 10 minutes
  };

  return {
    ...baseSWRConfig,
    dedupingInterval: cacheDurations[dataType],
  };
}

/**
 * Generate consistent cache key for API endpoints
 *
 * @param endpoint - API endpoint path
 * @param ticker - Stock ticker symbol
 * @param params - Optional query parameters
 * @returns Formatted cache key
 */
export function getCacheKey(
  endpoint: string,
  ticker: string,
  params?: Record<string, string | undefined>
): string | null {
  if (!ticker) return null;

  // Filter out undefined params
  const validParams = params
    ? Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      )
    : {};

  const queryString = Object.keys(validParams).length > 0
    ? `?${new URLSearchParams(validParams as Record<string, string>).toString()}`
    : '';

  return `${endpoint}/${ticker}${queryString}`;
}

/**
 * SWR configuration for financial data (statements, prices, ratios)
 * Cache: 5 minutes
 */
export const financialDataConfig = getCacheConfig('financial');

/**
 * SWR configuration for reference data (overview, dividends, events, news)
 * Cache: 1 hour
 */
export const referenceDataConfig = getCacheConfig('reference');

/**
 * SWR configuration for industry benchmark data
 * Cache: 10 minutes (heavy API call, but changes infrequently)
 */
export const benchmarkDataConfig = getCacheConfig('benchmark');
