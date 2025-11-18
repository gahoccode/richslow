"use client";

import { SWRConfig } from 'swr';
import { baseSWRConfig } from '@/lib/swr-config';

/**
 * SWR Provider Component
 *
 * Wraps the application with SWR configuration for global cache management,
 * request deduplication, and error handling.
 */
export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={baseSWRConfig}>
      {children}
    </SWRConfig>
  );
}
