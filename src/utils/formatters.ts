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