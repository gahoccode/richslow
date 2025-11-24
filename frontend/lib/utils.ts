import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getPeriodSortOrder } from "./utils/period-utils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sorts financial data by period in ascending chronological order
 * for proper timeline visualization in charts.
 * Supports both annual periods (e.g., "2024-Annual") and quarterly periods (e.g., "2024-Q1").
 *
 * @param data Array of objects with period field (period ID string like "2024-Q1" or "2024-Annual")
 * @returns Sorted array in ascending order (oldest → newest)
 *
 * @example
 * const chartData = sortByPeriodAscending([
 *   { period: "2024-Q2", revenue: 100 },
 *   { period: "2024-Q1", revenue: 90 },
 *   { period: "2023-Annual", revenue: 80 }
 * ]);
 * // Returns: [{ period: "2023-Annual", ... }, { period: "2024-Q1", ... }, { period: "2024-Q2", ... }]
 */
export function sortByPeriodAscending<T extends { period: string }>(data: T[]): T[] {
  return [...data].sort((a, b) => {
    const [yearA, periodOrderA] = getPeriodSortOrder(a.period);
    const [yearB, periodOrderB] = getPeriodSortOrder(b.period);

    // First sort by year, then by period order (Q1=1, Q2=2, Q3=3, Q4=4, Annual=5)
    if (yearA !== yearB) {
      return yearA - yearB;
    }
    return periodOrderA - periodOrderB;
  });
}
