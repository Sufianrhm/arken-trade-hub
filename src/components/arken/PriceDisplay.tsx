import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import type { PriceData } from '@/types/trading';

interface PriceDisplayProps {
  data: PriceData | undefined;
  isLoading: boolean;
}

export function PriceDisplay({ data, isLoading }: PriceDisplayProps) {
  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-6 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-5 w-20 bg-muted rounded" />
        <div className="h-5 w-24 bg-muted rounded" />
      </div>
    );
  }

  const isPositive = data.changePercent24h >= 0;

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toFixed(2);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6">
      {/* Mark Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-bold text-foreground">
          ${formatPrice(data.price)}
        </span>
      </div>

      {/* 24h Change */}
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${
        isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
      }`}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{data.changePercent24h.toFixed(2)}%
        </span>
      </div>

      {/* 24h Volume */}
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Activity className="w-4 h-4" />
        <span className="text-sm">
          Vol: <span className="text-foreground font-medium">${formatVolume(data.volume24h * data.price)}</span>
        </span>
      </div>

      {/* High/Low */}
      <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          H: <span className="text-success">${formatPrice(data.high24h)}</span>
        </span>
        <span>
          L: <span className="text-destructive">${formatPrice(data.low24h)}</span>
        </span>
      </div>
    </div>
  );
}
