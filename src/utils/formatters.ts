/**
 * Format a number as currency
 * @param value Number to format
 * @param decimals Number of decimal places
 * @returns Formatted string with $ symbol
 */
export function formatCurrency(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a large number with K/M/B/T suffix
 * @param value Number to format
 * @returns Formatted string with appropriate suffix
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
  return value.toString()
}

export function formatMarketCap(value: number | null): string {
  if (!value) return 'N/A';
  
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatNumber(num: number): string {
  if (!num) return 'N/A';
  if (num < 1e6) {
    return `$${num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10
    })}`;
  }
  return `$${num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}