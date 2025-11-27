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
  return (num * 100).toFixed(2) + '%';
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

/**
 * Format exchange rate values with 2 decimal places
 */
export function formatVNDRate(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Format VND in abbreviated form (e.g., "80.5M", "23.5K")
 */
export function formatVNDShort(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1e6) {
    return sign + (absNum / 1e6).toFixed(1) + 'M';
  } else if (absNum >= 1e3) {
    return sign + (absNum / 1e3).toFixed(1) + 'K';
  }

  return formatNumber(num);
}

/**
 * Format gold prices (typically large VND values)
 */
export function formatGoldPrice(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }) + ' VND';
}

/**
 * Format number as Vietnamese billions
 * Example: 1234567890000 → "1,234.57 B"
 */
export function formatBillionVND(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  const billions = value / 1_000_000_000;
  return billions.toLocaleString('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' B';
}

/**
 * Format YoY percentage with color
 * Example: 0.1522 → { text: "15.22%", color: "success" }
 */
export function formatYoY(value: number | null | undefined): {
  text: string;
  color: 'success' | 'destructive' | 'muted';
} {
  if (value === null || value === undefined || isNaN(value)) {
    return { text: 'N/A', color: 'muted' };
  }
  const percentage = value * 100;
  return {
    text: percentage.toFixed(2) + '%',
    color: percentage >= 0 ? 'success' : 'destructive'
  };
}

/**
 * Smart formatter based on field key
 */
export function formatStatementValue(
  value: number | null | undefined,
  fieldKey: string
): string {
  if (fieldKey.includes('yoy') || fieldKey.includes('_percent')) {
    const result = formatYoY(value);
    return result.text;
  }
  return formatBillionVND(value);
}
