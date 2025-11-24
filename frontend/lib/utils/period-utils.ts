import type { FinancialRatiosData } from '@/lib/api/facade';

/**
 * Type guard to check if FinancialRatiosData represents quarterly data
 * @param data - FinancialRatiosData to check
 * @returns true if data represents quarterly information (length_report 1-4)
 */
export function isQuarterlyData(data: FinancialRatiosData): boolean {
  return data.length_report !== null && data.length_report >= 1 && data.length_report <= 4;
}

/**
 * Type guard to check if FinancialRatiosData represents annual data
 * @param data - FinancialRatiosData to check
 * @returns true if data represents annual information (length_report = 5)
 */
export function isAnnualData(data: FinancialRatiosData): boolean {
  return data.length_report === 5;
}

/**
 * Convert length_report value to quarter string
 * @param lengthReport - The length_report value (1-4 for quarters)
 * @returns Quarter string (Q1-Q4) or null if not a valid quarter
 */
export function getQuarterFromLengthReport(lengthReport: number): string | null {
  const quarterMap: Record<number, string> = {
    1: 'Q1',
    2: 'Q2',
    3: 'Q3',
    4: 'Q4'
  };
  return quarterMap[lengthReport] || null;
}

/**
 * Get human-readable period label for financial data
 * @param data - FinancialRatiosData object
 * @returns Formatted period label (e.g., "2024 Q1", "2024 Annual")
 */
export function getPeriodLabel(data: FinancialRatiosData): string {
  if (isAnnualData(data)) {
    return `${data.year_report} Annual`;
  }

  const quarter = getQuarterFromLengthReport(data.length_report || 0);
  return quarter ? `${data.year_report} ${quarter}` : `${data.year_report} Unknown`;
}

/**
 * Create a standardized period identifier for data organization
 * @param year - The report year
 * @param lengthReport - The length_report value
 * @returns Standardized period ID (e.g., "2024-Q1", "2024-Annual")
 */
export function createPeriodId(year: number, lengthReport: number): string {
  if (lengthReport === 5) {
    return `${year}-Annual`;
  }

  const quarter = getQuarterFromLengthReport(lengthReport);
  return quarter ? `${year}-${quarter}` : `${year}-Unknown`;
}

/**
 * Get the chronological order for sorting periods
 * @param periodId - Period identifier (e.g., "2024-Q1", "2024-Annual")
 * @returns Array of [year, periodOrder] for sorting
 */
export function getPeriodSortOrder(periodId: string): [number, number] {
  const [yearStr, periodStr] = periodId.split('-');
  const year = parseInt(yearStr, 10);

  const periodOrder: Record<string, number> = {
    'Q1': 1,
    'Q2': 2,
    'Q3': 3,
    'Q4': 4,
    'Annual': 5
  };

  return [year, periodOrder[periodStr] || 0];
}

/**
 * Format a period for display in charts and tables
 * @param periodId - Period identifier
 * @param format - Display format ('short', 'long', 'compact')
 * @returns Formatted period string
 */
export function formatPeriod(periodId: string, format: 'short' | 'long' | 'compact' = 'short'): string {
  const [yearStr, periodStr] = periodId.split('-');
  const year = parseInt(yearStr, 10);

  switch (format) {
    case 'short':
      return periodStr === 'Annual' ? `${year}` : `${periodStr} ${year}`;
    case 'long':
      return periodStr === 'Annual' ? `${year} Annual` : `${year} Quarter ${periodStr.slice(1)}`;
    case 'compact':
      return periodId;
    default:
      return periodId;
  }
}

/**
 * Validate if a FinancialRatiosData object has valid period information
 * @param data - FinancialRatiosData to validate
 * @returns true if data has valid length_report value
 */
export function hasValidPeriod(data: FinancialRatiosData): boolean {
  return data.length_report !== null &&
         data.length_report >= 1 &&
         data.length_report <= 5;
}

/**
 * Get the description for a length_report value
 * @param lengthReport - The length_report value
 * @returns Human-readable description
 */
export function getLengthReportDescription(lengthReport: number): string {
  const descriptions: Record<number, string> = {
    1: 'Q1 - First Quarter (January to March)',
    2: 'Q2 - Second Quarter (April to June)',
    3: 'Q3 - Third Quarter (July to September)',
    4: 'Q4 - Fourth Quarter (October to December)',
    5: 'Annual - 12 Month Period'
  };
  return descriptions[lengthReport] || 'Unknown Period';
}