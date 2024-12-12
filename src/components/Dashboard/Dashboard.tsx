import { MarketCapDisplay } from './MarketCapDisplay';
import { MetricBanner } from './MetricBanner';
import { SocialLinks } from './SocialLinks';
import type { MarketData } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface DashboardProps {
  data: MarketData | null;
}

export function Dashboard({ data }: DashboardProps) {
  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
        <SocialLinks socialData={data.debug.socialData} />
      </div>

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