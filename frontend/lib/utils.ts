import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sorts financial data by period/year in ascending chronological order
 * for proper timeline visualization in charts.
 *
 * @param data Array of objects with period field (year as string)
 * @returns Sorted array in ascending order (oldest → newest)
 *
 * @example
 * const chartData = sortByPeriodAscending([
 *   { period: "2024", revenue: 100 },
 *   { period: "2023", revenue: 90 }
 * ]);
 * // Returns: [{ period: "2023", ... }, { period: "2024", ... }]
 */
export function sortByPeriodAscending<T extends { period: string }>(data: T[]): T[] {
  return [...data].sort((a, b) => {
    const yearA = parseInt(a.period) || 0;
    const yearB = parseInt(b.period) || 0;
    return yearA - yearB; // Ascending: oldest → newest
  });
}
