import { memo, useMemo } from 'react';
import type { OrderBookData } from '@/hooks/useBinanceWebSocket';

interface OrderBookProps {
  data: OrderBookData;
  currentPrice: number;
}

export const OrderBook = memo(function OrderBook({ data, currentPrice }: OrderBookProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toFixed(2);
    }
    return price.toFixed(4);
  };

  const formatQuantity = (qty: number) => {
    if (qty >= 1000) {
      return `${(qty / 1000).toFixed(2)}K`;
    }
    return qty.toFixed(4);
  };

  const { maxBidTotal, maxAskTotal } = useMemo(() => {
    const bidTotals = data.bids.reduce((acc, [, qty]) => acc + qty, 0);
    const askTotals = data.asks.reduce((acc, [, qty]) => acc + qty, 0);
    return {
      maxBidTotal: bidTotals,
      maxAskTotal: askTotals,
    };
  }, [data.bids, data.asks]);

  const calculateDepthPercentage = (qty: number, isAsk: boolean) => {
    const max = isAsk ? maxAskTotal : maxBidTotal;
    return max > 0 ? (qty / max) * 100 : 0;
  };

  return (
    <div className="glass-panel h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm">Order Book</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-muted-foreground border-b border-border/20">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (sells) - reversed so highest at top */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col-reverse">
          {data.asks.slice().reverse().map(([price, qty], i) => {
            const depthPercent = calculateDepthPercentage(qty, true);
            const runningTotal = data.asks
              .slice(0, data.asks.length - i)
              .reduce((sum, [, q]) => sum + q, 0);

            return (
              <div
                key={`ask-${i}`}
                className="grid grid-cols-3 gap-2 px-3 py-1 text-xs relative hover:bg-destructive/10 transition-colors"
              >
                <div
                  className="absolute inset-0 bg-destructive/20 pointer-events-none"
                  style={{ width: `${Math.min(depthPercent * 3, 100)}%`, right: 0, left: 'auto' }}
                />
                <span className="text-destructive tabular-nums relative z-10">{formatPrice(price)}</span>
                <span className="text-right tabular-nums relative z-10 text-muted-foreground">{formatQuantity(qty)}</span>
                <span className="text-right tabular-nums relative z-10 text-muted-foreground">{formatQuantity(runningTotal)}</span>
              </div>
            );
          })}
        </div>

        {/* Spread / Current Price */}
        <div className="px-3 py-2 bg-muted/30 border-y border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground tabular-nums">
              ${formatPrice(currentPrice)}
            </span>
            {data.asks[0] && data.bids[0] && (
              <span className="text-xs text-muted-foreground">
                Spread: {((data.asks[0][0] - data.bids[0][0]) / data.asks[0][0] * 100).toFixed(3)}%
              </span>
            )}
          </div>
        </div>

        {/* Bids (buys) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {data.bids.map(([price, qty], i) => {
            const depthPercent = calculateDepthPercentage(qty, false);
            const runningTotal = data.bids
              .slice(0, i + 1)
              .reduce((sum, [, q]) => sum + q, 0);

            return (
              <div
                key={`bid-${i}`}
                className="grid grid-cols-3 gap-2 px-3 py-1 text-xs relative hover:bg-success/10 transition-colors"
              >
                <div
                  className="absolute inset-0 bg-success/20 pointer-events-none"
                  style={{ width: `${Math.min(depthPercent * 3, 100)}%`, right: 0, left: 'auto' }}
                />
                <span className="text-success tabular-nums relative z-10">{formatPrice(price)}</span>
                <span className="text-right tabular-nums relative z-10 text-muted-foreground">{formatQuantity(qty)}</span>
                <span className="text-right tabular-nums relative z-10 text-muted-foreground">{formatQuantity(runningTotal)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
