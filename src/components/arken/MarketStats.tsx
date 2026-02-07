import type { PriceData } from '@/types/trading';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketStatsProps {
  data: PriceData | undefined;
  isLoading?: boolean;
}

export function MarketStats({ data, isLoading }: MarketStatsProps) {
  if (isLoading || !data) {
    return (
      <div className="glass-panel p-3 animate-pulse">
        <div className="flex gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-12 bg-muted rounded" />
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(2)}M`;
    }
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(2)}B`;
    }
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(2)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(2)}K`;
    }
    return volume.toFixed(2);
  };

  const isPositive = data.changePercent24h >= 0;

  return (
    <div className="glass-panel p-3">
      <div className="flex items-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide">
        {/* 24h Change */}
        <div className="flex-shrink-0">
          <div className="text-[10px] text-muted-foreground mb-0.5">24h Change</div>
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="tabular-nums">{isPositive ? '+' : ''}{data.changePercent24h.toFixed(2)}%</span>
          </div>
        </div>

        {/* 24h High */}
        <div className="flex-shrink-0">
          <div className="text-[10px] text-muted-foreground mb-0.5">24h High</div>
          <div className="text-sm text-foreground tabular-nums">
            ${formatPrice(data.high24h)}
          </div>
        </div>

        {/* 24h Low */}
        <div className="flex-shrink-0">
          <div className="text-[10px] text-muted-foreground mb-0.5">24h Low</div>
          <div className="text-sm text-foreground tabular-nums">
            ${formatPrice(data.low24h)}
          </div>
        </div>

        {/* 24h Volume */}
        <div className="flex-shrink-0">
          <div className="text-[10px] text-muted-foreground mb-0.5">24h Volume</div>
          <div className="text-sm text-foreground tabular-nums">
            ${formatVolume(data.volume24h)}
          </div>
        </div>
      </div>
    </div>
  );
}
