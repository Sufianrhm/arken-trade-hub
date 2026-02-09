import type { PriceData } from '@/types/trading';

interface MarketStatsProps {
  data: PriceData | undefined;
  isLoading?: boolean;
}

export function MarketStats({ data, isLoading }: MarketStatsProps) {
  if (isLoading || !data) {
    return (
      <div className="flex gap-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-0.5">
            <div className="h-2.5 w-10 bg-muted rounded" />
            <div className="h-3.5 w-14 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  const formatPrice = (price: number) => {
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

  return (
    <div className="flex items-center gap-4 md:gap-6 text-xs">
      {/* 24h High */}
      <div className="hidden sm:block">
        <div className="text-[9px] text-muted-foreground mb-0.5">24H HIGH</div>
        <div className="text-foreground tabular-nums font-medium text-success">
          ${formatPrice(data.high24h)}
        </div>
      </div>

      {/* 24h Low */}
      <div className="hidden sm:block">
        <div className="text-[9px] text-muted-foreground mb-0.5">24H LOW</div>
        <div className="text-foreground tabular-nums font-medium text-destructive">
          ${formatPrice(data.low24h)}
        </div>
      </div>

      {/* 24h Volume */}
      <div>
        <div className="text-[9px] text-muted-foreground mb-0.5">24H VOL</div>
        <div className="text-foreground tabular-nums font-medium">
          ${formatVolume(data.volume24h)}
        </div>
      </div>
    </div>
  );
}
