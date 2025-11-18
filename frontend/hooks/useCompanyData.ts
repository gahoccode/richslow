/**
 * Hook for fetching company information data
 * Fetches overview, profile, news, events, shareholders, and subsidiaries in parallel
 */

import useSWR from 'swr';
import { companyAPI, CompanyOverview, CompanyProfile, NewsItem, CorporateEvent, ShareholderInfo, Subsidiary } from '@/lib/api';
import { getCacheKey, referenceDataConfig } from '@/lib/swr-config';

interface UseCompanyDataReturn {
  data: {
    overview?: CompanyOverview;
    profile?: CompanyProfile;
    news?: NewsItem[];
    events?: CorporateEvent[];
    shareholders?: ShareholderInfo[];
    subsidiaries?: Subsidiary[];
  };
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch company information
 * @param ticker - Stock ticker symbol
 * @returns Company data, loading state, and error
 */
export function useCompanyData(ticker: string): UseCompanyDataReturn {
  // Fetch overview
  const {
    data: overview,
    error: overviewError,
    isLoading: overviewLoading,
    mutate: mutateOverview
  } = useSWR(
    getCacheKey('/api/company/overview', ticker),
    ticker ? () => companyAPI.getOverview(ticker) : null,
    referenceDataConfig // 1 hour cache for company data
  );

  // Fetch profile
  const {
    data: profile,
    error: profileError,
    isLoading: profileLoading,
    mutate: mutateProfile
  } = useSWR(
    getCacheKey('/api/company/profile', ticker),
    ticker ? () => companyAPI.getProfile(ticker) : null,
    referenceDataConfig
  );

  // Fetch news
  const {
    data: news,
    error: newsError,
    isLoading: newsLoading,
    mutate: mutateNews
  } = useSWR(
    getCacheKey('/api/company/news', ticker),
    ticker ? () => companyAPI.getNews(ticker) : null,
    referenceDataConfig
  );

  // Fetch events
  const {
    data: events,
    error: eventsError,
    isLoading: eventsLoading,
    mutate: mutateEvents
  } = useSWR(
    getCacheKey('/api/company/events', ticker),
    ticker ? () => companyAPI.getEvents(ticker) : null,
    referenceDataConfig
  );

  // Fetch shareholders
  const {
    data: shareholders,
    error: shareholdersError,
    isLoading: shareholdersLoading,
    mutate: mutateShareholders
  } = useSWR(
    getCacheKey('/api/company/shareholders', ticker),
    ticker ? () => companyAPI.getShareholders(ticker) : null,
    referenceDataConfig
  );

  // Fetch subsidiaries
  const {
    data: subsidiaries,
    error: subsidiariesError,
    isLoading: subsidiariesLoading,
    mutate: mutateSubsidiaries
  } = useSWR(
    getCacheKey('/api/company/subsidiaries', ticker),
    ticker ? () => companyAPI.getSubsidiaries(ticker) : null,
    referenceDataConfig
  );

  // Aggregate loading state
  const loading = overviewLoading || profileLoading || newsLoading ||
                  eventsLoading || shareholdersLoading || subsidiariesLoading;

  // Aggregate error state
  const error = overviewError || profileError || newsError ||
                eventsError || shareholdersError || subsidiariesError;

  // Refetch all data
  const refetch = () => {
    mutateOverview();
    mutateProfile();
    mutateNews();
    mutateEvents();
    mutateShareholders();
    mutateSubsidiaries();
  };

  return {
    data: {
      overview,
      profile,
      news,
      events,
      shareholders,
      subsidiaries
    },
    loading,
    error,
    refetch
  };
}
