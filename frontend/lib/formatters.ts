/**
 * Data formatting utilities for financial data display
 */

/**
 * Format large numbers with Vietnamese thousand separators
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

/**
 * Format currency in Vietnamese Dong
 */
export function formatCurrency(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return num.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Format financial ratios and percentages
 */
export function formatRatio(
  num: number | null | undefined,
  key?: string
): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';

  if (key && key.includes('(%)')) {
    return (num * 100).toLocaleString('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }) + '%';
  }

  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  });
}

/**
 * Format percentage values
 */
export function formatPercentage(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return num.toFixed(2) + '%';
}

/**
 * Format date from ISO string to Vietnamese format
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Format datetime with time component
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
  }
}

/**
 * Shorten large numbers with K, M, B suffixes
 */
export function formatCompact(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1e9) {
    return sign + (absNum / 1e9).toFixed(2) + 'B';
  } else if (absNum >= 1e6) {
    return sign + (absNum / 1e6).toFixed(2) + 'M';
  } else if (absNum >= 1e3) {
    return sign + (absNum / 1e3).toFixed(2) + 'K';
  }

  return formatNumber(num);
}

/**
 * Format month abbreviation for charts
 */
export function formatMonthShort(monthString: string): string {
  return monthString.slice(0, 3);
}
