import { MarketCapDisplay } from './MarketCapDisplay';
import { MetricBanner } from './MetricBanner';
import type { MarketData } from '../../types';

interface DashboardProps {
  data: MarketData | null;
}

export function Dashboard({ data }: DashboardProps) {
  if (!data) {
    return null;
  }

  const formatNumber = (num: number): string => {
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
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MarketCapDisplay coinId={data.raw_data} />
        <MetricBanner
          title="Price"
          value={formatNumber(data.price)}
          subtitle={`ATH: ${formatNumber(data.ath_usd)}`}
          change={data.ath_multiplier}
        />
        <MetricBanner
          title="Total USD Locked (TVL)"
          value={formatNumber(data.tvl)}
        />
        <MetricBanner
          title="Trust Score"
          value={`${Math.round(data.trustScore)}/100`}
        />
        <MetricBanner
          title="Sentiment"
          value={`${data.sentimentScore.toFixed(1)}%`}
        />
      </div>
    </div>
  );
}