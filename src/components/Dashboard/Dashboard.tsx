import { MetricBanner } from './MetricBanner';
import type { MarketData } from '../../types';

interface DashboardProps {
  data: MarketData | null;
}

export function Dashboard({ data }: DashboardProps) {
  if (!data) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricBanner
          title="Market Cap"
          value={formatNumber(data.marketCap)}
        />
        <MetricBanner
          title="Price"
          value={formatNumber(data.price)}
          subtitle={`ATH: ${formatNumber(data.ath_usd)}`}
        />
        <MetricBanner
          title="TVL"
          value={formatNumber(data.tvl)}
        />
        <MetricBanner
          title="Trust Score"
          value={`${Math.round(data.trustScore)}/100`}
        />
        <MetricBanner
          title="Sentiment"
          value={`${data.sentimentScore.toFixed(1)}%`}
          // value={`${data.raw_data}`}
        />
      </div>
    </div>
  );
}