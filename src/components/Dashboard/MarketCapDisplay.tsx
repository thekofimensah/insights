import { useMarketData } from '../../hooks/useMarketData';

interface MarketCapDisplayProps {
  coinId: string | null;
}

export function MarketCapDisplay({ coinId }: MarketCapDisplayProps) {
  const { marketCap, isLoading } = useMarketData(coinId);

  const formatMarketCap = (value: number | null): string => {
    if (!value) return 'N/A';
    
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-500">Market Cap</h3>
      <div className="mt-1">
        {isLoading ? (
          <div className="animate-pulse h-8 bg-gray-200 rounded w-32"></div>
        ) : (
          <span className="text-2xl font-semibold">{formatMarketCap(marketCap)}</span>
        )}
      </div>
    </div>
  );
}